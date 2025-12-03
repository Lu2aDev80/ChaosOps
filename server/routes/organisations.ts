import { Router } from 'express'
import crypto from 'crypto'
import prisma from '../../src/services/db'
import { requireAuth } from '../middleware/session'
import { sendMailSafe } from '../mailer'
import { userInvitationEmail } from '../templates/userInvitationEmail'
import { invitationEmail } from '../templates/invitationEmail'

const router = Router()

router.get('/', async (_req, res) => {
  const orgs = await prisma.organisation.findMany({
    select: { id: true, name: true, description: true },
    orderBy: { name: 'asc' },
  })
  res.json(orgs)
})

// Get single organisation details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const org = await prisma.organisation.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!org) {
      return res.status(404).json({ error: 'Organisation not found' })
    }

    // Check if user belongs to this organisation
    if (req.user!.organisationId !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(org)
  } catch (error) {
    console.error('Error fetching organisation:', error)
    res.status(500).json({ error: 'Failed to fetch organisation' })
  }
})

// Update organisation
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, logoUrl } = req.body

    // Check if user belongs to this organisation and is admin
    if (req.user!.organisationId !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update organisation details' })
    }

    const org = await prisma.organisation.update({
      where: { id },
      data: {
        name,
        description,
        logoUrl,
      },
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        updatedAt: true,
      },
    })

    res.json(org)
  } catch (error) {
    console.error('Error updating organisation:', error)
    res.status(500).json({ error: 'Failed to update organisation' })
  }
})

// Get organisation users
router.get('/:id/users', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    // Check if user belongs to this organisation
    if (req.user!.organisationId !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const users = await prisma.user.findMany({
      where: { organisationId: id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// List pending invitations
router.get('/:id/invitations', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    if (req.user!.organisationId !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view invitations' })
    }

    const invitations = await prisma.invitation.findMany({
      where: { organisationId: id },
      select: { id: true, email: true, role: true, invitedBy: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    res.json(invitations)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    res.status(500).json({ error: 'Failed to fetch invitations' })
  }
})

// Revoke invitation
router.delete('/:id/invitations/:invitationId', requireAuth, async (req, res) => {
  try {
    const { id, invitationId } = req.params

    if (req.user!.organisationId !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can revoke invitations' })
    }

    const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } })
    if (!invitation || invitation.organisationId !== id) {
      return res.status(404).json({ error: 'Invitation not found' })
    }

    await prisma.invitation.delete({ where: { id: invitationId } })

    res.json({ success: true, message: 'Invitation revoked' })
  } catch (error) {
    console.error('Error revoking invitation:', error)
    res.status(500).json({ error: 'Failed to revoke invitation' })
  }
})

// Invite user (create invitation with token)
router.post('/:id/users', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { email, role } = req.body

    // Check if user belongs to this organisation and is admin
    if (req.user!.organisationId !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can invite users' })
    }

    // Validate input
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Check if user already exists in this organisation
    const existingUser = await prisma.user.findFirst({
      where: {
        organisationId: id,
        email,
      },
    })

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists in your organisation',
      })
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        organisationId: id,
        email,
      },
    })

    if (existingInvitation) {
      // Delete the old invitation and create a new one
      await prisma.invitation.delete({
        where: { id: existingInvitation.id },
      })
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex')

    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        organisationId: id,
        email,
        role: role === 'admin' ? 'admin' : 'member',
        token,
        expiresAt,
        invitedBy: req.user!.username,
      },
    })

    // Get organisation details for email
    const organisation = await prisma.organisation.findUnique({
      where: { id },
      select: { name: true },
    })

    // Build invitation URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const invitationUrl = `${baseUrl}/minihackathon/accept-invitation?token=${token}`
    
    const emailSent = await sendMailSafe({
      to: email,
      subject: `You're invited to join ${organisation?.name || 'KonfiDayPlaner'}`,
      html: invitationEmail(
        email,
        organisation?.name || 'KonfiDayPlaner',
        req.user!.username,
        invitationUrl,
        role === 'admin' ? 'Admin' : 'Member'
      ),
    })

    if (!emailSent) {
      // If email fails, delete the invitation
      await prisma.invitation.delete({ where: { id: invitation.id } })
      return res.status(500).json({ error: 'Failed to send invitation email' })
    }

    res.status(201).json({
      message: 'Invitation sent successfully',
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    })
  } catch (error) {
    console.error('Error inviting user:', error)
    res.status(500).json({ error: 'Failed to invite user' })
  }
})

// Remove user
router.delete('/:id/users/:userId', requireAuth, async (req, res) => {
  try {
    const { id, userId } = req.params

    // Check if user belongs to this organisation and is admin
    if (req.user!.organisationId !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can remove users' })
    }

    // Prevent self-deletion
    if (req.user!.id === userId) {
      return res.status(400).json({ error: 'You cannot remove yourself' })
    }

    // Check if user exists and belongs to organisation
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userToDelete || userToDelete.organisationId !== id) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Delete user and their sessions
    await prisma.user.delete({
      where: { id: userId },
    })

    res.json({ success: true, message: 'User removed successfully' })
  } catch (error) {
    console.error('Error removing user:', error)
    res.status(500).json({ error: 'Failed to remove user' })
  }
})

export default router
