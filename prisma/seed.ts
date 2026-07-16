import "dotenv/config";
import { env } from "@/env";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

async function seed() {
  const existing = await prisma.user.findUnique({
    where: { email: env.ADMIN_EMAIL },
  });
  if (existing) {
    console.log("Admin already exists:", env.ADMIN_EMAIL);
    process.exit(0);
  }

  // Usa o admin plugin do Better Auth — ele já aplica role + hashing +Account.
  // O endpoint é `/admin/create-user`, exposto em auth.api como `createUser`.
  await auth.api.createUser({
    body: {
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      name: "Admin",
      role: "admin",
    },
  });

  // Marca email como verificado (admin inicial não precisa de fluxo de email).
  // admin.createUser não aplica emailVerified automaticamente.
  await prisma.user.update({
    where: { email: env.ADMIN_EMAIL },
    data: { emailVerified: true },
  });

  console.log("Admin created:", env.ADMIN_EMAIL);
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });
