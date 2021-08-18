-- CreateEnum
CREATE TYPE "PermissionOverrideType" AS ENUM ('USER', 'ROLE');

-- CreateEnum
CREATE TYPE "PermissionOverrideAction" AS ENUM ('ALLOW', 'DENY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "robloxAccounts" BIGINT[],
    "defaultRobloxAccount" BIGINT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "prefix" TEXT,
    "linkedGroup" BIGINT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildMember" (
    "selectedAccount" BIGINT,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    PRIMARY KEY ("guildId","userId")
);

-- CreateTable
CREATE TABLE "PermissionOverride" (
    "id" TEXT NOT NULL,
    "type" "PermissionOverrideType" NOT NULL DEFAULT E'ROLE',
    "command" TEXT NOT NULL,
    "action" "PermissionOverrideAction" NOT NULL,
    "guildId" TEXT NOT NULL,

    PRIMARY KEY ("id","type","command")
);

-- AddForeignKey
ALTER TABLE "GuildMember" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMember" ADD FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionOverride" ADD FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
