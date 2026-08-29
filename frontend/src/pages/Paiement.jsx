import { useEffect, useState, useCallback } from "react";
import "@/assets/styles/paiement.css";

const API_URL = "http://127.0.0.1:5555";

export default function Paiements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPaiements = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/paiements`);
      if (response.ok) {
        setTransactions(await response.json());
        setError("");
      }
    } catch (err) {
      console.error("Erreur chargement paiements:", err);
      setError("Impossible de contacter le serveur Flask.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaiements();
    const interval = setInterval(loadPaiements, 5000);
    return () => clearInterval(interval);
  }, [loadPaiements]);

  const filteredTransactions = transactions.filter((t) =>
    t.client.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalEncaisse = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + (t.montant_brut || 0), 0);

  const totalEnAttente = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + (t.montant_brut || 0), 0);

  const totalTransactions = transactions.reduce((sum, t) => sum + (t.montant_brut || 0), 0);

  return (
    <main className="p-8">
      {/* En-tête de la page */}
      <section className="mb-8">
        <h3 className="text-2xl text-purple-300 font-bold text-center">
          Gestion des Paiements
        </h3>
        <p className="mt-2 text-center text-gray-300 text-lg">
          Les paiements sont générés automatiquement à chaque fin de session
          (voir la page Sessions).
        </p>
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm text-center">
            {error}
          </div>
        )}
      </section>

      {/* Cartes KPI */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <article className="threearticle flex items-center gap-4">
          <div className="p-3 bg-purple-900/30 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" height="45" width="45" viewBox="0 0 640 640">
              <path
                fill="rgb(173, 1, 255)"
                d="M160 64C142.3 64 128 78.3 128 96C128 113.7 142.3 128 160 128L160 139C160 181.4 176.9 222.1 206.9 252.1L274.8 320L206.9 387.9C176.9 417.9 160 458.6 160 501L160 512C142.3 512 128 526.3 128 544C128 561.7 142.3 576 160 576L480 576C497.7 576 512 561.7 512 544C512 526.3 497.7 512 480 512L480 501C480 458.6 463.1 417.9 433.1 387.9L365.2 320L433.1 252.1C463.1 222.1 480 181.4 480 139L480 128C497.7 128 512 113.7 512 96C512 78.3 497.7 64 480 64L160 64z"
              />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-2xl font-bold">{totalEncaisse.toLocaleString("fr-FR")} Ar</h3>
            <h4 className="text-gray-400 text-sm">Total encaissé</h4>
          </div>
        </article>

        <article className="threearticle flex items-center gap-4">
          <div className="p-3 bg-yellow-900/30 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" height="45" width="45" viewBox="0 0 640 640">
              <path
                fill="rgb(255, 212, 59)"
                d="M320 48C306.7 48 296 58.7 296 72L296 84L294.2 84C257.6 84 228 113.7 228 150.2C228 183.6 252.9 211.8 286 215.9L347 223.5C352.1 224.1 356 228.5 356 233.7C356 239.4 351.4 243.9 345.8 243.9L272 244C256.5 244 244 256.5 244 272C244 287.5 256.5 300 272 300L296 300L296 312C296 325.3 306.7 336 320 336C333.3 336 344 325.3 344 312L344 300L345.8 300C382.4 300 412 270.3 412 233.8C412 200.4 387.1 172.2 354 168.1L293 160.5C287.9 159.9 284 155.5 284 150.3C284 144.6 288.6 140.1 294.2 140.1L360 140C375.5 140 388 127.5 388 112C388 96.5 375.5 84 360 84L344 84L344 72C344 58.7 333.3 48 320 48z"
              />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-2xl font-bold">{totalEnAttente.toLocaleString("fr-FR")} Ar</h3>
            <h4 className="text-gray-400 text-sm">Transactions en attente</h4>
          </div>
        </article>

        <article className="threearticle flex items-center gap-4">
          <div className="p-3 bg-emerald-900/30 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" height="45" width="45" viewBox="0 0 640 640">
              <path
                fill="rgb(99, 230, 190)"
                d="M192 160L192 144C192 99.8 278 64 384 64C490 64 576 99.8 576 144L576 160C576 190.6 534.7 217.2 474 230.7C471.6 227.9 469.1 225.2 466.6 222.7C451.1 207.4 431.1 195.8 410.2 187.2C368.3 169.7 313.7 160.1 256 160.1C234.1 160.1 212.7 161.5 192.2 164.2C192 162.9 192 161.5 192 160.1z"
              />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-2xl font-bold">{totalTransactions.toLocaleString("fr-FR")} Ar</h3>
            <h4 className="text-gray-400 text-sm">Total des transactions</h4>
          </div>
        </article>
      </section>

      {/* Recherche et Tableau */}
      <section className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div className="flex gap-2 flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800/80 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 w-full transition-all"
            />
          </div>
          <button
            onClick={() => setSearchTerm("")}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center cursor-pointer"
          >
            <i className="fa-solid fa-rotate-right mr-2"></i>Réinitialiser
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="rounded-l-lg">Client</th>
                <th>Montant</th>
                <th>Date</th>
                <th className="rounded-r-lg">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.client}</td>
                    <td className="font-semibold text-purple-300">{item.montant}</td>
                    <td>{item.date}</td>
                    <td>
                      <span className={`status ${item.status}`}>
                        {item.status === "completed" ? "Terminé" : "En attente"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-400">
                    {loading
                      ? "Chargement..."
                      : `Aucune transaction trouvée pour "${searchTerm}".`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
