import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { createCallerFactory } from "@trpc/server";
import { appRouter } from "@/server/trpc/root";
import { createContext } from "@/server/trpc/init";

const createCaller = createCallerFactory(appRouter);

const getContext = cache(async () => {
  const h = headers();
  return createContext({ headers: new Headers(h) });
});

export const api = async () => createCaller(await getContext());
