import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/supabase/supabase-client";
import type { Session } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  role: string | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  role: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setRole(session?.user?.app_metadata.role || null);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setRole(session?.user?.app_metadata.role || null);

        // Handle profile creation for OAuth sign-ins
        if (event === "SIGNED_IN" && session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", session.user.id)
            .single();

          if (!data) {
            await supabase
              .from("profiles")
              .insert([{ id: session.user.id, role_id: 3 }]);
          }
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, role, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
