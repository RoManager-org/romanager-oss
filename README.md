# RoManager
[![License](https://img.shields.io/github/license/RoManager-org/romanager-oss)](https://github.com/RoManager-org/romanager-oss/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/798735708755460118?color=5865F2&label=discord&logo=discord&logoColor=white)](https://discord.gg/WRTsHuH9qP)

RoManager is a free, feature-rich Discord-to-Roblox bot. This repository (https://github.com/RoManager-org/romanager-oss) is the self-hosted version.

## Setup
~~Instructions to start your own instance of RoManager are in the wiki: https://github.com/RoManager-org/romanager-oss/wiki.~~ (not yet complete)

## Security
Found a vulnerability or a security issue? See our [Security policy](https://github.com/RoManager-org/romanager-oss/blob/main/SECURITY.md). 

## Contribute
We accept any kind of contributions! They will also be added to the public version of RoManager.

### Developing on RoManager
Requirements:
* Node.js v16 or higher.
* npm 7 or higher
* PostgreSQL

1. Populate the `.env.example` file and rename it to `.env`
2. Install dependencies using `npm i --legacy-peer-deps`
3. Run `npm run build` to compile the TypeScript code to JavaScript
4. Run `npm run migrate:dev` to apply the schema to the database
5. Start the bot with `node .`

When making changes to the TS files, run `npm run build` afterwards to compile the changes to JavaScript.

When you make changes to the `prisma/schema.prisma` file, run `npm run db:push` to quickly test the changes.

## Public version
[Add the public verison of RoManager](https://discord.com/oauth2/authorize?client_id=738035113815834746&permissions=540142656&scope=bot%20applications.commands)

[![Discord Bots](https://top.gg/api/widget/738035113815834746.svg)](https://top.gg/bot/738035113815834746)

### Differences between public and self-hosted
#### Will come to self-hosted version eventually
* Only one account at a time is supported
* Does not have sales, audit logs, or join request logging.
* Does not include the API
* Does not have rank locks
* Does not have group bans

#### Never being included in self-hosted version
* The bot accounts will not automatically join groups
* Does not have the `bot-account` commands
