import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  FileCode2,
  GitPullRequest,
  Layers3,
  LockKeyhole,
  Table2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { buttonVariants } from "@/components/ui/button";

const repository = "https://github.com/LuPeBreak/nbps-admin-template";
const readme = `${repository}/blob/main/README.md`;

const modules = [
  { path: "src/app/", label: "Rotas e layouts" },
  { path: "src/components/", label: "Interface por domínio" },
  { path: "src/actions/", label: "Operações no servidor" },
  { path: "src/lib/auth/", label: "Sessão e permissões" },
  { path: "src/validations/", label: "Schemas compartilhados" },
] as const;

const features = [
  {
    icon: LockKeyhole,
    title: "Autenticação como ponto de partida",
    description:
      "Login por e-mail e senha, sessões e redefinição de senha com Better Auth. Páginas protegidas e permissões verificadas no servidor.",
    detail: "Better Auth · Prisma · PostgreSQL",
  },
  {
    icon: Users,
    title: "Gestão de usuários no painel",
    description:
      "Listagem, criação, edição e banimento de usuários, com os papéis admin e user. A interface acompanha as capacidades de cada papel.",
    detail: "Painel administrativo · Ações por usuário",
  },
  {
    icon: Table2,
    title: "Tabelas que consultam o servidor",
    description:
      "Busca, filtros, ordenação e paginação com estado na URL. A listagem de usuários mostra como conectar os componentes ao seu domínio.",
    detail: "TanStack Table · nuqs · View Options",
  },
] as const;

const workflow = [
  {
    title: "Contexto antes da mudança",
    description:
      "Os AGENTS.md da raiz e dos módulos registram responsabilidades, restrições e padrões locais.",
  },
  {
    title: "Contratos para estender",
    description:
      "Validação com Zod, autorização no servidor e helpers de ações oferecem referências para novos módulos.",
  },
  {
    title: "Verificação antes da integração",
    description:
      "Testes de contratos, checks e revisão humana fazem parte do fluxo. As instruções orientam o agente; a revisão continua necessária.",
  },
] as const;

