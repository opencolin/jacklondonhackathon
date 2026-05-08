import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nebius Builders — The operating layer for OpenClaw events",
  description:
    "Hackathons, hack nights, demo nights, and workshops for OpenClaw builders — powered by Nebius Token Factory, Contree workspaces, and Nebius Serverless deploys.",
  metadataBase: new URL("https://builders.nebius.com"),
  openGraph: {
    title: "Nebius Builders",
    description: "The operating layer for OpenClaw developer events.",
    url: "https://builders.nebius.com",
    siteName: "Nebius Builders",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `(function(){try{var t=localStorage.getItem('nb-theme');var dark=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);var html=document.documentElement;if(dark){html.classList.add('dark');}html.style.colorScheme=dark?'dark':'light';}catch(e){}})();`;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
