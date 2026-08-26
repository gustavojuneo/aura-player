import { Field as FieldPrimitive } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import { cn } from "../../utils/cn";

export function Field({
  className,
  ...props
}: ComponentProps<typeof FieldPrimitive.Root>) {
  return (
    <FieldPrimitive.Root
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

export function FieldLabel({
  className,
  ...props
}: ComponentProps<typeof FieldPrimitive.Label>) {
  return (
    <FieldPrimitive.Label
      className={cn("text-[0.6875rem] font-semibold text-muted", className)}
      {...props}
    />
  );
}

export function FieldDescription({
  className,
  ...props
}: ComponentProps<typeof FieldPrimitive.Description>) {
  return (
    <FieldPrimitive.Description
      className={cn("text-xs text-muted", className)}
      {...props}
    />
  );
}

export function FieldError({
  className,
  ...props
}: ComponentProps<typeof FieldPrimitive.Error>) {
  return (
    <FieldPrimitive.Error
      className={cn("text-xs font-medium text-danger-strong", className)}
      {...props}
    />
  );
}
