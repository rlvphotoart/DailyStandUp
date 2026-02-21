import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const today = new Date().toISOString().split('T')[0];

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.blocker.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash('admin123', 10);
  const memberHash = await bcrypt.hash('pass123', 10);

  const admin = await prisma.user.create({
    data: { name: 'Alex Rivera', email: 'admin@loop.dev', password: adminHash, role: 'ADMIN', color: '#6c63ff' },
  });
  const sam = await prisma.user.create({
    data: { name: 'Sam Chen', email: 'sam@loop.dev', password: memberHash, color: '#22c55e' },
  });
  const jordan = await prisma.user.create({
    data: { name: 'Jordan Park', email: 'jordan@loop.dev', password: memberHash, color: '#f97316' },
  });
  const mia = await prisma.user.create({
    data: { name: 'Mia Torres', email: 'mia@loop.dev', password: memberHash, color: '#3b82f6' },
  });

  await prisma.task.createMany({
    data: [
      { title: 'Finish auth PR review', description: 'PR #142', status: 'INPROGRESS', date: today, assigneeId: sam.id, createdById: admin.id },
      { title: 'Update API docs', status: 'PLANNED', date: today, assigneeId: sam.id, createdById: admin.id },
      { title: 'Fix prod bug #88', description: 'Login loop on mobile Safari', status: 'BLOCKED', date: today, assigneeId: jordan.id, createdById: admin.id },
      { title: 'Deploy staging build', status: 'DONE', date: today, assigneeId: jordan.id, createdById: admin.id },
      { title: 'Design system audit', description: 'Button & form components', status: 'PLANNED', date: today, assigneeId: mia.id, createdById: admin.id },
    ],
  });

  await prisma.blocker.createMany({
    data: [
      { text: 'Need access to prod DB logs from infra team', severity: 'HIGH', needsHelpFrom: 'DevOps', date: today, userId: jordan.id },
      { text: 'Waiting on design specs for new onboarding flow', severity: 'MED', needsHelpFrom: 'Mia Torres', date: today, userId: sam.id },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('   Admin → admin@loop.dev / admin123');
  console.log('   Members → sam@loop.dev, jordan@loop.dev, mia@loop.dev / pass123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
