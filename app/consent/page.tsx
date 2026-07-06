"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 p-5 sm:p-7 shadow-lg shadow-black/40">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">{title}</h2>
      <div className="text-white text-[13px] sm:text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function ConsentPage() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
       {/* Panneau noir flouté derrière tout le contenu pour la lisibilité sur le fond animé */}
       <div className="rounded-3xl bg-black/70 backdrop-blur-xl border border-white/10 p-4 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-accent-violet/10 border border-accent-violet/30 text-accent-violet text-sm font-medium px-4 py-2 rounded-full mb-6">
            <ShieldCheck className="w-4 h-4" />
            Consentement & utilisation
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Politique de Consentement
          </h1>
          <p className="text-white/70 text-sm">
            Dernière mise à jour : 22 juin 2026 — Version 2.0
          </p>
        </div>

        {/* Alerte contenu généré par IA */}
        <div className="bg-yellow-500/10 backdrop-blur-md border border-yellow-500/20 rounded-2xl p-5 mb-10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-white">
              <p className="font-semibold text-white mb-1">Information importante sur les images générées</p>
              <p>
                Le Service High Like It génère des visuels de <span className="text-white font-semibold">personnages
                (GTA 5, Fortnite, Simpsons, Minecraft)</span> à partir d&apos;une photo que vous téléversez. Les images produites sont des
                <span className="text-white font-semibold"> créations par intelligence artificielle</span> destinées à
                un usage personnel et récréatif. En utilisant le Service, vous acceptez la présente politique, que vous
                pouvez consulter à tout moment.
              </p>
            </div>
          </div>
        </div>

        <Section title="1. Nature des données traitées">
          <p>
            Lorsque vous téléversez une photographie sur High Like It, cette image est transmise à nos modèles
            d&apos;intelligence artificielle afin de vous transformer en personnage (GTA 5, Fortnite, Simpsons ou
            Minecraft). La photo sert uniquement de support visuel (visage, cadrage, ambiance) à la génération de
            l&apos;image finale.
          </p>
          <p>
            Votre photo originale est utilisée exclusivement pour produire l&apos;image demandée, puis
            <span className="text-white font-semibold"> supprimée définitivement</span> à l&apos;issue du traitement.
            Aucune photo n&apos;est conservée, indexée, revendue ou utilisée à d&apos;autres fins.
          </p>
        </Section>

        <Section title="2. Finalités du traitement soumises à consentement">
          <p>Votre consentement est requis pour les traitements suivants :</p>
          <ul className="space-y-2 pl-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-accent-violet flex-shrink-0 mt-0.5" />
              <span>
                <span className="text-white font-medium">Génération d&apos;image</span> : utilisation de votre photo par l&apos;IA pour vous transformer en personnage dans l&apos;univers ou le style sélectionné.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-accent-violet flex-shrink-0 mt-0.5" />
              <span>
                <span className="text-white font-medium">Stockage temporaire</span> : conservation de la photo originale sur nos serveurs de traitement sécurisés pendant la durée strictement nécessaire à la génération (quelques secondes à quelques dizaines de secondes).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-accent-violet flex-shrink-0 mt-0.5" />
              <span>
                <span className="text-white font-medium">Conservation du résultat</span> : seule l&apos;image générée est enregistrée dans votre historique, et vous pouvez la supprimer à tout moment.
              </span>
            </li>
          </ul>
        </Section>

        <Section title="3. Conditions du consentement">
          <p>
            Votre consentement au traitement de votre photo est :
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><span className="text-white font-medium">Libre</span> : vous n&apos;êtes pas contraint d&apos;utiliser le Service. Le refus du consentement signifie simplement que vous ne pourrez pas utiliser la fonctionnalité de génération d&apos;image.</li>
            <li><span className="text-white font-medium">Éclairé</span> : la présente page vous informe clairement de la nature, des finalités et des modalités du traitement avant toute action.</li>
            <li><span className="text-white font-medium">Spécifique</span> : le consentement est sollicité uniquement pour les finalités décrites ci-dessus, et non pour d&apos;autres usages.</li>
            <li><span className="text-white font-medium">Non équivoque</span> : il est recueilli par une action positive et affirmative (téléversement volontaire de votre photo, après acceptation des CGU et de la présente politique).</li>
          </ul>
          <p>
            En téléversant une photo sur le Service, vous confirmez que vous détenez les droits sur cette image,
            <span className="text-white font-semibold"> ou</span> que vous avez obtenu le consentement des personnes
            éventuellement représentées sur la photo.
          </p>
        </Section>

        <Section title="4. Retrait du consentement">
          <p>
            Vous pouvez retirer votre consentement à tout moment, sans que cela affecte la licéité des traitements
            réalisés avant ce retrait (article 7, paragraphe 3 du RGPD).
          </p>
          <p>
            Le retrait du consentement s&apos;effectue par :
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Suppression d&apos;une image générée depuis votre tableau de bord (effet immédiat).</li>
            <li>Demande de suppression de l&apos;ensemble de vos données par e-mail à{" "}
              <a href="mailto:contact@riseandclose.co" className="text-accent-violet hover:underline">contact@riseandclose.co</a>
              {" "}(traitement sous 30 jours).
            </li>
            <li>Suppression de votre compte depuis les paramètres (entraîne la suppression de toutes vos données générées).</li>
          </ul>
          <p>
            Le retrait du consentement ne permet pas la récupération des crédits déjà consommés.
          </p>
        </Section>

        <Section title="5. Marques, univers et usage des visuels">
          <p>
            Les noms d&apos;univers et de jeux (GTA 5 / Grand Theft Auto, Fortnite, Les Simpson, Minecraft, etc.) ainsi que
            leurs personnages et logos sont des <span className="text-white font-semibold">marques déposées</span> appartenant
            à leurs propriétaires respectifs (Rockstar Games, Epic Games, The Walt Disney Company, Mojang/Microsoft, etc.).
            High Like It n&apos;est ni affilié, ni sponsorisé, ni approuvé par ces
            marques. Les visuels générés sont des <span className="text-white font-semibold">interprétations de style créées par
            IA</span> et ne constituent ni des produits officiels, ni des reproductions approuvées.
          </p>
          <p>
            Vous vous engagez formellement à :
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              Réserver les images générées à un usage <span className="text-white font-medium">personnel et récréatif</span>,
              et non à la revente, à la contrefaçon ou à la commercialisation de produits dérivés.
            </li>
            <li>
              Ne pas utiliser les visuels pour tromper un tiers en présentant une image générée par IA comme un
              contenu officiel de la marque ou du jeu.
            </li>
            <li>
              Ne téléverser que des photos sur lesquelles vous détenez des droits, ou pour lesquelles vous disposez
              du consentement des personnes représentées.
            </li>
          </ul>
          <p>
            Tout manquement à ces engagements constitue une violation des présentes conditions et des{" "}
            <Link href="/terms" className="text-accent-violet hover:underline">CGU</Link>, et peut entraîner la
            suspension de votre compte ainsi que des poursuites judiciaires.
          </p>
        </Section>

        <Section title="6. Réservé aux personnes majeures">
          <p>
            Le Service est exclusivement réservé aux personnes majeures (18 ans et plus). Le téléversement de photos
            représentant des mineurs est interdit.
          </p>
        </Section>

        <Section title="7. Base légale et conformité réglementaire">
          <p>
            Le traitement de votre photo repose sur votre consentement au sens de l&apos;article 6, paragraphe 1,
            point a) du RGPD, ainsi que sur l&apos;exécution du Service que vous avez demandé.
          </p>
          <p>
            Le Service est conçu selon le principe du <span className="text-white font-medium">Privacy by Design</span> :
            seules les données strictement nécessaires à la fourniture du Service sont collectées, et la photo
            originale est détruite immédiatement après traitement.
          </p>
        </Section>

        <Section title="8. Sous-traitants impliqués dans le traitement">
          <p>
            La génération de votre image est réalisée via des modèles d&apos;intelligence artificielle hébergés sur
            une infrastructure sécurisée. Votre photo n&apos;est transmise qu&apos;aux seuls prestataires techniques
            nécessaires à la génération, et n&apos;est jamais utilisée à des fins de profilage, de reconnaissance ou
            d&apos;entraînement de modèles.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Pour toute question relative au traitement de vos données ou pour exercer vos droits :
          </p>
          <ul className="list-none space-y-1 pl-0">
            <li>
              <span className="text-white font-medium">E-mail :</span>{" "}
              <a href="mailto:contact@riseandclose.co" className="text-accent-violet hover:underline">
                contact@riseandclose.co
              </a>
            </li>
            <li>
              <span className="text-white font-medium">Téléphone :</span>{" "}
              <a href="tel:+33762782116" className="text-accent-violet hover:underline">
                07 62 78 21 16
              </a>
            </li>
          </ul>
          <p>
            Vous pouvez également introduire une réclamation auprès de la{" "}
            <span className="text-white font-medium">CNIL</span> (Commission Nationale de l&apos;Informatique et
            des Libertés) sur www.cnil.fr.
          </p>
        </Section>

        {/* Bloc d'accusé de lecture */}
        <div className={`border rounded-2xl p-6 transition-all duration-300 ${
          acknowledged
            ? "border-green-500/40 bg-green-500/5"
            : "border-surface-border bg-surface/50"
        }`}>
          <label className="flex items-start gap-4 cursor-pointer">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  acknowledged
                    ? "bg-green-500 border-green-500"
                    : "border-surface-border hover:border-accent-violet/50"
                }`}
              >
                {acknowledged && <span className="text-white text-sm font-bold">✓</span>}
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">
                J&apos;ai lu et compris la politique de consentement
              </p>
              <p className="text-white/80 text-sm leading-relaxed">
                Je comprends que le Service utilise ma photo pour me transformer en personnage (GTA 5, Fortnite, Simpsons, Minecraft) par IA, que
                cette photo est supprimée immédiatement après traitement, que les images produites sont des
                créations par IA destinées à un usage personnel, et que je peux retirer mon consentement à tout
                moment.
              </p>
            </div>
          </label>
          {acknowledged && (
            <div className="mt-4 flex items-center gap-2 text-green-400 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Merci d&apos;avoir pris connaissance de cette politique.
            </div>
          )}
        </div>

        <div className="border-t border-surface-border pt-8 mt-8 flex flex-col sm:flex-row gap-4 text-sm text-white/70">
          <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
          <Link href="/" className="hover:text-white transition-colors">Retour à l&apos;accueil</Link>
        </div>
       </div>
      </div>

      <Footer />
    </div>
  );
}
