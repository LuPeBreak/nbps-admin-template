// @vitest-environment jsdom

import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authClient } from "@/lib/auth/auth-client";
import { ac } from "@/lib/auth/permissions";
import { BanUserDialog } from "./ban-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { UnbanUserDialog } from "./unban-user-dialog";
import { UsersDataTableRowActions } from "./users-data-table-row-actions";
import type { UserTableRow } from "./users-table-types";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  updateUser: vi.fn(),
  setRole: vi.fn(),
  banUser: vi.fn(),
  unbanUser: vi.fn(),
  check: vi.fn<typeof authClient.admin.checkRolePermission>(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("sonner", () => ({
  toast: { success: mocks.success, error: mocks.error },
}));
vi.mock("@/lib/auth/auth-client", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/auth/auth-client")>();
  return {
    ...original,
    authClient: {
      ...original.authClient,
      admin: {
        ...original.authClient.admin,
        checkRolePermission: original.authClient.admin.checkRolePermission,
        updateUser: mocks.updateUser,
        setRole: mocks.setRole,
        banUser: mocks.banUser,
        unbanUser: mocks.unbanUser,
      },
    },
  };
});
vi.mock("@/lib/auth", () => ({
  useSession: () => ({ data: { user: { id: "operator", role: "admin" } } }),
  authClient: { admin: { checkRolePermission: mocks.check } },
}));

// Keep real React, RHF, schemas and mutation orchestration; isolate popup mechanics.
vi.mock("@/components/ui/dialog", () => {
  const content = ({ children }: { children: ReactNode }) => children;
  return {
    Dialog: ({ open, children }: { open: boolean; children: ReactNode }) =>
      open ? children : null,
    DialogContent: content,
    DialogDescription: content,
    DialogFooter: content,
    DialogHeader: content,
    DialogTitle: content,
  };
});
vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    disabled,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
  }) =>
    createElement(
      "select",
      {
        value,
        disabled,
        "aria-label": "Cargo",
        onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
          onValueChange(event.target.value),
      },
      createElement("option", { value: "user" }, "Usuário"),
      createElement("option", { value: "admin" }, "Administrador"),
    ),
  SelectContent: () => null,
  SelectItem: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
}));
vi.mock("@/components/ui/dropdown-menu", () => {
  const content = ({ children }: { children: ReactNode }) => children;
  return {
    DropdownMenu: content,
    DropdownMenuContent: content,
    DropdownMenuGroup: content,
    DropdownMenuLabel: content,
    DropdownMenuSeparator: () => null,
    DropdownMenuTrigger: content,
    DropdownMenuItem: ({
      children,
      disabled,
      onClick,
    }: {
      children: ReactNode;
      disabled?: boolean;
      onClick?: () => void;
    }) =>
      createElement("button", { type: "button", disabled, onClick }, children),
  };
});
vi.mock("./delete-user-dialog", () => ({ DeleteUserDialog: () => null }));
vi.mock("./reset-password-dialog", () => ({ ResetPasswordDialog: () => null }));
vi.mock("./impersonate-dialog", () => ({ ImpersonateDialog: () => null }));

const spark: UserTableRow = {
  id: "spark",
  name: "Spark Qa",
  email: "spark@example.com",
  role: "user",
  banned: false,
  createdAt: new Date("2026-01-01"),
};
const luna: UserTableRow = {
  ...spark,
  id: "luna",
  name: "Luna Qa",
  email: "luna@example.com",
  role: "admin",
};
let container: HTMLDivElement;
let root: Root;
const onOpenChange = vi.fn();
const onSuccess = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  for (const mutation of [
    mocks.updateUser,
    mocks.setRole,
    mocks.banUser,
    mocks.unbanUser,
  ]) {
    mutation.mockReset().mockResolvedValue({ error: null });
  }
  mocks.check.mockImplementation((input) =>
    authClient.admin.checkRolePermission(input),
  );
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

