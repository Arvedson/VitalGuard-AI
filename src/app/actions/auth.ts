"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["PATIENT", "DOCTOR"]).optional().default("PATIENT"),
});

export async function registerUser(formData: z.infer<typeof registerSchema>) {
  try {
    const { name, email, password, role } = registerSchema.parse(formData);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists with this email." };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userData: any = {
      name,
      email,
      passwordHash,
      role,
    };

    if (role === "DOCTOR") {
      userData.doctor = {
        create: {
          name: name,
        }
      };
    } else {
      userData.patient = {
        create: {
          name: name,
          birthDate: new Date(), // Placeholder, should be updated in profile
          gender: "OTHER", // Placeholder
        }
      };
    }

    const user = await prisma.user.create({
      data: userData,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: "Something went wrong. Please try again." };
  }
}
