import { createAuthClient } from "better-auth/react";

// Points to the backend where Better Auth is mounted at /api/auth/*
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
export default authClient;
