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

    const userId = parseInt(decoded.userId);
    
    const url = new URL(req.url);
    const status = url.searchParams.get("status"); 

    const whereClause: any = {
      OR: [
        { userId: userId }, 
        { 
          members: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    };

    if (status === "planned") {
      whereClause.OR = whereClause.OR.map((condition: any) => ({
        ...condition,
        status: "planned",
      }));
    } else if (status === "completed") {
      whereClause.OR = whereClause.OR.map((condition: any) => ({
        ...condition,
        status: "completed",
      }));
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        destination: true,
        startDate: true,
        endDate: true,
        budget: true,
        description: true,
        coverImage: true,
        status: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        userId: true, 
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
            stops: true,
            members: true,
          },
        },
      },
    });
    
    const tripsWithRole = trips.map(trip => ({
      ...trip,
      isCreator: trip.userId === userId,
      isMember: trip.userId !== userId,
    }));

    return Response.json({
      success: true,
      trips: tripsWithRole,
    });
  } catch (error) {
    console.error("Get trips error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}