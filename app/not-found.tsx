import Link from "next/link";
import Navbar from "./components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <h1 className="text-3xl font-bold mb-2">Page introuvable</h1>
        <p className="text-white/50 mb-8">Cette page n&apos;existe pas ou a été déplacée.</p>
        <Link href="/" className="btn-primary">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
