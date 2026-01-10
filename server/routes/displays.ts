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


// Generate a registration code for a new display
router.post('/displays/generate-code', async (req, res) => {
  try {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Check if code already exists
    const existing = await prisma.display.findUnique({ where: { registrationCode: code } })
    if (existing) {
      // Try again with a new code
      return res.status(409).json({ error: 'Code collision, please try again' })
    }

    // Code expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    res.json({ 
      code,
      expiresAt: expiresAt.toISOString(),
      registrationUrl: `/register-display?code=${code}`
    })
  } catch (error) {
    console.error('Error generating display code:', error)
    res.status(500).json({ error: 'Failed to generate code' })
  }
})

// Register a display with a code (admin entering code in settings)
router.post('/displays', async (req, res) => {
  try {
    const { code, organisationId, name } = req.body

    if (!code || !organisationId || !name) {
      return res.status(400).json({ error: 'Code, organisationId, and name are required' })
    }

    // Verify the organisation exists
    const organisation = await prisma.organisation.findUnique({ where: { id: organisationId } })
    if (!organisation) {
      return res.status(404).json({ error: 'Organisation not found' })
    }

    // Find existing display by code
    const existingDisplay = await prisma.display.findUnique({
      where: { registrationCode: code },
    })

    if (existingDisplay) {
      // Update existing display
      const updated = await prisma.display.update({
        where: { id: existingDisplay.id },
        data: {
          name,
          organisationId,
          isActive: true,
          registrationCode: null, // Clear code after registration
          codeExpiresAt: null,
        },
        include: { organisation: true },
      })
      return res.json(updated)
    }

    // If no existing display, create a new one
    const display = await prisma.display.create({
      data: {
        name,
        organisationId,
        isActive: true,
      },
      include: {
        organisation: true,
      },
    })

    res.status(201).json(display)
  } catch (error) {
    console.error('Error registering display:', error)
    res.status(500).json({ error: 'Failed to register display' })
  }
})

// Activate a display by code (confirms registration from admin panel)
router.post('/displays/activate', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Code is required' })
    }

    // Find display by code
    const display = await prisma.display.findUnique({
      where: { registrationCode: code },
      include: { organisation: true },
    })

    if (!display) {
      return res.status(404).json({ error: 'Display not found with this code' })
    }

    // Check if code has expired
    if (display.codeExpiresAt && new Date() > display.codeExpiresAt) {
      return res.status(400).json({ error: 'Registration code has expired' })
    }

    // Verify user has access to this organisation
    if (req.user!.organisationId !== display.organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Activate display and clear code
    const updatedDisplay = await prisma.display.update({
      where: { id: display.id },
      data: {
        isActive: true,
        registrationCode: null,
        codeExpiresAt: null,
      },
      include: { organisation: true },
    })

    res.json(updatedDisplay)
  } catch (error) {
    console.error('Error activating display:', error)
    res.status(500).json({ error: 'Failed to activate display' })
  }
})

// List displays for an organisation
router.get('/organisations/:organisationId/displays', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { organisationId } = req.params

    if (req.user!.organisationId !== organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const displays = await prisma.display.findMany({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
    })

    res.json(displays)
  } catch (error) {
    console.error('Error listing displays:', error)
    res.status(500).json({ error: 'Failed to list displays' })
  }
})

// Get single display
router.get('/displays/:displayId', async (req, res) => {
  try {
    const { displayId } = req.params

    const display = await prisma.display.findUnique({
      where: { id: displayId },
      include: { organisation: true },
    })

    if (!display) {
      return res.status(404).json({ error: 'Display not found' })
    }

    // Check if organisation still exists, reset if not
    if (display.organisationId && !display.organisation) {
      console.warn(`Display ${displayId} linked to non-existent organisation ${display.organisationId}. Resetting.`)
      const resetDisplay = await prisma.display.update({
        where: { id: displayId },
        data: {
          organisationId: null,
          isActive: false,
          currentDayPlanId: null,
        },
        include: { organisation: true },
      })
      
      // Update last seen
      await prisma.display.update({
        where: { id: displayId },
        data: { lastSeenAt: new Date() },
      })

      return res.json(resetDisplay)
    }

    // Update last seen
    await prisma.display.update({
      where: { id: displayId },
      data: { lastSeenAt: new Date() },
    })

    res.json(display)
  } catch (error) {
    console.error('Error getting display:', error)
    res.status(500).json({ error: 'Failed to get display' })
  }
})

// Update display
router.patch('/displays/:displayId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { displayId } = req.params
    const { name, currentDayPlanId, isActive } = req.body

    const display = await prisma.display.findUnique({ 
      where: { id: displayId },
      include: { organisation: true }
    })
    
    if (!display) {
      return res.status(404).json({ error: 'Display not found' })
    }

    // Check if organisation still exists, reset if not
    if (display.organisationId && !display.organisation) {
      console.warn(`Display ${displayId} linked to non-existent organisation. Resetting.`)
      const resetDisplay = await prisma.display.update({
        where: { id: displayId },
        data: {
          organisationId: null,
          isActive: false,
          currentDayPlanId: null,
        },
      })
      return res.status(400).json({ 
        error: 'Display organisation no longer exists. Display has been reset.',
        display: resetDisplay
      })
    }

    if (req.user!.organisationId !== display.organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const data: { name?: string; currentDayPlanId?: string; isActive?: boolean } = {}
    if (name !== undefined) data.name = name
    if (currentDayPlanId !== undefined) data.currentDayPlanId = currentDayPlanId
    if (isActive !== undefined) data.isActive = isActive

    const updatedDisplay = await prisma.display.update({
      where: { id: displayId },
      data,
    })

    res.json(updatedDisplay)
  } catch (error) {
    console.error('Error updating display:', error)
    res.status(500).json({ error: 'Failed to update display' })
  }
})

// Delete display
router.delete('/displays/:displayId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { displayId } = req.params

    const display = await prisma.display.findUnique({ where: { id: displayId } })
    if (!display) {
      return res.status(404).json({ error: 'Display not found' })
    }

    if (req.user!.organisationId !== display.organisationId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    await prisma.display.delete({ where: { id: displayId } })

    res.json({ success: true, message: 'Display deleted successfully' })
  } catch (error) {
    console.error('Error deleting display:', error)
    res.status(500).json({ error: 'Failed to delete display' })
  }
})

// Get all unassigned displays
router.get('/displays/unassigned', requireAuth, async (req: AuthRequest, res) => {
  try {
    // In a real multi-tenant app, this should be restricted to super-admins.
    // For this project, any authenticated admin can see unassigned displays.
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view unassigned displays.' });
    }

    const displays = await prisma.display.findMany({
      where: { organisationId: null },
      orderBy: { createdAt: 'desc' },
    });
    res.json(displays);
  } catch (error) {
    console.error('Error listing unassigned displays:', error);
    res.status(500).json({ error: 'Failed to list unassigned displays' });
  }
});

// Assign a display to an organisation
router.patch('/displays/:displayId/assign', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { displayId } = req.params;
    const { organisationId } = req.body;

    // Ensure the user is an admin of the target organisation
    if (req.user?.role !== 'admin' || req.user?.organisationId !== organisationId) {
      return res.status(403).json({ error: 'You do not have permission to assign a display to this organisation.' });
    }

    const display = await prisma.display.findUnique({ where: { id: displayId } });
    if (!display) {
      return res.status(404).json({ error: 'Display not found' });
    }

    // Optional: Check if the display is already assigned
    if (display.organisationId) {
      return res.status(409).json({ error: 'This display is already assigned to an organisation.' });
    }

    const updatedDisplay = await prisma.display.update({
      where: { id: displayId },
      data: { organisationId },
      include: { organisation: true },
    });

    res.json(updatedDisplay);
  } catch (error) {
    console.error('Error assigning display:', error);
    res.status(500).json({ error: 'Failed to assign display' });
  }
});


// Get display data for viewing (public, no auth needed)
router.get('/displays/:displayId/view', async (req, res) => {
  try {
    const { displayId } = req.params

    const display = await prisma.display.findUnique({
      where: { id: displayId },
      include: {
        organisation: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    })

    if (!display) {
      return res.status(404).json({ error: 'Display not found' })
    }

    if (!display.isActive) {
      return res.status(403).json({ error: 'Display is not active' })
    }

    // Update last seen
    await prisma.display.update({
      where: { id: displayId },
      data: { lastSeenAt: new Date() },
    })

    let dayPlan = null
    if (display.currentDayPlanId) {
      dayPlan = await prisma.dayPlan.findUnique({
        where: { id: display.currentDayPlanId },
        include: {
          scheduleItems: { orderBy: { position: 'asc' } },
          event: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }

    res.json({
      display: {
        id: display.id,
        name: display.name,
        organisation: display.organisation,
      },
      dayPlan,
    })
  } catch (error) {
    console.error('Error getting display view data:', error)
    res.status(500).json({ error: 'Failed to get display data' })
  }
})

export default router
