import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiFetch(url: string, options: RequestInit = {}){
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(baseUrl + url, {
    // credentials: "include",
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }

  return res;
}
