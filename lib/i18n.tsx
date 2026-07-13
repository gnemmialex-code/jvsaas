"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Locale = "fr" | "en" | "es" | "de";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
];

export const SITE_LANG_STORAGE_KEY = "site_lang";
export const SITE_LANG_EVENT = "site-lang-change";

type Dict = Record<string, string>;

// Dictionnaire de traduction. Clés organisées par section ("nav.", "hero.",
// "stats.", "faq.", "login."). Toute clé absente d'une langue retombe sur le
// français, qui reste donc la langue de référence.
const translations: Record<Locale, Dict> = {
  fr: {
    "nav.gta6.label": "Grand Theft Auto VI",
    "nav.gta6.soon": "Disponible prochainement",
    "nav.gta6.unlocked": "Accès anticipé débloqué",
    "nav.gta5": "Grand Theft Auto V",
    "nav.login": "Compte",
    "nav.profile": "Mon profil",
    "nav.cta": "Commencer Maintenant",

    "hero.title.line1": "La plateforme n°1 de transformation photo",
    "hero.title.line1Accent": "IA",
    "hero.title.brand": "High Like It",
    "hero.subtitle": "Deviens le héros de ton propre jeu vidéo.",
    "hero.cta": "Commencer Maintenant",
    "hero.liveCounter": "personnes ont généré une image aujourd'hui avec",

    "stats.upload.title": "Upload",
    "stats.upload.desc": "Importe une photo de ton visage (JPG, PNG, PDF, HEIC)",
    "stats.customize.title": "Personnalise",
    "stats.customize.desc": "Crée ton personnage au choix en moins de 30 secondes.",
    "stats.download.title": "Télécharge",
    "stats.download.desc": "Télécharge ton image ultra-réaliste en 4K ou en 1080p.",

    "faq.title": "FAQ",
    "faq.q1": "Comment fonctionne la transformation en personnage ?",
    "faq.a1": "Uploadez votre photo, choisissez un univers (GTA 5, Fortnite, Simpsons ou Minecraft) et notre pipeline IA vous transforme en personnage tout en gardant votre ressemblance, puis upscale le résultat en 4K (RealESRGAN). Tout se passe en moins de 30 secondes sur nos serveurs.",
    "faq.q2": "Mes photos sont-elles conservées ?",
    "faq.a2": "Non. Votre photo originale est automatiquement supprimée de nos serveurs après traitement. Seule l'image générée est stockée dans votre historique, et vous pouvez la supprimer à tout moment.",
    "faq.q3": "Puis-je utiliser n'importe quelle photo ?",
    "faq.a3": "Oui, tant que le visage est bien visible, de face ou légèrement de profil, avec une bonne luminosité. Les photos floues, très sombres ou avec plusieurs visages donnent des résultats moins précis.",
    "faq.q4": "Les crédits expirent-ils ?",
    "faq.a4": "Non, vos crédits n'ont pas de date d'expiration. Achetez-en une fois, utilisez-les à votre rythme.",
    "faq.q5": "Quelle est la résolution finale des images ?",
    "faq.a5": "Toutes les images sont générées puis upscalées x4 via RealESRGAN. La résolution finale atteint jusqu'à 4K (4096×4096 px) selon le style choisi.",
    "faq.q6": "Puis-je utiliser les images commercialement ?",
    "faq.a6": "Les images générées sont destinées à un usage créatif personnel. Pour un usage commercial (publicité, revente, etc.), contactez-nous pour une licence spécifique.",

    "login.email": "Email",
    "login.emailPlaceholder": "vous@exemple.com",
    "login.password": "Mot de passe",
    "login.forgotPassword": "Mot de passe oublié ?",
    "login.submit": "Se connecter",
    "login.submitting": "Connexion...",
    "login.noAccount": "Pas encore de compte ?",
    "login.signupFree": "Inscris-toi gratuitement",
    "login.errorEmailRequired": "Email requis",
    "login.errorEmailInvalid": "Email invalide",
    "login.errorPasswordRequired": "Mot de passe requis",
    "login.success": "Connexion réussie !",
    "login.errorBadCredentials": "Email ou mot de passe incorrect",
    "login.errorGeneric": "Erreur de connexion",
  },
  en: {
    "nav.gta6.label": "Grand Theft Auto VI",
    "nav.gta6.soon": "Coming soon",
    "nav.gta6.unlocked": "Early access unlocked",
    "nav.gta5": "Grand Theft Auto V",
    "nav.login": "Account",
    "nav.profile": "My profile",
    "nav.cta": "Get Started Now",

    "hero.title.line1": "Make your dreams possible with",
    "hero.title.brand": "High Like It",
    "hero.subtitle": "Generate your photo and finally become the hero of your own Grand Theft Auto V story — Grand Theft Auto VI coming soon.",
    "hero.cta": "Get Started Now",
    "hero.liveCounter": "people generated an image today with",

    "stats.upload.title": "Upload",
    "stats.upload.desc": "Upload a photo of your face (JPG, PNG, PDF, HEIC)",
    "stats.customize.title": "Customize",
    "stats.customize.desc": "Create your character of choice in under 30 seconds.",
    "stats.download.title": "Download",
    "stats.download.desc": "Download your ultra-realistic image in 4K or 1080p.",

    "faq.title": "FAQ",
    "faq.q1": "How does the character transformation work?",
    "faq.a1": "Upload your photo, choose a universe (GTA 5, Fortnite, Simpsons or Minecraft) and our AI pipeline turns you into a character while keeping your likeness, then upscales the result to 4K (RealESRGAN). It all happens in under 30 seconds on our servers.",
    "faq.q2": "Are my photos kept?",
    "faq.a2": "No. Your original photo is automatically deleted from our servers after processing. Only the generated image is stored in your history, and you can delete it at any time.",
    "faq.q3": "Can I use any photo?",
    "faq.a3": "Yes, as long as the face is clearly visible, front-facing or slightly angled, with good lighting. Blurry, very dark photos or ones with multiple faces give less accurate results.",
    "faq.q4": "Do credits expire?",
    "faq.a4": "No, your credits never expire. Buy them once, use them at your own pace.",
    "faq.q5": "What is the final image resolution?",
    "faq.a5": "All images are generated then upscaled 4x via RealESRGAN. Final resolution reaches up to 4K (4096×4096 px) depending on the chosen style.",
    "faq.q6": "Can I use the images commercially?",
    "faq.a6": "Generated images are for personal creative use. For commercial use (advertising, resale, etc.), contact us for a specific license.",

    "login.email": "Email",
    "login.emailPlaceholder": "you@example.com",
    "login.password": "Password",
    "login.forgotPassword": "Forgot password?",
    "login.submit": "Log in",
    "login.submitting": "Logging in...",
    "login.noAccount": "Not registered?",
    "login.signupFree": "Sign up for free",
    "login.errorEmailRequired": "Email required",
    "login.errorEmailInvalid": "Invalid email",
    "login.errorPasswordRequired": "Password required",
    "login.success": "Logged in successfully!",
    "login.errorBadCredentials": "Incorrect email or password",
    "login.errorGeneric": "Connection error",
  },
  es: {
    "nav.gta6.label": "Grand Theft Auto VI",
    "nav.gta6.soon": "Próximamente",
    "nav.gta6.unlocked": "Acceso anticipado desbloqueado",
    "nav.gta5": "Grand Theft Auto V",
    "nav.login": "Cuenta",
    "nav.profile": "Mi perfil",
    "nav.cta": "Empezar Ahora",

    "hero.title.line1": "Haz tus sueños posibles con",
    "hero.title.brand": "High Like It",
    "hero.subtitle": "Genera tu foto y conviértete por fin en protagonista de tu propia historia de Grand Theft Auto V, y pronto de Grand Theft Auto VI.",
    "hero.cta": "Empezar Ahora",
    "hero.liveCounter": "personas generaron una imagen hoy con",

    "stats.upload.title": "Sube",
    "stats.upload.desc": "Sube una foto de tu cara (JPG, PNG, PDF, HEIC)",
    "stats.customize.title": "Personaliza",
    "stats.customize.desc": "Crea el personaje que quieras en menos de 30 segundos.",
    "stats.download.title": "Descarga",
    "stats.download.desc": "Descarga tu imagen ultra realista en 4K o 1080p.",

    "faq.title": "FAQ",
    "faq.q1": "¿Cómo funciona la transformación en personaje?",
    "faq.a1": "Sube tu foto, elige un universo (GTA 5, Fortnite, Simpsons o Minecraft) y nuestro pipeline de IA te transforma en personaje conservando tu parecido, luego mejora el resultado a 4K (RealESRGAN). Todo ocurre en menos de 30 segundos en nuestros servidores.",
    "faq.q2": "¿Se conservan mis fotos?",
    "faq.a2": "No. Tu foto original se elimina automáticamente de nuestros servidores tras el procesamiento. Solo la imagen generada se guarda en tu historial, y puedes eliminarla cuando quieras.",
    "faq.q3": "¿Puedo usar cualquier foto?",
    "faq.a3": "Sí, siempre que el rostro sea claramente visible, de frente o ligeramente de perfil, con buena iluminación. Las fotos borrosas, muy oscuras o con varios rostros dan resultados menos precisos.",
    "faq.q4": "¿Los créditos caducan?",
    "faq.a4": "No, tus créditos no tienen fecha de caducidad. Cómpralos una vez y úsalos a tu ritmo.",
    "faq.q5": "¿Cuál es la resolución final de las imágenes?",
    "faq.a5": "Todas las imágenes se generan y luego se mejoran x4 mediante RealESRGAN. La resolución final llega hasta 4K (4096×4096 px) según el estilo elegido.",
    "faq.q6": "¿Puedo usar las imágenes comercialmente?",
    "faq.a6": "Las imágenes generadas son para uso creativo personal. Para uso comercial (publicidad, reventa, etc.), contáctanos para una licencia específica.",

    "login.email": "Correo electrónico",
    "login.emailPlaceholder": "tu@ejemplo.com",
    "login.password": "Contraseña",
    "login.forgotPassword": "¿Olvidaste tu contraseña?",
    "login.submit": "Iniciar sesión",
    "login.submitting": "Iniciando sesión...",
    "login.noAccount": "¿No tienes cuenta?",
    "login.signupFree": "Regístrate gratis",
    "login.errorEmailRequired": "Correo requerido",
    "login.errorEmailInvalid": "Correo inválido",
    "login.errorPasswordRequired": "Contraseña requerida",
    "login.success": "¡Sesión iniciada correctamente!",
    "login.errorBadCredentials": "Correo o contraseña incorrectos",
    "login.errorGeneric": "Error de conexión",
  },
  de: {
    "nav.gta6.label": "Grand Theft Auto VI",
    "nav.gta6.soon": "Demnächst verfügbar",
    "nav.gta6.unlocked": "Früher Zugang freigeschaltet",
    "nav.gta5": "Grand Theft Auto V",
    "nav.login": "Konto",
    "nav.profile": "Mein Profil",
    "nav.cta": "Jetzt Starten",

    "hero.title.line1": "Verwirkliche deine Träume mit",
    "hero.title.brand": "High Like It",
    "hero.subtitle": "Erstelle dein Foto und werde endlich zum Helden deiner eigenen Grand Theft Auto V Geschichte — Grand Theft Auto VI demnächst verfügbar.",
    "hero.cta": "Jetzt Starten",
    "hero.liveCounter": "Personen haben heute ein Bild generiert mit",

    "stats.upload.title": "Hochladen",
    "stats.upload.desc": "Lade ein Foto deines Gesichts hoch (JPG, PNG, PDF, HEIC)",
    "stats.customize.title": "Anpassen",
    "stats.customize.desc": "Erstelle deinen Charakter in weniger als 30 Sekunden.",
    "stats.download.title": "Herunterladen",
    "stats.download.desc": "Lade dein ultra-realistisches Bild in 4K oder 1080p herunter.",

    "faq.title": "FAQ",
    "faq.q1": "Wie funktioniert die Charakterverwandlung?",
    "faq.a1": "Lade dein Foto hoch, wähle ein Universum (GTA 5, Fortnite, Simpsons oder Minecraft) und unsere KI-Pipeline verwandelt dich in einen Charakter unter Beibehaltung deiner Ähnlichkeit und skaliert das Ergebnis dann auf 4K hoch (RealESRGAN). Alles geschieht in weniger als 30 Sekunden auf unseren Servern.",
    "faq.q2": "Werden meine Fotos gespeichert?",
    "faq.a2": "Nein. Dein Originalfoto wird nach der Verarbeitung automatisch von unseren Servern gelöscht. Nur das generierte Bild wird in deinem Verlauf gespeichert, und du kannst es jederzeit löschen.",
    "faq.q3": "Kann ich ein beliebiges Foto verwenden?",
    "faq.a3": "Ja, solange das Gesicht gut sichtbar ist, frontal oder leicht seitlich, mit guter Beleuchtung. Unscharfe, sehr dunkle Fotos oder solche mit mehreren Gesichtern liefern weniger genaue Ergebnisse.",
    "faq.q4": "Verfallen die Credits?",
    "faq.a4": "Nein, deine Credits haben kein Ablaufdatum. Kaufe sie einmal und nutze sie in deinem eigenen Tempo.",
    "faq.q5": "Wie hoch ist die endgültige Bildauflösung?",
    "faq.a5": "Alle Bilder werden generiert und anschließend über RealESRGAN 4x hochskaliert. Die endgültige Auflösung erreicht je nach gewähltem Stil bis zu 4K (4096×4096 px).",
    "faq.q6": "Darf ich die Bilder kommerziell nutzen?",
    "faq.a6": "Generierte Bilder sind für den persönlichen kreativen Gebrauch bestimmt. Für eine kommerzielle Nutzung (Werbung, Weiterverkauf usw.) kontaktiere uns für eine spezielle Lizenz.",

    "login.email": "E-Mail",
    "login.emailPlaceholder": "du@beispiel.com",
    "login.password": "Passwort",
    "login.forgotPassword": "Passwort vergessen?",
    "login.submit": "Anmelden",
    "login.submitting": "Anmeldung läuft...",
    "login.noAccount": "Noch nicht registriert?",
    "login.signupFree": "Kostenlos registrieren",
    "login.errorEmailRequired": "E-Mail erforderlich",
    "login.errorEmailInvalid": "Ungültige E-Mail",
    "login.errorPasswordRequired": "Passwort erforderlich",
    "login.success": "Erfolgreich angemeldet!",
    "login.errorBadCredentials": "E-Mail oder Passwort falsch",
    "login.errorGeneric": "Verbindungsfehler",
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "fr",
  setLocale: () => {},
  t: (key: string) => translations.fr[key] ?? key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const stored = localStorage.getItem(SITE_LANG_STORAGE_KEY) as Locale | null;
    if (stored && LOCALES.some((l) => l.code === stored)) setLocaleState(stored);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Locale>).detail;
      if (detail && LOCALES.some((l) => l.code === detail)) setLocaleState(detail);
    };
    window.addEventListener(SITE_LANG_EVENT, onChange);
    return () => window.removeEventListener(SITE_LANG_EVENT, onChange);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(SITE_LANG_STORAGE_KEY, l);
    window.dispatchEvent(new CustomEvent(SITE_LANG_EVENT, { detail: l }));
  }, []);

  const t = useCallback(
    (key: string) => translations[locale][key] ?? translations.fr[key] ?? key,
    [locale]
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
