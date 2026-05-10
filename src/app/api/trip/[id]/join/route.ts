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
    const tripId = parseInt(id);
    const userId = parseInt(decoded.userId);

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      return Response.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: {
          tripId: tripId,
          userId: userId,
        },
      },
    });

    if (existingMember) {
      return Response.json(
        { success: false, message: "You are already a member of this trip" },
        { status: 409 }
      );
    }

    // Add user as a member
    const member = await prisma.tripMember.create({
      data: {
        tripId: tripId,
        userId: userId,
        role: "member",
      },
    });

    return Response.json({
      success: true,
      message: "Successfully joined the trip!",
      member,
    });
  } catch (error) {
    console.error("Join trip error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}