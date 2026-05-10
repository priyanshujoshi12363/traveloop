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
    const destination = url.searchParams.get("destination");
    const minBudget = url.searchParams.get("minBudget");
    const maxBudget = url.searchParams.get("maxBudget");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const minMembers = url.searchParams.get("minMembers");
    const maxMembers = url.searchParams.get("maxMembers");

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

    if (status) {
      whereClause.status = status;
    }

    if (destination) {
      whereClause.destination = {
        contains: destination,
        mode: 'insensitive',
      };
    }

    if (minBudget || maxBudget) {
      whereClause.budget = {};
      if (minBudget) {
        whereClause.budget.gte = parseFloat(minBudget);
      }
      if (maxBudget) {
        whereClause.budget.lte = parseFloat(maxBudget);
      }
    }

    if (startDate) {
      whereClause.startDate = {
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      whereClause.endDate = {
        lte: new Date(endDate),
      };
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
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
        _count: {
          select: {
            members: true,
            stops: true,
          },
        },
      },
    });
    let filteredTrips = trips;
    if (minMembers) {
      filteredTrips = filteredTrips.filter(trip => trip._count.members >= parseInt(minMembers));
    }
    if (maxMembers) {
      filteredTrips = filteredTrips.filter(trip => trip._count.members <= parseInt(maxMembers));
    }

    return Response.json({
      success: true,
      trips: filteredTrips.map(trip => ({
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        description: trip.description,
        coverImage: trip.coverImage,
        status: trip.status,
        isPublic: trip.isPublic,
        shareUrl: trip.shareUrl,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
        creator: trip.user,
        memberCount: trip._count.members,
        stopCount: trip._count.stops,
        isCreator: trip.userId === userId,
      })),
      filters: {
        status: status || null,
        destination: destination || null,
        minBudget: minBudget || null,
        maxBudget: maxBudget || null,
        startDate: startDate || null,
        endDate: endDate || null,
        minMembers: minMembers || null,
        maxMembers: maxMembers || null,
      },
    });
  } catch (error) {
    console.error("Filter trips error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}