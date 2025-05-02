import { auth } from "@clerk/nextjs/server"

export const checkRole = (role) => {
  const { sessionClaims } = auth()

  return sessionClaims?.metadata.role === role;
}