import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      username: "admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.email);

  // Create viewer user
  const viewerPassword = await bcrypt.hash("viewer123", 12);
  const viewer = await prisma.user.upsert({
    where: { email: "viewer@example.com" },
    update: {},
    create: {
      email: "viewer@example.com",
      username: "viewer",
      password: viewerPassword,
      role: "VIEWER",
    },
  });

  console.log("Created viewer user:", viewer.email);

  // Create sample cameras
  const camera1 = await prisma.camera.upsert({
    where: { id: "sample-camera-1" },
    update: {},
    create: {
      id: "sample-camera-1",
      name: "Main Entrance",
      ip: "192.168.1.100",
      port: 80,
      username: "admin",
      password: "camera123",
      protocol: "ONVIF",
      status: "OFFLINE",
      ownerId: admin.id,
    },
  });

  console.log("Created sample camera:", camera1.name);

  const camera2 = await prisma.camera.upsert({
    where: { id: "sample-camera-2" },
    update: {},
    create: {
      id: "sample-camera-2",
      name: "Exit Gate",
      ip: "192.168.1.101",
      port: 80,
      username: "admin",
      password: "camera123",
      protocol: "ONVIF",
      status: "OFFLINE",
      ownerId: admin.id,
    },
  });

  console.log("Created sample camera:", camera2.name);

  // Create sample count records
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - i * 3600000);
    await prisma.countRecord.create({
      data: {
        cameraId: camera1.id,
        count: Math.floor(Math.random() * 100) + 10,
        timestamp,
      },
    });
  }

  console.log("Created 24 sample count records");
  console.log("\nSeed complete!");
  console.log("\nTest accounts:");
  console.log("  Admin: admin@example.com / admin123");
  console.log("  Viewer: viewer@example.com / viewer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
