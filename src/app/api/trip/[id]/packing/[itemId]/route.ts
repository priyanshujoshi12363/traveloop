import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
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

    const { id, itemId } = await params;
    const tripId = parseInt(id);
    const itemIdInt = parseInt(itemId);
    const userId = parseInt(decoded.userId);

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
    const item = await prisma.packingItem.findFirst({
      where: {
        id: itemIdInt,
        tripId: tripId,
        userId: userId,
      },
    });

    if (!item) {
      return Response.json(
        { success: false, message: "Item not found" },
        { status: 404 }
      );
    }

    await prisma.packingItem.delete({
      where: {
        id: itemIdInt,
      },
    });

    return Response.json({
      success: true,
      message: "Item deleted from packing list",
    });
  } catch (error) {
    console.error("Delete packing item error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}