import assert from "node:assert";
import { crc16, pixCopyPaste } from "./pix-copy-paste.ts";

describe("pixCopyPaste", () => {
  it("computes the CRC of the static Pix sample from the Banco Central manual", () => {
    const sample = "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304";

    assert.strictEqual(crc16(sample), "1D3D");
  });

  it("builds the static Pix with the CPF key, the amount, the name and the city without accents", () => {
    const code = pixCopyPaste({ key: "11144477735", name: "João Conceição", city: "São Paulo", amountCents: 1050 });
    const payload = "00020126330014br.gov.bcb.pix011111144477735520400005303986540510.505802BR5914Joao Conceicao6009Sao Paulo62070503***6304";

    assert.strictEqual(code, payload + crc16(payload));
  });

  it("cuts the name at 25 characters and the city at 15", () => {
    const code = pixCopyPaste({ key: "11144477735", name: "Maria Aparecida dos Santos Oliveira", city: "Santana do Livramento", amountCents: 1 });

    assert.ok(code.includes("5925Maria Aparecida dos Santo"));
    assert.ok(code.includes("6015Santana do Livr"));
    assert.ok(code.includes("54040.01"));
  });
});
