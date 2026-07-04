import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// Valeurs de repli : sans vraies clés (ex. copie locale sans Supabase configuré),
// on évite que la création du client plante l'app au chargement. Le client se crée
// mais les appels réseau échoueront simplement — le site reste visualisable.
// Dès que de vraies clés sont présentes dans .env.local, elles reprennent le dessus.
const FALLBACK_URL = "https://placeholder.supabase.co";
const FALLBACK_KEY = "placeholder-anon-key";

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "[Supabase] Clés absentes — mode démo : auth/DB désactivées. " +
    "Renseigne NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local pour les réactiver."
  );
}

// Client-side Supabase client (use in "use client" components)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role (server-only, never expose to browser)
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_KEY
  );
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          credits: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          credits?: number;
          created_at?: string;
        };
        Update: {
          credits?: number;
        };
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          input_image_url: string;
          output_image_url: string;
          style: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          input_image_url: string;
          output_image_url: string;
          style: string;
          created_at?: string;
        };
        Update: never;
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: "purchase" | "use" | "bonus";
          pack_id: string | null;
          stripe_session_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          amount: number;
          type: "purchase" | "use" | "bonus";
          pack_id?: string;
          stripe_session_id?: string;
        };
        Update: never;
      };
    };
  };
};
