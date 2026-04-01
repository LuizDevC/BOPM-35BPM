import { supabase } from "@/lib/supabase";

const API_BASE_URL = "https://bopm-ts.onrender.com";

export interface Oficial {
  id: string;
  nome: string;
  patente: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export type CreateOficialData = Omit<Oficial, "id" | "created_at" | "updated_at">;
export type UpdateOficialData = Partial<CreateOficialData>;

function buildHeaders(token?: string | null) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const oficiaisService = {
  async listarOficiais(token?: string | null): Promise<Oficial[]> {
    const response = await fetch(`${API_BASE_URL}/api/oficiais`, {
      headers: buildHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Falha ao carregar oficiais");
    }

    return response.json();
  },

  async criarOficial(dados: CreateOficialData, token?: string | null): Promise<Oficial> {
    const response = await fetch(`${API_BASE_URL}/api/oficiais`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Falha ao criar oficial");
    }

    return response.json();
  },

  async atualizarOficial(id: string, dados: UpdateOficialData, token?: string | null): Promise<Oficial> {
    const response = await fetch(`${API_BASE_URL}/api/oficiais/${id}`, {
      method: "PATCH",
      headers: buildHeaders(token),
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Falha ao atualizar oficial");
    }

    return response.json();
  },

  async deletarOficial(id: string, token?: string | null): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/oficiais/${id}`, {
      method: "DELETE",
      headers: buildHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Falha ao excluir oficial");
    }
  },
};