import type { Request, Response, NextFunction } from 'express'
import prisma from '../../src/services/db'

export async function getSessionFromRequest(req: Request) {
  const token = req.cookies?.sid as string | undefined
  if (!token) return null
  const now = new Date()
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { include: { organisation: true } } },
  })
  if (!session) return null
  if (session.expiresAt < now) {
    await prisma.session.delete({ where: { token } }).catch(() => {})
    return null
  }
  return session
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Not authenticated' })
  ;(req as any).session = session
  next()
}
