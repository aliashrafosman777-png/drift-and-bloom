// @ts-nocheck
"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMail, FiHash, FiUser } from "react-icons/fi";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/common/Button";
import { useToast } from "../components/common/Toast";
import { useAuth } from "../context/AuthContext";
const loginImage = "/assets/login.jpeg";

type Step = "email" | "code" | "name";

export default function Login() {
  const { sendCode, verifyCode, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/";
  const gatingMessage = searchParams.get("message");

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Already authenticated → redirect
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(isAdmin ? '/admin' : redirectTo);
    }
  }, [isAuthenticated, isAdmin, authLoading, redirectTo]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await sendCode(email);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    showToast("Verification code sent to your email.");
    setStep("code");
    setCountdown(60);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await verifyCode(email, code);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (result.isNewUser) {
      setStep("name");
      return;
    }

    showToast("Welcome back to Drift & Bloom.");
    // isAdmin will be set by the auth context after verifyCode returns
    // The useEffect above handles the redirect
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // OTP is still valid (not consumed for new users), re-submit with name
    const result = await verifyCode(email, code, name);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    showToast("Welcome to Drift & Bloom!");
    // The useEffect above handles the redirect based on role
  };

  const handleResend = async () => {
    setError("");
    const result = await sendCode(email);
    if (!result.success) {
      setError(result.error);
      return;
    }
    showToast("New code sent to your email.");
    setCountdown(60);
    setCode("");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <AuthLayout
      title={
        step === "email" ? "Welcome" :
        step === "code" ? "Check your email" :
        "Almost there"
      }
      subtitle={
        step === "email" ? "Enter your email to sign in or create an account." :
        step === "code" ? `We sent a 6-digit code to ${email}` :
        "Tell us your name to finish creating your account."
      }
      image={loginImage}
    >
      {gatingMessage && step === "email" && (
        <p className="bg-beige text-charcoal/70 text-sm rounded-lg px-4 py-3 mb-4">
          {gatingMessage}
        </p>
      )}

      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {/* Step 1: Email */}
      {step === "email" && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" size={16} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-beige rounded-lg pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>
          <Button type="submit" fullWidth size="lg" className="mt-2" disabled={loading}>
            {loading ? "Sending..." : "Continue"}
          </Button>
        </form>
      )}

      {/* Step 2: OTP Code */}
      {step === "code" && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="relative">
            <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" size={16} />
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              className="w-full bg-beige rounded-lg pl-11 pr-4 py-3.5 text-sm tracking-[0.3em] text-center font-medium focus:outline-none focus:ring-1 focus:ring-sage"
              autoFocus
            />
          </div>
          <Button type="submit" fullWidth size="lg" className="mt-2" disabled={loading || code.length < 6}>
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
          <div className="flex items-center justify-between text-xs text-charcoal/50 mt-3">
            <button
              type="button"
              onClick={() => { setStep("email"); setCode(""); setError(""); }}
              className="underline hover:text-charcoal/70"
            >
              ← Change email
            </button>
            {countdown > 0 ? (
              <span>Resend in {formatTime(countdown)}</span>
            ) : (
              <button type="button" onClick={handleResend} className="text-olive underline hover:text-olive/80">
                Resend code
              </button>
            )}
          </div>
        </form>
      )}

      {/* Step 3: Name (new users) */}
      {step === "name" && (
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" size={16} />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-beige rounded-lg pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage"
              autoFocus
            />
          </div>
          <Button type="submit" fullWidth size="lg" className="mt-2" disabled={loading || !name.trim()}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>
      )}

      <p className="text-xs text-charcoal/30 text-center mt-10">
        We&apos;ll send you a verification code — no password needed.
      </p>
    </AuthLayout>
  );
}
