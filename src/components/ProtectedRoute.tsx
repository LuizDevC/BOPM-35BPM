import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-primary">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="uppercase tracking-widest font-bold text-sm text-muted-foreground">
          Verificando Credenciais...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Usuário existe, mas perfil ainda não foi encontrado/carregado corretamente
  // Não trate isso como "sem permissão" imediatamente
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-primary">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="uppercase tracking-widest font-bold text-sm text-muted-foreground">
          Carregando perfil...
        </p>
      </div>
    );
  }

  if (requireAdmin && profile.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}