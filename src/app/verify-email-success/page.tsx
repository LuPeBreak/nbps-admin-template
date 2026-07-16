import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Email verificado</CardTitle>
          <CardDescription>
            Seu endereço de email foi confirmado com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/sign-in"
            className={buttonVariants({ className: "w-full" })}
          >
            Ir para o login
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
