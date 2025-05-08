export async function fetchCurrentUser() {
  const response = await fetch("/api/auth/user");
  console.log(response);

  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }

  const data = await response.json();

  return data;
}
