import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function handleImageUpload(image: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
    throw new Error("Invalid image type. Allowed: JPEG, PNG, WebP");
  }

  if (image.size > MAX_IMAGE_SIZE) {
    throw new Error("Image size exceeds 5MB limit");
  }
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }

  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${sanitizedName}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  await fs.writeFile(filePath, buffer);
  
  return `/uploads/${fileName}`;
}