/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@pesca.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const hash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    create: {
      name: 'Super Admin',
      email,
      passwordHash: hash,
      role: 'SUPER_ADMIN',
    },
    update: {
      passwordHash: hash,
      role: 'SUPER_ADMIN',
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed admin ready:', email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
