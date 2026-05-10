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

    const trips = await prisma.trip.findMany({
      where: {
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
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
            email: true,
          },
        },
        stops: {
          take: 3,
          orderBy: {
            orderIndex: 'asc',
          },
          select: {
            id: true,
            cityName: true,
            country: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (trips.length === 0) {
      return Response.json({
        success: true,
        message: "No trips found",
        trip: null,
      });
    }

    const sortedTrips = trips.sort((a, b) => b._count.members - a._count.members);
    const hotTrip = sortedTrips[0];

    const isCreator = hotTrip.userId === userId;
    const member = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: {
          tripId: hotTrip.id,
          userId: userId,
        },
      },
    });

    return Response.json({
      success: true,
      trip: {
        id: hotTrip.id,
        title: hotTrip.title,
        destination: hotTrip.destination,
        startDate: hotTrip.startDate,
        endDate: hotTrip.endDate,
        budget: hotTrip.budget,
        description: hotTrip.description,
        coverImage: hotTrip.coverImage,
        status: hotTrip.status,
        isPublic: hotTrip.isPublic,
        shareUrl: hotTrip.shareUrl,
        createdAt: hotTrip.createdAt,
        updatedAt: hotTrip.updatedAt,
        creator: {
          id: hotTrip.user.id,
          firstName: hotTrip.user.firstName,
          lastName: hotTrip.user.lastName,
          profilePic: hotTrip.user.profilePic,
          email: hotTrip.user.email,
        },
        stops: hotTrip.stops,
        memberCount: hotTrip._count.members,
        stopCount: hotTrip.stops.length,
        isCreator: isCreator,
        userRole: isCreator ? "creator" : (member?.role || "member"),
      },
    });
  } catch (error) {
    console.error("Get hot trip error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}