import { render } from "@react-email/render";
import type { ReactElement } from "react";

export async function renderEmail(
  template: ReactElement,
): Promise<{ html: string; text: string }> {
  const html = await render(template);
  const text = await render(template, { plainText: true });
  return { html, text };
}
