"use server";

import { db } from "@/lib/db";
import { User } from "@prisma/client";
import crypto from "crypto";

// Helper to hash password using native crypto SHA-256
function hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
}

export async function registerUserAction(formData: {
    fullName: string;
    email: string;
    password: string;
}): Promise<{ success: boolean; user?: Omit<User, "password">; error?: string }> {
    try {
        if (!formData.fullName || !formData.email || !formData.password) {
            return { success: false, error: "Todos los campos son obligatorios." };
        }

        const existingUser = await db.user.findUnique({
            where: { email: formData.email.toLowerCase() },
        });

        if (existingUser) {
            return { success: false, error: "El correo electrónico ya está registrado." };
        }

        const hashedPassword = hashPassword(formData.password);

        const newUser = await db.user.create({
            data: {
                fullName: formData.fullName,
                email: formData.email.toLowerCase(),
                password: hashedPassword,
                role: "user",
            },
        });

        const { password, ...userWithoutPassword } = newUser;
        return { success: true, user: userWithoutPassword };
    } catch (e) {
        console.error("Error registering user:", e);
        return { success: false, error: "Error al registrar el usuario." };
    }
}

export async function loginUserAction(formData: {
    email: string;
    password: string;
}): Promise<{ success: boolean; user?: Omit<User, "password">; error?: string }> {
    try {
        if (!formData.email || !formData.password) {
            return { success: false, error: "Todos los campos son obligatorios." };
        }

        const user = await db.user.findUnique({
            where: { email: formData.email.toLowerCase() },
        });

        if (!user) {
            return { success: false, error: "Credenciales incorrectas." };
        }

        const hashedPassword = hashPassword(formData.password);
        if (user.password !== hashedPassword) {
            return { success: false, error: "Credenciales incorrectas." };
        }

        const { password, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword };
    } catch (e) {
        console.error("Error logging in:", e);
        return { success: false, error: "Error al iniciar sesión." };
    }
}

export async function adminLoginAction(passwordInput: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
        const adminPass = process.env.ADMIN_PASSWORD;
        const adminId = process.env.ADMIN_ID;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminFullName = process.env.ADMIN_FULLNAME;
        const adminRole = process.env.ADMIN_ROLE;

        if (!adminPass || !adminId || !adminEmail || !adminFullName || !adminRole) {
            return { success: false, error: "El acceso administrativo no está completamente configurado en las variables de entorno." };
        }

        if (passwordInput === adminPass) {
            return { 
                success: true, 
                user: {
                    id: adminId,
                    email: adminEmail,
                    fullName: adminFullName,
                    role: adminRole,
                }
            };
        }
        return { success: false, error: "Contraseña incorrecta." };
    } catch (e) {
        return { success: false, error: "Error en el servidor de autenticación." };
    }
}
