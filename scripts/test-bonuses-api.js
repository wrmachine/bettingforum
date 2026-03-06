const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const posts = await prisma.post.findMany({
      where: { type: "bonus", status: "published" },
      include: {
        author: { select: { username: true } },
        votes: { select: { value: true } },
        _count: { select: { comments: true } },
        postTags: { include: { tag: true } },
        bonus: {
          include: {
            product: {
              select: {
                brandName: true,
                siteUrl: true,
                post: { select: { slug: true } },
              },
            },
          },
        },
      },
      take: 5,
    });
    console.log("Success! Found", posts.length, "bonuses");
    console.log("First bonus product:", posts[0]?.bonus?.product);
  } catch (err) {
    console.error("Error:", err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
