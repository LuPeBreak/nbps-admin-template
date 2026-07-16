"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { translateAuthError } from "@/lib/auth/translate-auth-error";
import type { ActionResponse } from "@/lib/errors";

interface UseDialogActionOptions {
  successMessage: string;
  onSuccess?: () => void;
}

export function useDialogAction(opts: UseDialogActionOptions) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (action: () => Promise<ActionResponse<unknown>>) => {
      setLoading(true);
      try {
        const result = await action();
        if (!result.success) {
          toast.error(translateAuthError(result.error));
          return false;
        }
        toast.success(opts.successMessage);
        opts.onSuccess?.();
        router.refresh();
        return true;
      } catch (error) {
        console.error("useDialogAction:", error);
        toast.error("Ocorreu um erro inesperado.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [opts.successMessage, opts.onSuccess, router],
  );

  return { loading, execute };
}
