import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: Request, { params }: { params: Promise<{ id: string; stopId: string }> }) {
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

    const { id, stopId } = await params;
    const tripId = parseInt(id);
    const stopIdInt = parseInt(stopId);
    const userId = parseInt(decoded.userId);

    const body = await req.json();
    const { 
      name, 
      description, 
      activityType, 
      cost, 
      duration, 
      location, 
      time 
    } = body;

    if (!name || !activityType) {
      return Response.json(
        { success: false, message: "Name and activity type are required" },
        { status: 400 }
      );
    }
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
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
    });

    if (!trip) {
      return Response.json(
        { success: false, message: "Trip not found or you don't have access" },
        { status: 404 }
      );
    }

    const stop = await prisma.tripStop.findFirst({
      where: {
        id: stopIdInt,
        tripId: tripId,
      },
    });

    if (!stop) {
      return Response.json(
        { success: false, message: "Stop not found" },
        { status: 404 }
      );
    }

    
    const activity = await prisma.tripActivity.create({
      data: {
        tripId: tripId,
        stopId: stopIdInt,
        name: name,
        description: description || null,
        activityType: activityType,
        cost: cost ? parseFloat(cost) : null,
        duration: duration || null,
        location: location || null,
        time: time || null,
        isCompleted: false,
      },
    });

    return Response.json({
      success: true,
      message: "Activity added successfully",
      activity,
    });
  } catch (error) {
    console.error("Add activity error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string; stopId: string }> }) {
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

    const { id, stopId } = await params;
    const tripId = parseInt(id);
    const stopIdInt = parseInt(stopId);
    const userId = parseInt(decoded.userId);

    // Check if user has access to this trip
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
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
    });

    if (!trip) {
      return Response.json(
        { success: false, message: "Trip not found or you don't have access" },
        { status: 404 }
      );
    }

    // Get all activities for this stop
    const activities = await prisma.tripActivity.findMany({
      where: {
        tripId: tripId,
        stopId: stopIdInt,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return Response.json({
      success: true,
      tripId: tripId,
      stopId: stopIdInt,
      activities: activities,
    });
  } catch (error) {
    console.error("Get activities error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}