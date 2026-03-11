import { useCheckAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";

export default function Home() {
  const { data } = useCheckAuth();
  try {
    if (data?.ok) {
      redirect("/dashboard");
    }
  } catch (error) {
    console.error("Auth check failed", error);
  }

  redirect("/login");
}
