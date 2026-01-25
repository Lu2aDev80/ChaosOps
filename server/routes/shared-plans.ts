import { Router, Request } from 'express'
import prisma from '../../src/services/db'
import { requireAuth } from '../middleware/session'
import crypto from 'crypto'

interface AuthRequest extends Request {
  user?: {
    id: string
    username: string
    email: string | null
    role: 'admin' | 'member'
    organisationId: string
  }
}

const router = Router()

// Generate a shareable link for a day plan
router.post('/dayplans/:dayPlanId/share', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { dayPlanId } = req.params
    const { title, description, expiresAt } = req.body

    // Verify the day plan exists and user has access
    const dayPlan = await prisma.dayPlan.findFirst({
      where: {
        id: dayPlanId,
        event: {
          organisationId: req.user!.organisationId
        }
      },
      include: {
        event: true
      }
    })

    if (!dayPlan) {
      return res.status(404).json({ error: 'Day plan not found or access denied' })
    }

    // Generate a unique share token
    const shareToken = crypto.randomBytes(16).toString('hex')

    // Create shared plan
    const sharedPlan = await prisma.sharedPlan.create({
      data: {
        dayPlanId,
        shareToken,
        title: title || dayPlan.name,
        description,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: req.user!.id
      },
      include: {
        dayPlan: {
          include: {
            event: true
          }
        },
        creator: {
          select: { id: true, username: true }
        }
      }
    })

    // Generate the shareable URL - use FRONTEND_HOST or fallback to dev server
    const getFrontendBaseUrl = () => {
      if (process.env.FRONTEND_HOST) {
        return process.env.FRONTEND_HOST;
      }
      const host = req.get('host') || 'localhost:3000';
      if (host.includes('localhost')) {
        // In development, use Vite dev server
        return 'http://localhost:5173';
      }
      return `https://${host}`;
    };
    
    const shareUrl = `${getFrontendBaseUrl()}/share/${shareToken}`

    res.status(201).json({
      ...sharedPlan,
      shareUrl
    })
  } catch (error) {
    console.error('Error creating shared plan:', error)
    res.status(500).json({ error: 'Failed to create shareable link' })
  }
})

// Get shared plans for a day plan
router.get('/dayplans/:dayPlanId/shares', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { dayPlanId } = req.params

    // Verify the day plan exists and user has access
    const dayPlan = await prisma.dayPlan.findFirst({
      where: {
        id: dayPlanId,
        event: {
          organisationId: req.user!.organisationId
        }
      }
    })

    if (!dayPlan) {
      return res.status(404).json({ error: 'Day plan not found or access denied' })
    }

    const sharedPlans = await prisma.sharedPlan.findMany({
      where: {
        dayPlanId,
        isActive: true
      },
      include: {
        creator: {
          select: { id: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Add share URLs to each plan - use FRONTEND_HOST or fallback to dev server
    const getFrontendBaseUrl = () => {
      if (process.env.FRONTEND_HOST) {
        return process.env.FRONTEND_HOST;
      }
      const host = req.get('host') || 'localhost:3000';
      if (host.includes('localhost')) {
        return 'http://localhost:5173';
      }
      return `https://${host}`;
    };
    const baseUrl = getFrontendBaseUrl();
    
    const plansWithUrls = sharedPlans.map(plan => ({
      ...plan,
      shareUrl: `${baseUrl}/share/${plan.shareToken}`
    }))

    res.json(plansWithUrls)
  } catch (error) {
    console.error('Error fetching shared plans:', error)
    res.status(500).json({ error: 'Failed to fetch shared plans' })
  }
})

// Update a shared plan
router.patch('/shared-plans/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { title, description, isActive, expiresAt } = req.body

    // Verify the shared plan exists and user has access
    const existingPlan = await prisma.sharedPlan.findFirst({
      where: {
        id,
        dayPlan: {
          event: {
            organisationId: req.user!.organisationId
          }
        }
      }
    })

    if (!existingPlan) {
      return res.status(404).json({ error: 'Shared plan not found or access denied' })
    }

    const updatedPlan = await prisma.sharedPlan.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null })
      },
      include: {
        creator: {
          select: { id: true, username: true }
        }
      }
    })

    // Add share URL - use FRONTEND_HOST or fallback to dev server
    const getFrontendBaseUrl = () => {
      if (process.env.FRONTEND_HOST) {
        return process.env.FRONTEND_HOST;
      }
      const host = req.get('host') || 'localhost:3000';
      if (host.includes('localhost')) {
        return 'http://localhost:5173';
      }
      return `https://${host}`;
    };
    
    res.json({
      ...updatedPlan,
      shareUrl: `${getFrontendBaseUrl()}/share/${updatedPlan.shareToken}`
    })
  } catch (error) {
    console.error('Error updating shared plan:', error)
    res.status(500).json({ error: 'Failed to update shared plan' })
  }
})

