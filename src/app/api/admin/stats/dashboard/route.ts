import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

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

    // Check if user is admin
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

    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();
    const totalStops = await prisma.tripStop.count();
    const totalActivities = await prisma.tripActivity.count();
    const totalPosts = await prisma.communityPost.count();
    const totalComments = await prisma.communityComment.count();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const newTrips = await prisma.trip.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const tripsByStatus = await prisma.trip.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const activitiesByType = await prisma.tripActivity.groupBy({
      by: ['activityType'],
      _count: {
        id: true,
      },
    });

    return Response.json({
      success: true,
      stats: {
        totalUsers,
        totalTrips,
        totalStops,
        totalActivities,
        totalPosts,
        totalComments,
        newUsers,
        newTrips,
        tripsByStatus,
        activitiesByType,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}