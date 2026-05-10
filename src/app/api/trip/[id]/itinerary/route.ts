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
    const titleQuery = url.searchParams.get("title") || "";

    if (!titleQuery) {
      return Response.json(
        { success: false, message: "Please provide a trip title to search" },
        { status: 400 }
      );
    }

    const trips = await prisma.trip.findMany({
      where: {
        title: {
          contains: titleQuery,
          mode: 'insensitive',
        },
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
      select: {
        id: true,
        title: true,
        destination: true,
      },
      take: 5, 
    });

    if (trips.length === 0) {
      return Response.json({
        success: true,
        message: "No trips found with that title",
        trips: [],
      });
    }

    const tripsWithItinerary = await Promise.all(
      trips.map(async (trip) => {
        const stops = await prisma.tripStop.findMany({
          where: {
            tripId: trip.id,
          },
          orderBy: {
            orderIndex: 'asc',
          },
          include: {
            activities: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        });

        const itinerary = stops.map(stop => ({
          id: stop.id,
          cityName: stop.cityName,
          country: stop.country,
          startDate: stop.startDate,
          endDate: stop.endDate,
          orderIndex: stop.orderIndex,
          costIndex: stop.costIndex,
          popularity: stop.popularity,
          stopNotes: stop.stopNotes,
          activities: stop.activities.map(activity => ({
            id: activity.id,
            name: activity.name,
            description: activity.description,
            image: activity.image,
            category: activity.category,
            cost: activity.cost,
            duration: activity.duration,
            location: activity.location,
            time: activity.time,
            isCompleted: activity.isCompleted,
            createdAt: activity.createdAt,
          })),
        }));

        return {
          id: trip.id,
          title: trip.title,
          destination: trip.destination,
          itinerary: itinerary,
          totalStops: itinerary.length,
          totalActivities: itinerary.reduce((acc, stop) => acc + stop.activities.length, 0),
        };
      })
    );

    return Response.json({
      success: true,
      trips: tripsWithItinerary,
    });
  } catch (error) {
    console.error("Search itinerary error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}