import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/auth'
import organisationsRoutes from './routes/organisations'
import emailRoutes from "./routes/email";
import { logger } from "./logger";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req: any, res: any, next: any) => {
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
    ? (origin: any, callback: any) => {
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
app.get("/api/health", (_req: any, res: any) => {
  logger.info("Health check requested");
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    allowedOrigins: allowedOrigins
  });
});

// Routes
app.use("/api/organisations", organisationsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);

app.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`)
})
