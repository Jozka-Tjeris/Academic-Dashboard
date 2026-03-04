import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const csrfToken = getCookie("csrf_token");

  return fetch(process.env.NEXT_PUBLIC_API_URL + url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken && { "X-CSRF-Token": csrfToken }),
      ...options.headers,
    },
  }).then(res => {
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  });
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
