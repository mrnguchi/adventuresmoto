"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { LoginForm } from "@/components/account/login-form";
import { SignupForm } from "@/components/account/signup-form";
import {
  protectedAreaCopy,
  type AccountModalView,
  type ProtectedAccountArea,
} from "@/components/account/account-types";
import { CloseIcon } from "@/components/icons";
import { accountRequest, useAccount } from "./account-provider";
import { ProfileForm } from "./profile-form";

type AccountModalProps = {
  area: ProtectedAccountArea;
  onClose: () => void;
  onViewChange: (view: AccountModalView) => void;
  open: boolean;
  view: AccountModalView;
};

type FormNotice = {
  message: string;
  tone: "error" | "info";
};

export function AccountModal({
  area,
  onClose,
  onViewChange,
  open,
  view,
}: AccountModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { user, setUser } = useAccount();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const areaCopy = protectedAreaCopy[area];
  const isLogin = view === "login";
  const isSignup = view === "signup";

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && dialog && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog?.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  function changeView(nextView: AccountModalView) {
    setNotice(null);
    onViewChange(nextView);
  }

  function showIntegrationNotice(message: string) {
    setNotice({ message, tone: "info" });
  }

  async function submitAccount(action: "login" | "signup", formData: FormData) {
    if (busy) return;
    setBusy(true); setNotice(null);
    try {
      const result = await accountRequest(action, { ...Object.fromEntries(formData), email: formData.get("email") ?? formData.get("identifier"), termsAccepted: formData.get("termsAccepted") === "on" });
      setUser(result.user); setNotice(null);
    } catch (error) { setNotice({ message: error instanceof Error ? error.message : "Unable to sign in.", tone: "error" }); }
    finally { setBusy(false); }
  }
  function submitSignup(formData: FormData) {
    if (formData.get("password") !== formData.get("passwordConfirmation")) {
      setNotice({
        message: "Those passwords do not match. Please try again.",
        tone: "error",
      });
      return;
    }

    void submitAccount("signup", formData);
  }

  return (
    <dialog
      className="account-dialog"
      ref={dialogRef}
      aria-labelledby="account-modal-title"
      aria-describedby="account-modal-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onClose={onClose}
    >
      <div className="account-modal-shell">
        <button
          className="account-modal-close"
          type="button"
          aria-label="Close account window"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <Image
          className="account-modal-logo"
          src="/images/logo.png"
          alt="Adventures Moto"
          width={304}
          height={108}
        />

        <section className="account-modal-content">
          <div className="account-modal-intro">
            <h1 id="account-modal-title">
              {user ? `Hello, ${user.firstName}` : isLogin
                ? "Log in"
                : isSignup
                  ? "Create account"
                  : "Reset password"}
            </h1>
            <p id="account-modal-description">
              {user ? "Manage your account details" : isLogin
                ? area === "account"
                  ? "Please enter your details to log in"
                  : areaCopy.description
                : isSignup
                  ? "Enter your details to create your account"
                  : "We’ll help you get back into your account"}
            </p>
          </div>

          {notice ? (
            <p
              className={`auth-notice auth-notice--${notice.tone}`}
              role={notice.tone === "error" ? "alert" : "status"}
            >
              {notice.message}
            </p>
          ) : null}

          <fieldset className="account-form-view" key={user ? "profile" : view} disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            {user ? <ProfileForm /> : isLogin ? (
              <LoginForm
                onForgotPassword={() => changeView("password-recovery")}
                onSocialSignIn={(provider) =>
                  showIntegrationNotice(
                    `${provider} sign-in is ready for us to connect.`,
                  )
                }
                onSubmit={(data) => void submitAccount("login", data)}
                onSwitchToSignup={() => changeView("signup")}
              />
            ) : isSignup ? (
              <SignupForm
                onSocialSignIn={(provider) =>
                  showIntegrationNotice(
                    `${provider} sign-up is ready for us to connect.`,
                  )
                }
                onSubmit={submitSignup}
                onSwitchToLogin={() => changeView("login")}
              />
            ) : (
              <div className="auth-login-links"><p>Password reset by email is not available yet. Please contact the store for help.</p><button type="button" onClick={() => changeView("login")}>Back to login</button></div>
            )}
            {busy && <p role="status">Please wait…</p>}
          </fieldset>
        </section>
      </div>
    </dialog>
  );
}
