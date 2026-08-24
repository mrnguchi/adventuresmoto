"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { LoginForm } from "@/components/account/login-form";
import { PasswordRecoveryForm } from "@/components/account/password-recovery-form";
import { SignupForm } from "@/components/account/signup-form";
import {
  protectedAreaCopy,
  type AccountModalView,
  type ProtectedAccountArea,
} from "@/components/account/account-types";
import { CloseIcon } from "@/components/icons";

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

  function submitSignup(formData: FormData) {
    if (formData.get("password") !== formData.get("passwordConfirmation")) {
      setNotice({
        message: "Those passwords do not match. Please try again.",
        tone: "error",
      });
      return;
    }

    showIntegrationNotice(
      "Account creation is ready for us to connect to the authentication service.",
    );
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
              {isLogin
                ? "Log in"
                : isSignup
                  ? "Create account"
                  : "Reset password"}
            </h1>
            <p id="account-modal-description">
              {isLogin
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

          <div className="account-form-view" key={view}>
            {isLogin ? (
              <LoginForm
                onForgotPassword={() => changeView("password-recovery")}
                onSocialSignIn={(provider) =>
                  showIntegrationNotice(
                    `${provider} sign-in is ready for us to connect.`,
                  )
                }
                onSubmit={() =>
                  showIntegrationNotice(
                    "Login is ready for us to connect to the authentication service.",
                  )
                }
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
              <PasswordRecoveryForm
                onBackToLogin={() => changeView("login")}
              />
            )}
          </div>
        </section>
      </div>
    </dialog>
  );
}
