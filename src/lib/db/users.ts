// In-memory user store for demo purposes
// In production, use a real database

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

// Shared users array - exported for use in both register API and auth
export const users: DemoUser[] = [];

export function findUserByEmail(email: string): DemoUser | undefined {
  return users.find((u) => u.email === email);
}

export function createUser(data: { name: string; email: string; password: string }): DemoUser {
  const newUser: DemoUser = {
    id: Date.now().toString(),
    name: data.name,
    email: data.email,
    password: data.password,
  };
  users.push(newUser);
  return newUser;
}