export function isCurrentUser(
  session: { user?: { id?: string } } | null | undefined,
  userId: string,
): boolean {
  return session?.user?.id === userId;
}
