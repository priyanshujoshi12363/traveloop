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

    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json(
        { success: false, message: "Items array is required and must not be empty" },
        { status: 400 }
      );
    }

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

    // Validate each item
    for (const item of items) {
      if (!item.name || !item.packingCategory) {
        return Response.json(
          { success: false, message: "Each item must have a name and packingCategory" },
          { status: 400 }
        );
      }
    }

    // Create all items in a transaction
    const createdItems = await prisma.$transaction(
      items.map((item) => 
        prisma.packingItem.create({
          data: {
            tripId: tripId,
            userId: userId,
            name: item.name,
            packingCategory: item.packingCategory, // ✅ Changed from 'category' to 'packingCategory'
            quantity: item.quantity || 1,
            notes: item.notes || null,
            isPacked: false,
          },
        })
      )
    );

    return Response.json({
      success: true,
      message: `${createdItems.length} items added to packing list`,
      items: createdItems,
    });
  } catch (error) {
    console.error("Bulk add packing items error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}