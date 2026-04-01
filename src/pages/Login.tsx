import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Shield, Lock, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Se o usuário já estiver logado e o contexto não estiver carregando, redireciona
    if (!authLoading && user) {
      navigate("/oficiais");
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Erro ao entrar: " + error.message);
      setLoading(false);
    } else {
      toast.success("Login efetuado com sucesso!");
      navigate("/oficiais");
    }
  };

  const inputClass = "bg-[#0B0F1A]/80 border-red-900/30 text-[#F9FAFB] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] h-12 rounded-lg transition-all placeholder:text-gray-600 backdrop-blur-sm shadow-inner";
  const labelClass = "font-black text-[#D4AF37]/80 uppercase text-[10px] tracking-[0.2em] pb-2 block flex items-center gap-2";

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      {/* BACKGROUND GRID OVERLAY */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />

      {/* TOP DECORATION */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />

      {/* BACK BUTTON */}
      <div className="absolute top-8 left-8 z-20">
        <Link to="/">
          <Button variant="ghost" className="tactical-btn gap-3 text-red-500 hover:text-white hover:bg-red-600/20 border border-transparent hover:border-red-900/50 rounded-full px-6 transition-all">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Retornar</span>
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-10 relative z-10 animate-in fade-in zoom-in-95 duration-700">

        {/* LOGO AREA */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative group">
            <div className="w-20 h-20 bg-red-950/40 rounded-full flex items-center justify-center border-2 border-red-600 shadow-[0_0_30px_rgba(185,28,28,0.3)] group-hover:shadow-[0_0_50px_rgba(185,28,28,0.5)] transition-all duration-500">
              <Shield className="w-10 h-10 text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
            </div>
            <div className="absolute -inset-2 bg-red-600/10 blur-xl rounded-full -z-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-[0.25em] text-white leading-none">
              35º BPM <span className="text-red-600">//</span> ADMINISTRATIVO
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-red-600" />
              <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Acesso Restrito ao Comando</p>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-red-600" />
            </div>
          </div>
        </div>

        {/* LOGIN CARD */}
        <Card className="hud-card border-red-900/30 overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 text-red-600/10 font-black text-6xl select-none group-hover:text-red-600/20 transition-colors pointer-events-none">SEC_ENTRY</div>

          <CardHeader className="space-y-2 text-center pb-8 border-b border-red-900/20 relative z-10">
            <CardTitle className="text-sm font-black uppercase flex items-center justify-center gap-3 text-white tracking-[0.3em]">
              <Lock className="w-4 h-4 text-red-600" /> Protocolo de Acesso
            </CardTitle>
            <CardDescription className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Inicie validação de credenciais táticas</CardDescription>
          </CardHeader>

          <CardContent className="pt-10 relative z-10">
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="email" className={labelClass}>
                  <span className="w-1 h-3 bg-red-600 rounded-full" />
                  E-Mail de Identificação
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="militar@pm.gov.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={labelClass}>
                  <span className="w-1 h-3 bg-[#D4AF37] rounded-full" />
                  Código de Segurança
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-600 rounded-full animate-pulse opacity-50" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full tactical-btn bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] mt-2 py-7 rounded-xl shadow-[0_0_20px_rgba(185,28,28,0.4)] border border-red-500/50 group/btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Validando Sessão...
                  </>
                ) : (
                  <>
                    Validar Acesso
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-red-900/10 py-6 relative z-10">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[8px] text-gray-600 font-black uppercase tracking-[0.5em]">

              </span>
              <div className="flex gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-75" />
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-150" />
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* FOOTER INFO */}
        <div className="text-center space-y-4">
          <p className="text-[9px] text-[#D4AF37] font-black uppercase tracking-[0.3em] opacity-40">
            35º Batalhão de Polícia Militar
          </p>
          <div className="w-12 h-[1px] bg-red-900/30 mx-auto" />
        </div>
      </div>

      {/* DECORATIVE ELEMENTS */}
      <div className="fixed bottom-10 left-10 text-[10px] font-mono text-red-900/20 rotate-90 origin-left hidden lg:block tracking-[0.5em] select-none">
        VERSION_DATA: 2.4.0.ALPHA
      </div>
      <div className="fixed top-10 right-10 text-[10px] font-mono text-red-900/20 tracking-[0.5em] select-none text-right hidden lg:block">
        SECURE_CONNECTION: ESTABLISHED
      </div>
    </div>
  );
}
