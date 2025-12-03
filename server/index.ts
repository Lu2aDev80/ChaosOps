import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import authRoutes from './routes/auth'
import organisationsRoutes from './routes/organisations'
import eventsRoutes from './routes/events'
import emailRoutes from "./routes/email";
import uploadRoutes from './routes/upload';
import { logger } from "./logger";
import { testConnection, isEmailEnabled } from "./mailer";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
// Optional base path for running behind reverse proxies (e.g., /minihackathon)
const BASE_PATH = (process.env.APP_BASE_PATH || '').trim();
const apiBase = `${BASE_PATH}/api`;

app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// In dev, allow Vite dev server; in prod, rely on same-origin or proxy
const devOrigins = [
  process.env.DEV_ORIGIN || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174"
];

// For production, also allow the configured frontend host and common production patterns
const productionOrigins = [
  process.env.FRONTEND_HOST,
  "http://localhost:8080", // Local docker setup
  // Add your actual production domains here
  "https://lu2adevelopment.de",
  "https://www.lu2adevelopment.de"
].filter(Boolean); // Remove any undefined values

const allowedOrigins = [...devOrigins, ...productionOrigins];

app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // In production, allow same-origin requests (no origin header) and configured origins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      }
    : allowedOrigins, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Health
app.get(`${apiBase}/health`, (_req: Request, res: Response) => {
  logger.info("Health check requested");
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    allowedOrigins: allowedOrigins,
    emailEnabled: isEmailEnabled(),
    basePath: BASE_PATH || '/'
  });
});

// Routes
app.use(`${apiBase}/organisations`, organisationsRoutes);
app.use(`${apiBase}`, eventsRoutes);
app.use(`${apiBase}/auth`, authRoutes);
app.use(`${apiBase}/email`, emailRoutes);
app.use(`${apiBase}/upload`, uploadRoutes);

// Test SMTP connection on startup (non-blocking)
async function testEmailOnStartup() {
  logger.info('Testing SMTP connection on startup...');
  const result = await testConnection();
  
  if (result.success) {
    logger.info('✓ Email service ready', result.config);
  } else {
    logger.warn('✗ Email service unavailable - will continue without email functionality', {
      error: result.error,
      config: result.config
    });
    logger.warn('To enable email: Configure SMTP_HOST, SMTP_USER, SMTP_PASS environment variables');
  }
}

app.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`)
  
  // Test email connection after server starts (don't block startup)
  setTimeout(() => {
    testEmailOnStartup().catch(err => {
      logger.error('Error during email startup test', { error: err.message });
    });
  }, 1000);
})
