import type { Metadata } from "next";
import { HomePresentation } from "@/components/home-presentation";

export const metadata: Metadata = {
  title: "NBPS — Uma base para o seu próximo produto",
  description:
    "Template agent-ready com autenticação, gestão de usuários e tabelas server-side. Módulos, contratos e guias para desenvolver com contexto.",
};

export default function HomePage() {
  return <HomePresentation />;
}
