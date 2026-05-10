import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const tripId = parseInt(id);
    const userId = parseInt(decoded.userId);

    // Check if user is a member of this trip
    const member = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: {
          tripId: tripId,
          userId: userId,
        },
      },
    });

    if (!member) {
      return Response.json(
        { success: false, message: "You are not a member of this trip" },
        { status: 404 }
      );
    }

    // Check if user is the creator (can't leave if creator)
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { userId: true },
    });

    if (trip?.userId === userId) {
      return Response.json(
        { success: false, message: "Creator cannot leave the trip. Delete the trip instead." },
        { status: 400 }
      );
    }

    // Remove user from trip members
    await prisma.tripMember.delete({
      where: {
        tripId_userId: {
          tripId: tripId,
          userId: userId,
        },
      },
    });

    return Response.json({
      success: true,
      message: "You have left the trip successfully",
    });
  } catch (error) {
    console.error("Leave trip error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}