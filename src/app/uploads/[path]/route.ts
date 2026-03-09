import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path: filePath } = await params;
  if (!filePath || filePath.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const fullPath = path.resolve(path.join(UPLOAD_DIR, filePath));
  const uploadDirResolved = path.resolve(UPLOAD_DIR);
  if (!fullPath.startsWith(uploadDirResolved)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const bytes = await readFile(fullPath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return new NextResponse(null, { status: 404 });
    }
    console.error("Upload serve error:", err);
    return NextResponse.json({ error: "File not found" }, { status: 500 });
  }
}
