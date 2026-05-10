import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return Response.json(
        { success: false, message: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
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
        trips: {
          select: {
            id: true,
            title: true,
            destination: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        memberOf: {
          select: {
            trip: {
              select: {
                id: true,
                title: true,
                destination: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'desc',
          },
        },
        communityPosts: {
          select: {
            id: true,
            title: true,
            content: true,
            category: true,
            likes: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        communityComments: {
          select: {
            id: true,
            content: true,
            post: {
              select: {
                title: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            trips: true,
            memberOf: true,
            communityPosts: true,
            communityComments: true,
          },
        },
      },
    });

    if (!targetUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      user: targetUser,
    });
  } catch (error) {
    console.error("Get user details error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}