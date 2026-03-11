import { useApi } from "@/hooks/useApi";
import { redirect } from "next/navigation";

export default async function Home() {
  const { secureFetch } = useApi();
  
  try {
    const res = await secureFetch("/api/auth/me", {
      cache: "no-store",
    });

    if (res.ok) {
      redirect("/dashboard");
    }
  } catch (error) {
    console.error("Auth check failed", error);
  }

  redirect("/login");
}
