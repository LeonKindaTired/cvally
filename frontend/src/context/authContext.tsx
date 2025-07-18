import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/supabase/supabase-client";
import type { Session } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  role: string | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  role: null,
  isLoading: true,
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    setIsLoading(true);
    const {
      data: { session },
    } = await supabase.auth.refreshSession();
    setSession(session);
    setRole(session?.user?.app_metadata?.role || null);
    setIsLoading(false);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setRole(session?.user?.app_metadata?.role || null);
      setIsLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setRole(session?.user?.app_metadata?.role || null);

      if (event === "SIGNED_IN" && session?.user) {
        try {
          await supabase
            .from("profiles")
            .upsert({ id: session.user.id }, { onConflict: "id" });
        } catch (error) {
          console.error("Profile creation error:", error);
        }
      }

      if (event === "SIGNED_IN") {
        await refreshSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        role,
        isLoading,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
