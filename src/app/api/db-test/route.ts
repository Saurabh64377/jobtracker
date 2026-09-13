import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const url = new URL(process.env.DATABASE_URL!);

    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: {
        rejectUnauthorized: false,
      },
      connectionLimit: 1,
      connectTimeout: 30000,
      acquireTimeout: 30000,
    });

    const prisma = new PrismaClient({ adapter });

    await prisma.$queryRaw`SELECT 1`;

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
    });
  } catch (error: any) {
    console.error("DB TEST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message,
        cause: error?.cause?.message,
        code: error?.code,
      },
      { status: 500 }
    );
  }
}