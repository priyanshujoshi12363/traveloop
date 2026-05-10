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
      select: {
        id: true,
        budget: true,
        budgetItems: {
          select: {
            id: true,
            budgetCategory: true,
            itemName: true,
            cost: true,
            isPaid: true,
            date: true,
            notes: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!trip) {
      return Response.json(
        { success: false, message: "Trip not found or you don't have access" },
        { status: 404 }
      );
    }

    const totalBudget = trip.budget;
    const totalSpent = trip.budgetItems.reduce((sum, item) => sum + item.cost, 0);
    const remainingBudget = totalBudget - totalSpent;

    const categoryBreakdown = trip.budgetItems.reduce((acc, item) => {
      const category = item.budgetCategory;
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          count: 0,
          items: [],
        };
      }
      acc[category].total += item.cost;
      acc[category].count += 1;
      acc[category].items.push({
        id: item.id,
        itemName: item.itemName,
        cost: item.cost,
        isPaid: item.isPaid,
        date: item.date,
        notes: item.notes,
      });
      return acc;
    }, {} as Record<string, { total: number; count: number; items: any[] }>);

    const paidItems = trip.budgetItems.filter(item => item.isPaid);
    const unpaidItems = trip.budgetItems.filter(item => !item.isPaid);

    return Response.json({
      success: true,
      tripId: tripId,
      budgetSummary: {
        totalBudget: totalBudget,
        totalSpent: totalSpent,
        remainingBudget: remainingBudget,
        spentPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        remainingPercentage: totalBudget > 0 ? (remainingBudget / totalBudget) * 100 : 0,
      },
      categoryBreakdown: categoryBreakdown,
      items: {
        all: trip.budgetItems,
        paid: paidItems,
        unpaid: unpaidItems,
      },
      counts: {
        totalItems: trip.budgetItems.length,
        paidItems: paidItems.length,
        unpaidItems: unpaidItems.length,
        categories: Object.keys(categoryBreakdown).length,
      },
    });
  } catch (error) {
    console.error("Get budget summary error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}