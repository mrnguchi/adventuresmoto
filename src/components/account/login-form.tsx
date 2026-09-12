"use client";

import type { FormEvent } from "react";

import { PasswordField } from "@/components/account/password-field";

type LoginFormProps = {
  onForgotPassword: () => void;
  onSocialSignIn: (provider: string) => void;
  onSubmit: (formData: FormData) => void;
  onSwitchToSignup: () => void;
};

export function LoginForm({
  onForgotPassword,
  onSubmit,
  onSwitchToSignup,
}: LoginFormProps) {
  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
  }

  return (
    <>
      <form className="auth-form" onSubmit={submitLogin}>
        <div className="auth-field">
          <label className="sr-only" htmlFor="login-identifier">
            Email address
          </label>
          <input
            id="login-identifier"
            name="identifier"
            type="email"
            autoComplete="username"
            placeholder="Email address"
            required
            autoFocus
          />
        </div>

        <PasswordField
          id="login-password"
          name="password"
          label="Password"
          placeholder="Password"
          autoComplete="current-password"
          hideLabel
        />

        <button className="auth-submit" type="submit">
          Log in
        </button>
      </form>

      <div className="auth-login-links">
        <button type="button" onClick={onForgotPassword}>
          Forgot your password?
        </button>
        <p>
          Don&apos;t have an account?{" "}
          <button type="button" onClick={onSwitchToSignup}>
            Create account
          </button>
        </p>
      </div>

    </>
  );
}