export function HomePresentation() {
  return (
    <div
      id="inicio"
      className="min-h-screen bg-background text-foreground [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-solid [&_a:focus-visible]:outline-foreground [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-solid [&_button:focus-visible]:outline-foreground [&_a]:motion-reduce:transition-none [&_button]:motion-reduce:transition-none"
      style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:p-3"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <a
            href="#inicio"
            aria-label="NBPS — início"
            className="flex items-center gap-3"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers3 className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight">NBPS</span>
            <span className="hidden border-l pl-3 text-xs text-muted-foreground sm:block">
              Admin Template
            </span>
          </a>
          <nav
            aria-label="Navegação principal"
            className="flex items-center gap-4 text-sm sm:gap-6"
          >
            <a href="#recursos" className="hidden hover:underline sm:inline">
              Recursos
            </a>
            <a href={readme} className="hidden hover:underline md:inline">
              Documentação
            </a>
            <ThemeSwitcher />
            <Link
              href="/sign-in"
              className="inline-flex min-h-9 items-center gap-1.5 font-medium hover:underline"
            >
              Entrar no painel{" "}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1}>
        <section
          aria-labelledby="home-title"
          className="mx-auto grid max-w-7xl gap-12 px-5 pt-16 pb-12 sm:px-8 sm:pt-24 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16 lg:px-12 lg:pt-28 lg:pb-20"
        >
          <div>
            <p className="mb-7 flex items-center gap-3 font-mono text-xs tracking-wider uppercase">
              <span className="size-2 bg-foreground" aria-hidden="true" />
              Uma base reutilizável. Seu próximo produto.
            </p>
            <h1
              id="home-title"
              className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl lg:text-7xl"
            >
              Comece pelo
              <br />
              seu produto.
              <span className="mt-2 block text-muted-foreground">
                O painel já tem
                <br />
                um começo.
              </span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Autenticação, gestão de usuários e tabelas server-side em uma base
              Next.js. Com estrutura e contratos para você desenvolver com
              agentes de IA — e com contexto.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={repository}
                className={buttonVariants({
                  size: "lg",
                  className: "min-h-12 gap-2 px-5",
                })}
              >
                <GitPullRequest aria-hidden="true" /> Usar o template{" "}
                <ArrowUpRight aria-hidden="true" />
              </a>
              <a
                href={readme}
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "min-h-12 px-5",
                })}
              >
                Ler a documentação <ArrowRight aria-hidden="true" />
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Código no GitHub · Licença MIT · Feito para adaptar
            </p>
          </div>
          <aside
            aria-labelledby="structure-title"
            className="min-w-0 rounded-2xl border bg-muted/40"
          >
            <div className="flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
              <span className="flex items-center gap-2 text-xs font-medium">
                <FileCode2 className="size-4" aria-hidden="true" /> Dentro do
                repositório
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                /nbps
              </span>
            </div>
            <div className="p-5 sm:p-6">
              <p className="mb-2 font-mono text-xs text-muted-foreground">
                01 / ESTRUTURA
              </p>
              <h2
                id="structure-title"
                className="text-xl font-medium tracking-tight"
              >
                Cada parte tem seu lugar.
              </h2>
              <ul className="mt-6 space-y-1">
                {modules.map((module) => (
                  <li key={module.path}>
                    <a
                      href={`${repository}/tree/main/${module.path}`}
                      className="group flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md px-2 py-3 hover:bg-muted"
                    >
                      <code className="text-xs sm:text-sm">{module.path}</code>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {module.label}
                        <ArrowUpRight
                          className="size-3 opacity-60 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={`${repository}/blob/main/AGENTS.md`}
                className="mt-5 flex items-center justify-between gap-3 rounded-lg border bg-background px-4 py-4 text-sm"
              >
                <span>
                  <span className="block font-mono font-medium">AGENTS.md</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Orientação da raiz até o módulo.
                  </span>
                </span>
                <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </aside>
        </section>
        <div className="border-y">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-5 px-5 py-6 sm:px-8 lg:px-12">
            <p className="font-mono text-xs text-muted-foreground">
              UMA STACK CONHECIDA
            </p>
            <ul className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium">
              {[
                "Next.js",
                "Better Auth",
                "Prisma",
                "PostgreSQL",
                "Tailwind CSS",
                "Base UI",
              ].map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </div>
        <section
          id="recursos"
          aria-labelledby="features-title"
          className="mx-auto max-w-7xl scroll-mt-8 px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
        >
          <div className="grid gap-5 md:grid-cols-2 md:gap-12">
            <div>
              <p className="mb-4 font-mono text-xs text-muted-foreground">
                02 / O PONTO DE PARTIDA
              </p>
              <h2
                id="features-title"
                className="max-w-md text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                O trabalho recorrente
                <br />
                já tem uma referência.
              </h2>
            </div>
            <p className="max-w-lg text-base leading-7 text-muted-foreground md:pt-8">
              Para projetos que precisam de acesso autenticado, operações
              administrativas e listagens de dados. Você parte desses módulos e
              acrescenta as regras do seu produto.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-10">
            {features.map((feature, index) => (
              <article key={feature.title} className="border-t pt-6">
                <div className="mb-7 flex items-center justify-between">
                  <feature.icon
                    className="size-6"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="max-w-xs text-xl font-medium tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
                <p className="mt-6 text-xs font-medium">{feature.detail}</p>
              </article>
            ))}
          </div>
          <a
            href={`${repository}/tree/main/src/components/users`}
            className="mt-10 inline-flex min-h-10 items-center gap-2 text-sm font-medium underline underline-offset-4"
          >
            Explorar a implementação de usuários{" "}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </section>
        <section
          aria-labelledby="agents-title"
          className="bg-primary text-primary-foreground"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:px-12">
            <div>
              <p className="mb-6 font-mono text-xs">
                03 / DESENVOLVIMENTO COM AGENTES
              </p>
              <h2
                id="agents-title"
                className="max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Agent-ready,
                <br />
                nos arquivos e no fluxo.
              </h2>
              <p className="mt-6 max-w-md text-base leading-7">
                Uma organização que ajuda pessoas e agentes a localizar padrões,
                entender limites e revisar mudanças. O contexto acompanha o
                código.
              </p>
              <div className="mt-9 inline-flex items-center gap-3 rounded-full border border-primary-foreground/40 px-4 py-2.5 text-xs">
                <GitPullRequest className="size-4" aria-hidden="true" />{" "}
                Mudanças pequenas. Revisão humana.
              </div>
            </div>
            <ol className="space-y-8">
              {workflow.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[2rem_1fr] gap-4 border-t border-primary-foreground/30 pt-5"
                >
                  <span className="pt-1 font-mono text-xs">0{index + 1}</span>
                  <div>
                    <h3 className="text-lg font-medium">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section
          aria-labelledby="start-title"
          className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:px-12"
        >
          <div>
            <p className="mb-4 font-mono text-xs text-muted-foreground">
              04 / DO TEMPLATE AO SEU PROJETO
            </p>
            <h2
              id="start-title"
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Uma base sua.
              <br />
              Daqui em diante.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
              Crie seu repositório a partir do template, configure o ambiente e
              use os módulos existentes como referência. Inclusive esta Home:
              substitua pelo seu produto.
            </p>
            <a
              href={readme}
              className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-medium underline underline-offset-4"
            >
              Começar pelo README{" "}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
          <div className="rounded-xl border p-6 sm:p-8">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ArrowDown className="size-4" aria-hidden="true" /> Seu caminho
              para começar
            </p>
            <ol className="mt-6 space-y-5 text-sm">
              {[
                "Crie seu repositório pelo GitHub.",
                "Siga o Quick Start para ambiente, banco e seed.",
                "Leia os guias do módulo que vai estender.",
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 leading-6">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-7 flex items-center gap-2 border-t pt-5 text-xs text-muted-foreground">
              <Check className="size-4 shrink-0" aria-hidden="true" />{" "}
              Pré-requisitos e comandos no README.
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-7 text-xs text-muted-foreground sm:px-8 lg:px-12">
          <p>
            <span className="font-semibold text-foreground">NBPS</span> / Admin
            Template
          </p>
          <nav aria-label="Links do projeto" className="flex flex-wrap gap-5">
            <a href={repository} className="hover:underline">
              GitHub
            </a>
            <a href={readme} className="hover:underline">
              Documentação
            </a>
            <a
              href={`${repository}/blob/main/LICENSE`}
              className="hover:underline"
            >
              Licença MIT
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
