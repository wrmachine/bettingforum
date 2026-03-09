const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.post.updateMany({
    where: { status: "draft" },
    data: { status: "published" },
  });
  console.log(`Published ${result.count} draft posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
