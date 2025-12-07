import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { PrismaClient, DeviceStatus } from '@prisma/client';
import { logger } from './logger';

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

export function setupSocketIO(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.DEV_ORIGIN || "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:5174",
        process.env.FRONTEND_HOST || "",
        // Production domains
        "https://lu2adevelopment.de",
        "https://www.lu2adevelopment.de"
      ].filter(Boolean),
      credentials: true
    },
    // Important: Configure Socket.IO path to match the base path used in frontend
    // In production with /minihackathon base: socket.io is at /minihackathon/socket.io/
    path: process.env.APP_BASE_PATH ? `${process.env.APP_BASE_PATH}/socket.io/` : '/socket.io/'
  });

  logger.info(`Socket.IO configured with path: ${process.env.APP_BASE_PATH ? `${process.env.APP_BASE_PATH}/socket.io/` : '/socket.io/'}`);

  io.on('connection', async (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    try {
      // Generate unique pairing code
      const pairingCode = await generateUniquePairingCode();

      // Create display entry in database
      const display = await prisma.display.create({
        data: {
          pairingCode,
          socketId: socket.id,
          status: DeviceStatus.PENDING,
          name: `Display ${pairingCode}`
        }
      });

      logger.info(`Display created with pairing code: ${pairingCode} (${display.id})`);

      // Send pairing code to client
      socket.emit('pairing-code', { code: pairingCode, deviceId: display.id });

    } catch (error: any) {
      logger.error('Error creating display:', error);
      socket.emit('error', { message: 'Failed to generate pairing code' });
    }

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      
      // Optionally clean up pending displays after disconnect
      prisma.display.deleteMany({
        where: {
          socketId: socket.id,
          status: DeviceStatus.PENDING
        }
      }).catch((err: Error) => {
        logger.error('Error cleaning up disconnected display:', err);
      });
    });
  });

  // Helper function to emit to a specific socket
  io.emitToPairedDevice = async (socketId: string, orgId: string, displayId: string, deviceName?: string) => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('paired', { orgId, displayId, deviceName });
      logger.info(`Emitted paired event to socket ${socketId}`);
    } else {
      logger.warn(`Socket ${socketId} not found for paired emission`);
    }
  };

  // Helper function to emit dayplan update to a specific socket
  io.emitDayPlanUpdate = async (socketId: string, dayPlan: any) => {
    logger.info(`emitDayPlanUpdate called: socketId=${socketId}, dayPlanId=${dayPlan.id}`);
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      logger.info(`Socket found, emitting dayplan-assigned event with full data`);
      socket.emit('dayplan-assigned', { dayPlan });
      logger.info(`Emitted dayplan-assigned event to socket ${socketId}`);
    } else {
      logger.warn(`Socket ${socketId} not found for dayplan update`);
      logger.info(`Available sockets: ${Array.from(io.sockets.sockets.keys()).join(', ')}`);
    }
  };

  return io;
}

// Extend Socket.IO types
declare module 'socket.io' {
  interface Server {
    emitToPairedDevice(socketId: string, orgId: string, displayId: string, deviceName?: string): Promise<void>;
    emitDayPlanUpdate(socketId: string, dayPlan: any): Promise<void>;
  }
}
