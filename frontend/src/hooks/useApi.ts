import { apiFetch } from "@/lib/queryClient";

export function useApi() {
  const getCsrfToken = () => {
    if (typeof document === "undefined") return null;

    const match = document.cookie.match(/(^|;)\s*csrf_token=([^;]+)/);
    return match?.[2] ?? null;
  };

  const secureFetch = async (url: string, options: RequestInit = {}) => {
    const csrfToken = getCsrfToken();

    const headers = new Headers(options.headers);

    const method = options.method?.toUpperCase() ?? "GET";

    if (
      csrfToken &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(method)
    ) {
      headers.set("X-CSRF-Token", csrfToken);
    }

    return apiFetch(url, {
      ...options,
      headers,
    });
  };

  return { secureFetch };
}
