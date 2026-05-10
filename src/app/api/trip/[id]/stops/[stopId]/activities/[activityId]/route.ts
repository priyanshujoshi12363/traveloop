import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; activityId: string }> }) {
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

    const { id, activityId } = await params;
    const tripId = parseInt(id);
    const activityIdInt = parseInt(activityId);
    const userId = parseInt(decoded.userId);

    const body = await req.json();
    const { 
      name, 
      description, 
      activityType, 
      cost, 
      duration, 
      location, 
      time, 
      isCompleted 
    } = body;

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

    const activity = await prisma.tripActivity.findFirst({
      where: {
        id: activityIdInt,
        tripId: tripId,
      },
    });

    if (!activity) {
      return Response.json(
        { success: false, message: "Activity not found" },
        { status: 404 }
      );
    }

    const updatedActivity = await prisma.tripActivity.update({
      where: {
        id: activityIdInt,
      },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        activityType: activityType || undefined,
        cost: cost !== undefined ? (cost ? parseFloat(cost) : null) : undefined,
        duration: duration !== undefined ? duration : undefined,
        location: location !== undefined ? location : undefined,
        time: time !== undefined ? time : undefined,
        isCompleted: isCompleted !== undefined ? isCompleted : undefined,
      },
    });

    return Response.json({
      success: true,
      message: "Activity updated successfully",
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Update activity error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; activityId: string }> }) {
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

    const { id, activityId } = await params;
    const tripId = parseInt(id);
    const activityIdInt = parseInt(activityId);
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

    // Check if activity exists and belongs to this trip
    const activity = await prisma.tripActivity.findFirst({
      where: {
        id: activityIdInt,
        tripId: tripId,
      },
    });

    if (!activity) {
      return Response.json(
        { success: false, message: "Activity not found" },
        { status: 404 }
      );
    }

    // Delete activity
    await prisma.tripActivity.delete({
      where: {
        id: activityIdInt,
      },
    });

    return Response.json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error("Delete activity error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}