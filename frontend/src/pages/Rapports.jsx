import { useEffect, useState, useCallback } from "react";
import "@/assets/styles/report.css";

const API_URL = "http://127.0.0.1:5555";

export default function Rapports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/reports/summary`);
      if (response.ok) {
        setSummary(await response.json());
        setError("");
      }
    } catch (err) {
      console.error("Erreur chargement rapports:", err);
      setError("Impossible de contacter le serveur Flask.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
    const interval = setInterval(loadSummary, 5000);
    return () => clearInterval(interval);
  }, [loadSummary]);

  return (
    <div className="mainrapport">
      <h2 className="text-2xl font-bold mb-2">Rapports</h2>
      <p className="text-slate-300 mb-4">
        Vue d'ensemble générée à partir des vraies données (clients, machines,
        sessions et paiements).
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-400">Chargement...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <article className="article">
              <h4 className="text-slate-400 text-sm">Recette du jour</h4>
              <p className="text-3xl font-bold text-green-400">
                {summary?.recette_jour ?? 0} Ar
              </p>
            </article>
            <article className="article">
              <h4 className="text-slate-400 text-sm">Recette totale</h4>
              <p className="text-3xl font-bold text-green-400">
                {summary?.recette_totale ?? 0} Ar
              </p>
            </article>
            <article className="article">
              <h4 className="text-slate-400 text-sm">Sessions en cours</h4>
              <p className="text-3xl font-bold">{summary?.sessions_en_cours ?? 0}</p>
            </article>
            <article className="article">
              <h4 className="text-slate-400 text-sm">Sessions terminées</h4>
              <p className="text-3xl font-bold">{summary?.sessions_terminees ?? 0}</p>
            </article>
            <article className="article">
              <h4 className="text-slate-400 text-sm">Total clients</h4>
              <p className="text-3xl font-bold">{summary?.total_clients ?? 0}</p>
            </article>
            <article className="article">
              <h4 className="text-slate-400 text-sm">Total machines</h4>
              <p className="text-3xl font-bold">{summary?.total_machines ?? 0}</p>
            </article>
          </div>

          <article className="article graphe mt-4">
            <h4 className="text-slate-300 font-semibold mb-3">Machines les plus utilisées</h4>
            {summary?.machines_populaires?.length > 0 ? (
              <table className="table-auto w-full border-collapse">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="pb-2">Machine</th>
                    <th className="pb-2">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.machines_populaires.map((m) => (
                    <tr key={m.machine} className="border-t border-white/10">
                      <td className="py-2">{m.machine}</td>
                      <td className="py-2">{m.utilisations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-400">
                Aucune session terminée pour le moment — les statistiques
                apparaîtront ici dès qu'une session sera arrêtée.
              </p>
            )}
          </article>
        </>
      )}
    </div>
  );
}
