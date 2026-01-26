import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Seed Organisations
  const organisations = [
    {
      id: 'org1',
      name: 'Jugendgruppe St. Martin',
      description: 'Konfi-Tag Organisation St. Martin',
    },
    {
      id: 'org2',
      name: 'Ev. Jugend West',
      description: 'Evangelische Jugendgruppe Nord',
    },
    {
      id: 'org3',
      name: 'Konfi-Team Süd',
      description: 'Konfi-Tag Team Süd',
    },
  ]

  console.log('📋 Seeding organisations...')
  for (const org of organisations) {
    await prisma.organisation.upsert({
      where: { id: org.id },
      update: {},
      create: org,
    })
    console.log(`  ✓ Created/Updated: ${org.name}`)
  }

  // Seed a demo admin user with hashed password
  console.log('👤 Seeding admin user...')
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    console.log('  ⚠️ ADMIN_PASSWORD environment variable not set - skipping admin user creation')
    console.log('  💡 Set ADMIN_PASSWORD in your .env file to create an admin user')
  } else {
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12)
    
    await prisma.adminUser.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@konfidayplaner.de',
        passwordHash: adminPasswordHash,
      },
    })
    console.log('  ✓ Created/Updated: admin user')
  }

  console.log('✅ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
