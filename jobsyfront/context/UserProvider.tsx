'use client';
import { createContext, useContext } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useCurrentUser();
  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
