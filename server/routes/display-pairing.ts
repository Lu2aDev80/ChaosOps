import express, { Request, Response } from 'express';
import { PrismaClient, DeviceStatus } from '@prisma/client';
import { logger } from '../logger';

const router = express.Router();
const prisma = new PrismaClient();

// Generate a random 6-digit pairing code
function generatePairingCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if a pairing code is unique
async function isCodeUnique(code: string): Promise<boolean> {
  const existing = await prisma.display.findUnique({
    where: { pairingCode: code }
  });
  return !existing;
}

// Generate a unique pairing code
async function generateUniquePairingCode(): Promise<string> {
  let code = generatePairingCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (!(await isCodeUnique(code)) && attempts < maxAttempts) {
    code = generatePairingCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique pairing code');
  }

  return code;
}

// POST /api/displays/pairing/init
// Initialize a display and get a pairing code
router.post('/displays/pairing/init', async (req: Request, res: Response) => {
  try {
    // Generate unique pairing code
    const pairingCode = await generateUniquePairingCode();

    // Create display entry in database
    const display = await prisma.display.create({
      data: {
        pairingCode,
        socketId: null, // No longer using socket IDs
        status: DeviceStatus.PENDING,
        name: `Display ${pairingCode}`
      }
    });

    logger.info(`Display created with pairing code: ${pairingCode} (${display.id})`);

    res.json({
      success: true,
      code: pairingCode,
      deviceId: display.id
    });

  } catch (error) {
    logger.error('Error initializing display:', error);
    res.status(500).json({ error: 'Failed to generate pairing code' });
  }
});

