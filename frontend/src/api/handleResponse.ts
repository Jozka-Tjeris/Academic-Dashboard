
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok && response.status === 403) throw new Error("Error: Limit has been reached");
  if (!response.ok && response.status === 409) throw new Error("Error: An item of the same name already exists");
  if (!response.ok) throw new Error("Error: Network response was not ok");
  if (response.status === 204) return {} as T;
  return response.json();
}
