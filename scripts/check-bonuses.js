const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.post.count({ where: { type: "bonus", status: "published" } });
  console.log("Bonus posts in DB:", count);
  const bonuses = await prisma.post.findMany({
    where: { type: "bonus", status: "published" },
    select: { id: true, title: true, slug: true },
  });
  console.log("Sample:", bonuses.slice(0, 3));
  await prisma.$disconnect();
}

main().catch(console.error);
