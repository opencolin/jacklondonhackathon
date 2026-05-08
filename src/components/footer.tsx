import { BuilderShipLogo } from "./buildership-logo";
import { ThemeToggleComposio } from "./theme-toggle-composio";

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="container-page py-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <BuilderShipLogo />
          <ThemeToggleComposio />
        </div>
      </div>
    </footer>
  );
}
