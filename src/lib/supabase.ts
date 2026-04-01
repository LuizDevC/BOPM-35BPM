import { createClient } from "@supabase/supabase-js";

// Pegando as variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inicializa o supabase client apenas se as credenciais existirem
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co", 
  supabaseAnonKey || "placeholder-key"
);
