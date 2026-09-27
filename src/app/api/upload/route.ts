import { db } from "@/db";
import { uploadedMedia } from "@/db/schema";
import { requireAdmin, logAdminActivity } from "@/lib/auth";
import { createHash, randomBytes } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const admin = await requireAdmin("uploads.create");
  if (!admin) {
    return Response.json({ error: "Unauthorized: Upload permission required" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return Response.json({ error: "No image file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: "Only JPG, PNG, WEBP, GIF, and SVG images are allowed" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "Image size must be under 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let uploadedUrl = "";
    let storageProvider = "local";

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudKey = process.env.CLOUDINARY_API_KEY;
    const cloudSecret = process.env.CLOUDINARY_API_SECRET;

    // 1. Cloudinary upload if configured
    if (cloudName && cloudKey && cloudSecret) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = "mrtomgadgets";
        const sigStr = `folder=${folder}&timestamp=${timestamp}${cloudSecret}`;
        const signature = createHash("sha1").update(sigStr).digest("hex");

        const cf = new FormData();
        cf.append("file", new Blob([buffer], { type: file.type }), file.name);
        cf.append("api_key", cloudKey);
        cf.append("timestamp", String(timestamp));
        cf.append("folder", folder);
        cf.append("signature", signature);

        const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: cf,
        });
        if (cRes.ok) {
          const cData = await cRes.json();
          uploadedUrl = cData.secure_url;
          storageProvider = "cloudinary";
        }
      } catch (err) {
        console.error("Cloudinary upload fallback to local:", err);
      }
    }

    // 2. Local /public/uploads fallback (works in container/sandbox & serves directly via Next.js static assets)
    if (!uploadedUrl) {
      const ext = path.extname(file.name) || ".jpg";
      const safeName = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, safeName), buffer);
      uploadedUrl = `/uploads/${safeName}`;
      storageProvider = process.env.S3_BUCKET ? "r2_s3_compatible" : "local";
    }

    const record = await db
      .insert(uploadedMedia)
      .values({
        fileName: file.name.slice(0, 250),
        url: uploadedUrl,
        storageProvider,
        mimeType: file.type,
        sizeBytes: file.size,
        uploadedBy: admin.id,
      })
      .returning();

    await logAdminActivity({
      actor: admin,
      action: "media.upload",
      entityType: "product",
      entityId: record[0]?.id,
      summary: `Uploaded image "${file.name}" (${storageProvider})`,
      details: { url: uploadedUrl, sizeBytes: file.size, provider: storageProvider },
      req,
    });

    return Response.json({
      ok: true,
      url: uploadedUrl,
      provider: storageProvider,
      media: record[0],
    });
  } catch (e) {
    console.error("upload error", e);
    return Response.json({ error: "Image upload failed" }, { status: 500 });
  }
}
