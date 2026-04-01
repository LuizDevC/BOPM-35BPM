import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Copy, RefreshCw, FileText, Shield, UserSearch, Newspaper, Lock, TriangleAlert, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { oficiaisService } from "@/services/oficiaisService";
import { useAuth } from "@/contexts/AuthContext";


const unidades = [
  "COMANDO ANCHIETA - 92000",
  "SUBCOMANDO ANCHIETA - 92001",
  "COORDENADOR ANCHIETA - 92002",
  "ANCHIETA 1 - 92100",
  "ANCHIETA 2 - 92201",
  "ANCHIETA 3 - 92300",
  "ANCHIETA 4 - 92400",
  "ANCHIETA CMD 1 - 92101",
  "ANCHIETA CMD 1 - 92105",
  "ANCHIETA CMD 2 - 92203",
  "ANCHIETA CMD 4 - 92410",
  "ANCHIETA - 92210",
  "ANCHIETA 124 - 92124",
  "ANCHIETA 125 - 92125",
  "ANCHIETA 132 - 92132",
  "ANCHIETA 140 - 92140",
  "ANCHIETA 215 - 92215",
  "ANCHIETA 219 - 92219",
  "ANCHIETA 221 - 92221",
  "ANCHIETA 225 - 92225",
  "ANCHIETA 226 - 92226",
  "ANCHIETA 415 - 92415",
  "ANCHIETA 325 - 92325",
  "ANCHIETA 425 - 92425",
  "ROCAM ANCHIETA",
];

const artigos = {
  // 🔴 Crimes Contra a Pessoa
  121: "Art. 121 – Homicídio.",
  "121§1": "Art. 121 §1º – Homicídio Privilegiado.",
  "121§2": "Art. 121 §2º – Homicídio Qualificado.",
  "121§3": "Art. 121 §3º – Homicídio Culposo.",

  129: "Art. 129 – Lesão Corporal.",
  "129§1": "Art. 129 §1º – Lesão Corporal de Natureza Grave.",
  "129§2": "Art. 129 §2º – Lesão Corporal Gravíssima.",
  "129§3": "Art. 129 §3º – Lesão Corporal Seguida de Morte.",

  135: "Art. 135 – Omissão de Socorro.",
  147: "Art. 147 – Ameaça.",
  "147A": "Art. 147-A – Perseguição (Stalking).",
  "147B": "Art. 147-B – Violência Psicológica Contra a Mulher.",
  148: "Art. 148 – Sequestro e Cárcere Privado.",

  138: "Art. 138 – Calúnia.",
  139: "Art. 139 – Difamação.",
  140: "Art. 140 – Injúria.",

  // 🟠 Patrimônio
  155: "Art. 155 – Furto: Subtração de bem alheio sem violência ou grave ameaça.",
  157: "Art. 157 – Roubo: Subtração de bem mediante violência ou grave ameaça.",
  158: "Art. 158 – Extorsão: Constranger alguém mediante violência ou grave ameaça para obter vantagem.",
  163: "Art. 163 – Dano: Destruir, inutilizar ou deteriorar coisa alheia.",
  "163§1": "Art. 163 §1º – Dano Qualificado.",
  168: "Art. 168 – Apropriação Indébita: Apropriar-se de coisa alheia móvel de que tem posse.",
  171: "Art. 171 – Estelionato: Obtenção de vantagem ilícita mediante fraude.",
  180: "Art. 180 – Receptação: Adquirir ou ocultar produto de crime.",

  // 🟡 Organização Criminosa e Falsificações
  288: "Art. 288 – Associação Criminosa: Associação de 3 ou mais pessoas para prática criminosa.",
  289: "Art. 289 – Moeda Falsa: Posse ou circulação de moeda falsificada.",
  296: "Art. 296 – Falsificação de Documento Público.",
  297: "Art. 297 – Falsificação de Documento Público.",
  298: "Art. 298 – Falsificação de Documento Particular.",
  299: "Art. 299 – Falsidade Ideológica: Inserir informação falsa em documento.",
  304: "Art. 304 – Uso de Documento Falso.",
  311: "Art. 311 – Adulteração de Sinal Identificador de Veículo.",

  // 🔵 Administração Pública
  329: "Art. 329 – Resistência: Oposição à ação policial.",
  330: "Art. 330 – Desobediência: Descumprir ordem legal de funcionário público.",
  331: "Art. 331 – Desacato: Ofender funcionário público no exercício da função."
};

