import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; noteId: string }> }) {
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

    const { id, noteId } = await params;
    const tripId = parseInt(id);
    const noteIdInt = parseInt(noteId);
    const userId = parseInt(decoded.userId);

    const body = await req.json();
    const { title, content, stopId } = body;

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

    const note = await prisma.tripNote.findFirst({
      where: {
        id: noteIdInt,
        tripId: tripId,
        userId: userId,
      },
    });

    if (!note) {
      return Response.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    let stopIdInt = null;
    if (stopId) {
      stopIdInt = parseInt(stopId);
      const stop = await prisma.tripStop.findFirst({
        where: {
          id: stopIdInt,
          tripId: tripId,
        },
      });
      if (!stop) {
        return Response.json(
          { success: false, message: "Stop not found" },
          { status: 404 }
        );
      }
    }

    const updatedNote = await prisma.tripNote.update({
      where: {
        id: noteIdInt,
      },
      data: {
        title: title !== undefined ? title : undefined,
        content: content || undefined,
        stopId: stopIdInt !== undefined ? stopIdInt : undefined,
        updatedAt: new Date(),
      },
    });

    return Response.json({
      success: true,
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Update note error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}



export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; noteId: string }> }) {
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

    const { id, noteId } = await params;
    const tripId = parseInt(id);
    const noteIdInt = parseInt(noteId);
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

    const note = await prisma.tripNote.findFirst({
      where: {
        id: noteIdInt,
        tripId: tripId,
        userId: userId,
      },
    });

    if (!note) {
      return Response.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    await prisma.tripNote.delete({
      where: {
        id: noteIdInt,
      },
    });

    return Response.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}