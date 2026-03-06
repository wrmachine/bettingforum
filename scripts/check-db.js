const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.post.count();
  console.log("Post count:", count);
  const sample = await prisma.post.findMany({ take: 3, select: { title: true, type: true } });
  console.log("Sample:", JSON.stringify(sample, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
