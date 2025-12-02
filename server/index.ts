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

// In dev, allow Vite dev server; in prod, rely on same-origin or proxy
const devOrigins = [
  process.env.DEV_ORIGIN || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174"
];
const allowedOrigins = [...devOrigins, "http://localhost:8080"];
app.use(cors({ 
  origin: allowedOrigins, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/organisations", organisationsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);

app.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`)
})
