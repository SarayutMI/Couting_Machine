import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

  const [totalCameras, onlineCameras, todayCounts, hourCounts] = await Promise.all([
    prisma.camera.count(),
    prisma.camera.count({ where: { status: "ONLINE" } }),
    prisma.countRecord.aggregate({
      _sum: { count: true },
      where: { timestamp: { gte: startOfDay } },
    }),
    prisma.countRecord.aggregate({
      _sum: { count: true },
      where: { timestamp: { gte: startOfHour } },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalCameras,
      onlineCameras,
      totalCountToday: todayCounts._sum.count ?? 0,
      totalCountThisHour: hourCounts._sum.count ?? 0,
    },
  });
}
