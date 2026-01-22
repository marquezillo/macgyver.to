import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { ENV } from "./env";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // In standalone mode, create a default user if not authenticated
  console.log('[Context] standaloneMode:', ENV.standaloneMode, 'user:', user ? 'exists' : 'null');
  if (!user && ENV.standaloneMode) {
    user = {
      id: 1,
      openId: "standalone-user",
      name: "Usuario",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    console.log('[Context] Created standalone user');
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
