"use client";

import { useState, type FormEvent } from "react";

import { PasswordField } from "@/components/account/password-field";

type PasswordRecoveryFormProps = {
  onBackToLogin: () => void;
};

type RecoveryStep = "request" | "verify" | "reset" | "complete";

export function PasswordRecoveryForm({
  onBackToLogin,
}: PasswordRecoveryFormProps) {
  const [step, setStep] = useState<RecoveryStep>("request");
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");

  function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIdentifier(String(formData.get("identifier") ?? ""));
    setError("");
    setStep("verify");
  }

  function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStep("reset");
  }

  function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (formData.get("password") !== formData.get("passwordConfirmation")) {
      setError("Those passwords do not match. Please try again.");
      return;
    }

    setError("");
    setStep("complete");
  }

  if (step === "complete") {
    return (
      <div className="password-recovery-complete">
        <span aria-hidden="true">✓</span>
        <h2>Password updated</h2>
        <p>
          Your password has been changed. You can now log in with your new
          details.
        </p>
        <button className="auth-submit" type="button" onClick={onBackToLogin}>
          Back to log in
        </button>
      </div>
    );
  }

  return (
    <>
      {step === "request" ? (
        <form className="auth-form" onSubmit={requestCode}>
          <div className="auth-field">
            <label className="sr-only" htmlFor="recovery-identifier">
              Mobile number or email address
            </label>
            <input
              id="recovery-identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              placeholder="Mobile number or email address"
              required
              autoFocus
            />
          </div>
          <button className="auth-submit" type="submit">
            Send recovery code
          </button>
        </form>
      ) : null}

      {step === "verify" ? (
        <>
          <p className="password-recovery-copy">
            Enter the six-digit code sent to <strong>{identifier}</strong>.
          </p>
          <form className="auth-form" onSubmit={verifyCode}>
            <div className="auth-field">
              <label className="sr-only" htmlFor="recovery-code">
                Six-digit verification code
              </label>
              <input
                id="recovery-code"
                className="recovery-code-input"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit verification code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <button className="auth-submit" type="submit">
              Verify code
            </button>
          </form>
          <button
            className="password-recovery-secondary"
            type="button"
            onClick={() => setStep("request")}
          >
            Send a new code
          </button>
        </>
      ) : null}

      {step === "reset" ? (
        <form className="auth-form" onSubmit={resetPassword}>
          <PasswordField
            id="recovery-password"
            name="password"
            label="New password"
            placeholder="New password"
            autoComplete="new-password"
            minLength={8}
            autoFocus
            hideLabel
          />
          <PasswordField
            id="recovery-password-confirmation"
            name="passwordConfirmation"
            label="Confirm new password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            minLength={8}
            hideLabel
          />
          {error ? (
            <p className="auth-notice auth-notice--error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="auth-submit" type="submit">
            Update password
          </button>
        </form>
      ) : null}

      <button
        className="password-recovery-back"
        type="button"
        onClick={onBackToLogin}
      >
        Back to log in
      </button>
    </>
  );
}
