import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const postId = parseInt(id);
    const userId = parseInt(decoded.userId);

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return Response.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    const existingLike = await prisma.communityLike.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId,
        },
      },
    });

    if (existingLike) {
      return Response.json(
        { success: false, message: "You already liked this post" },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.communityLike.create({
        data: {
          postId: postId,
          userId: userId,
        },
      }),
      prisma.communityPost.update({
        where: { id: postId },
        data: {
          likes: { increment: 1 },
        },
      }),
    ]);

    return Response.json({
      success: true,
      message: "Post liked successfully",
    });
  } catch (error) {
    console.error("Like post error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}