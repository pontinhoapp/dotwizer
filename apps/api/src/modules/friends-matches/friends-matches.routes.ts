import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { matchParamsSchema, recordFriendsMatchBodySchema, recordFriendsMatchResponseSchema } from "@pontinho/api-contract";
import { INTERNAL_SECURITY, internalErrors, TAGS } from "../../common/openapi/route-docs.ts";
import type { FriendsMatchesService } from "./friends-matches.service.ts";

const recordSchema = {
  summary: "Gravar uma partida com amigos",
  description:
    "Guarda o resultado de cada jogador em fichas só da partida, para o ranking. Nada mexe na carteira. O id vem do servidor do jogo, e repetir a gravação com o mesmo id não grava de novo. Na sala com acerto por Pix, devolve quem paga quanto a quem, com o Pix Copia e Cola e o QR de cada pagamento; nenhum dinheiro passa pelo app.",
  tags: [TAGS.internal],
  security: INTERNAL_SECURITY,
  params: matchParamsSchema,
  body: recordFriendsMatchBodySchema,
  response: {
    200: recordFriendsMatchResponseSchema,
    ...internalErrors({ codes: ["validationFailed", "badRequest", "tableNotFound", "playerNotFound"] }),
  },
};

export function friendsMatchesRoutes({ friendsMatchesService }: { friendsMatchesService: FriendsMatchesService }): FastifyPluginAsyncZod {
  return async (app) => {
    app.put("/friends-matches/:matchId", { schema: recordSchema }, (request) =>
      friendsMatchesService.record({ matchId: request.params.matchId, ...request.body }),
    );
  };
}
