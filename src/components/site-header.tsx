import "server-only";
import { auth } from "@/server/auth";
import { TopNav } from "./nav";
import { AppHeader } from "./app-chrome";

const builderNav = [
  { label: "Console", href: "/builders/dashboard" },
  { label: "Schedule", href: "/events" },
  { label: "Teams", href: "/builders/teams" },
  { label: "Workshops", href: "/workshops" },
  { label: "Profile", href: "/builders/dashboard/profile" },
];

export async function SiteHeader() {
  const session = await auth();

  if (session?.user) {
    return <AppHeader links={builderNav} />;
  }
  return <TopNav />;
}
