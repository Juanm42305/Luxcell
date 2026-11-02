import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ActionState } from "../action-state";

export const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3 text-base transition-colors hover:border-muted focus:border-ink focus:outline-none aria-[invalid=true]:border-warn sm:text-sm";

type BaseProps = {
  name: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
};

function FieldShell({
  name,
  label,
  error,
  hint,
  className,
  children,
}: BaseProps & { children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${name}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs font-medium text-warn">
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (name: string, error?: string, hint?: ReactNode) =>
  error ? `${name}-error` : hint ? `${name}-hint` : undefined;

export function TextField({
  defaultValue,
  type = "text",
  inputMode,
  required,
  maxLength,
  ...props
}: BaseProps & {
  defaultValue?: string | number | null;
  type?: string;
  inputMode?: "numeric" | "text" | "email" | "tel";
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <FieldShell {...props}>
      <input
        id={props.name}
        name={props.name}
        type={type}
        inputMode={inputMode}
        required={required}
        maxLength={maxLength}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(props.error)}
        aria-describedby={describedBy(props.name, props.error, props.hint)}
        className={cn(inputClass, "h-11")}
      />
    </FieldShell>
  );
}

export function TextArea({
  defaultValue,
  rows = 4,
  maxLength,
  ...props
}: BaseProps & { defaultValue?: string | null; rows?: number; maxLength?: number }) {
  return (
    <FieldShell {...props}>
      <textarea
        id={props.name}
        name={props.name}
        rows={rows}
        maxLength={maxLength}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(props.error)}
        aria-describedby={describedBy(props.name, props.error, props.hint)}
        className={cn(inputClass, "py-2")}
      />
    </FieldShell>
  );
}

export function SelectField({
  defaultValue,
  options,
  placeholder,
  ...props
}: BaseProps & {
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <FieldShell {...props}>
      <select
        id={props.name}
        name={props.name}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(props.error)}
        aria-describedby={describedBy(props.name, props.error, props.hint)}
        className={cn(inputClass, "h-11")}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-5 shrink-0 accent-ink"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function FormStatus({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl px-3 py-2 text-sm",
        state.status === "error" ? "bg-warn-soft text-warn" : "bg-ok-soft text-ok",
      )}
    >
      {state.message}
    </p>
  );
}
