const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "partners@wrmachine.com";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });
    console.log(`Updated ${email} to admin.`);
  } else {
    let username = "partners";
    let n = 0;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `partners${++n}`;
    }
    const hashedPassword = bcrypt.hashSync("ChangeMe123!", 10);
    await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log(`Created admin user ${email} (username: ${username}, temp password: ChangeMe123!)`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
