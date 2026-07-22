import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Détection de la langue selon le pays du visiteur.
// Vercel fournit automatiquement l'en-tête `x-vercel-ip-country` (code ISO à 2
// lettres, ex. "US" pour un visiteur de New York). On mappe ce pays vers l'une
// des langues supportées. Tout pays non listé retombe sur le français.
const COUNTRY_TO_LOCALE: Record<string, string> = {
  // Anglophone → English
  US: "en", GB: "en", CA: "en", AU: "en", NZ: "en", IE: "en", IN: "en", SG: "en",
  ZA: "en", NG: "en", PH: "en",
  // Hispanophone → Español
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es", EC: "es",
  UY: "es", PY: "es", BO: "es", CR: "es", GT: "es", DO: "es",
  // Germanophone → Deutsch
  DE: "de", AT: "de", CH: "de", LI: "de",
  // Francophone (FR, BE, LU, etc.) → langue par défaut (fr)
};

// Pose le cookie `site_lang` selon le pays si aucun choix n'existe déjà
// (choix manuel de l'utilisateur ou pays déjà détecté lors d'une visite passée).
function applyGeoLocale(req: NextRequest, res: NextResponse) {
  if (req.cookies.get("site_lang")) return;
  const country = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
  const locale = COUNTRY_TO_LOCALE[country] || "fr";
  res.cookies.set("site_lang", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 an
    sameSite: "lax",
  });
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let supabaseResponse = NextResponse.next({ request: req });

  // Sans clés Supabase configurées (ex. copie locale), on laisse simplement
  // passer la requête au lieu de planter le middleware sur chaque page.
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    applyGeoLocale(req, supabaseResponse);
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Read session from cookie — no network call, reliable in Edge Runtime
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session?.user;

  // Protect /admin only — /dashboard reste accessible en mode aperçu (les actions y sont bloquées côté UI)
  if (!isAuthenticated && pathname.startsWith("/admin")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Already logged in → skip /login and /register
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  applyGeoLocale(req, supabaseResponse);
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
