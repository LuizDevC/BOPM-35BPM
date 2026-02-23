import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Copy, RefreshCw, FileText, Shield, UserSearch, Newspaper, ShieldPlus, Lock, TriangleAlert, User } from "lucide-react";
import { toast } from "sonner";

const patentes = [
  "Soldado 2ª Classe PM",
  "Soldado 1ª Classe PM",
  "Cabo PM",
  "3º Sargento PM",
  "2º Sargento PM",
  "1º Sargento PM",
  "Subtenente PM",
  "2º Tenente PM",
  "1º Tenente PM",
  "Capitão PM",
];

const patentesComando = [
  "Cabo PM",
  "3º Sargento PM",
  "2º Sargento PM",
  "1º Sargento PM",
  "Subtenente PM",
  "2º Tenente PM",
  "1º Tenente PM",
  "Capitão PM",
];

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
  encarregadoPatente: patentesComando[0],
  encarregadoNome: "",
  motoristaPatente: patentes[0],
  motoristaNome: "",
  terceiroPatente: patentes[0],
  terceiroNome: "",
  quartoPatente: patentes[0],
  quartoNome: "",
  supervisor: "",
  local: "",
  delegado: "",
  nomeIndividuo: "",
  rg: "",
  sacoEvd: "",
  natureza: "",
  apresentacao: "",
  descricao: "",
};

