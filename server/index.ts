import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/auth'
import organisationsRoutes from './routes/organisations'
import { logger } from './logger'

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.use(express.json())
app.use(cookieParser())

// In dev, allow Vite dev server; in prod, rely on same-origin or proxy
const devOrigin = process.env.DEV_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: [devOrigin], credentials: true }))

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Routes
app.use('/api/organisations', organisationsRoutes)
app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`)
})
