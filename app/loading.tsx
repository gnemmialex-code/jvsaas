import Loader from "./components/Loader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader message="Chargement..." />
    </div>
  );
}
