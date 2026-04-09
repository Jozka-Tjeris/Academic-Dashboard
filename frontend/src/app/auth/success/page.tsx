"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("access_token", token);
      setTimeout(() => {
        router.replace("/dashboard");
      }, 50);
    } else {
      router.push("/login");
    }
  }, [router]);

  return <p>Logging you in...</p>;
}