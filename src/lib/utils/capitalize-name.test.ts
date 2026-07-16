import { describe, expect, it } from "vitest";
import { capitalizeName } from "./capitalize-name";

describe("capitalizeName", () => {
  it("deve capitalizar as palavras mantendo preposições conhecidas em minúsculas", () => {
    expect(capitalizeName("ana de souza")).toBe("Ana de Souza");
    expect(capitalizeName("MARIA DA SILVA DOS SANTOS")).toBe(
      "Maria da Silva dos Santos",
    );
    expect(capitalizeName("joão do carmo e silva")).toBe(
      "João do Carmo e Silva",
    );
  });

  it("deve capitalizar a primeira palavra mesmo que seja uma preposição", () => {
    expect(capitalizeName("de souza")).toBe("De Souza");
    expect(capitalizeName("dos santos oliveira")).toBe("Dos Santos Oliveira");
  });

  it("deve retornar string vazia para entradas vazias ou contendo apenas espaços", () => {
    expect(capitalizeName("")).toBe("");
    expect(capitalizeName("   ")).toBe("");
  });

  it("deve tratar múltiplos espaços entre as palavras corretamente", () => {
    expect(capitalizeName("carlos   eduardo   da  silva")).toBe(
      "Carlos Eduardo da Silva",
    );
  });
});
