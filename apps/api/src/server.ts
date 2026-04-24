import { buildApp } from "./app";

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? "0.0.0.0";

async function start() {
  const app = buildApp();
  await app.listen({ port, host });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
