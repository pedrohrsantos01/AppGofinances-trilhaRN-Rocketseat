import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { createSupabaseAuthVerifier, AuthVerifier } from "./auth";
import { fail, ok } from "./http/envelope";
import { InMemorySharingService } from "./services/inMemorySharingService";
import { InMemorySyncService } from "./services/inMemorySyncService";
import { AuthenticatedUser, SharingService, SyncService } from "./types";

const syncMutationSchema = z.object({
  id: z.string().min(1),
  entity_type: z.enum([
    "accounts",
    "credit_cards",
    "transactions",
    "invoices",
    "budgets",
    "reminders",
    "goals",
  ]),
  entity_id: z.string().min(1),
  operation: z.enum(["insert", "update", "delete"]),
  payload: z.record(z.string(), z.unknown()).nullable(),
  idempotency_key: z.string().min(1),
  device_id: z.string().min(1),
  created_at: z.string().min(1),
});

const syncPushSchema = z.object({
  mutations: z.array(syncMutationSchema),
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["viewer", "editor"]),
});

export interface BuildAppOptions {
  authVerifier?: AuthVerifier;
  syncService?: SyncService;
  sharingService?: SharingService;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

function extractBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header) return null;

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
  verifier: AuthVerifier
): Promise<boolean> {
  const token = extractBearerToken(request);
  if (!token) {
    await reply.code(401).send(fail("AUTH_REQUIRED", "Missing bearer token"));
    return false;
  }

  const user = await verifier(token);
  if (!user) {
    await reply.code(401).send(fail("AUTH_REQUIRED", "Invalid bearer token"));
    return false;
  }

  request.user = user;
  return true;
}

function requireUser(request: FastifyRequest): AuthenticatedUser {
  if (!request.user) {
    throw new Error("Authenticated user missing after auth guard");
  }
  return request.user;
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: false });
  const authVerifier = options.authVerifier ?? createSupabaseAuthVerifier();
  const syncService = options.syncService ?? new InMemorySyncService();
  const sharingService = options.sharingService ?? new InMemorySharingService();

  void app.register(cors, { origin: true });
  void app.register(sensible);

  app.get("/health", async () => ok({ status: "ok" }));

  app.get("/v1/me", async (request, reply) => {
    if (!(await authenticate(request, reply, authVerifier))) return reply;
    return ok(requireUser(request));
  });

  app.post("/v1/sync/push", async (request, reply) => {
    if (!(await authenticate(request, reply, authVerifier))) return reply;

    const parsed = syncPushSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send(fail("VALIDATION_ERROR", "Invalid sync push payload"));
    }

    const result = await syncService.push(requireUser(request), parsed.data.mutations);
    return ok(result);
  });

  app.get("/v1/sync/pull", async (request, reply) => {
    if (!(await authenticate(request, reply, authVerifier))) return reply;

    const since =
      typeof (request.query as Record<string, unknown>).since === "string"
        ? ((request.query as Record<string, string>).since as string)
        : undefined;

    const result = await syncService.pull(requireUser(request), since);
    return ok(result);
  });

  app.get("/v1/sharing/invites", async (request, reply) => {
    if (!(await authenticate(request, reply, authVerifier))) return reply;
    return ok(await sharingService.listByOwner(requireUser(request)));
  });

  app.post("/v1/sharing/invites", async (request, reply) => {
    if (!(await authenticate(request, reply, authVerifier))) return reply;

    const parsed = inviteSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send(fail("VALIDATION_ERROR", "Invalid sharing invite payload"));
    }

    return reply
      .code(201)
      .send(ok(await sharingService.createInvite(requireUser(request), parsed.data)));
  });

  app.patch("/v1/sharing/:id/revoke", async (request, reply) => {
    if (!(await authenticate(request, reply, authVerifier))) return reply;
    try {
      return ok(
        await sharingService.revoke(requireUser(request), (request.params as { id: string }).id)
      );
    } catch {
      return reply.code(404).send(fail("FORBIDDEN", "Sharing invite not found"));
    }
  });

  app.post("/v1/open-finance/consents", async (request, reply) => {
    if (!(await authenticate(request, reply, authVerifier))) return reply;
    return reply.code(202).send(ok({ status: "pending" }));
  });

  app.post("/v1/open-finance/sync", async (request, reply) => {
    if (!(await authenticate(request, reply, authVerifier))) return reply;
    return reply.code(202).send(ok({ imported: 0, skipped: 0 }));
  });

  return app;
}
