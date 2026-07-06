import Link from "next/link";
import { Shield } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Politique de Confidentialité — High Like It",
  description: "Politique de confidentialité et protection des données personnelles — High Like It.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 p-5 sm:p-7 shadow-lg shadow-black/40">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">{title}</h2>
      <div className="text-white text-[13px] sm:text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
       {/* Panneau noir flouté derrière tout le contenu pour la lisibilité sur le fond animé */}
       <div className="rounded-3xl bg-black/70 backdrop-blur-xl border border-white/10 p-4 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-accent-violet/10 border border-accent-violet/30 text-accent-violet text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            Protection des données
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Politique de Confidentialité
          </h1>
          <p className="text-white/70 text-sm">
            Dernière mise à jour : 25 mai 2025 — Version 1.0 — Conforme RGPD (UE 2016/679)
          </p>
        </div>

        <div className="bg-accent-violet/10 backdrop-blur-md border border-accent-violet/20 rounded-2xl p-5 mb-10 text-sm text-white">
          <p className="font-semibold text-white mb-2">Résumé de nos engagements</p>
          <ul className="space-y-1">
            <li>🔒 Votre photo originale est supprimée de nos serveurs immédiatement après traitement.</li>
            <li>🚫 Nous ne vendons pas vos données personnelles à des tiers.</li>
            <li>✅ Vous pouvez exercer vos droits RGPD à tout moment par simple e-mail.</li>
            <li>🇪🇺 Toutes vos données sont traitées conformément au droit européen.</li>
          </ul>
        </div>

        <Section title="1. Responsable du traitement">
          <p>
            Le responsable du traitement des données personnelles collectées via le site High Like It est :
          </p>
          <div className="bg-surface border border-surface-border rounded-xl p-4 mt-2 space-y-1">
            <p><span className="text-white font-medium">Dénomination sociale :</span> SAS Progressio (marque High Like It / Rise and Close)</p>
            <p><span className="text-white font-medium">Forme juridique :</span> Société par actions simplifiée (SAS)</p>
            <p><span className="text-white font-medium">Siège social :</span> 4 rue du 8 mai 1945, 91470 Limours, France</p>
            <p><span className="text-white font-medium">SIREN :</span> 100 853 746 — <span className="text-white font-medium">TVA :</span> FR12 100853746</p>
            <p><span className="text-white font-medium">Représentants légaux :</span> Alexis Gnemmi et Hugo Sohan</p>
            <p><span className="text-white font-medium">E-mail :</span>{" "}
              <a href="mailto:contact@riseandclose.co" className="text-accent-violet hover:underline">
                contact@riseandclose.co
              </a>
            </p>
            <p><span className="text-white font-medium">Téléphone :</span>{" "}
              <a href="tel:+33762782116" className="text-accent-violet hover:underline">
                07 62 78 21 16
              </a>
            </p>
          </div>
          <p className="pt-1">
            <span className="text-white font-medium">Délégué à la protection des données (DPO) :</span> aucun DPO
            n&apos;a été désigné, la désignation n&apos;étant pas obligatoire au regard de l&apos;activité. Toute
            demande relative à vos données personnelles est traitée directement par l&apos;Éditeur aux coordonnées
            ci-dessus.
          </p>
        </Section>

        <Section title="2. Données collectées">
          <p>Nous collectons les données suivantes :</p>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left py-2 pr-4 text-white font-semibold">Catégorie</th>
                  <th className="text-left py-2 pr-4 text-white font-semibold">Données</th>
                  <th className="text-left py-2 text-white font-semibold">Finalité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                <tr>
                  <td className="py-2 pr-4 align-top">Compte</td>
                  <td className="py-2 pr-4 align-top">E-mail, mot de passe (hashé), date d&apos;inscription</td>
                  <td className="py-2 align-top">Authentification, gestion du compte</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Images</td>
                  <td className="py-2 pr-4 align-top">Photo uploadée (traitée et supprimée), image générée</td>
                  <td className="py-2 align-top">Fourniture du Service</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Usage</td>
                  <td className="py-2 pr-4 align-top">Historique des générations, crédits consommés</td>
                  <td className="py-2 align-top">Tableau de bord, facturation</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Paiement</td>
                  <td className="py-2 pr-4 align-top">Identifiant Stripe (aucune carte bancaire stockée)</td>
                  <td className="py-2 align-top">Traitement des paiements</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Technique</td>
                  <td className="py-2 pr-4 align-top">Adresse IP, type de navigateur, logs de connexion</td>
                  <td className="py-2 align-top">Sécurité, prévention des abus</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Cookies</td>
                  <td className="py-2 pr-4 align-top">Session d&apos;authentification</td>
                  <td className="py-2 align-top">Maintien de la connexion</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="3. Base légale du traitement">
          <p>Vos données sont traitées sur les bases légales suivantes (article 6 du RGPD) :</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><span className="text-white font-medium">Exécution du contrat</span> : traitement de votre photo pour générer l&apos;image, gestion de votre compte et de vos crédits.</li>
            <li><span className="text-white font-medium">Consentement explicite</span> : traitement de votre image faciale (donnée biométrique au sens large), collecté lors de l&apos;inscription et du premier upload.</li>
            <li><span className="text-white font-medium">Intérêt légitime</span> : sécurité du Service, prévention des fraudes, amélioration du Service.</li>
            <li><span className="text-white font-medium">Obligation légale</span> : conservation des données de facturation conformément aux obligations fiscales françaises (10 ans).</li>
          </ul>
        </Section>

        <Section title="4. Traitement des photos et données biométriques">
          <p>
            La photo que vous téléversez est utilisée exclusivement pour générer l&apos;image demandée. Elle est
            transmise à notre pipeline de traitement IA, puis <span className="text-white font-semibold">supprimée définitivement de nos serveurs</span> immédiatement
            après la génération.
          </p>
          <p>
            Le traitement implique une détection faciale. En France et dans l&apos;UE, ce type de traitement relève
            de l&apos;article 9 du RGPD (données sensibles). Votre consentement explicite est requis et recueilli
            via notre page{" "}
            <Link href="/consent" className="text-accent-violet hover:underline">Consentement</Link>.
          </p>
          <p>
            Les images générées (résultat final) sont stockées dans votre historique. Vous pouvez les supprimer à
            tout moment depuis votre tableau de bord.
          </p>
        </Section>

        <Section title="5. Durée de conservation">
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><span className="text-white font-medium">Photo originale uploadée</span> : supprimée immédiatement après traitement.</li>
            <li><span className="text-white font-medium">Images générées</span> : conservées jusqu&apos;à suppression par l&apos;utilisateur ou suppression du compte.</li>
            <li><span className="text-white font-medium">Données de compte</span> : conservées pendant la durée d&apos;activité du compte, puis 3 ans après la désactivation.</li>
            <li><span className="text-white font-medium">Données de facturation</span> : 10 ans conformément aux obligations légales françaises.</li>
            <li><span className="text-white font-medium">Logs de sécurité</span> : 1 an.</li>
          </ul>
        </Section>

        <Section title="6. Partage des données avec des tiers">
          <p>Vos données peuvent être partagées avec les sous-traitants suivants, dans le cadre strict de la fourniture du Service :</p>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left py-2 pr-4 text-white font-semibold">Partenaire</th>
                  <th className="text-left py-2 pr-4 text-white font-semibold">Rôle</th>
                  <th className="text-left py-2 text-white font-semibold">Localisation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                <tr>
                  <td className="py-2 pr-4">Supabase</td>
                  <td className="py-2 pr-4">Authentification, base de données</td>
                  <td className="py-2">UE (Frankfurt)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Stripe, Inc.</td>
                  <td className="py-2 pr-4">Traitement des paiements</td>
                  <td className="py-2">USA (clauses BCE)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Vercel, Inc.</td>
                  <td className="py-2 pr-4">Hébergement du site web</td>
                  <td className="py-2">USA / UE (clauses BCE)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            Aucun partage de données à des fins publicitaires ou de revente n&apos;est réalisé.
          </p>
        </Section>

        <Section title="7. Transferts hors UE">
          <p>
            Certains de nos sous-traitants (Stripe, Vercel) sont établis aux États-Unis. Ces transferts sont encadrés
            par des Clauses Contractuelles Types (CCT) approuvées par la Commission européenne, garantissant un niveau
            de protection adéquat de vos données.
          </p>
        </Section>

        <Section title="8. Vos droits (RGPD)">
          <p>Conformément au RGPD, vous disposez des droits suivants sur vos données :</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><span className="text-white font-medium">Droit d&apos;accès</span> : obtenir une copie de vos données personnelles traitées.</li>
            <li><span className="text-white font-medium">Droit de rectification</span> : corriger des données inexactes ou incomplètes.</li>
            <li><span className="text-white font-medium">Droit à l&apos;effacement</span> : demander la suppression de vos données (sous réserve des obligations légales).</li>
            <li><span className="text-white font-medium">Droit à la portabilité</span> : recevoir vos données dans un format structuré et lisible par machine.</li>
            <li><span className="text-white font-medium">Droit d&apos;opposition</span> : vous opposer à certains traitements basés sur l&apos;intérêt légitime.</li>
            <li><span className="text-white font-medium">Droit à la limitation</span> : demander la suspension d&apos;un traitement contesté.</li>
            <li><span className="text-white font-medium">Droit de retrait du consentement</span> : retirer votre consentement à tout moment, sans que cela affecte la licéité des traitements antérieurs.</li>
          </ul>
          <p>
            Pour exercer vos droits, contactez-nous à :{" "}
            <a href="mailto:contact@riseandclose.co" className="text-accent-violet hover:underline">
              contact@riseandclose.co
            </a>
            . Nous répondrons dans un délai maximum de 30 jours.
          </p>
          <p>
            En cas de réponse insatisfaisante, vous pouvez introduire une réclamation auprès de la CNIL (Commission
            Nationale de l&apos;Informatique et des Libertés) :{" "}
            <span className="text-white">www.cnil.fr</span>.
          </p>
        </Section>

        <Section title="9. Cookies et traceurs">
          <p>
            Nous utilisons uniquement des cookies strictement nécessaires au fonctionnement du Service :
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><span className="text-white font-medium">Cookie de session</span> : maintien de votre connexion (durée : session ou 30 jours si « se souvenir de moi »).</li>
            <li><span className="text-white font-medium">Cookie de sécurité CSRF</span> : protection contre les attaques inter-sites.</li>
          </ul>
          <p>
            Aucun cookie publicitaire ou de suivi tiers n&apos;est déposé sans votre consentement explicite.
          </p>
        </Section>

        <Section title="10. Sécurité">
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
            chiffrement des communications (TLS), hachage des mots de passe (bcrypt), isolation des environnements de
            traitement, accès aux données limité au personnel autorisé, suppression automatique des photos après
            traitement.
          </p>
          <p>
            En cas de violation de données susceptible d&apos;engendrer un risque pour vos droits et libertés, nous
            nous engageons à vous en informer dans les 72 heures conformément à l&apos;article 33 du RGPD.
          </p>
        </Section>

        <Section title="11. Modifications de la politique">
          <p>
            Nous pouvons mettre à jour la présente politique à tout moment. La date de dernière mise à jour figure en
            haut du document. En cas de modification substantielle, vous serez informé par e-mail ou par notification
            dans le Service.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Pour toute question relative à la présente politique ou à vos données personnelles, ou pour exercer vos
            droits :
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
        </Section>

        <div className="border-t border-surface-border pt-8 mt-8 flex flex-col sm:flex-row gap-4 text-sm text-white/70">
          <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
          <Link href="/consent" className="hover:text-white transition-colors">Consentement</Link>
          <Link href="/" className="hover:text-white transition-colors">Retour à l&apos;accueil</Link>
        </div>
       </div>
      </div>

      <Footer />
    </div>
  );
}
