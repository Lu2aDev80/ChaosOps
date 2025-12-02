import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import dayjs from 'dayjs'
import prisma from '../../src/services/db'
import { logger } from '../logger'

const router = Router()

async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = dayjs().add(7, 'day').toDate()
  await prisma.session.create({ data: { token, userId, expiresAt } })
  return { token, expiresAt }
}

function setSessionCookie(res: any, token: string, expiresAt: Date) {
  res.cookie('sid', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    expires: expiresAt,
    path: '/',
  })
}

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.sid as string | undefined
    if (!token) return res.status(401).json({ error: 'Not authenticated' })
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { include: { organisation: true } } },
    })
    if (!session) return res.status(401).json({ error: 'Not authenticated' })
    res.json({
      user: {
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
        role: session.user.role,
        organisationId: session.user.organisationId,
      },
      organisation: {
        id: session.user.organisation.id,
        name: session.user.organisation.name,
        description: session.user.organisation.description,
      },
    })
  } catch (e) {
    logger.error('me endpoint failed', e)
    res.status(500).json({ error: 'Internal error' })
  }
})

router.post('/signup', async (req, res) => {
  const { orgName, description, adminUsername, adminEmail, password } = req.body ?? {}
  if (!orgName || !adminUsername || !password) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const result = await prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({ data: { name: orgName, description } })
      const user = await tx.user.create({
        data: {
          organisationId: organisation.id,
          username: adminUsername,
          email: adminEmail,
          passwordHash,
          role: 'admin',
        },
      })
      return { organisation, user }
    })

    const { token, expiresAt } = await createSession(result.user.id)
    setSessionCookie(res, token, expiresAt)
    res.status(201).json({ organisation: result.organisation, user: { id: result.user.id, username: result.user.username, role: result.user.role } })
  } catch (err: any) {
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Username or email already in use' })
    logger.error('signup error', err)
    res.status(500).json({ error: 'Internal error' })
  }
})

router.post('/login', async (req, res) => {
  const { organisationId, usernameOrEmail, password } = req.body ?? {}
  if (!organisationId || !usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  try {
    const org = await prisma.organisation.findUnique({ where: { id: organisationId } })
    if (!org) return res.status(404).json({ error: 'Organisation not found' })

    const user = await prisma.user.findFirst({
      where: { organisationId, OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }] },
    })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const { token, expiresAt } = await createSession(user.id)
    setSessionCookie(res, token, expiresAt)

    res.json({ organisation: { id: org.id, name: org.name }, user: { id: user.id, username: user.username, role: user.role } })
  } catch (err) {
    logger.error('login error', err)
    res.status(500).json({ error: 'Internal error' })
  }
})

router.post('/logout', async (req, res) => {
  const token = req.cookies?.sid as string | undefined
  if (token) await prisma.session.delete({ where: { token } }).catch(() => {})
  res.clearCookie('sid', { path: '/' })
  res.json({ ok: true })
})

export default router
