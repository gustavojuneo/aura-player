import { ProductState } from "../../../components/ui";

export function SessionExpiredState() {
  return (
    <ProductState
      action={{
        label: "Entrar novamente",
        onClick: () => window.location.assign("/"),
      }}
      className="w-full max-w-md"
      kind="session-expired"
    />
  );
}
