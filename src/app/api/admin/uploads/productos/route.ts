import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/admin";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    const session = await apiAuth();
    if ("error" in session) return session.error;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Formato inválido. Usá JPG, PNG o WEBP." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "La imagen supera 5MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `productos/${crypto.randomUUID()}.${ext}`;

    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({
      url: blob.url,
      fileName: blob.pathname,
    });
  } catch (error) {
    console.error("[ADMIN_PRODUCT_UPLOAD_ERROR]", error);
    return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 });
  }
}
