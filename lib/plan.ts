// Détermine si un plan donne accès à la version NETTE (non floutée) des images.
//
// • Un compte fraîchement inscrit a le plan "free" → résultat flouté (aperçu).
// • Toute formule payante (Essentiel / Pro / Elite-Ultra) débloque la HD.
//
// Utilisable côté serveur ET côté client (aucune dépendance serveur).
export function isPaidPlan(plan?: string | null): boolean {
  if (!plan) return false;
  const p = plan.toLowerCase().trim();
  if (p === "free" || p === "gratuit" || p === "") return false;
  return (
    p.includes("essentiel") ||
    p.includes("pro") ||
    p.includes("ultra") ||
    p.includes("elite")
  );
}
