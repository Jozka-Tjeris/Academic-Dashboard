import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const token = (await cookies()).get("access_token");

  if (token) redirect("/dashboard");

  redirect("/login");
}
