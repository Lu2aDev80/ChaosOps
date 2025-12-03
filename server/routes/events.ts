import { Router, Request } from 'express'
import prisma from '../../src/services/db'
import { requireAuth } from '../middleware/session'

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

// List events for an organisation
router.get('/organisations/:organisationId/events', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { organisationId } = req.params

    if (req.user!.organisationId !== organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const events = await prisma.event.findMany({
      where: { organisationId },
      include: {
        dayPlans: {
          include: { scheduleItems: { orderBy: { position: 'asc' } } },
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(events)
  } catch (error) {
    console.error('Error listing events:', error)
    res.status(500).json({ error: 'Failed to list events' })
  }
})

// Create event
router.post('/organisations/:organisationId/events', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { organisationId } = req.params
    const { name, description } = req.body

    if (req.user!.organisationId !== organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' })
    }

    const event = await prisma.event.create({
      data: { name, description, organisationId },
    })
    res.status(201).json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    res.status(500).json({ error: 'Failed to create event' })
  }
})

// Create day plan for an event
router.post('/events/:eventId/day-plans', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { eventId } = req.params
    const { name, date, schedule } = req.body as { name: string; date: string; schedule?: Array<any> }

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) return res.status(404).json({ error: 'Event not found' })

    if (req.user!.organisationId !== event.organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date are required' })
    }

    const dayPlan = await prisma.dayPlan.create({
      data: { name, date, eventId },
    })

    // Optional: create schedule items if provided
    if (Array.isArray(schedule) && schedule.length > 0) {
      const items = schedule.map((item, index) => ({
        dayPlanId: dayPlan.id,
        time: item.time || '09:00',
        type: item.type || 'session',
        title: item.title || 'Item',
        position: index,
      }))
      await prisma.scheduleItem.createMany({ data: items })
    }

    const full = await prisma.dayPlan.findUnique({
      where: { id: dayPlan.id },
      include: { scheduleItems: { orderBy: { position: 'asc' } } },
    })

    res.status(201).json(full)
  } catch (error) {
    console.error('Error creating day plan:', error)
    res.status(500).json({ error: 'Failed to create day plan' })
  }
})

export default router
