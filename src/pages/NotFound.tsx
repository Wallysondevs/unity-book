import { Link } from "wouter";
import { Home as HomeIcon, Box } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <Box size={64} className="mx-auto mb-4 text-unity-cyan" />
      <h1 className="text-4xl font-bold text-unity-cyan-dark dark:text-unity-cyan mb-2">404</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">
        Esta cena não foi carregada. Talvez o GameObject tenha sido destruído.
      </p>
      <Link href="/" className="inline-flex items-center gap-2 bg-unity-cyan-dark hover:bg-unity-darker text-white px-5 py-2.5 rounded-lg font-semibold transition-colors">
        <HomeIcon size={18} /> Voltar ao início
      </Link>
    </div>
  );
}
