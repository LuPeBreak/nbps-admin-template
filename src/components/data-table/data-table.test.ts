// @vitest-environment jsdom

import type { ColumnDef, Table, TableOptions } from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
  act,
  type ComponentProps,
  type ComponentType,
  createElement,
  useState,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  orderByParser,
  orderParser,
  pageParser,
  pageSizeParser,
  roleParser,
  searchParser,
} from "@/components/users/users-search-params";
import { DataTable } from "./data-table";

vi.mock("./data-table-view-options", () => ({
  DataTableViewOptions: ({ table }: { table: Table<unknown> }) =>
    createElement(
      "button",
      {
        type: "button",
        "data-testid": "hide-name-column",
        onClick: () => table.getColumn("name")?.toggleVisibility(false),
      },
      "Hide name column",
    ),
}));

interface Entity {
  id: string;
  name: string;
}

interface CustomEntity {
  key: string;
  label: string;
}

function StatefulCell({ id, label }: { id: string; label: string }) {
  const [count, setCount] = useState(0);

  return createElement(
    "button",
    {
      type: "button",
      "data-testid": `counter-${id}`,
      onClick: () => setCount((current) => current + 1),
    },
    `${label}:${count}`,
  );
}

const entityColumns: ColumnDef<Entity>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) =>
      createElement(StatefulCell, {
        id: row.original.id,
        label: row.original.name,
      }),
  },
];

const customEntityColumns: ColumnDef<CustomEntity>[] = [
  {
    accessorKey: "label",
    header: "Label",
    cell: ({ row }) =>
      createElement(StatefulCell, {
        id: row.original.key,
        label: row.original.label,
      }),
  },
];

const queryStateParsers = {
  page: pageParser,
  pageSize: pageSizeParser,
  search: searchParser,
  role: roleParser,
  orderBy: orderByParser,
  order: orderParser,
};

function QueryStateProbe() {
  const [state] = useQueryStates(queryStateParsers);

  return createElement(
    "output",
    { "data-testid": "query-state" },
    JSON.stringify(state),
  );
}

interface RenderTableOptions {
  onUrlUpdate?: ComponentProps<typeof NuqsTestingAdapter>["onUrlUpdate"];
  pageCount?: number;
  searchParams?: string;
  totalCount?: number;
  toolbar?: ComponentProps<typeof DataTable>["toolbar"];
}

type TestingAdapterOptions = Omit<
  ComponentProps<typeof NuqsTestingAdapter>,
  "children"
>;
const TestingAdapter =
  NuqsTestingAdapter as ComponentType<TestingAdapterOptions>;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
});

async function renderTable<TData>(
  columns: ColumnDef<TData>[],
  data: TData[],
  getRowId?: TableOptions<TData>["getRowId"],
  options: RenderTableOptions = {},
) {
  await act(async () => {
    const dataTable = createElement(DataTable<TData, unknown>, {
      columns,
      data,
      getRowId,
      pageCount: options.pageCount ?? 1,
      toolbar: options.toolbar,
      totalCount: options.totalCount ?? data.length,
    });

    root.render(
      createElement(
        TestingAdapter,
        {
          hasMemory: true,
          onUrlUpdate: options.onUrlUpdate,
          searchParams: options.searchParams,
        },
        dataTable,
      ),
    );
  });
}

function getCounter(id: string) {
  const counter = container.querySelector<HTMLButtonElement>(
    `[data-testid="counter-${id}"]`,
  );
  if (!counter) throw new Error(`Counter ${id} was not rendered`);
  return counter;
}

describe("DataTable row identity", () => {
  it("preserves per-entity cell state when rows reorder with getRowId", async () => {
    const initialData: Entity[] = [
      { id: "alpha", name: "Alpha" },
      { id: "beta", name: "Beta" },
    ];

    await renderTable(entityColumns, initialData, (row) => row.id);
    await act(async () => {
      getCounter("alpha").click();
    });

    await renderTable(
      entityColumns,
      [initialData[1], { id: "alpha", name: "Alpha updated" }],
      (row) => row.id,
    );

    expect(getCounter("beta").textContent).toBe("Beta:0");
    expect(getCounter("alpha").textContent).toBe("Alpha updated:1");
  });

  it("resets cell state when a row position receives a different entity", async () => {
    const initialData: Entity[] = [
      { id: "alpha", name: "Alpha" },
      { id: "beta", name: "Beta" },
    ];

    await renderTable(entityColumns, initialData, (row) => row.id);
    await act(async () => {
      getCounter("alpha").click();
    });

    await renderTable(
      entityColumns,
      [{ id: "replacement", name: "Replacement" }, initialData[1]],
      (row) => row.id,
    );

    expect(getCounter("replacement").textContent).toBe("Replacement:0");
    expect(getCounter("beta").textContent).toBe("Beta:0");
  });

  it("supports a custom stable key for non-user row DTOs", async () => {
    const initialData: CustomEntity[] = [
      { key: "first", label: "First" },
      { key: "second", label: "Second" },
    ];

    await renderTable(customEntityColumns, initialData, (row) => row.key);
    await act(async () => {
      getCounter("first").click();
    });

    await renderTable(
      customEntityColumns,
      [initialData[1], { key: "first", label: "First updated" }],
      (row) => row.key,
    );

    expect(getCounter("second").textContent).toBe("Second:0");
    expect(getCounter("first").textContent).toBe("First updated:1");
  });

  it("preserves Nuqs table state and column visibility when data changes", async () => {
    const initialData: Entity[] = [
      { id: "alpha", name: "Alpha" },
      { id: "beta", name: "Beta" },
    ];
    const searchParams =
      "?page=3&pageSize=20&search=ana&role=admin&orderBy=name&order=asc";
    const onUrlUpdate = vi.fn();

    await renderTable(entityColumns, initialData, (row) => row.id, {
      onUrlUpdate,
      pageCount: 5,
      searchParams,
      totalCount: 100,
      toolbar: createElement(QueryStateProbe),
    });

    expect(
      container.querySelector('[data-testid="query-state"]')?.textContent,
    ).toBe(
      JSON.stringify({
        page: 3,
        pageSize: 20,
        search: "ana",
        role: "admin",
        orderBy: "name",
        order: "asc",
      }),
    );
    expect(container.textContent).toContain("Página 3 de 5");
    expect(onUrlUpdate).not.toHaveBeenCalled();

    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="hide-name-column"]')
        ?.click();
    });

    expect(container.querySelector('[data-testid="counter-alpha"]')).toBeNull();

    await renderTable(
      entityColumns,
      [{ id: "beta", name: "Beta updated" }, initialData[0]],
      (row) => row.id,
      {
        onUrlUpdate,
        pageCount: 5,
        searchParams,
        totalCount: 100,
        toolbar: createElement(QueryStateProbe),
      },
    );

    expect(
      container.querySelector('[data-testid="query-state"]')?.textContent,
    ).toBe(
      JSON.stringify({
        page: 3,
        pageSize: 20,
        search: "ana",
        role: "admin",
        orderBy: "name",
        order: "asc",
      }),
    );
    expect(container.textContent).toContain("Página 3 de 5");
    expect(onUrlUpdate).not.toHaveBeenCalled();
    expect(container.querySelector('[data-testid="counter-alpha"]')).toBeNull();
  });

  it("keeps consumers without getRowId rendering successfully", async () => {
    const data: Entity[] = [{ id: "alpha", name: "Alpha" }];

    await renderTable(entityColumns, data);

    expect(getCounter("alpha").textContent).toBe("Alpha:0");
  });
});