export default function Index() {
  const [form, setForm] = useState(estadoInicial);
  const [apoios, setApoios] = useState<Apoio[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [resultado, setResultado] = useState("");
  const [nextId, setNextId] = useState(1);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const formatarPessoa = (patente: string, nome: string) =>
    nome.trim() ? `${patente} ${nome.trim()}` : "Sem Alteração.";

  const addApoio = () => {
    setApoios((prev) => [...prev, { id: nextId, valor: "" }]);
    setNextId((n) => n + 1);
  };

  const removeApoio = (id: number) =>
    setApoios((prev) => prev.filter((a) => a.id !== id));

  const updateApoio = (id: number, valor: string) =>
    setApoios((prev) => prev.map((a) => (a.id === id ? { ...a, valor } : a)));

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

  const gerarTextoApoios = () => {
    const linhas = apoios.map((a) => a.valor.trim()).filter(Boolean);
    return linhas.length ? linhas.join("\n") : "Sem Alteração.";
  };

  const gerarTextoMateriais = () => {
    const linhas = materiais
      .filter((m) => m.quantidade.trim() && m.descricao.trim())
      .map((m) => `${m.quantidade.trim()}x ${m.descricao.trim()}`);

    return linhas.length ? linhas.join("\n") : "Sem Alteração.";
  };

  const gerarBopm = () => {
    const texto = `BOPM nº ${form.numero}

EQUIPE EMPENHADA

UNIDADE: ${form.prefixo}
COMANDANTE DE EQUIPE: ${formatarPessoa(form.encarregadoPatente, form.encarregadoNome)}
MOTORISTA: ${formatarPessoa(form.motoristaPatente, form.motoristaNome)}
1° AUXILIZAR: ${formatarPessoa(form.terceiroPatente, form.terceiroNome)}
2° AUXILIZAR: ${formatarPessoa(form.quartoPatente, form.quartoNome)}

INFORMAÇÕES DA OCORRÊNCIA

DATA: ${form.data}
HORÁRIO: ${form.horario}
LOCAL: ${form.local.trim() || "Sem Alteração."}

IDENTIFICAÇÃO DO ENVOLVIDO

NOME: ${form.nomeIndividuo.trim() || "Sem Alteração."}
RG: ${form.rg.trim() || "Sem Alteração."}
SACO DE EVIDÊNCIAS N°: ${form.sacoEvd.trim() || "Sem Alteração."}
ARTIGOS: ${form.natureza.trim() || "Sem Alteração."}
ILÍCITOS: 
${gerarTextoMateriais()}

RELATO DA OCORRÊNCIA:
${form.descricao.trim() || "Sem Alteração."}

RESPONSÁVEL (CHEFE DE BARCA): ${formatarPessoa(form.encarregadoPatente, form.encarregadoNome)}
`;

    setResultado(texto);
  };

  const copiar = () => {
    navigator.clipboard.writeText(resultado);
    toast.success("BOPM copiado com sucesso!");
  };

  const limpar = () => {
    setForm(estadoInicial);
    setApoios([]);
    setMateriais([]);
    setResultado("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Shield className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold tracking-wide">Gerador de BOPM — 35 BPM</h1>
            <p className="text-sm opacity-75">Boletim de Ocorrência Policial Militar</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Identificação */}
        <Card>
          <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded-md">
            <TriangleAlert className="w-4 h-4 text-red-600" />
            Atenção: Campos sem informação devem permanecer em branco.
          </p>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Identificação
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Número do BOPM</Label>
              <Input value={form.numero} onChange={(e) => set("numero", e.target.value)} placeholder="Ex: 1234" />
            </div>

            <div className="space-y-1">
              <Label>Unidade</Label>
              <Input value={form.prefixo} onChange={(e) => set("prefixo", e.target.value)} placeholder="Ex: 92221" />
            </div>
          </CardContent>
        </Card>

        {/* Equipe */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <UserSearch className="w-4 h-4" />
              Equipe Empenhada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Comandante de equipe", patenteKey: "encarregadoPatente", nomeKey: "encarregadoNome" },
              { label: "Motorista", patenteKey: "motoristaPatente", nomeKey: "motoristaNome" },
              { label: "1° auxiliar", patenteKey: "terceiroPatente", nomeKey: "terceiroNome" },
              { label: "2° auxiliar", patenteKey: "quartoPatente", nomeKey: "quartoNome" },
            ].map(({ label, patenteKey, nomeKey }) => (
              <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="space-y-1">
                  <Label>{label}</Label>
                  <Select value={form[patenteKey as keyof typeof form]} onValueChange={(v) => set(patenteKey, v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(label === "Comandante de equipe" ? patentesComando : patentes).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label>Nome</Label>
                  <Input
                    value={form[nomeKey as keyof typeof form]}
                    onChange={(e) => set(nomeKey, e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ocorrência */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              Ocorrência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Data</Label>
                <Input value={form.data} onChange={(e) => set("data", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Horário</Label>
                <Input value={form.horario} onChange={(e) => set("horario", e.target.value)} placeholder="Ex: 14h30" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Local</Label>
                <Input value={form.local} onChange={(e) => set("local", e.target.value)} placeholder="Endereço da ocorrência" />
              </div>

              <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
                <User className="w-4 h-4" />
                Identificação do envolvido
              </CardTitle>
              <div className="sm:col-span-2 space-y-1">
                <Label>Nome</Label>
                <Input value={form.nomeIndividuo} onChange={(e) => set("nomeIndividuo", e.target.value)} placeholder="Nome do indivíduo" />
              </div>
              <div className="space-y-1">
                <Label>RG</Label>
                <Input value={form.rg} onChange={(e) => set("rg", e.target.value)} placeholder="Ex: GGG00000" />
              </div>
              <div className="space-y-1">
                <Label>Saco de evidências</Label>
                <Input value={form.sacoEvd} onChange={(e) => set("sacoEvd", e.target.value)} placeholder="Ex: EVD-202602200000" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Artigos</Label>
                <Input value={form.natureza} onChange={(e) => set("natureza", e.target.value)} placeholder="Ex: Art 157, Art 155, Art 171..." />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Relato da ocorrência</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                rows={5}
                placeholder="Descreva detalhadamente os fatos ocorridos..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Apoios 
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <ShieldPlus className="w-4 h-4" />
              Apoios
            </CardTitle>
            <Button size="sm" variant="outline" onClick={addApoio} className="gap-1">
              <Plus className="w-4 h-4" /> Adicionar Apoio
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {apoios.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Nenhum apoio adicionado.</p>
            )}
            {apoios.map((a) => (
              <div key={a.id} className="flex gap-2">
                <Input
                  value={a.valor}
                  onChange={(e) => updateApoio(a.id, e.target.value)}
                  placeholder="Descrição do apoio"
                />
                <Button size="icon" variant="destructive" onClick={() => removeApoio(a.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
*/}

        {/* Material Apreendido */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Material Apreendido
            </CardTitle>
            <Button size="sm" variant="outline" onClick={addMaterial} className="gap-1">
              <Plus className="w-4 h-4" /> Adicionar Material
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {materiais.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Nenhum material adicionado.</p>
            )}
            {materiais.map((m) => (
              <div key={m.id} className="flex gap-2">
                <Input
                  className="w-28 flex-shrink-0"
                  value={m.quantidade}
                  onChange={(e) => updateMaterial(m.id, "quantidade", e.target.value)}
                  placeholder="Qtd"
                />
                <Input
                  value={m.descricao}
                  onChange={(e) => updateMaterial(m.id, "descricao", e.target.value)}
                  placeholder="Descrição do material"
                />
                <Button size="icon" variant="destructive" onClick={() => removeMaterial(m.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={gerarBopm} className="flex-1 sm:flex-none gap-2 bg-primary text-primary-foreground hover:opacity-90">
            <FileText className="w-4 h-4" /> Gerar BOPM
          </Button>
          <Button
            onClick={copiar}
            disabled={!resultado}
            variant="outline"
            className="flex-1 sm:flex-none gap-2 border-[hsl(var(--success))] text-[hsl(var(--success))] hover:bg-[hsl(var(--success))] hover:text-[hsl(var(--success-foreground))]"
          >
            <Copy className="w-4 h-4" /> Copiar
          </Button>
          <Button onClick={limpar} variant="destructive" className="flex-1 sm:flex-none gap-2">
            <RefreshCw className="w-4 h-4" /> Limpar
          </Button>
        </div>

        {/* Resultado */}
        {resultado && (
          <>
            <Separator />
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-primary">Resultado Final (BOPM)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={resultado}
                  readOnly
                  rows={20}
                  className="font-mono text-sm resize-none bg-muted"
                />
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
