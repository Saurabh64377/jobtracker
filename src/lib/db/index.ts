// import { PrismaClient } from "@prisma/client";
// import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// function resolveSsl(sslMode: string | null): { rejectUnauthorized: boolean } | undefined {
//   if (!sslMode) return undefined;

//   // Follows MySQL's standard ssl-mode semantics: REQUIRED only mandates
//   // encryption, not certificate verification. VERIFY_CA/VERIFY_IDENTITY
//   // additionally validate the certificate chain against a trusted CA.
//   switch (sslMode.toUpperCase()) {
//     case "DISABLED":
//       return undefined;
//     case "VERIFY_CA":
//     case "VERIFY_IDENTITY":
//       return { rejectUnauthorized: true };
//     case "PREFERRED":
//     case "REQUIRED":
//     default:
//       return { rejectUnauthorized: false };
//   }
// }

// function buildPoolConfig(databaseUrl: string) {
//   const url = new URL(databaseUrl);
//   const sslMode = url.searchParams.get("ssl-mode") ?? url.searchParams.get("sslmode");

//   return {
//     host: url.hostname,
//     port: url.port ? Number(url.port) : 3306,
//     user: decodeURIComponent(url.username),
//     password: decodeURIComponent(url.password),
//     database: url.pathname.replace(/^\//, ""),
//     ssl: resolveSsl(sslMode),
//     connectionLimit: 10,
//     // Generous headroom for a cold pool: a page that fires many parallel
//     // queries right after startup needs several fresh TLS connections to
//     // Aiven at once, and `acquireTimeout` bounds queueing behind those,
//     // not just a single connect. Once the pool is warm, connections are
//     // reused and this ceiling is never approached.
//     connectTimeout: 30_000,
//     acquireTimeout: 30_000,
//   };
// }

// function createPrismaClient() {
//   const databaseUrl = process.env.DATABASE_URL;
//   if (!databaseUrl) {
//     throw new Error("DATABASE_URL is not set");
//   }

//   const adapter = new PrismaMariaDb(buildPoolConfig(databaseUrl));
//   return new PrismaClient({ adapter });
// }

// const globalForPrisma = globalThis as unknown as {
//   prisma: ReturnType<typeof createPrismaClient> | undefined;
// };

// export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }



import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const url = new URL(databaseUrl);

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: {
      rejectUnauthorized: false,
    },
    connectionLimit: 3,
    connectTimeout: 30000,
    acquireTimeout: 30000,
  });

  return new PrismaClient({
    adapter,
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}