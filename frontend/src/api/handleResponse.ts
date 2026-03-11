
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error("Network response was not ok");
  if (response.status === 204) return {} as T;
  return response.json();
}