// Delete a shared plan
router.delete('/shared-plans/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Verify the shared plan exists and user has access
    const existingPlan = await prisma.sharedPlan.findFirst({
      where: {
        id,
        dayPlan: {
          event: {
            organisationId: req.user!.organisationId
          }
        }
      }
    })

    if (!existingPlan) {
      return res.status(404).json({ error: 'Shared plan not found or access denied' })
    }

    await prisma.sharedPlan.delete({
      where: { id }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting shared plan:', error)
    res.status(500).json({ error: 'Failed to delete shared plan' })
  }
})

// Public route to get shared plan (no auth required)
router.get('/share/:token', async (req, res) => {
  try {
    const { token } = req.params

    const sharedPlan = await prisma.sharedPlan.findFirst({
      where: {
        shareToken: token,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        dayPlan: {
          include: {
            event: {
              include: {
                organisation: {
                  select: { name: true, logoUrl: true }
                }
              }
            },
            scheduleItems: {
              orderBy: { position: 'asc' },
              include: {
                ScheduleItemToScheduleItemTag: {
                  include: {
                    schedule_item_tags: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!sharedPlan) {
      return res.status(404).json({ error: 'Shared plan not found or expired' })
    }

    // Update view count and last view time
    await prisma.sharedPlan.update({
      where: { id: sharedPlan.id },
      data: {
        viewCount: { increment: 1 },
        lastViewAt: new Date()
      }
    })

    // Transform schedule items to include tags in the expected format
    const scheduleItemsWithTags = sharedPlan.dayPlan.scheduleItems.map(item => ({
      ...item,
      tags: item.ScheduleItemToScheduleItemTag.map(relation => relation.schedule_item_tags)
    }))

    const result = {
      id: sharedPlan.id,
      title: sharedPlan.title,
      description: sharedPlan.description,
      createdAt: sharedPlan.createdAt,
      viewCount: sharedPlan.viewCount,
      dayPlan: {
        ...sharedPlan.dayPlan,
        scheduleItems: scheduleItemsWithTags
      }
    }

    res.json(result)
  } catch (error) {
    console.error('Error fetching shared plan:', error)
    res.status(500).json({ error: 'Failed to fetch shared plan' })
  }
})

// List all shared plans for an organisation (admin only)
router.get('/organisations/:organisationId/shared-plans', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { organisationId } = req.params

    if (req.user!.organisationId !== organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const sharedPlans = await prisma.sharedPlan.findMany({
      where: {
        dayPlan: {
          event: {
            organisationId
          }
        }
      },
      include: {
        dayPlan: {
          include: {
            event: {
              select: { id: true, name: true }
            }
          }
        },
        creator: {
          select: { id: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Add share URLs - use FRONTEND_HOST or fallback to dev server
    const getFrontendBaseUrl = () => {
      if (process.env.FRONTEND_HOST) {
        return process.env.FRONTEND_HOST;
      }
      const host = req.get('host') || 'localhost:3000';
      if (host.includes('localhost')) {
        return 'http://localhost:5173';
      }
      return `https://${host}`;
    };
    
    const plansWithUrls = sharedPlans.map(plan => ({
      ...plan,
      shareUrl: `${getFrontendBaseUrl()}/share/${plan.shareToken}`
    }))

    res.json(plansWithUrls)
  } catch (error) {
    console.error('Error fetching organisation shared plans:', error)
    res.status(500).json({ error: 'Failed to fetch shared plans' })
  }
})

export default router