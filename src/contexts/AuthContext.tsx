import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  accessToken: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  accessToken: null,
  signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar profile:", error);
        setProfile(null);
        return;
      }

      setProfile((data as Profile) ?? null);
    } catch (err) {
      console.error("Erro inesperado ao buscar profile:", err);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;


    const bootstrap = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          setAccessToken(session.access_token); // 👈 AQUI
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setAccessToken(null);
        }
      } catch (err) {
        console.error("Auth bootstrap error:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    // Listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (!mounted) return;

      console.log(`Auth Event: ${event}`);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        setAccessToken(session?.access_token ?? null); // 👈 AQUI

        if (sessionUser) {
          await fetchProfile(sessionUser.id);
        }
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setLoading(false);
        setAccessToken(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, accessToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}