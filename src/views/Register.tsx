// @ts-nocheck
"use client"

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Register page now redirects to Login — registration happens inline
 * via the OTP email flow (email → code → name for new users).
 */
export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const from = searchParams.get("from");
    const message = searchParams.get("message");
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (message) params.set("message", message);
    router.replace(params.toString() ? `/login?${params}` : "/login");
  }, []);

  return null;
}
