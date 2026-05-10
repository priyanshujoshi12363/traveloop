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
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch (error) {
      return Response.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = parseInt(decoded.userId);
    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const image = formData.get("image") as File | null;

    if (!title || !content || !category) {
      return Response.json(
        { success: false, message: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    let imageUrl = null;
    if (image && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return Response.json(
          { success: false, message: "File must be an image" },
          { status: 400 }
        );
      }

      if (image.size > 5 * 1024 * 1024) {
        return Response.json(
          { success: false, message: "File size must be less than 5MB" },
          { status: 400 }
        );
      }

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uniqueId = uuidv4();
      const fileExtension = image.name.split(".").pop();
      const filename = `community-${uniqueId}.${fileExtension}`;
      
      const uploadDir = path.join(process.cwd(), "public/uploads/community");
      const filePath = path.join(uploadDir, filename);
      
      const fs = require("fs");
      await fs.promises.mkdir(uploadDir, { recursive: true });
      await writeFile(filePath, buffer);

      imageUrl = `/uploads/community/${filename}`;
    }

    const post = await prisma.communityPost.create({
      data: {
        userId: userId,
        title: title,
        content: content,
        category: category,
        image: imageUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    });

    return Response.json({
      success: true,
      message: "Post created successfully",
      post: post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return Response.json(
      { success: false, message: "Server error" },
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
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch (error) {
      return Response.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "";
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (category) {
      whereClause.category = category;
    }

    const posts = await prisma.communityPost.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: skip,
      take: limit,
    });

    const total = await prisma.communityPost.count({
      where: whereClause,
    });

    return Response.json({
      success: true,
      posts: posts,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}