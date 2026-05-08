import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { appRouter } from "@/server/trpc/root";
import { createContext } from "@/server/trpc/init";

const getContext = cache(async () => {
  const h = headers();
  return createContext({ headers: new Headers(h) });
});

export const api = async () => appRouter.createCaller(await getContext());
