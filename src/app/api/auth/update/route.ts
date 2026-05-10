import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { handleImageUpload } from "@/utils/upload";

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return Response.json(
        { success: false, message: "Invalid token format" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };
    } catch (error) {
      return Response.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const phoneNumber = formData.get("phoneNumber") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as File;

    if (!firstName || !lastName || !email) {
      return Response.json(
        { success: false, message: "First name, last name, and email are required" },
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

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== decoded.userId) {
      return Response.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    const updateData: any = {
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber || null,
      city: city || null,
      country: country || null,
      bio: bio || null,
    };

    if (image && image.size > 0) {
      try {
        updateData.profilePic = await handleImageUpload(image);
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

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
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
        updatedAt: true,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);

    return Response.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return Response.json(
        { success: false, message: "Invalid token format" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };
    } catch (error) {
      return Response.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
        updatedAt: true,
      },
    });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get profile error:", error);

    return Response.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}