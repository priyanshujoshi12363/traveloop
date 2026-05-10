import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const packingItems = await prisma.packingItem.findMany({
      where: {
        tripId: tripId,
        userId: userId,
      },
      orderBy: {
        packingCategory: 'asc',
      },
    });

    const groupedItems = packingItems.reduce((acc, item) => {
      if (!acc[item.packingCategory]) {
        acc[item.packingCategory] = [];
      }
      acc[item.packingCategory].push(item);
      return acc;
    }, {} as Record<string, typeof packingItems>);

    const totalItems = packingItems.length;
    const packedItems = packingItems.filter(item => item.isPacked).length;
    const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

    return Response.json({
      success: true,
      tripId: tripId,
      userId: userId,
      items: packingItems,
      groupedItems: groupedItems,
      stats: {
        total: totalItems,
        packed: packedItems,
        unpacked: totalItems - packedItems,
        progress: Math.round(progress),
      },
    });
  } catch (error) {
    console.error("Get packing items error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}