interface Apoio {
  id: number;
  valor: string;
}

interface Material {
  id: number;
  quantidade: string;
  descricao: string;
}

const hoje = new Date().toLocaleDateString("pt-BR");
const agora = new Date();

const horas = String(agora.getHours()).padStart(2, "0");
const minutos = String(agora.getMinutes()).padStart(2, "0");

const horarioAtual = `${horas}:${minutos}`;

const estadoInicial = {
  numero: "",
  data: hoje,
  horario: horarioAtual,
  prefixo: "",
  encarregadoPatente: "",
  encarregadoNome: "",
  motoristaPatente: "",
  motoristaNome: "",
  terceiroPatente: "",
  terceiroNome: "",
  quartoPatente: "",
  quartoNome: "",
  supervisor: "",
  local: "",
  delegado: "",
  nomeIndividuo: "",
  rg: "",
  sacoEvd: gerarEVD(1),
  natureza: [] as string[],
  apresentacao: "",
  descricao: "",
};

function gerarEVD(sequencia: number): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `EVD-${ano}${mes}${dia}`;
}

export default function Index() {
  const { user } = useAuth();
  const [form, setForm] = useState(estadoInicial);
  const [buscaArtigo, setBuscaArtigo] = useState("");
  const [apoios, setApoios] = useState<Apoio[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [resultado, setResultado] = useState("");
  const [nextId, setNextId] = useState(1);
  const [oficiais, setOficiais] = useState<any[]>([]);

  useEffect(() => {
    const fetchOficiais = async () => {
      try {
        const data = await oficiaisService.listarOficiais();

        // Filtra de forma mais flexível para evitar problemas de maiusculas/minusculas
        const ativos = data.filter(o => o.status?.toLowerCase().trim() === "ativa" || !o.status);
        const sortedAtivos = [...ativos].sort((a, b) => a.nome.localeCompare(b.nome));
        setOficiais(sortedAtivos);
      } catch (err: any) {
        console.error("Fetch Exception:", err);
        toast.error("Falha de rede ao buscar Oficiais na Tela Inicial.");
      }
    };

    fetchOficiais();

    const onFocus = () => {
      if (user) {
        setTimeout(() => {
          fetchOficiais();
        }, 500);
      }
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const formatarPessoa = (patente: string, nome: string) =>
    nome.trim() ? `${patente} ${nome.trim()}` : "Sem Alteração.";

  const addMaterial = () => {
    setMateriais((prev) => [...prev, { id: nextId, quantidade: "", descricao: "" }]);
    setNextId((n) => n + 1);
  };

  const removeMaterial = (id: number) =>
    setMateriais((prev) => prev.filter((m) => m.id !== id));

  const updateMaterial = (id: number, campo: "quantidade" | "descricao", valor: string) =>
    setMateriais((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [campo]: valor } : m))
    );

  const gerarTextoMateriais = () => {
    const linhas = materiais
      .filter((m) => m.quantidade.trim() && m.descricao.trim())
      .map((m) => `${m.quantidade.trim()}x ${m.descricao.trim()}`);
    return linhas.length ? linhas.join("\n") : "Sem Alteração.";
  };

  const gerarBopm = () => {
    const texto = `**BOPM nº ${form.numero}**
----------------------------------------------------------------------------------------------------------------------------
**EQUIPE EMPENHADA**

**UNIDADE:** ${form.prefixo}
**COMANDANTE DE EQUIPE:** ${formatarPessoa(form.encarregadoPatente, form.encarregadoNome)}
**MOTORISTA:** ${formatarPessoa(form.motoristaPatente, form.motoristaNome)}
**1° AUXILIZAR:** ${formatarPessoa(form.terceiroPatente, form.terceiroNome)}
**2° AUXILIZAR:** ${formatarPessoa(form.quartoPatente, form.quartoNome)}
----------------------------------------------------------------------------------------------------------------------------
**INFORMAÇÕES DA OCORRÊNCIA**

**DATA:** ${form.data}
**HORÁRIO:** ${form.horario}
**LOCAL:** ${form.local.trim() || "Sem Alteração."}
----------------------------------------------------------------------------------------------------------------------------
**IDENTIFICAÇÃO DO ENVOLVIDO**

**NOME:** ${form.nomeIndividuo.trim() || "Sem Alteração."}
**RG:** ${form.rg.trim() || "Sem Alteração."}
**SACO DE EVIDÊNCIAS N°:** ${form.sacoEvd.trim() || "Sem Alteração."}
**ARTIGOS:**
 ${form.natureza.length
        ? form.natureza
          .map((codigo) => artigos[codigo as keyof typeof artigos])
          .join("\n ")
        : "Sem Alteração."
      }
**ILÍCITOS:** 
${gerarTextoMateriais()}
----------------------------------------------------------------------------------------------------------------------------
**RELATO DA OCORRÊNCIA:**
${form.descricao.trim() || "Sem Alteração."}
----------------------------------------------------------------------------------------------------------------------------
**RESPONSÁVEL (CHEFE DE BARCA): ${formatarPessoa(form.encarregadoPatente, form.encarregadoNome)}**
`;
    setResultado(texto);
    toast.success("BOPM Gerado com Sucesso!");
  };

  const copiar = () => {
    navigator.clipboard.writeText(resultado);
    toast.success("BOPM copiado para a área de transferência!");
  };

  const limpar = () => {
    setForm(estadoInicial);
    setApoios([]);
    setMateriais([]);
    setResultado("");
    toast.info("Formulário reiniciado.");
  };

  // Funções de CSS reutilizáveis
  const inputClass = "bg-[#0B0F1A]/80 border-red-900/30 text-[#F9FAFB] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] h-12 rounded-lg transition-all placeholder:text-[#4B5563] backdrop-blur-sm shadow-inner";
  const labelClass = "font-bold text-[#D4AF37]/80 uppercase text-[10px] tracking-[0.2em] pb-2 block flex items-center gap-2";

  return (
    <div className="min-h-screen font-sans bg-[#0B0F1A] text-[#F9FAFB] pb-12 selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      {/* BACKGROUND GRID OVERLAY */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />

      {/* HEADER TÁTICO HUD */}
      <header className="sticky top-0 z-50 border-b border-red-900/50 bg-[#0B0F1A]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(185,28,28,0.15)]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 relative group">
            <div className="relative">
              <Shield className="w-12 h-12 text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" strokeWidth={2} />
              <div className="absolute -inset-1 bg-[#D4AF37]/20 blur-md rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-[0.15em] uppercase text-white leading-none">
                35º BPM <span className="text-red-600">//</span> CHOQUE
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                <p className="text-[10px] font-bold text-[#D4AF37] opacity-80 tracking-widest uppercase">Sistema de Gerenciamento de BOPM</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/oficiais">
              <Button
                variant="outline"
                className="tactical-btn border-red-900/50 bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-500 h-11 px-8 rounded-md transition-all shadow-[0_0_10px_rgba(185,28,28,0.1)] group"
              >
                <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <ShieldCheck className="w-5 h-5 mr-3" />
                Acesso Administrativo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10 relative z-10">

        {/* STATUS BAR / SYSTEM ALERT */}
        <div className="bg-red-950/20 text-red-500 p-4 rounded-lg border-l-4 border-red-600 flex items-center justify-between gap-4 text-xs shadow-lg backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          <div className="flex items-center gap-4 relative z-10">
            <TriangleAlert className="w-5 h-5 animate-pulse" />
            <span className="font-bold tracking-[0.1em] uppercase">
              Operacionalização do sistema em modo de segurança. Insira os dados com precisão tática.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 font-mono opacity-60 text-[10px]">

          </div>
        </div>

        {/* GRID PRINCIPAL */}
        {/* LAYOUT LINEAR */}
        <div className="space-y-10">

          {/* IDENTIFICAÇÃO */}
          <Card className="hud-card group">
            <CardHeader className="bg-gradient-to-r from-red-950/40 to-transparent pb-6 border-b border-red-900/20">
              <CardTitle className="text-lg font-black flex items-center gap-3 uppercase text-white tracking-[0.2em]">
                <div className="p-2 bg-red-950/50 rounded-lg border border-red-900/50">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                Identificação da Ocorrência
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <Label className={labelClass}>
                  <span className="w-1 h-3 bg-red-600 rounded-full" />
                  Número do BOPM
                </Label>
                <Input
                  value={form.numero}
                  onChange={(e) => set("numero", e.target.value)}
                  placeholder="DIGITE O NÚMERO..."
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <Label className={labelClass}>
                  <span className="w-1 h-3 bg-red-600 rounded-full" />
                  Prefixo da VTR
                </Label>
                <Select value={form.prefixo} onValueChange={(value) => {
                  set("prefixo", value);
                  setTimeout(() => { document.body.style.pointerEvents = "auto"; }, 100);
                }}>
                  <SelectTrigger className={`${inputClass} border-red-900/20`}>
                    <SelectValue placeholder="SELECIONAR UNIDADE" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B0F1A] border-red-900/50 text-[#F9FAFB]">
                    {unidades.map((unidade) => (
                      <SelectItem key={unidade} value={unidade} className="focus:bg-red-900/20 focus:text-white cursor-pointer uppercase font-mono text-xs py-3 border-b border-red-900/10 last:border-0">
                        {unidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* EQUIPE */}
          <Card className="hud-card">
            <CardHeader className="bg-gradient-to-r from-red-950/40 to-transparent pb-6 border-b border-red-900/20">
              <CardTitle className="text-lg font-black flex items-center gap-3 uppercase text-white tracking-[0.2em]">
                <div className="p-2 bg-red-950/50 rounded-lg border border-red-900/50">
                  <UserSearch className="w-5 h-5 text-red-500" />
                </div>
                Designação de Operacionais
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              {[
                { label: "Comandante de Equipe", patenteKey: "encarregadoPatente", nomeKey: "encarregadoNome" },
                { label: "Motorista Tático", patenteKey: "motoristaPatente", nomeKey: "motoristaNome" },
                { label: "1° Auxiliar", patenteKey: "terceiroPatente", nomeKey: "terceiroNome" },
                { label: "2° Auxiliar", patenteKey: "quartoPatente", nomeKey: "quartoNome" },
              ].map(({ label, patenteKey, nomeKey }) => (
                <div key={label} className="relative">
                  <Label className={labelClass}>
                    <span className="w-1 h-3 bg-[#D4AF37] rounded-full" />
                    {label}
                  </Label>
                  <Select
                    value={(form[nomeKey as keyof typeof form] as string) || "none"}
                    onValueChange={(val) => {
                      if (val === "none") {
                        set(nomeKey, "");
                        set(patenteKey, "");
                      } else {
                        const selectedOficial = oficiais.find(o => o.nome === val);
                        if (selectedOficial) {
                          set(nomeKey, selectedOficial.nome);
                          set(patenteKey, selectedOficial.patente);
                        }
                      }
                      setTimeout(() => { document.body.style.pointerEvents = "auto"; }, 100);
                    }}
                  >
                    <SelectTrigger className={`${inputClass} border-red-900/20 hover:border-red-600/40 transition-colors uppercase`}>
                      <SelectValue placeholder={`SELECIONAR ${label.toUpperCase()}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B0F1A] border-red-900/50 text-[#F9FAFB] max-h-64">
                      <SelectItem value="none" className="focus:bg-red-900/20 cursor-pointer text-[#9CA3AF] italic text-xs">
                        -- CANCELAR SELEÇÃO --
                      </SelectItem>
                      {oficiais.map((o) => (
                        <SelectItem key={o.id} value={o.nome} className="focus:bg-red-900/20 focus:text-white cursor-pointer uppercase font-mono text-xs py-3">
                          <span className="text-[#D4AF37] font-bold mr-2">[{o.patente}]</span> {o.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* OCORRÊNCIA */}
          <Card className="hud-card">
            <CardHeader className="bg-gradient-to-r from-red-950/40 to-transparent pb-6 border-b border-red-900/20">
              <CardTitle className="text-lg font-black flex items-center gap-3 uppercase text-white tracking-[0.2em]">
                <div className="p-2 bg-red-950/50 rounded-lg border border-red-900/50">
                  <Newspaper className="w-5 h-5 text-red-500" />
                </div>
                Log da Ocorrência
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-10">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <Label className={labelClass}>Data do Registro</Label>
                  <Input value={form.data} onChange={(e) => set("data", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <Label className={labelClass}>Horário da Incursão</Label>
                  <Input value={form.horario} onChange={(e) => set("horario", e.target.value)} className={inputClass} />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <Label className={labelClass}>Coordenadas / Localização</Label>
                  <Input value={form.local} onChange={(e) => set("local", e.target.value.toUpperCase())} className={`${inputClass} font-mono`} />
                </div>
              </div>

              <div className="border border-red-900/30 bg-red-950/10 p-6 rounded-xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 text-red-600/20 font-black text-4xl select-none">RG</div>

                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <User className="w-4 h-4 text-red-500" /> Identificação do Indivíduo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="md:col-span-2 space-y-1">
                    <Label className={labelClass}>Nome Completo</Label>
                    <Input value={form.nomeIndividuo} onChange={(e) => set("nomeIndividuo", e.target.value.toUpperCase())} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <Label className={labelClass}>Documento de Identidade (RG)</Label>
                    <Input value={form.rg} onChange={(e) => set("rg", e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <Label className={labelClass}>Saco de Evidência (EVD)</Label>
                    <Input value={form.sacoEvd} onChange={(e) => set("sacoEvd", e.target.value)} className={`${inputClass} border-[#D4AF37]/30 focus:border-[#D4AF37]`} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className={labelClass}>Códigos de Natureza (ARTIGOS)</Label>
                  <span className="text-[9px] font-bold text-red-500 bg-red-900/30 px-2 py-1 rounded">SELECIONE MAIS DE UM SE NECESSÁRIO</span>
                </div>
                <Input
                  placeholder="FILTRAR ARTIGOS..."
                  value={buscaArtigo}
                  onChange={(e) => setBuscaArtigo(e.target.value)}
                  className={`${inputClass} h-10 text-sm`}
                />
                <div className="border border-red-900/40 rounded-xl p-4 h-64 overflow-y-auto bg-[#080B14] custom-scroll space-y-2 cyber-grid">
                  {Object.entries(artigos)
                    .filter(([codigo, descricao]) =>
                      codigo.includes(buscaArtigo) ||
                      descricao.toLowerCase().includes(buscaArtigo.toLowerCase())
                    )
                    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
                    .map(([codigo, descricao]) => (
                      <label key={codigo} className={`flex items-start gap-4 text-xs cursor-pointer p-3 rounded-lg transition-all border border-transparent ${form.natureza.includes(codigo) ? 'bg-red-900/30 border-red-600/50 shadow-[0_0_10px_rgba(185,28,28,0.2)]' : 'hover:bg-red-950/20'}`}>
                        <input
                          type="checkbox"
                          checked={form.natureza.includes(codigo)}
                          className="mt-1 w-4 h-4 accent-red-600 rounded cursor-pointer"
                          onChange={() => {
                            const atualizado = form.natureza.includes(codigo)
                              ? form.natureza.filter((item) => item !== codigo)
                              : [...form.natureza, codigo];
                            setForm((prev) => ({ ...prev, natureza: atualizado }));
                          }}
                        />
                        <span className={`${form.natureza.includes(codigo) ? 'text-white' : 'text-gray-400'} font-bold tracking-wide`}>{descricao}</span>
                      </label>
                    ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>Histórico Detalhado (Relatório Técnico)</Label>
                <Textarea
                  value={form.descricao}
                  onChange={(e) => set("descricao", e.target.value)}
                  rows={8}
                  placeholder="DESCREVA A DINÂMICA DA OCORRÊNCIA COM PRECISÃO TÉCNICA..."
                  className="bg-[#0B0F1A]/80 border-red-900/30 text-[#F9FAFB] focus:ring-1 focus:ring-red-600 focus:border-red-600 rounded-xl p-6 transition-all placeholder:text-[#4B5563] resize-none backdrop-blur-sm custom-scroll leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* APREENSÕES */}
          <Card className="hud-card border-[#D4AF37]/30">
            <CardHeader className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent pb-6 border-b border-[#D4AF37]/20 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black flex items-center gap-3 uppercase text-white tracking-[0.2em]">
                <Lock className="w-5 h-5 text-[#D4AF37]" /> Apreensões
              </CardTitle>
              <Button size="icon" onClick={addMaterial} className="bg-[#D4AF37] hover:bg-[#FACC15] text-black rounded-full h-8 w-8 shadow-lg transition-transform hover:scale-110">
                <Plus className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-8 space-y-4">
              {materiais.length === 0 && (
                <div className="flex flex-col items-center justify-center p-10 text-gray-500 border-2 border-dashed border-red-900/20 rounded-xl">
                  <Lock className="w-8 h-8 mb-4 opacity-20" />
                  <span className="uppercase text-[9px] tracking-[0.3em] font-black text-center">Nenhum Material Sancionado</span>
                </div>
              )}
              {materiais.map((m) => (
                <div key={m.id} className="flex gap-3 animate-in fade-in zoom-in-95 duration-300">
                  <Input
                    className={`${inputClass} w-20 border-[#D4AF37]/20 text-center font-black text-sm`}
                    value={m.quantidade}
                    onChange={(e) => updateMaterial(m.id, "quantidade", e.target.value)}
                    placeholder="QTD"
                  />
                  <Input
                    value={m.descricao}
                    className={`${inputClass} grow border-[#D4AF37]/20 text-xs uppercase font-bold`}
                    onChange={(e) => updateMaterial(m.id, "descricao", e.target.value)}
                    placeholder="DESCRIÇÃO DO ILÍCITO"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeMaterial(m.id)}
                    className="text-red-500 hover:bg-red-600 hover:text-white h-12 w-12 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AÇÕES */}
          <div className="space-y-4">
            <Button
              onClick={gerarBopm}
              className="w-full tactical-btn bg-red-600 hover:bg-red-500 text-white h-16 rounded-xl shadow-[0_0_20px_rgba(185,28,28,0.4)] border border-red-500/50 text-base"
            >
              <div className="absolute top-0 right-0 p-1 px-2 bg-red-950/50 text-[8px] font-black tracking-widest rounded-bl-lg">STATUS: READY</div>
              <FileText className="w-6 h-6 mr-3" /> CONSOLIDAR RELATÓRIO
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={copiar}
                disabled={!resultado}
                className="tactical-btn bg-transparent border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white h-14 rounded-xl shadow-lg disabled:opacity-30"
              >
                <Copy className="w-4 h-4 mr-2" /> COPIAR
              </Button>
              <Button
                onClick={limpar}
                className="tactical-btn bg-transparent border border-gray-700 text-gray-500 hover:bg-gray-800 hover:text-white h-14 rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> LIMPAR
              </Button>
            </div>
          </div>

          {/* PREVIEW */}
          {resultado && (
            <Card className="hud-card border-red-600/40 animate-in slide-in-from-bottom-5 duration-500">
              <CardHeader className="bg-red-950/20 pb-4 border-b border-red-900/30">
                <CardTitle className="text-xs font-black uppercase text-red-500 tracking-[0.2em] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Espelho de Sistema (Preview)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  value={resultado}
                  readOnly
                  rows={15}
                  className="font-mono text-[11px] leading-relaxed resize-none bg-[#080B14] border-red-900/30 text-gray-300 p-6 focus:ring-0 shadow-inner custom-scroll select-all rounded-lg"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-6 relative z-10">
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-red-900 to-transparent rounded-full" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-[9px] font-black text-red-600/50 uppercase tracking-[0.5em]">OS FRACOS QUE SE ARREBETEM | 35 BPM</p>
          <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest opacity-80">
            Desenvolvido por <span className="text-white">Luiz Ricardo</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
