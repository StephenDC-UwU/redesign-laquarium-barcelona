"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v2 as cloudinary } from "cloudinary";

export async function uploadImageAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "No se proporcionó ningún archivo." };
        }

        // Configure Cloudinary inside the function call to ensure env vars are populated
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });
        }

        const isCloudinaryConfigured = !!(
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET
        );

        if (isCloudinaryConfigured) {
            // Convert file to buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload directly to Cloudinary
            const uploadResult = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { 
                        folder: "laquarium_barcelona",
                        resource_type: "auto"
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });

            return { success: true, url: uploadResult.secure_url };
        } else {
            console.warn("Cloudinary is not configured. Falling back to local upload.");
            
            // Local fallback logic
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadDir = join(process.cwd(), "public", "uploads");
            await mkdir(uploadDir, { recursive: true });

            const timestamp = Date.now();
            const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const filename = `${timestamp}_${cleanName}`;
            const filePath = join(uploadDir, filename);

            await writeFile(filePath, buffer);

            return { success: true, url: `/uploads/${filename}` };
        }
    } catch (e: any) {
        console.error("Error in uploadImageAction:", e);
        return { success: false, error: "Error al subir la imagen." };
    }
}
