"use client";

import { useState } from "react";

type PasswordFieldProps = {
  autoComplete: "current-password" | "new-password";
  autoFocus?: boolean;
  hideLabel?: boolean;
  id: string;
  label: string;
  minLength?: number;
  name: string;
  placeholder: string;
};

export function PasswordField({
  autoComplete,
  autoFocus = false,
  hideLabel = false,
  id,
  label,
  minLength,
  name,
  placeholder,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <div
        className={`auth-field-heading ${
          hideLabel ? "auth-field-heading--label-hidden" : ""
        }`}
      >
        <label className={hideLabel ? "sr-only" : undefined} htmlFor={id}>
          {label}
        </label>
        <button
          type="button"
          aria-controls={id}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={minLength}
        required
        autoFocus={autoFocus}
      />
    </div>
  );
}
