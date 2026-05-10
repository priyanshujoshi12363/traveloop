import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
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

    const creatorUserId = parseInt(decoded.userId);

    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const destination = formData.get("destination") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const budget = formData.get("budget") as string;
    const description = formData.get("description") as string;
    
    const imageFile = formData.get("coverImage") as File | null;

    if (!title || !destination || !startDate || !endDate || !budget) {
      return Response.json(
        { 
          success: false, 
          message: "Missing required fields: title, destination, startDate, endDate, budget" 
        },
        { status: 400 }
      );
    }

    let coverImageUrl = null;
    if (imageFile && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        return Response.json(
          { success: false, message: "File must be an image" },
          { status: 400 }
        );
      }

      if (imageFile.size > 5 * 1024 * 1024) {
        return Response.json(
          { success: false, message: "File size must be less than 5MB" },
          { status: 400 }
        );
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uniqueId = uuidv4();
      const fileExtension = imageFile.name.split(".").pop();
      const filename = `trip-${uniqueId}.${fileExtension}`;
      
      const uploadDir = path.join(process.cwd(), "public/uploads/trips");
      const filePath = path.join(uploadDir, filename);
      
      const fs = require("fs");
      await fs.promises.mkdir(uploadDir, { recursive: true });
      await writeFile(filePath, buffer);

      coverImageUrl = `/uploads/trips/${filename}`;
    }

    const trip = await prisma.trip.create({
      data: {
        title,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: parseFloat(budget),
        description: description || "",
        coverImage: coverImageUrl,
        userId: creatorUserId,
      },
    });

    return Response.json({
      success: true,
      message: "Trip created successfully",
      trip: {
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        description: trip.description,
        coverImage: trip.coverImage,
        status: trip.status,
        createdAt: trip.createdAt,
        createdBy: creatorUserId,
      },
    });
  } catch (error) {
    console.error("Create trip error:", error);
    return Response.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}