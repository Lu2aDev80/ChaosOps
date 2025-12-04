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

// Get single event
router.get('/events/:eventId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { eventId } = req.params

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        dayPlans: {
          include: { scheduleItems: { orderBy: { position: 'asc' } } },
          orderBy: { date: 'asc' },
        },
      },
    })

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    if (req.user!.organisationId !== event.organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(event)
  } catch (error) {
    console.error('Error getting event:', error)
    res.status(500).json({ error: 'Failed to get event' })
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

// Update event
router.patch('/events/:eventId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { eventId } = req.params
    const { name, description } = req.body

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    if (req.user!.organisationId !== event.organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { name, description },
    })

    res.json(updatedEvent)
  } catch (error) {
    console.error('Error updating event:', error)
    res.status(500).json({ error: 'Failed to update event' })
  }
})

// Delete event
router.delete('/events/:eventId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { eventId } = req.params

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    if (req.user!.organisationId !== event.organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    await prisma.event.delete({ where: { id: eventId } })
    res.json({ success: true, message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

// Get single day plan
router.get('/day-plans/:dayPlanId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { dayPlanId } = req.params

    const dayPlan = await prisma.dayPlan.findUnique({
      where: { id: dayPlanId },
      include: { 
        scheduleItems: { orderBy: { position: 'asc' } },
        event: true 
      },
    })

    if (!dayPlan) {
      return res.status(404).json({ error: 'Day plan not found' })
    }

    if (req.user!.organisationId !== dayPlan.event.organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(dayPlan)
  } catch (error) {
    console.error('Error getting day plan:', error)
    res.status(500).json({ error: 'Failed to get day plan' })
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
        speaker: item.speaker || undefined,
        location: item.location || undefined,
        details: item.details || undefined,
        materials: item.materials || undefined,
        duration: item.duration || undefined,
        snacks: item.snacks || undefined,
        facilitator: item.facilitator || undefined,
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

// Update day plan
router.patch('/day-plans/:dayPlanId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { dayPlanId } = req.params
    const { name, date, schedule } = req.body

    const dayPlan = await prisma.dayPlan.findUnique({ 
      where: { id: dayPlanId },
      include: { event: true } 
    })
    
    if (!dayPlan) {
      return res.status(404).json({ error: 'Day plan not found' })
    }

    if (req.user!.organisationId !== dayPlan.event.organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Update day plan basic info
    const updatedDayPlan = await prisma.dayPlan.update({
      where: { id: dayPlanId },
      data: { name, date },
    })

    // Update schedule if provided
    if (Array.isArray(schedule)) {
      // Delete existing schedule items
      await prisma.scheduleItem.deleteMany({ where: { dayPlanId } })

      // Create new schedule items
      if (schedule.length > 0) {
        const items = schedule.map((item, index) => ({
          dayPlanId: dayPlanId,
          time: item.time || '09:00',
          type: item.type || 'session',
          title: item.title || 'Item',
          speaker: item.speaker || undefined,
          location: item.location || undefined,
          details: item.details || undefined,
          materials: item.materials || undefined,
          duration: item.duration || undefined,
          snacks: item.snacks || undefined,
          facilitator: item.facilitator || undefined,
          position: index,
        }))
        await prisma.scheduleItem.createMany({ data: items })
      }
    }

    const full = await prisma.dayPlan.findUnique({
      where: { id: dayPlanId },
      include: { scheduleItems: { orderBy: { position: 'asc' } } },
    })

    res.json(full)
  } catch (error) {
    console.error('Error updating day plan:', error)
    res.status(500).json({ error: 'Failed to update day plan' })
  }
})

// Delete day plan
router.delete('/day-plans/:dayPlanId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { dayPlanId } = req.params

    const dayPlan = await prisma.dayPlan.findUnique({ 
      where: { id: dayPlanId },
      include: { event: true } 
    })
    
    if (!dayPlan) {
      return res.status(404).json({ error: 'Day plan not found' })
    }

    if (req.user!.organisationId !== dayPlan.event.organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    await prisma.dayPlan.delete({ where: { id: dayPlanId } })
    res.json({ success: true, message: 'Day plan deleted successfully' })
  } catch (error) {
    console.error('Error deleting day plan:', error)
    res.status(500).json({ error: 'Failed to delete day plan' })
  }
})

export default router
