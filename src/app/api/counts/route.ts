import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isDemo } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MOCK_COUNTS = [
  { id: "1", cameraId: "1", count: 120, timestamp: new Date("2024-01-01T08:00:00Z"), metadata: {} },
  { id: "2", cameraId: "1", count: 340, timestamp: new Date("2024-01-01T09:00:00Z"), metadata: {} },
  { id: "3", cameraId: "1", count: 580, timestamp: new Date("2024-01-01T10:00:00Z"), metadata: {} },
  { id: "4", cameraId: "1", count: 720, timestamp: new Date("2024-01-01T11:00:00Z"), metadata: {} },
  { id: "5", cameraId: "1", count: 950, timestamp: new Date("2024-01-01T12:00:00Z"), metadata: {} },
  { id: "6", cameraId: "1", count: 1100, timestamp: new Date("2024-01-01T13:00:00Z"), metadata: {} },
  { id: "7", cameraId: "1", count: 1247, timestamp: new Date("2024-01-01T14:00:00Z"), metadata: {} },
];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Demo user — return mock data without hitting DB
  if (isDemo(session)) {
    return NextResponse.json({ success: true, data: MOCK_COUNTS });
  }

  const { searchParams } = new URL(req.url);
  const cameraId = searchParams.get("cameraId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = parseInt(searchParams.get("limit") || "100");

  const where: Record<string, unknown> = {};
  if (cameraId) where.cameraId = cameraId;
  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Record<string, unknown>).gte = new Date(from);
    if (to) (where.timestamp as Record<string, unknown>).lte = new Date(to);
  }

  try {
    const counts = await prisma.countRecord.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, data: counts });
  } catch {
    return NextResponse.json({ success: false, error: "Server error — database not connected." }, { status: 503 });
  }
}