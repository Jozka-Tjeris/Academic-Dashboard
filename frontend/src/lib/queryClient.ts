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

  const res = fetch(baseUrl + url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return res;
}