async function renderEdit(user = spark, open = true) {
  await act(() =>
    root.render(
      createElement(EditUserDialog, { user, open, onOpenChange, onSuccess }),
    ),
  );
}
function nameInput() {
  return container.querySelector<HTMLInputElement>(
    'input[name="name"]',
  ) as HTMLInputElement;
}
function roleInput() {
  return container.querySelector("select") as HTMLSelectElement;
}
async function changeName(value: string) {
  await act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(nameInput(), value);
    nameInput().dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function changeRole(value: string) {
  await act(() => {
    roleInput().value = value;
    roleInput().dispatchEvent(new Event("change", { bubbles: true }));
  });
}
async function submit() {
  await act(async () => {
    container
      .querySelector("form")
      ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}
function button(label: string) {
  return Array.from(container.querySelectorAll("button")).find(
    (element) => element.textContent?.trim() === label,
  );
}

describe("edit form synchronization", () => {
  it("replaces Spark values with Luna values in the same mounted dialog", async () => {
    await renderEdit();
    expect(nameInput().value).toBe("Spark Qa");
    await renderEdit(luna);
    expect(nameInput().value).toBe("Luna Qa");
    expect(roleInput().value).toBe("admin");
    await changeName("Luna Updated");
    await submit();
    expect(mocks.updateUser).toHaveBeenCalledWith({
      userId: "luna",
      data: { name: "Luna Updated" },
    });
    expect(mocks.setRole).not.toHaveBeenCalled();
  });

  it("discards cancelled edits and uses current persisted values on reopening", async () => {
    await renderEdit();
    await changeName("Unsaved Draft");
    await renderEdit(spark, false);
    await renderEdit();
    expect(nameInput().value).toBe("Spark Qa");
    await renderEdit(spark, false);
    await renderEdit({ ...spark, name: "Spark Updated", role: "admin" });
    expect(nameInput().value).toBe("Spark Updated");
    expect(roleInput().value).toBe("admin");
  });

  it("discards a draft when the new entity has the same name and role", async () => {
    await renderEdit();
    await changeName("Unsaved Draft");
    await renderEdit({ ...spark, id: "different-user" });
    expect(nameInput().value).toBe("Spark Qa");
  });

  it("preserves an in-progress draft when unchanged entity data is rerendered", async () => {
    await renderEdit();
    await changeName("Unsaved Draft");
    await renderEdit({ ...spark });
    expect(nameInput().value).toBe("Unsaved Draft");
  });

  it.each(["name", "role", "both"])(
    "refreshes persisted %s changes exactly once",
    async (field) => {
      await renderEdit();
      if (field !== "role") await changeName("Spark Updated");
      if (field !== "name") await changeRole("admin");
      await submit();
      expect(mocks.updateUser).toHaveBeenCalledTimes(field === "role" ? 0 : 1);
      expect(mocks.setRole).toHaveBeenCalledTimes(field === "name" ? 0 : 1);
      if (field !== "name")
        expect(mocks.setRole).toHaveBeenCalledWith({
          userId: "spark",
          role: "admin",
        });
      expect(mocks.refresh).toHaveBeenCalledOnce();
      expect(onSuccess).toHaveBeenCalledOnce();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    },
  );

  it("refreshes a persisted name even if the subsequent role change is denied", async () => {
    mocks.setRole.mockResolvedValue({
      error: { code: "FORBIDDEN", message: "Denied" },
    });
    await renderEdit();
    await changeName("Spark Updated");
    await changeRole("admin");
    await submit();
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(mocks.error).toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("keeps failed edits open without claiming success or refreshing", async () => {
    mocks.updateUser.mockResolvedValue({
      error: { code: "FORBIDDEN", message: "Denied" },
    });
    await renderEdit();
    await changeName("Spark Updated");
    await submit();
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("waits for persistence before requesting a refresh", async () => {
    let resolveMutation!: (result: { error: null }) => void;
    mocks.updateUser.mockReturnValue(
      new Promise((resolve) => {
        resolveMutation = resolve;
      }),
    );
    await renderEdit();
    await changeName("Spark Updated");
    await submit();
    expect(mocks.updateUser).toHaveBeenCalledOnce();
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    await act(async () => resolveMutation({ error: null }));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
});

describe("ban/unban convergence and permission UX", () => {
  it.each(["ban", "unban"])("refreshes after successful %s", async (action) => {
    await act(() =>
      root.render(
        createElement(action === "ban" ? BanUserDialog : UnbanUserDialog, {
          userId: spark.id,
          userName: spark.name,
          open: true,
          onOpenChange,
        }),
      ),
    );
    await submit();
    const mutation = action === "ban" ? mocks.banUser : mocks.unbanUser;
    expect(mutation).toHaveBeenCalledWith(
      expect.objectContaining({ userId: spark.id }),
    );
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it.each(["ban", "unban"])(
    "does not refresh or close when %s is denied",
    async (action) => {
      const mutation = action === "ban" ? mocks.banUser : mocks.unbanUser;
      mutation.mockResolvedValue({
        error: { code: "FORBIDDEN", message: "Denied" },
      });
      await act(() =>
        root.render(
          createElement(action === "ban" ? BanUserDialog : UnbanUserDialog, {
            userId: spark.id,
            userName: spark.name,
            open: true,
            onOpenChange,
          }),
        ),
      );
      await submit();
      expect(mocks.refresh).not.toHaveBeenCalled();
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(mocks.error).toHaveBeenCalled();
    },
  );

  it("hides all row actions from an ordinary user", async () => {
    await act(() =>
      root.render(
        createElement(UsersDataTableRowActions, {
          user: spark,
          role: "user",
          currentUserId: "operator",
        }),
      ),
    );
    expect(container.textContent).toBe("");
  });

  it("retains update + set-role for Edit and ban capability for ban/unban", async () => {
    const updateOnly = ac.newRole({ user: ["update"] });
    mocks.check.mockImplementation(
      ({ permissions }) => updateOnly.authorize(permissions).success,
    );
    await act(() =>
      root.render(
        createElement(UsersDataTableRowActions, {
          user: spark,
          role: "admin",
          currentUserId: "operator",
        }),
      ),
    );
    expect(button("Editar")).toBeUndefined();
    const banOnly = ac.newRole({ user: ["ban"] });
    mocks.check.mockImplementation(
      ({ permissions }) => banOnly.authorize(permissions).success,
    );
    await act(() =>
      root.render(
        createElement(UsersDataTableRowActions, {
          user: spark,
          role: "admin",
          currentUserId: "operator",
        }),
      ),
    );
    expect(button("Banir")).toBeDefined();
    expect(button("Editar")).toBeUndefined();
    await act(() =>
      root.render(
        createElement(UsersDataTableRowActions, {
          user: { ...spark, banned: true },
          role: "admin",
          currentUserId: "operator",
        }),
      ),
    );
    expect(button("Desbanir")).toBeDefined();
    expect(button("Banir")).toBeUndefined();
  });

  it("keeps self-ban and self-role controls disabled", async () => {
    await act(() =>
      root.render(
        createElement(UsersDataTableRowActions, {
          user: { ...spark, id: "operator" },
          role: "admin",
          currentUserId: "operator",
        }),
      ),
    );
    expect(button("Banir")?.disabled).toBe(true);
    await renderEdit({ ...spark, id: "operator", role: "admin" });
    expect(roleInput().disabled).toBe(true);
  });
});
