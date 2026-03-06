/**
 * Create or promote a user to admin.
 * Usage: node scripts/make-admin.js [email] [password]
 * If email is provided, updates that user to admin. Otherwise creates admin@example.com.
 * When creating a new user, password is required (or use default "ChangeMe123!").
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || "admin@example.com").trim().toLowerCase();
  const password = process.argv[3] || "ChangeMe123!";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role === "admin") {
      console.log(`User ${email} is already an admin.`);
      return;
    }
    await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });
    console.log(`Promoted ${email} to admin.`);
  } else {
    const username = email.split("@")[0];
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { username, email, password: hashedPassword, role: "admin" },
    });
    console.log(`Created admin user: ${email} (username: ${username})`);
    console.log(`\nPassword: ${password} (change after first sign-in)`);
  }

  console.log("\nSign in at /auth/sign-in with this email.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