// GET /api/displays/pairing/status/:deviceId
// Poll for display status, pairing info, and assigned day plan
router.get('/displays/pairing/status/:deviceId', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;

    const display = await prisma.display.findUnique({
      where: { id: deviceId }
    });

    if (!display) {
      return res.status(404).json({ error: 'Display not found' });
    }

    // If display has an organisation, verify it still exists
    if (display.organisationId && display.status === DeviceStatus.PAIRED) {
      const organisation = await prisma.organisation.findUnique({
        where: { id: display.organisationId }
      });

      // If organisation was deleted, reset the display
      if (!organisation) {
        logger.warn(`Organisation ${display.organisationId} for display ${deviceId} no longer exists. Resetting display.`);
        const resetDisplay = await prisma.display.update({
          where: { id: deviceId },
          data: {
            organisationId: null,
            status: DeviceStatus.PENDING,
            currentDayPlanId: null,
            isActive: false
          }
        });
        
        return res.json({
          status: resetDisplay.status,
          isPaired: false,
          organisationId: null,
          deviceName: resetDisplay.name,
          dayPlan: null,
          wasReset: true,
          resetReason: 'Organisation no longer exists'
        });
      }
    }

    // If display has a day plan assigned, fetch it separately
    let dayPlan = null;
    if (display.currentDayPlanId) {
      dayPlan = await prisma.dayPlan.findUnique({
        where: { id: display.currentDayPlanId },
        include: {
          scheduleItems: {
            orderBy: { position: 'asc' }
          }
        }
      });

      // If day plan was deleted, clear it from display
      if (!dayPlan) {
        logger.warn(`DayPlan ${display.currentDayPlanId} for display ${deviceId} no longer exists. Clearing assignment.`);
        await prisma.display.update({
          where: { id: deviceId },
          data: { currentDayPlanId: null }
        });
      }
    }

    res.json({
      status: display.status,
      isPaired: display.status === DeviceStatus.PAIRED,
      organisationId: display.organisationId,
      deviceName: display.name,
      dayPlan: dayPlan
    });

  } catch (error) {
    logger.error('Error fetching display status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/displays/pairing/register
// Register a display by pairing code
router.post('/displays/pairing/register', async (req: Request, res: Response) => {
  try {
    const { pairingCode, organisationId, deviceName } = req.body;

    if (!pairingCode || !organisationId) {
      return res.status(400).json({ 
        error: 'Missing required fields: pairingCode and organisationId are required' 
      });
    }

    // Verify organisation exists first
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId }
    });

    if (!organisation) {
      logger.warn(`Display registration failed: Organisation ${organisationId} not found`);
      return res.status(404).json({ error: 'Organisation not found' });
    }

    // Find display by pairing code
    const display = await prisma.display.findUnique({
      where: { pairingCode }
    });

    if (!display) {
      logger.warn(`Display registration failed: Invalid pairing code ${pairingCode}`);
      return res.status(404).json({ error: 'Invalid pairing code' });
    }

    if (display.status === DeviceStatus.PAIRED) {
      logger.warn(`Display registration failed: Display already paired ${pairingCode}`);
      return res.status(400).json({ error: 'Display is already paired' });
    }

    // Update display with org info
    const updatedDisplay = await prisma.display.update({
      where: { id: display.id },
      data: {
        status: DeviceStatus.PAIRED,
        organisationId,
        name: deviceName || display.name
      }
    });

    logger.info(`Display paired successfully: ${updatedDisplay.id} to org ${organisationId}`);

    // Return display info - display will pick this up via polling
    res.json({
      success: true,
      display: updatedDisplay
    });

  } catch (error) {
    logger.error('Error registering display:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/displays/pairing/:organisationId
// Get all displays for an organization
router.get('/displays/pairing/:organisationId', async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;

    const displays = await prisma.display.findMany({
      where: { organisationId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(displays);
  } catch (error) {
    logger.error('Error fetching displays:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/displays/pairing/:displayId/dayplan
// Assign a DayPlan to a display
router.put('/displays/pairing/:displayId/dayplan', async (req: Request, res: Response) => {
  try {
    const { displayId } = req.params;
    const { dayPlanId } = req.body;

    if (!dayPlanId) {
      return res.status(400).json({ error: 'dayPlanId is required' });
    }

    // Verify display exists and has organization
    const display = await prisma.display.findUnique({
      where: { id: displayId }
    });

    if (!display) {
      return res.status(404).json({ error: 'Display not found' });
    }

    if (!display.organisationId) {
      return res.status(400).json({ error: 'Display must be paired with an organisation first' });
    }

    // Verify the organisation still exists
    const organisation = await prisma.organisation.findUnique({
      where: { id: display.organisationId }
    });

    if (!organisation) {
      logger.warn(`Organisation ${display.organisationId} for display ${displayId} no longer exists. Resetting display.`);
      await prisma.display.update({
        where: { id: displayId },
        data: {
          organisationId: null,
          status: DeviceStatus.PENDING,
          currentDayPlanId: null,
          isActive: false
        }
      });
      return res.status(400).json({ error: 'Display organisation no longer exists. Display has been reset.' });
    }

    // Verify the DayPlan exists
    const dayPlan = await prisma.dayPlan.findUnique({
      where: { id: dayPlanId },
      include: {
        scheduleItems: {
          orderBy: { position: 'asc' }
        },
        event: {
          select: {
            organisationId: true
          }
        }
      }
    });

    if (!dayPlan) {
      logger.error(`DayPlan ${dayPlanId} not found`);
      return res.status(404).json({ error: 'DayPlan not found' });
    }

    // Verify day plan belongs to the same organisation as the display
    if (dayPlan.event.organisationId !== display.organisationId) {
      logger.error(`DayPlan ${dayPlanId} belongs to different organisation than display ${displayId}`);
      return res.status(403).json({ error: 'DayPlan must belong to the same organisation as the display' });
    }

    // Update display with dayPlanId
    const updatedDisplay = await prisma.display.update({
      where: { id: displayId },
      data: { currentDayPlanId: dayPlanId }
    });

    logger.info(`DayPlan ${dayPlanId} assigned to display ${displayId}`);

    // Display will pick this up via polling
    res.json({
      success: true,
      display: updatedDisplay,
      dayPlan: dayPlan
    });

  } catch (error) {
    logger.error('Error assigning DayPlan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/displays/pairing/:displayId/disconnect
// Disconnect display from organization (deactivate)
router.post('/displays/pairing/:displayId/disconnect', async (req: Request, res: Response) => {
  try {
    const { displayId } = req.params;

    const display = await prisma.display.findUnique({
      where: { id: displayId }
    });

    if (!display) {
      return res.status(404).json({ error: 'Display not found' });
    }

    // Deactivate display and clear organization association
    const updatedDisplay = await prisma.display.update({
      where: { id: displayId },
      data: {
        isActive: false,
        organisationId: null,
        status: DeviceStatus.PENDING,
        currentDayPlanId: null
      }
    });

    logger.info(`Display ${displayId} disconnected`);

    res.json({
      success: true,
      message: 'Display disconnected successfully',
      display: updatedDisplay
    });

  } catch (error) {
    logger.error('Error disconnecting display:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/displays/pairing/:displayId/reset
// Reset display completely (delete and recreate)
router.post('/displays/pairing/:displayId/reset', async (req: Request, res: Response) => {
  try {
    const { displayId } = req.params;

    const display = await prisma.display.findUnique({
      where: { id: displayId }
    });

    if (!display) {
      return res.status(404).json({ error: 'Display not found' });
    }

    // Delete the old display
    await prisma.display.delete({
      where: { id: displayId }
    });

    // Generate new pairing code
    const pairingCode = await generateUniquePairingCode();

    // Create new display entry
    const newDisplay = await prisma.display.create({
      data: {
        pairingCode,
        socketId: null,
        status: DeviceStatus.PENDING,
        name: `Display ${pairingCode}`
      }
    });

    logger.info(`Display ${displayId} reset, new display created: ${newDisplay.id}`);

    res.json({
      success: true,
      message: 'Display reset successfully',
      code: pairingCode,
      deviceId: newDisplay.id
    });

  } catch (error) {
    logger.error('Error resetting display:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/displays/pairing/cleanup
// Cleanup displays without valid organisations (admin utility)
router.post('/displays/pairing/cleanup', async (req: Request, res: Response) => {
  try {
    // Find all displays with organisationId set
    const displaysWithOrg = await prisma.display.findMany({
      where: {
        organisationId: { not: null }
      },
      include: {
        organisation: true
      }
    });

    const orphanedDisplays = displaysWithOrg.filter(d => !d.organisation);
    
    if (orphanedDisplays.length === 0) {
      return res.json({
        success: true,
        message: 'No orphaned displays found',
        cleaned: 0
      });
    }

    // Reset all orphaned displays
    const resetResults = await Promise.all(
      orphanedDisplays.map(async (display) => {
        try {
          await prisma.display.update({
            where: { id: display.id },
            data: {
              organisationId: null,
              status: DeviceStatus.PENDING,
              currentDayPlanId: null,
              isActive: false
            }
          });
          logger.info(`Cleaned up orphaned display: ${display.id} (was linked to deleted org ${display.organisationId})`);
          return { id: display.id, success: true };
        } catch (error) {
          logger.error(`Failed to clean up display ${display.id}:`, error);
          return { id: display.id, success: false, error: String(error) };
        }
      })
    );

    const successCount = resetResults.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Cleaned up ${successCount} orphaned display(s)`,
      cleaned: successCount,
      details: resetResults
    });

  } catch (error) {
    logger.error('Error during display cleanup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
