# TypeScript Service Boilerplate

This project is meant to be a base for a Node.js service (or API) written in
TypeScript. It ships with Express (coming soon), but it can easily be swapped
out for another API library, a task runner, etc.

## Features

### Ships with:

- Node.js 12.x support
- Dockerfile (with docker-compose file for development)
- TypeScript
- ESLint (with TypeScript plugin)
- Prettier
- Jest (with TypeScript support)

### Configured with:

- npm scripts for `build`, `clean`, `format`, `lint`, `start`, `test`, `watch`
- Pre-commit hook to `format` and `lint`
- `nvm which` support

## Instructions

1. Clone the ts-service-boilerplate repo
2. Copy/paste into new folder
3. Delete the `.git` folder and run `git init` to start fresh
4. Run `npm i` to install dependencies
5. Run `npm start` to run locally or `docker-compose up` to run in Docker
