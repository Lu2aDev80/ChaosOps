import { Router } from 'express'
import prisma from '../../src/services/db'

const router = Router()

router.get('/', async (_req, res) => {
  const orgs = await prisma.organisation.findMany({
    select: { id: true, name: true, description: true },
    orderBy: { name: 'asc' },
  })
  res.json(orgs)
})

export default router
