import "server-only";
import { router } from "./init";
import { authRouter } from "@/server/routers/auth";
import { eventsRouter } from "@/server/routers/events";
import { teamsRouter } from "@/server/routers/teams";
import { projectsRouter } from "@/server/routers/projects";
import { submissionsRouter } from "@/server/routers/submissions";
import { judgingRouter } from "@/server/routers/judging";
import { officeHoursRouter } from "@/server/routers/officeHours";
import { manifestRouter } from "@/server/routers/manifest";
import { sponsorsRouter } from "@/server/routers/sponsors";
import { adminRouter } from "@/server/routers/admin";

export const appRouter = router({
  auth: authRouter,
  events: eventsRouter,
  teams: teamsRouter,
  projects: projectsRouter,
  submissions: submissionsRouter,
  judging: judgingRouter,
  officeHours: officeHoursRouter,
  manifest: manifestRouter,
  sponsors: sponsorsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
