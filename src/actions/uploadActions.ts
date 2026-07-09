"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadImageAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "No se proporcionó ningún archivo." };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define path
        const uploadDir = join(process.cwd(), "public", "uploads");
        
        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // Generate unique name
        const timestamp = Date.now();
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${timestamp}_${cleanName}`;
        const filePath = join(uploadDir, filename);

        // Write file
        await writeFile(filePath, buffer);

        return { success: true, url: `/uploads/${filename}` };
    } catch (e: any) {
        console.error("Error in uploadImageAction:", e);
        return { success: false, error: "Error al subir la imagen." };
    }
}
