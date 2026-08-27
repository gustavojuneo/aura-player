import { BrandLogo } from "../../../components/brand-logo";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return <BrandLogo collapsed={collapsed} />;
}
