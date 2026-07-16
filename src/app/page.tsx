import {
  ArrowRight,
  Code,
  Database,
  FileJson,
  Lock,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PageBackground } from "@/components/page-background";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <PageBackground maskPosition="top">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </PageBackground>

      {/* Header */}
      <header className="relative z-10 border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20">
              N
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight leading-none">
                NBPS Admin Template
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                AI-Ready Template
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Link href="/sign-in" className={buttonVariants({ size: "sm" })}>
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-1 flex-col items-center py-16 px-4 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Desenvolvido para Desenvolvimento Assistido por IA</span>
          </div>

          <h1 className="bg-gradient-to-br from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent sm:text-7xl">
            A base perfeita para o seu
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-purple-500 bg-clip-text text-transparent">
              Próximo SaaS com IA
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            O **NBPS Admin Template** é um template Next.js pronto para produção
            com autenticação, banco de dados e RBAC, planejado sob regras
            arquiteturais rígidas que guiam IAs (como Claude, Gemini e Cursor) a
            criarem códigos perfeitos e seguros.
          </p>

          <div className="mt-10 flex items-center justify-center">
            <Link href="/sign-in" className={buttonVariants({ size: "lg" })}>
              Acessar Plataforma <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* AI-Ready Explanation card */}
        <div className="mt-16 w-full max-w-5xl rounded-3xl border bg-card/40 p-8 backdrop-blur-md shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-[300px] w-[300px] translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
          <div className="relative z-10 grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7 space-y-4 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Code className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                O que é um template "AI-Agent Ready"?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Modelos de linguagem (LLMs) frequentemente cometem pequenos
                erros de arquitetura ao criar novas rotas ou componentes, como
                duplicar lógicas de autenticação, expor segredos no cliente, ou
                escrever queries diretas de banco em views.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Este projeto resolve isso organizando o fluxo em regras de ouro
                documentadas localmente. Cada diretório contém seu próprio
                arquivo{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  agents.md
                </code>{" "}
                explicando o padrão esperado, permitindo que a IA que te auxilia
                leia o contexto local antes de sugerir ou editar o código.
              </p>
            </div>
            <div className="md:col-span-5 rounded-2xl border bg-background/80 p-6 text-left font-mono text-xs shadow-inner space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-border/40">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Terminal className="h-3.5 w-3.5 text-primary" /> Prompt
                  Recomendado
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-muted-foreground leading-relaxed">
                "Leia o arquivo{" "}
                <code className="text-foreground font-bold">AGENTS.md</code> na
                raiz para entender o fluxo de desenvolvimento do projeto e
                consulte as especificidades do módulo que você for alterar no
                arquivo{" "}
                <code className="text-foreground font-bold">agents.md</code>{" "}
                local do diretório antes de escrever o código."
              </p>
              <div className="pt-2 border-t border-border/40 flex justify-between text-[10px] text-muted-foreground">
                <span>✓ Next.js 16.2</span>
                <span>✓ Better Auth 1.6</span>
                <span>✓ Prisma v7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Database className="h-5 w-5 text-blue-500" />,
              title: "Banco de Dados & Prisma v7",
              description:
                "Modelagem robusta com PostgreSQL. Padrão Singleton para o Prisma Client com Driver Adapter integrado. Queries permitidas exclusivamente dentro de Server Actions.",
            },
            {
              icon: <Lock className="h-5 w-5 text-amber-500" />,
              title: "Better Auth & RBAC",
              description:
                "Gerenciamento de sessão seguro com o plugin Admin nativo. Autenticação completa e controle granular de permissões com base em papéis (Roles) síncronos.",
            },
            {
              icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
              title: "Segurança de Ações (Server-Side)",
              description:
                "Validação obrigatória com schemas Zod em toda mutação. Server Actions envolvidas com o HOF protectedAction, bloqueando requisições não autorizadas diretamente no servidor.",
            },
            {
              icon: <FileJson className="h-5 w-5 text-purple-500" />,
              title: "Tratamento de Erros Unificado",
              description:
                "Contrato ActionResponse para transporte limpo na rede. Os erros internos são logados de forma confidencial no servidor, prevenindo vazamento de stack traces.",
            },
            {
              icon: <Users className="h-5 w-5 text-indigo-500" />,
              title: "Gestão Administrativa",
              description:
                "Dashboard administrativo integrado para visualização e gerenciamento de usuários do sistema. Telas estruturadas usando tabelas server-side e filtros URL via nuqs.",
            },
            {
              icon: <Sparkles className="h-5 w-5 text-pink-500" />,
              title: "UI Otimizada com Tailwind v4",
              description:
                "Interface moderna usando componentes primitivos Shadcn/UI adaptados ao Tailwind CSS v4, suporte completo a temas claros/escuros e responsividade de fábrica.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-md text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 mb-4 group-hover:scale-105 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-base">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Development Quick Navigation Map */}
        <div className="mt-20 w-full max-w-5xl text-left space-y-6">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" /> Atalhos de
            Desenvolvimento
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              {
                label: "Página de Entrada",
                path: "/sign-in",
                desc: "Acessar login principal",
              },
              {
                label: "Dashboard",
                path: "/dashboard",
                desc: "Painel inicial protegido",
              },
              {
                label: "Gestão de Usuários",
                path: "/dashboard/admin/users",
                desc: "Controle de usuários (Admin)",
              },
              {
                label: "Perfil do Usuário",
                path: "/dashboard/profile",
                desc: "Configurações da conta",
              },
            ].map((route) => (
              <Link
                href={route.path}
                key={route.path}
                className="group p-4 rounded-xl border bg-card/20 hover:bg-card/60 transition-colors flex flex-col justify-between h-28"
              >
                <div>
                  <span className="text-xs font-semibold font-mono text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                    {route.path}
                  </span>
                  <p className="text-sm font-semibold mt-3">{route.label}</p>
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground flex items-center gap-1 mt-1 transition-colors">
                  Acessar rota{" "}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-8 text-center text-xs text-muted-foreground backdrop-blur-sm">
        NBPS Admin Template &mdash; Template Base para Desenvolvimento Moderno e
        Assistido por IA
      </footer>
    </div>
  );
}
