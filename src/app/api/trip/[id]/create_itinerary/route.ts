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

    // ⚠️ IMPORTANT: Await params
    const { id } = await params;
    const tripId = parseInt(id);
    
    const { sections } = await req.json();

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        userId: parseInt(decoded.userId),
      },
    });

    if (!trip) {
      return Response.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    }

    // Delete existing stops
    await prisma.tripStop.deleteMany({
      where: { tripId },
    });

    // Create new sections
    const createdSections = await Promise.all(
      sections.map((section: any, index: number) => 
        prisma.tripStop.create({
          data: {
            tripId,
            cityName: section.location || "Unknown",
            country: section.country || "",
            startDate: new Date(section.dateRangeStart),
            endDate: new Date(section.dateRangeEnd),
            orderIndex: index,
            stopNotes: section.description,
            costIndex: section.costIndex || "medium",
            popularity: section.popularity || 5,
          }
        })
      )
    );

    return Response.json({
      success: true,
      message: "Itinerary saved successfully",
      sections: createdSections,
    });
  } catch (error) {
    console.error("Save itinerary error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
