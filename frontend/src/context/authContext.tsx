import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "@/supabase/supabase-client";
import type { Session } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  role: string | null;
  isLoading: boolean;
  refreshSession: () => Promise<Session | null>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  role: null,
  isLoading: true,
  refreshSession: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Changed to isInitialized
  const initializedRef = useRef(false);

  const handleSession = useCallback(
    async (session: Session | null): Promise<Session | null> => {
      if (!session) {
        setSession(null);
        setRole(null);
        return null;
      }

      try {
        // 1. Ensure profile exists
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({ id: session.user.id }, { onConflict: "id" });

        if (upsertError) throw upsertError;

        // 2. Get profile role - ADD TIMEOUT HANDLING
        const { data: profile, error: profileError } = await Promise.race([
          supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Profile fetch timeout")), 3000)
          ) as Promise<{ data: null; error: any }>,
        ]);

        if (profileError) throw profileError;

        const userRole = profile?.role || "user";

        // 3. Update session with role
        const updatedSession: Session = {
          ...session,
          user: {
            ...session.user,
            app_metadata: {
              ...session.user.app_metadata,
              role: userRole,
            },
          },
        };

        setSession(updatedSession);
        setRole(userRole);
        return updatedSession;
      } catch (error) {
        console.error("Session handling error:", error);
        // Use role from existing session metadata
        const existingRole = session.user.app_metadata?.role || "user";

        setSession(session);
        setRole(existingRole);
        return session; // Return original session
      }
    },
    []
  );

  const refreshSession = useCallback(async (): Promise<Session | null> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return await handleSession(data.session);
    } catch (error) {
      console.error("Session refresh error:", error);
      return null;
    }
  }, [handleSession]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    console.log("Auth initialization started");

    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (isMounted) {
          await handleSession(session);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (isMounted) {
          setIsInitialized(true); // Set initialized flag
        }
      }
    };

    initializeAuth();

    // Auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event, "Session:", session);

      if (event === "SIGNED_OUT") {
        setSession(null);
        setRole(null);
      } else if (session) {
        // Optimistic update
        const tempRole = session.user.app_metadata?.role || "user";
        setSession(session);
        setRole(tempRole);

        // Background update
        handleSession(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      initializedRef.current = false;
    };
  }, [handleSession]);

  return (
    <AuthContext.Provider
      value={{
        session,
        role,
        isLoading: !isInitialized, // Derive loading state
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
