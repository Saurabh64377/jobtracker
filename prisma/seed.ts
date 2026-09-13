import "dotenv/config";
import { prisma } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth/password";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN") {
      await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log(`Promoted existing user ${email} to ADMIN.`);
    } else {
      console.log(`Admin user ${email} already exists.`);
    }
    return;
  }

  const hashed = await hashPassword(password);
  await prisma.user.create({
    data: {
      name: "Admin",
      email,
      password: hashed,
      role: "ADMIN",
      isActive: true,
      onboardingCompleted: true,
    },
  });

  console.log(`Created admin user: ${email}`);
}

async function main() {
  await seedAdmin();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
