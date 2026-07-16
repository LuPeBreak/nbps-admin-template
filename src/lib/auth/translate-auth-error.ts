// Mapeamento por `error.code` (estável, do Better Auth) → mensagem PT-BR.
// `error.code` é o método primário: mensagens em inglês podem mudar entre versões,
// mas o `code` é parte do contrato público do Better Auth.
const CODE_TRANSLATIONS: Record<string, string> = {
  USER_NOT_FOUND: "Usuário não encontrado.",
  USER_ALREADY_EXISTS: "Este email já está cadastrado.",
  INVALID_EMAIL: "Email inválido.",
  INVALID_PASSWORD: "A senha atual está incorreta.",
  INVALID_EMAIL_OR_PASSWORD: "Email ou senha incorretos.",
  TOO_MANY_REQUESTS: "Muitas tentativas. Tente novamente em alguns minutos.",
  SESSION_EXPIRED: "Sessão expirada. Faça login novamente.",
  USER_BANNED: "Sua conta foi suspensa. Entre em contato com o suporte.",
  FAILED_TO_CREATE_USER: "Não foi possível criar o usuário.",
  INVALID_FIELDS: "Preencha todos os campos obrigatórios.",
  YOU_CANNOT_IMPERSONATE_ADMINS:
    "Administradores não podem representar outros administradores.",
  YOU_ARE_NOT_ALLOWED_TO_IMPERSONATE_USERS:
    "Você não tem permissão para representar usuários.",
  YOU_CANNOT_BAN_YOURSELF: "Você não pode banir a si mesmo.",
  YOU_CANNOT_REMOVE_YOURSELF: "Você não pode remover a si mesmo.",
  // Better Auth admin permission errors
  YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS:
    "Você não tem permissão para criar usuários.",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_USERS:
    "Você não tem permissão para atualizar usuários.",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS:
    "Você não tem permissão para excluir usuários.",
  YOU_ARE_NOT_ALLOWED_TO_BAN_USERS:
    "Você não tem permissão para banir usuários.",
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS:
    "Você não tem permissão para listar usuários.",
  YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE:
    "Você não tem permissão para alterar o cargo de usuários.",
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD:
    "Você não tem permissão para redefinir senhas.",
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_EMAIL:
    "Você não tem permissão para alterar o email de usuários.",
  YOU_ARE_NOT_ALLOWED_TO_GET_USER:
    "Você não tem permissão para visualizar este usuário.",
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS_SESSIONS:
    "Você não tem permissão para listar sessões de usuários.",
  YOU_ARE_NOT_ALLOWED_TO_REVOKE_USERS_SESSIONS:
    "Você não tem permissão para revogar sessões.",
  FORBIDDEN: "Você não tem permissão para executar esta ação.",
  UNAUTHORIZED: "Sessão expirada. Faça login novamente.",
};

// Fallback por regex na `error.message` (quando `code` não está disponível ou
// não bate). Mantido para erros retornados sem o campo `code`.
const MESSAGE_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /banned|banido/i,
    message:
      "Sua conta foi suspensa. Entre em contato com o suporte se acredita que isso é um erro.",
  },
  {
    pattern: /failed to verify password|invalid password|incorrect password/i,
    message: "A senha atual está incorreta.",
  },
  {
    pattern: /invalid email or password|invalid credentials/i,
    message: "Email ou senha incorretos.",
  },
  {
    pattern: /user not found|usuário não encontrado/i,
    message: "Usuário não encontrado.",
  },
  {
    pattern: /already exists|já cadastrado|email.*taken/i,
    message: "Este email já está cadastrado.",
  },
  {
    pattern: /password.*short|ao menos 8|at least 8/i,
    message: "A senha deve ter ao menos 8 caracteres.",
  },
  { pattern: /invalid email|email inválido/i, message: "Email inválido." },
  {
    pattern: /too many requests|rate limit|muitas tentativas/i,
    message: "Muitas tentativas. Tente novamente em alguns minutos.",
  },
  {
    pattern: /session.*expired|sessão expirada/i,
    message: "Sessão expirada. Faça login novamente.",
  },
  {
    pattern: /failed to create user|criação do usuário/i,
    message: "Não foi possível criar o usuário.",
  },
  {
    pattern: /invalid.*fields|campos.*inválidos|missing.*fields/i,
    message: "Preencha todos os campos obrigatórios.",
  },
  {
    pattern: /not allowed|não tem permissão|não autorizado/i,
    message: "Você não tem permissão para executar esta ação.",
  },
];

const FALLBACK_MESSAGE = "Ocorreu um erro inesperado. Tente novamente.";

interface AuthErrorLike {
  code?: string;
  message?: string;
}

function extractFields(error: unknown): { code?: string; message: string } {
  if (error == null) return { message: "" };
  if (typeof error === "string") return { message: error };
  if (typeof error === "object") {
    const e = error as AuthErrorLike;
    return {
      code: e.code,
      message: e.message ?? e.code ?? "",
    };
  }
  return { message: String(error) };
}

export function translateAuthError(error: unknown): string {
  const { code, message } = extractFields(error);
  if (code && CODE_TRANSLATIONS[code]) return CODE_TRANSLATIONS[code];
  if (message) {
    for (const { pattern, message: pt } of MESSAGE_PATTERNS) {
      if (pattern.test(message)) return pt;
    }
  }
  return FALLBACK_MESSAGE;
}
