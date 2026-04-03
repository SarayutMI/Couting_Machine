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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameras = await prisma.camera.findMany({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: (session.user as any).role === "ADMIN" ? {} : { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: cameras });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, ip, port, username, password, protocol } = body;

  if (!name || !ip || !username || !password) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

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
}
