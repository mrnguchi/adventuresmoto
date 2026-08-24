"use client";

import type { FormEvent } from "react";

import { PasswordField } from "@/components/account/password-field";
import { SocialSignIn } from "@/components/account/social-sign-in";

type SignupFormProps = {
  onSocialSignIn: (provider: string) => void;
  onSubmit: (formData: FormData) => void;
  onSwitchToLogin: () => void;
};

export function SignupForm({
  onSocialSignIn,
  onSubmit,
  onSwitchToLogin,
}: SignupFormProps) {
  function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
  }

  return (
    <>
      <form className="auth-form" onSubmit={submitSignup}>
        <div className="auth-name-fields">
          <div className="auth-field">
            <label htmlFor="signup-first-name">First name</label>
            <input
              id="signup-first-name"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              required
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label htmlFor="signup-last-name">Last name</label>
            <input
              id="signup-last-name"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <PasswordField
          id="signup-password"
          name="password"
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
        />

        <PasswordField
          id="signup-password-confirmation"
          name="passwordConfirmation"
          label="Confirm password"
          placeholder="Enter your password again"
          autoComplete="new-password"
          minLength={8}
        />

        <label className="auth-checkbox auth-terms">
          <input name="termsAccepted" type="checkbox" required />
          <span>
            I agree to the <a href="/terms">terms</a> and{" "}
            <a href="/privacy-policy">privacy policy</a>.
          </span>
        </label>

        <button className="auth-submit" type="submit">
          Create account
        </button>
      </form>

      <SocialSignIn onSelect={onSocialSignIn} />

      <p className="auth-switch-copy">
        Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin}>
          Log in
        </button>
      </p>
    </>
  );
}
