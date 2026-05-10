import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";
    const country = url.searchParams.get("country") || "";
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");

    const whereClause: any = {};

    if (query) {
      whereClause.name = {
        contains: query,
        mode: 'insensitive',
      };
    }

    if (country) {
      whereClause.country = {
        contains: country,
        mode: 'insensitive',
      };
    }

    const skip = (page - 1) * limit;

    const cities = await prisma.cityExploration.findMany({
      where: whereClause,
      orderBy: {
        popularity: 'desc',
      },
      skip: skip,
      take: limit,
    });

    const total = await prisma.cityExploration.count({
      where: whereClause,
    });

    return Response.json({
      success: true,
      cities: cities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search cities error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}