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
    const cityId = parseInt(id);

    const city = await prisma.cityExploration.findUnique({
      where: {
        id: cityId,
      },
    });

    if (!city) {
      return Response.json(
        { success: false, message: "City not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      city: city,
    });
  } catch (error) {
    console.error("Get city details error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}