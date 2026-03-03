-- CreateTable
CREATE TABLE IF NOT EXISTS "seasons" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "challenges" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "season_id" INTEGER,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_challenge_completions" (
    "wallet" TEXT NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "completion_day" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "user_challenge_completions_pkey" PRIMARY KEY ("wallet","challenge_id","completion_day")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "seasons_slug_key" ON "seasons"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "challenges_slug_key" ON "challenges"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "challenges_type_starts_at_ends_at_idx" ON "challenges"("type", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "challenges_season_id_idx" ON "challenges"("season_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_challenge_completions_challenge_id_idx" ON "user_challenge_completions"("challenge_id");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'challenges_season_id_fkey'
  ) THEN
    ALTER TABLE "challenges" ADD CONSTRAINT "challenges_season_id_fkey"
      FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_challenge_completions_challenge_id_fkey'
  ) THEN
    ALTER TABLE "user_challenge_completions" ADD CONSTRAINT "user_challenge_completions_challenge_id_fkey"
      FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
