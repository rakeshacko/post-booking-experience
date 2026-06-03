"use client";

import { useCallback, useState } from "react";

import { LOAN_APPLICATION_CONTROL_TEXT_CLASS } from "@/components/payment/loan-application/loan-application-layout";

type LoanApplicationFormFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  multiline?: boolean;
  className?: string;
  /** Default `labeled` follows skills/forms-controls.md. `placeholder` is Figma personal override only. */
  variant?: "labeled" | "placeholder";
  /** Shown below the field (e.g. Mother's name verification copy). */
  hint?: string;
};

const FLOAT_TRANSITION =
  "transition-[top,transform,font-size,line-height,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:duration-0";

const INPUT_WRAP_LABELED_CLASS =
  "flex min-h-12 w-full items-center rounded-lg border border-[#e8e8e8] bg-white px-4";
const LABELED_INNER_INPUT_CLASS =
  "min-w-0 w-full border-0 bg-transparent p-0 text-base font-normal leading-6 text-[#121212] outline-none placeholder:text-[#9e9e9e] focus:ring-0";
const MULTILINE_WRAP_LABELED_CLASS =
  "flex h-24 w-full items-start rounded-lg border border-[#e8e8e8] bg-white px-4 py-3";

const FLOAT_LABEL_ACTIVE_CLASS =
  "-top-0.5 -translate-y-1/2 bg-white px-0.5 text-xs leading-[18px]";
const FLOAT_LABEL_INACTIVE_CLASS = "top-1/2 -translate-y-1/2 text-sm leading-5";
const FLOAT_LABEL_INACTIVE_MULTILINE_CLASS = "top-3 translate-y-0 text-sm leading-5";

const PLACEHOLDER_VALUE_CLASS = `${LOAN_APPLICATION_CONTROL_TEXT_CLASS} text-[#121212]`;

type FloatingPlaceholderFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  multiline?: boolean;
};

function FloatingPlaceholderField({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  multiline = false,
}: FloatingPlaceholderFieldProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.trim().length > 0;

  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback(() => setFocused(false), []);

  const wrapClass = [
    "relative w-full rounded-lg border bg-white px-4",
    FLOAT_TRANSITION,
    multiline ? "flex h-24 flex-col" : "flex h-12 items-center",
    active ? "border-[#e0e0e1]" : "border-[#e8e8e8]",
  ].join(" ");

  const floatLabelClass = [
    "pointer-events-none absolute left-4 z-10 origin-left text-[#757575]",
    FLOAT_TRANSITION,
    active
      ? FLOAT_LABEL_ACTIVE_CLASS
      : multiline
        ? FLOAT_LABEL_INACTIVE_MULTILINE_CLASS
        : FLOAT_LABEL_INACTIVE_CLASS,
  ].join(" ");

  const inputClass = [
    "w-full min-w-0 border-0 bg-transparent p-0 outline-none focus:ring-0",
    PLACEHOLDER_VALUE_CLASS,
    multiline ? "min-h-0 flex-1 resize-none pt-3" : "",
  ].join(" ");

  return (
    <div className={wrapClass}>
      <label htmlFor={id} className={floatLabelClass}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          rows={3}
          autoComplete={autoComplete}
          className={inputClass}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete={autoComplete}
          className={inputClass}
        />
      )}
    </div>
  );
}

export function LoanApplicationFormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  multiline = false,
  className = "",
  variant = "labeled",
  hint,
}: LoanApplicationFormFieldProps) {
  const isPlaceholderVariant = variant === "placeholder";

  if (isPlaceholderVariant) {
    return (
      <div className={`w-full ${className}`}>
        <FloatingPlaceholderField
          id={id}
          label={placeholder ?? label}
          value={value}
          onChange={onChange}
          type={type}
          autoComplete={autoComplete}
          multiline={multiline}
        />
        {hint ? (
          <p className="mt-2 text-xs font-normal leading-[18px] text-[#757575]">{hint}</p>
        ) : null}
      </div>
    );
  }

  const labelEl = (
    <label htmlFor={id} className="mb-2 block text-sm font-medium leading-5 text-[#121212]">
      {label}
    </label>
  );

  const control = multiline ? (
    <div className={MULTILINE_WRAP_LABELED_CLASS}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        autoComplete={autoComplete}
        className={`${LABELED_INNER_INPUT_CLASS} h-full min-h-0 resize-none`}
      />
    </div>
  ) : (
    <div className={INPUT_WRAP_LABELED_CLASS}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={LABELED_INNER_INPUT_CLASS}
      />
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {labelEl}
      {control}
      {hint ? (
        <p className="mt-2 text-xs font-normal leading-[18px] text-[#757575]">{hint}</p>
      ) : null}
    </div>
  );
}
