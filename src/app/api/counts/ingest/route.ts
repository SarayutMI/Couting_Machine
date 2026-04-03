import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.INGEST_API_KEY) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { cameraId, count, timestamp, metadata } = body;

  if (!cameraId || count === undefined) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    const record = await prisma.countRecord.create({
      data: {
        cameraId,
        count: parseInt(count),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        metadata: metadata || {},
      },
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Server error — database not connected." }, { status: 503 });
  }
}
