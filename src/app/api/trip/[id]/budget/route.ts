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
    const { category, itemName, cost, date, isPaid, notes } = body;

    if (!category || !itemName || cost === undefined) {
      return Response.json(
        { success: false, message: "Category, item name, and cost are required" },
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

    const budgetItem = await prisma.budgetItem.create({
      data: {
        tripId: tripId,
        budgetCategory: category,
        itemName: itemName,
        cost: parseFloat(cost),
        date: date ? new Date(date) : null,
        isPaid: isPaid || false,
        notes: notes || null,
      },
    });

    return Response.json({
      success: true,
      message: "Budget item added successfully",
      item: budgetItem,
    });
  } catch (error) {
    console.error("Add budget item error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}



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

    const budgetItems = await prisma.budgetItem.findMany({
      where: {
        tripId: tripId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json({
      success: true,
      tripId: tripId,
      items: budgetItems,
    });
  } catch (error) {
    console.error("Get budget items error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}