import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
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

    // Check if item exists and belongs to user
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

    // Toggle packed status
    const updatedItem = await prisma.packingItem.update({
      where: {
        id: itemIdInt,
      },
      data: {
        isPacked: !item.isPacked,
        updatedAt: new Date(),
      },
    });

    return Response.json({
      success: true,
      message: `Item ${updatedItem.isPacked ? 'packed' : 'unpacked'} successfully`,
      item: updatedItem,
    });
  } catch (error) {
    console.error("Toggle packing item error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}