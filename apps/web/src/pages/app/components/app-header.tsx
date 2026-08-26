import type { ReactNode } from "react";
import { Icon } from "../../../components/icon";
import { Brand } from "./brand";

export function AppHeader({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`flex min-h-12 items-center justify-between gap-4 ${className ?? ""}`}
    >
      <div className="lg:hidden">
        <Brand />
      </div>
      <div className="hidden flex-1 md:block">{children}</div>
      <div className="ml-auto flex items-center gap-4 text-muted md:hidden">
        <button aria-label="Buscar" className="md:hidden" type="button">
          <Icon name="search" />
        </button>
      </div>
    </header>
  );
}
