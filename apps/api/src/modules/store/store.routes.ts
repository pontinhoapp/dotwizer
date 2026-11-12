import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  buyBodySchema,
  buyHeadersSchema,
  IDEMPOTENCY_KEY_HEADER,
  purchaseParamsSchema,
  purchaseResponseSchema,
  quoteQuerySchema,
  quoteResponseSchema,
} from "@pontinho/api-contract";
import { APP_SECURITY, appErrors, TAGS } from "../../common/openapi/route-docs.ts";
import type { StoreService } from "./store.service.ts";

const quoteSchema = {
  summary: "Cotar uma quantidade de fichas",
  description: "Devolve o valor em centavos e os limites de uma compra (mínimo, passo e máximo).",
  tags: [TAGS.store],
  security: APP_SECURITY,
  querystring: quoteQuerySchema,
  response: { 200: quoteResponseSchema, ...appErrors({ codes: ["validationFailed", "quantityAboveMaximum"] }) },
};

const buySchema = {
  summary: "Comprar fichas",
  description:
    "Cria a compra e chama o provedor de pagamento. Com o provedor de teste a compra fica pendente, com um Pix Copia e Cola de teste, e nada é cobrado. Repetir a mesma `Idempotency-Key` devolve a mesma compra, sem cobrar de novo.",
  tags: [TAGS.store],
  security: APP_SECURITY,
  headers: buyHeadersSchema,
  body: buyBodySchema,
  response: {
    201: purchaseResponseSchema,
    ...appErrors({ codes: ["validationFailed", "badRequest", "quantityAboveMaximum", "idempotencyKeyReused"] }),
  },
};

const getPurchaseSchema = {
  summary: "Consultar uma compra",
  description: "Devolve a compra da própria conta e confere o pagamento no provedor enquanto ela está pendente. Com o provedor de teste, a compra é paga 5 s depois de criada.",
  tags: [TAGS.store],
  security: APP_SECURITY,
  params: purchaseParamsSchema,
  response: { 200: purchaseResponseSchema, ...appErrors({ codes: ["validationFailed", "purchaseNotFound"] }) },
};

export function storeRoutes({ service }: { service: StoreService }): FastifyPluginAsyncZod {
  return async (app) => {
    app.get("/store/quote", { schema: quoteSchema }, (request) => service.quote(request.query));
    app.get("/store/purchases/:id", { schema: getPurchaseSchema }, (request) =>
      service.getPurchase({ userId: request.auth.userId, purchaseId: request.params.id }),
    );
    app.post("/store/purchases", { schema: buySchema }, async (request, reply) => {
      reply.code(201);
      return service.buy({
        userId: request.auth.userId,
        idempotencyKey: request.headers[IDEMPOTENCY_KEY_HEADER],
        ...request.body,
      });
    });
  };
}
