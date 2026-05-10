// app/api/trips/[id]/route.ts
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
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePic: true,
                email: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        stops: {
          include: {
            activities: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        notes: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePic: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        budgetItems: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            stops: true,
            members: true,
            notes: true,
            budgetItems: true,
          },
        },
      },
    });

    if (!trip) {
      return Response.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    }

    const totalSpent = trip.budgetItems.reduce((sum, item) => sum + item.cost, 0);

    const isCreator = trip.userId === userId;
    const member = trip.members.find(m => m.userId === userId);
    const userRole = isCreator ? "creator" : (member?.role || "viewer");

    return Response.json({
      success: true,
      trip: {
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        description: trip.description,
        coverImage: trip.coverImage,
        status: trip.status,
        isPublic: trip.isPublic,
        shareUrl: trip.shareUrl,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
        
        creator: {
          id: trip.user.id,
          firstName: trip.user.firstName,
          lastName: trip.user.lastName,
          profilePic: trip.user.profilePic,
          email: trip.user.email,
        },
        
        members: trip.members.map(member => ({
          id: member.id,
          role: member.role,
          joinedAt: member.joinedAt,
          user: {
            id: member.user.id,
            firstName: member.user.firstName,
            lastName: member.user.lastName,
            profilePic: member.user.profilePic,
            email: member.user.email,
          },
        })),
        
        itinerary: trip.stops.map(stop => ({
          id: stop.id,
          cityName: stop.cityName,
          country: stop.country,
          startDate: stop.startDate,
          endDate: stop.endDate,
          orderIndex: stop.orderIndex,
          costIndex: stop.costIndex,
          popularity: stop.popularity,
          stopNotes: stop.stopNotes,
          activities: stop.activities.map(activity => ({
            id: activity.id,
            name: activity.name,
            description: activity.description,
            image: activity.image,
            category: activity.category,
            cost: activity.cost,
            duration: activity.duration,
            location: activity.location,
            time: activity.time,
            isCompleted: activity.isCompleted,
          })),
        })),
        
        notes: trip.notes.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          isPrivate: note.isPrivate,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          user: {
            id: note.user.id,
            firstName: note.user.firstName,
            lastName: note.user.lastName,
            profilePic: note.user.profilePic,
          },
        })),
        
        budgetItems: trip.budgetItems.map(item => ({
          id: item.id,
          category: item.category,
          itemName: item.itemName,
          cost: item.cost,
          date: item.date,
          isPaid: item.isPaid,
          notes: item.notes,
        })),
        
        
        budgetSummary: {
          total: trip.budget,
          spent: totalSpent,
          remaining: trip.budget - totalSpent,
          itemCount: trip.budgetItems.length,
        },
        
        counts: {
          stops: trip._count.stops,
          members: trip._count.members,
          notes: trip._count.notes,
          budgetItems: trip._count.budgetItems,
        },
        
        userRole: userRole,
        isCreator: isCreator,
        isMember: !isCreator && member !== undefined,
      },
    });
  } catch (error) {
    console.error("Get trip error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}