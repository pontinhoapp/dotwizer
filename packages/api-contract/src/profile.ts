import { z } from "zod";
import { AVATAR_CONTENT_TYPES, BRAZILIAN_STATES, FULL_NAME_MAX_LENGTH, NICKNAME_MAX_LENGTH } from "./constants.ts";
import { isoDateSchema, userIdSchema } from "./common.ts";

const CPF_PATTERN = /^\d{11}$/;
const REPEATED_DIGITS = /^(\d)\1{10}$/;
const NICKNAME_PATTERN = /^[ -~\p{L}]+$/u;

function cpfCheckDigit(digits: number[]) {
  const sum = digits.reduce((total, digit, index) => total + digit * (digits.length + 1 - index), 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(cpf: string) {
  if (!CPF_PATTERN.test(cpf) || REPEATED_DIGITS.test(cpf)) {
    return false;
  }
  const digits = [...cpf].map(Number);
  return cpfCheckDigit(digits.slice(0, 9)) === digits[9] && cpfCheckDigit(digits.slice(0, 10)) === digits[10];
}

export const cpfSchema = z
  .string()
  .refine(isValidCpf, { message: "CPF inválido" })
  .describe("CPF com os 11 dígitos, sem máscara. Os dois dígitos verificadores são conferidos.");

export const nicknameSchema = z
  .string()
  .trim()
  .normalize()
  .min(3)
  .max(NICKNAME_MAX_LENGTH)
  .regex(NICKNAME_PATTERN)
  .describe("Apelido no jogo, de 3 a 15 caracteres: letras, números, espaço e símbolos do teclado, sem emoji. É o nome que aparece na mesa.");

export const phoneSchema = z
  .string()
  .regex(/^\d{11}$/)
  .describe("Celular com 11 dígitos, sem máscara.");

export const addressSchema = z
  .strictObject({
    postalCode: z.string().regex(/^\d{8}$/).describe("CEP com 8 dígitos, sem máscara."),
    street: z.string().trim().min(1).max(120).describe("Rua."),
    number: z.string().trim().min(1).max(10).describe("Número, ou S/N."),
    complement: z.string().trim().max(60).describe("Complemento, que pode ficar vazio."),
    district: z.string().trim().min(1).max(80).describe("Bairro."),
    city: z.string().trim().min(1).max(80).describe("Cidade."),
    state: z.enum(BRAZILIAN_STATES).describe("UF."),
  })
  .describe("Endereço opcional da conta.");
export type Address = z.infer<typeof addressSchema>;

export const bankAccountSchema = z
  .strictObject({
    bankCode: z.string().regex(/^\d{3}$/).describe("Código do banco (COMPE), com 3 dígitos."),
    bankName: z.string().trim().min(1).max(80).describe("Nome do banco."),
    branch: z.string().regex(/^\d{4}$/).describe("Agência com 4 dígitos, sem o dígito."),
    account: z.string().regex(/^\d{1,12}$/).describe("Número da conta, sem o dígito."),
    accountDigit: z.string().regex(/^[0-9X]$/).describe("Dígito da conta (0 a 9 ou X)."),
    type: z.enum(["checking", "savings"]).describe("Conta corrente ou poupança."),
  })
  .describe("Conta bancária para receber. O titular é sempre o CPF do cadastro.");
export type BankAccount = z.infer<typeof bankAccountSchema>;

export const profileResponseSchema = z.object({
  id: userIdSchema,
  email: z.string().describe("E-mail da conta, vindo do token do Supabase."),
  nickname: z.string().nullable().describe("Apelido no jogo. Nulo até o cadastro."),
  fullName: z.string().nullable().describe("Nome completo. Nulo até o cadastro, que trava o campo."),
  cpf: z.string().nullable().describe("CPF com os 11 dígitos. Só sai para a própria conta. Nulo até o cadastro, que trava o campo."),
  birthDate: isoDateSchema.nullable().describe("Data de nascimento. Nula até o cadastro, que trava o campo."),
  phone: z.string().nullable().describe("Celular com 11 dígitos, ou nulo quando a conta não tem."),
  address: addressSchema.nullable().describe("Endereço, ou nulo quando a conta não tem."),
  photoUrl: z.string().nullable().describe("URL pública da foto, ou nulo quando a conta não tem foto."),
  bankAccount: bankAccountSchema.nullable().describe("Conta bancária para receber, ou nulo quando a conta não cadastrou."),
  pixKeyRegistered: z.boolean().describe("Verdadeiro depois que a conta cadastrou a chave Pix do CPF para receber."),
  complete: z.boolean().describe("Verdadeiro quando a conta tem nome completo, CPF, data de nascimento e apelido."),
});
export type ProfileResponse = z.infer<typeof profileResponseSchema>;

export const registrationBodySchema = z.strictObject({
  fullName: z.string().trim().min(1).max(FULL_NAME_MAX_LENGTH).describe("Nome completo, de 1 a 100 caracteres."),
  cpf: cpfSchema,
  birthDate: isoDateSchema.describe("Data de nascimento. A conta precisa ter 18 anos ou mais (data de Brasília)."),
  nickname: nicknameSchema,
});
export type RegistrationBody = z.infer<typeof registrationBodySchema>;

export const updateProfileBodySchema = z.strictObject({
  nickname: nicknameSchema.optional(),
  phone: phoneSchema.optional(),
  address: addressSchema.nullable().optional().describe("Endereço novo, ou nulo para apagar."),
  photoPath: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("Caminho devolvido por `POST /profile/photo-upload`, depois de enviar o arquivo."),
});
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;

export const photoUploadBodySchema = z.strictObject({
  contentType: z.enum(AVATAR_CONTENT_TYPES).describe("Tipo do arquivo que será enviado."),
});
export type PhotoUploadBody = z.infer<typeof photoUploadBodySchema>;

export const photoUploadResponseSchema = z.object({
  path: z.string().describe("Caminho do arquivo no armazenamento; vai em `photoPath` no `PATCH /profile`."),
  uploadUrl: z.string().describe("URL assinada para enviar o arquivo."),
  token: z.string().describe("Token do envio (`uploadToSignedUrl` do Supabase)."),
});
export type PhotoUploadResponse = z.infer<typeof photoUploadResponseSchema>;
