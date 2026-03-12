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

  const res = await fetch(baseUrl + url, {
    credentials: "include",
    ...options,
  });

  if (res.status === 401) {
    window.location.href = "/login";
  }

  return res;
}
