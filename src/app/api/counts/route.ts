import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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

  const counts = await prisma.countRecord.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: limit,
  });

  return NextResponse.json({ success: true, data: counts });
}
