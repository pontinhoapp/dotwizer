-- CreateTable
CREATE TABLE "friends_matches" (
    "id" UUID NOT NULL,
    "table_id" INTEGER NOT NULL,
    "point_value" INTEGER NOT NULL,
    "winner_id" UUID,
    "finished_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "friends_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friends_match_players" (
    "match_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "result" INTEGER NOT NULL,

    CONSTRAINT "friends_match_players_pkey" PRIMARY KEY ("match_id","user_id")
);

-- CreateIndex
CREATE INDEX "friends_match_players_user_id_idx" ON "friends_match_players"("user_id");

-- AddForeignKey
ALTER TABLE "friends_matches" ADD CONSTRAINT "friends_matches_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends_match_players" ADD CONSTRAINT "friends_match_players_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "friends_matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends_match_players" ADD CONSTRAINT "friends_match_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

