import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isDemo } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MOCK_CAMERAS = [
  { id: "1", name: "CAM-01 — Entrance", status: "ONLINE", count: 1247 },
  { id: "2", name: "CAM-02 — Main Hall", status: "ONLINE", count: 892 },
  { id: "3", name: "CAM-03 — Parking", status: "OFFLINE", count: 0 },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Demo user — return mock data without hitting DB
  if (isDemo(session)) {
    return NextResponse.json({ success: true, data: MOCK_CAMERAS });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cameras = await prisma.camera.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: (session.user as any).role === "ADMIN" ? {} : { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: cameras });
  } catch {
    return NextResponse.json({ success: false, error: "Server error — database not connected." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Demo user — read-only, camera creation not supported
  if (isDemo(session)) {
    return NextResponse.json({ success: false, error: "Camera creation is disabled in demo mode." }, { status: 403 });
  }

  const body = await req.json();
  const { name, ip, port, username, password, protocol } = body;

  if (!name || !ip || !username || !password) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    const camera = await prisma.camera.create({
      data: {
        name,
        ip,
        port: port || 80,
        username,
        password,
        protocol: protocol || "ONVIF",
        ownerId: session.user.id!,
      },
    });

    return NextResponse.json({ success: true, data: camera }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Server error — database not connected." }, { status: 503 });
  }
}
