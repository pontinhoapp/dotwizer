export const CHIP_PURCHASE_MINIMUM = 1_000;
export const CHIP_PURCHASE_STEP = 1_000;
export const NICKNAME_MAX_LENGTH = 15;
export const FULL_NAME_MAX_LENGTH = 100;
export const BRAZILIAN_STATES = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] as const;
export const AVATAR_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const SERVICE_TOKEN_HEADER = "x-service-token";
export const IDEMPOTENCY_KEY_HEADER = "idempotency-key";
