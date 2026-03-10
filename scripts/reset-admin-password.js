/**
 * Reset an admin user's password in the database.
 * Usage: node scripts/reset-admin-password.js [email] [newPassword]
 * Default: dave@example.com, password123
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || "dave@example.com").trim().toLowerCase();
  const newPassword = process.argv[3] || "password123";

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  if (user.role !== "admin") {
    console.error(`User ${email} is not an admin. Use make-admin.js to promote first.`);
    process.exit(1);
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log(`Password reset for admin ${email}`);
  console.log(`Sign in at /auth/sign-in with email: ${email}`);
  console.log(`New password: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
