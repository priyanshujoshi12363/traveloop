import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { handleImageUpload } from "@/utils/upload";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const password = formData.get("password") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as File;

    if (!firstName || !lastName || !email || !password) {
      return Response.json(
        { success: false, message: "Required fields missing: firstName, lastName, email, password" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return Response.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    let imagePath = "";
    if (image && image.size > 0) {
      try {
        imagePath = await handleImageUpload(image);
      } catch (error) {
        return Response.json(
          { 
            success: false, 
            message: error instanceof Error ? error.message : "Image upload failed" 
          },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        city: city || null,
        country: country || null,
        bio: bio || null,
        profilePic: imagePath || null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        city: true,
        country: true,
        bio: true,
        profilePic: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return Response.json(
      {
        success: true,
        message: "User registered successfully",
        user,
        token, 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return Response.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}