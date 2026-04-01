import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { oficiaisService } from "@/services/oficiaisService";
import {
  Shield,
  ArrowLeft,
  Plus,
  Edit2,
  ArrowUpCircle,
  Check,
  X,
  ShieldAlert,
  Loader2,
  Trash2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const PATENTES = [
  "Soldado 2ª Classe PM",
  "Soldado 1ª Classe PM",
  "Cabo PM",
  "3º Sargento PM",
  "2º Sargento PM",
  "1º Sargento PM",
  "Subtenente PM",
  "Aspirante a Oficial PM",
  "2º Tenente PM",
  "1º Tenente PM",
  "Capitão PM",
  "Major PM",
  "Tenente-Coronel PM",
  "Coronel",
];

const STATUS_OPCOES = ["ativa", "reserva", "exonerado"];

interface Oficial {
  id: string;
  nome: string;
  patente: string;
  status: string;
  created_at: string;
}

const formInicial = {
  nome: "",
  patente: PATENTES[0],
  status: STATUS_OPCOES[0],
};

export default function Oficiais() {
  const navigate = useNavigate();
  const { profile, accessToken } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [oficiais, setOficiais] = useState<Oficial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(formInicial);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [promoveModalOpen, setPromoveModalOpen] = useState(false);
  const [oficialParaPromover, setOficialParaPromover] = useState<Oficial | null>(null);
  const [novaPatente, setNovaPatente] = useState<string>("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [oficialParaExcluir, setOficialParaExcluir] = useState<Oficial | null>(null);

  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  const fetchOficiais = async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (!silent && isMountedRef.current) {
        setLoading(true);
      }

      const data = await oficiaisService.listarOficiais(accessToken);

      if (isMountedRef.current) {
        const sortedData = [...data].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setOficiais(sortedData);
      }
    } catch (err: any) {
      console.error("[fetchOficiais] erro:", err);
      if (isMountedRef.current) {
        toast.error(err?.message || "Erro ao carregar os oficiais.");
      }
    } finally {
      if (!silent && isMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    void fetchOficiais();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = "";
    };
  }, []);

  const setValor = (campo: string, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      toast.error("O campo Nome é obrigatório.");
      return;
    }

    const dados = {
      nome: form.nome.trim(),
      patente: form.patente,
      status: form.status,
    };

    try {
      setSaving(true);

      if (editingId) {
        await oficiaisService.atualizarOficial(editingId, dados, accessToken);
        toast.success("Oficial atualizado com sucesso!");
      } else {
        await oficiaisService.criarOficial(dados, accessToken);
        toast.success("Oficial cadastrado com sucesso!");
      }

      handleCancelar();
      void fetchOficiais(true);
    } catch (err: any) {
      console.error("[handleSalvar] erro ao salvar:", err);
      toast.error(err?.message || "Falha ao salvar oficial.");
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  };

  const handleCancelar = () => {
    setForm({ ...formInicial });
    setEditingId(null);
  };

  const iniciarEdicao = (oficial: Oficial) => {
    if (!isAdmin) return;

    setForm({
      nome: oficial.nome,
      patente: oficial.patente,
      status: oficial.status,
    });

    setEditingId(oficial.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (oficial: Oficial) => {
    if (!isAdmin) return;
    setOficialParaExcluir(oficial);
    setDeleteModalOpen(true);
  };

  const confirmarExclusao = async () => {
    if (!isAdmin || !oficialParaExcluir) return;

    try {
      setSaving(true);
      await oficiaisService.deletarOficial(oficialParaExcluir.id, accessToken);

      toast.success(`Registro de ${oficialParaExcluir.nome} foi removido com sucesso.`);
      void fetchOficiais(true);
    } catch (err: any) {
      console.error("[confirmarExclusao] erro:", err);
      toast.error(err?.message || "Falha ao excluir oficial.");
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
        setDeleteModalOpen(false);
        setOficialParaExcluir(null);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const openPromoveModal = (oficial: Oficial) => {
    if (!isAdmin) return;
    setOficialParaPromover(oficial);
    setNovaPatente(oficial.patente);
    setPromoveModalOpen(true);
  };

  const confirmarPromocao = async () => {
    if (!oficialParaPromover) return;

    if (novaPatente === oficialParaPromover.patente) {
      toast.error("A nova patente deve ser diferente da atual.");
      return;
    }

    try {
      setSaving(true);
      await oficiaisService.atualizarOficial(oficialParaPromover.id, { patente: novaPatente }, accessToken);

      toast.success("Oficial promovido com sucesso!");
      setPromoveModalOpen(false);
      void fetchOficiais(true);
    } catch (err: any) {
      console.error("[confirmarPromocao] erro:", err);
      toast.error(err?.message || "Falha ao promover oficial.");
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "ativa":
        return "bg-green-950/30 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
      case "reserva":
        return "bg-yellow-950/30 text-yellow-400 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]";
      case "exonerado":
        return "bg-red-950/30 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
      default:
        return "bg-gray-950/30 text-gray-400 border border-gray-500/30";
    }
  };

  const inputClass = "bg-[#0B0F1A]/80 border-red-900/20 text-[#F9FAFB] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] h-12 rounded-lg transition-all placeholder:text-gray-600 backdrop-blur-sm";
  const labelClass = "font-black text-[#D4AF37]/80 uppercase text-[10px] tracking-[0.2em] pb-2 block flex items-center gap-2";

  return (
    <div className="min-h-screen font-sans bg-[#0B0F1A] text-[#F9FAFB] pb-12 selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      {/* BACKGROUND GRID OVERLAY */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />

      {/* HEADER TÁTICO HUD */}
      <header className="sticky top-0 z-50 border-b border-red-900/50 bg-[#0B0F1A]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(185,28,28,0.15)]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full sm:w-auto">
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-red-600/20 text-red-500 rounded-full transition-all border border-transparent hover:border-red-900/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>

            <div className="relative group">
              <Shield className="w-10 h-10 text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" strokeWidth={2} />
              <div className="absolute -inset-1 bg-[#D4AF37]/10 blur-md rounded-full animate-pulse" />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-[0.2em] uppercase text-white leading-none">
                Gestão <span className="text-red-600">Militar</span>
              </h1>
              <p className="text-[10px] font-bold text-[#D4AF37] opacity-80 tracking-widest uppercase mt-1">Efetivo de Operacionais</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-red-950/20 px-4 py-2 rounded-lg border border-red-900/30 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="text-[9px] uppercase font-black text-red-500 tracking-[0.2em] opacity-80 hidden sm:inline">
                ID_PERFIL:
              </span>
              <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest group-hover:text-white transition-colors">
                {profile?.role || "Usuário"}
              </span>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="bg-red-950/10 border-red-900/50 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all h-10 w-10 shadow-lg"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10 relative z-10">
        
        {/* ALERTA DE PERMISSÃO */}
        {!isAdmin && (
          <div className="bg-red-950/20 text-red-500 p-5 rounded-xl border border-red-600/40 flex items-center gap-4 text-xs shadow-[0_0_20px_rgba(185,28,28,0.1)] backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 px-3 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest">Read Only</div>
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <span className="font-bold tracking-[0.1em] uppercase leading-relaxed">
              Modo de consulta ativado. Suas credenciais atuais não possuem autorização para modificação de registros.
            </span>
          </div>
        )}

        {/* FORMULÁRIO DE REGISTRO (ADMIN ONLY) */}
        {isAdmin && (
          <Card className="hud-card group">
            <CardHeader className="bg-gradient-to-r from-red-950/30 to-transparent pb-6 border-b border-red-900/20 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
              <CardTitle className="text-lg font-black flex items-center gap-4 uppercase text-white tracking-[0.2em]">
                <div className="p-2 bg-red-950/50 rounded-lg border border-red-900/50">
                  {editingId ? <Edit2 className="w-5 h-5 text-red-500" /> : <Plus className="w-5 h-5 text-red-500" />}
                </div>
                {editingId ? "Atualizar Registro Tático" : "Designar Novo Operacional"}
              </CardTitle>
              <CardDescription className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2">
                Entrada de dados no banco de inteligência do 35º BPM
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="nome" className={labelClass}>
                    <span className="w-1 h-3 bg-red-600 rounded-full" />
                    Nome de Guerra
                  </Label>
                  <Input
                    id="nome"
                    value={form.nome}
                    onChange={(e) => setValor("nome", e.target.value)}
                    placeholder="DIGITE O NOME..."
                    className={`${inputClass} uppercase font-bold`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patente" className={labelClass}>
                    <span className="w-1 h-3 bg-[#D4AF37] rounded-full" />
                    Graduação / Patente
                  </Label>
                  <Select value={form.patente} onValueChange={(v) => setValor("patente", v)}>
                    <SelectTrigger
                      id="patente"
                      className={`${inputClass} border border-red-900/20 hover:border-red-600/40 font-bold`}
                    >
                      <SelectValue placeholder="SELECIONAR PATENTE" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B0F1A] border-red-900/50 text-[#F9FAFB]">
                      {PATENTES.map((p) => (
                        <SelectItem key={p} value={p} className="focus:bg-red-900/20 focus:text-white cursor-pointer uppercase font-mono text-xs py-3 border-b border-red-900/10 last:border-0">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className={labelClass}>
                    <span className="w-1 h-3 bg-green-600 rounded-full" />
                    Situação Atual
                  </Label>
                  <Select value={form.status} onValueChange={(v) => setValor("status", v)}>
                    <SelectTrigger
                      id="status"
                      className={`${inputClass} border border-red-900/20 hover:border-red-600/40 font-bold uppercase`}
                    >
                      <SelectValue placeholder="SELECIONAR STATUS" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B0F1A] border-red-900/50 text-[#F9FAFB]">
                      {STATUS_OPCOES.map((s) => (
                        <SelectItem key={s} value={s} className="uppercase focus:bg-red-900/20 focus:text-white cursor-pointer font-mono text-xs py-3 border-b border-red-900/10 last:border-0">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-12">
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={handleCancelar}
                    disabled={saving}
                    className="tactical-btn bg-transparent border-gray-700 text-gray-500 hover:bg-gray-800 hover:text-white h-12 px-8 rounded-lg"
                  >
                    <X className="w-4 h-4 mr-3" /> Cancelar
                  </Button>
                )}

                <Button
                  onClick={handleSalvar}
                  disabled={saving}
                  className="tactical-btn bg-red-600 hover:bg-red-500 text-white h-12 px-10 rounded-lg shadow-[0_0_15px_rgba(185,28,28,0.4)] border border-red-500/30"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Processando
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-3" /> {editingId ? "Confirmar Alteração" : "Efetivar Registro"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TABELA DE EFETIVO */}
        <Card className="hud-card group">
          <CardHeader className="bg-gradient-to-r from-red-950/20 to-transparent pb-6 border-b border-red-900/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black flex items-center gap-4 uppercase text-white tracking-[0.2em]">
                <Shield className="w-6 h-6 text-[#D4AF37]" /> Quadro de Operacionais
              </CardTitle>
              <CardDescription className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Efetivo consolidado no banco de dados</CardDescription>
            </div>

            <div className="bg-red-950/40 px-6 py-2 rounded-full border border-red-900/50 text-[10px] text-white font-black tracking-[0.2em] shadow-lg">
              OPERACIONAIS: <span className="text-[#D4AF37] ml-2 text-sm">{oficiais.length}</span>
            </div>
          </CardHeader>

          <div className="overflow-x-auto min-h-[400px] cyber-grid">
            <Table>
              <TableHeader className="bg-red-950/20">
                <TableRow className="border-red-900/30 hover:bg-transparent">
                  <TableHead className="font-black text-red-500 tracking-[0.2em] uppercase text-[10px] py-6 pl-8 w-[40%]">Nome de Guerra // ID</TableHead>
                  <TableHead className="font-black text-red-500 tracking-[0.2em] uppercase text-[10px]">Patente</TableHead>
                  <TableHead className="font-black text-red-500 tracking-[0.2em] uppercase text-[10px]">Status Operacional</TableHead>
                  <TableHead className="text-right font-black text-red-500 tracking-[0.2em] uppercase text-[10px] pr-8">Sistema</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow className="border-transparent">
                    <TableCell colSpan={4} className="text-center py-24">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                          <Loader2 className="w-12 h-12 animate-spin text-red-600" />
                          <div className="absolute inset-0 bg-red-600/20 blur-xl animate-pulse" />
                        </div>
                        <span className="text-white uppercase tracking-[0.4em] text-xs font-black animate-pulse">
                          Recuperando Banco de Dados...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : oficiais.length === 0 ? (
                  <TableRow className="border-transparent">
                    <TableCell colSpan={4} className="text-center py-24 text-gray-500 font-bold uppercase tracking-[0.2em] text-xs italic">
                      Banco de dados vazio. Nenhum operacional detectado.
                    </TableCell>
                  </TableRow>
                ) : (
                  oficiais.map((oficial, index) => (
                    <TableRow 
                      key={oficial.id} 
                      className={`border-red-900/10 transition-all hover:bg-red-900/5 group/row ${index % 2 === 0 ? 'bg-red-950/5' : ''}`}
                    >
                      <TableCell className="font-black uppercase tracking-[0.1em] text-white pl-8 py-5 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity" />
                        {oficial.nome}
                      </TableCell>
                      <TableCell className="font-bold text-gray-400 text-xs tracking-wide">
                        {oficial.patente}
                      </TableCell>
                      <TableCell>
                        <span className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-[0.2em] ${getBadgeStyle(oficial.status)}`}>
                          {oficial.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover/row:translate-x-0 group-hover/row:opacity-100 transition-all duration-300">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-transparent hover:bg-[#D4AF37]/20 text-gray-500 hover:text-[#D4AF37] h-9 w-9 rounded-lg border border-transparent hover:border-[#D4AF37]/30 transition-all"
                            onClick={() => iniciarEdicao(oficial)}
                            disabled={!isAdmin}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-transparent hover:bg-red-600/20 text-gray-500 hover:text-red-500 h-9 w-9 rounded-lg border border-transparent hover:border-red-600/30 transition-all"
                            onClick={() => openDeleteModal(oficial)}
                            disabled={!isAdmin}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      {/* MODAL DE PROMOÇÃO */}
      <Dialog open={promoveModalOpen} onOpenChange={setPromoveModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0B0F1A] border-red-900/50 text-[#F9FAFB] shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl backdrop-blur-2xl">
          <DialogHeader className="border-b border-red-900/30 pb-6">
            <DialogTitle className="flex items-center gap-4 uppercase font-black tracking-[0.2em] text-white text-xl">
              <div className="p-2 bg-red-950/50 rounded-lg border border-red-900/50">
                <ArrowUpCircle className="w-6 h-6 text-[#D4AF37]" />
              </div>
              Promotion Protocol
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 py-8">
            <div className="bg-red-950/20 p-5 rounded-xl border border-red-900/30 flex justify-between items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="space-y-1 relative z-10">
                <span className="font-black text-[#D4AF37] text-[10px] uppercase tracking-[0.3em]">Identificação:</span>
                <p className="font-black text-white tracking-[0.1em] uppercase text-lg">
                  {oficialParaPromover?.nome}
                </p>
              </div>
              <Shield className="w-12 h-12 text-red-900/20 relative z-10" />
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>Patente Atual no Sistema</Label>
              <Input
                value={oficialParaPromover?.patente || ""}
                disabled
                className="bg-[#0B0F1A] border-gray-800 text-gray-600 font-bold h-12 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className={`${labelClass} text-red-500`}>Nova Graduação Designada</Label>
              <Select value={novaPatente} onValueChange={setNovaPatente}>
                <SelectTrigger className={`${inputClass} border-[#D4AF37]/40 h-12 font-black text-white`}>
                  <SelectValue placeholder="SELECIONAR" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0F1A] border-red-900/50 text-[#F9FAFB]">
                  {PATENTES.map((p) => (
                    <SelectItem key={p} value={p} className="focus:bg-red-900/20 focus:text-white cursor-pointer uppercase font-mono text-xs py-3 border-b border-red-900/10 last:border-0">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="bg-red-950/10 p-6 -m-6 mt-4 gap-4 flex sm:flex-row flex-col border-t border-red-900/30">
            <Button
              variant="outline"
              onClick={() => setPromoveModalOpen(false)}
              disabled={saving}
              className="tactical-btn grow sm:grow-0 bg-transparent border-gray-700 text-gray-500 hover:bg-gray-800 h-12 px-8"
            >
              Abortar
            </Button>
            <Button
              onClick={confirmarPromocao}
              disabled={saving}
              className="tactical-btn grow bg-[#D4AF37] text-black hover:bg-[#FACC15] h-12 shadow-[0_0_20px_rgba(212,175,55,0.3)] border border-[#D4AF37]/50"
            >
              {saving ? "TRANSMITINDO..." : "AUTORIZAR PROMOÇÃO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE EXCLUSÃO */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0B0F1A] border-red-600/50 text-[#F9FAFB] shadow-[0_0_100px_rgba(220,38,38,0.2)] rounded-xl backdrop-blur-3xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
          
          <DialogHeader className="border-b border-red-900/30 pb-6 mt-2">
            <DialogTitle className="flex items-center gap-4 uppercase font-black tracking-[0.2em] text-red-500 text-xl">
              <div className="p-2 bg-red-600/10 rounded-lg border border-red-600/30">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              Security Breach Protocol
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-10 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px] leading-relaxed">
              ATENÇÃO: Você está prestes a <span className="text-red-500 px-1 font-black underline">EXPULSAR</span> este oficial do quadro efetivo. Esta ação invalidará o registro permanentemente.
            </p>
            <div className="bg-red-950/30 p-8 rounded-xl border-2 border-red-600/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600/5 group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10">
                <p className="text-red-500 font-black text-[9px] uppercase tracking-[0.4em] mb-2">OPERACIONAL_ID</p>
                <span className="font-black text-white tracking-[0.2em] uppercase text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  {oficialParaExcluir?.patente} <br /> {oficialParaExcluir?.nome}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-red-900 font-black uppercase tracking-widest">Proceder com a invalidação do registro?</p>
          </div>

          <DialogFooter className="bg-red-950/20 p-6 -m-6 mt-4 gap-4 flex sm:flex-row flex-col border-t border-red-900/30">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={saving}
              className="tactical-btn grow sm:grow-0 bg-transparent border-gray-700 text-gray-500 hover:bg-gray-800 h-12 px-8"
            >
              Abortar
            </Button>
            <Button
              onClick={confirmarExclusao}
              disabled={saving}
              className="tactical-btn grow bg-red-600 text-white hover:bg-red-500 h-12 shadow-[0_0_30px_rgba(220,38,38,0.4)] border border-red-500/50"
            >
              {saving ? "EXECUTANDO..." : "CONFIRMAR EXPULSÃO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}