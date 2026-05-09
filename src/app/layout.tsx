import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BuilderShip — Three-week hackathon, finals on the bay",
    template: "%s — BuilderShip",
  },
  description:
    "BuilderShip: a three-week remote AI hackathon hosted by Composio and Nebius. Submit by May 28. Top 30 builders earn a boat day on the bay, May 30. Compete for $10k and a DGX Spark.",
  metadataBase: new URL("https://ship.builders"),
  openGraph: {
    title: "BuilderShip — Three-week hackathon, finals on the bay",
    description:
      "30 hand-picked builders. Three weeks of daily office hours. One boat day on May 30. Hosted by Composio, Nebius, Tavily, and OpenClaw.",
    url: "https://ship.builders",
    siteName: "BuilderShip",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuilderShip — Three-week hackathon, finals on the bay",
    description:
      "30 hand-picked builders. Three weeks of daily office hours. One boat day on May 30. Hosted by Composio, Nebius, Tavily, and OpenClaw.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `(function(){try{var t=localStorage.getItem('nb-theme');var dark=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);var url=new URL(window.location.href);var qp=url.searchParams.get('theme');if(qp==='composio'){localStorage.removeItem('bs-theme-nebius');}else if(qp==='nebius'||qp==='default'){localStorage.setItem('bs-theme-nebius','1');}if(localStorage.getItem('bs-theme-default')==='1'){localStorage.setItem('bs-theme-nebius','1');}localStorage.removeItem('bs-theme-default');localStorage.removeItem('bs-theme-composio');var composio=localStorage.getItem('bs-theme-nebius')!=='1';var html=document.documentElement;if(composio){html.setAttribute('data-theme','composio');dark=true;}if(dark){html.classList.add('dark');}html.style.colorScheme=dark?'dark':'light';}catch(e){}})();`;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Cinzel:wght@600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
