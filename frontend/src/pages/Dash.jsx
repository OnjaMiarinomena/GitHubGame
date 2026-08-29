import { useEffect, useState, useCallback } from "react";
import "@/assets/styles/dash.css";

const API_URL = "http://127.0.0.1:5555";

export default function Dash() {
  const [stats, setStats] = useState(null);
  const [sessionsList, setSessionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async () => {
    try {
      const [statsResponse, sessionsResponse] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/stats`),
        fetch(`${API_URL}/api/sessions`),
      ]);

      if (statsResponse.ok) {
        setStats(await statsResponse.json());
      }
      if (sessionsResponse.ok) {
        setSessionsList(await sessionsResponse.json());
      }
      setError("");
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
      setError("Impossible de contacter le serveur Flask.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    // Rafraîchit automatiquement pour rester à jour avec les autres pages
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const arreter = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/${id}/stop`, {
        method: "PUT",
      });
      if (response.ok) {
        loadDashboardData();
      } else {
        const data = await response.json();
        setError(data.error || "Impossible d'arrêter la session");
      }
    } catch (err) {
      console.error("Erreur arrêt session:", err);
      setError("Impossible de contacter le serveur Flask.");
    }
  };

  return (
    <div className="principal">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Cartes de statistiques */}
      <div className="forsection">
        <section>
          <div className="flex items-center gap-4 justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="60"
              width="60"
              viewBox="0 0 640 640"
            >
              <path
                fill="rgb(177, 151, 252)"
                d="M380.8 96C372.7 110.1 368 126.5 368 144L368 160L96 160L96 384L368 384L368 448L96 448C60.7 448 32 419.3 32 384L32 160C32 124.7 60.7 96 96 96L380.8 96zM368 496C368 513.5 372.7 529.9 380.8 544L152 544C138.7 544 128 533.3 128 520C128 506.7 138.7 496 152 496L368 496zM464 96L560 96C586.5 96 608 117.5 608 144L608 496C608 522.5 586.5 544 560 544L464 544C437.5 544 416 522.5 416 496L416 144C416 117.5 437.5 96 464 96zM488 160C474.7 160 464 170.7 464 184C464 197.3 474.7 208 488 208L536 208C549.3 208 560 197.3 560 184C560 170.7 549.3 160 536 160L488 160zM488 256C474.7 256 464 266.7 464 280C464 293.3 474.7 304 488 304L536 304C549.3 304 560 293.3 560 280C560 266.7 549.3 256 536 256L488 256zM544 400C544 382.3 529.7 368 512 368C494.3 368 480 382.3 480 400C480 417.7 494.3 432 512 432C529.7 432 544 417.7 544 400z"
              />
            </svg>
            <div>
              <h3>Machines disponibles</h3>
              <p id="affichageMachines" className="text-3xl font-bold">
                {loading ? "--" : (stats?.machines_disponibles ?? stats?.total_machines ?? "--")}
              </p>
              <p>Sur {stats?.total_machines ?? "--"} machines</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="60"
              width="60"
              viewBox="0 0 640 640"
            >
              <path
                fill="rgb(116, 192, 252)"
                d="M160 64C142.3 64 128 78.3 128 96C128 113.7 142.3 128 160 128L160 139C160 181.4 176.9 222.1 206.9 252.1L274.8 320L206.9 387.9C176.9 417.9 160 458.6 160 501L160 512C142.3 512 128 526.3 128 544C128 561.7 142.3 576 160 576L480 576C497.7 576 512 561.7 512 544C512 526.3 497.7 512 480 512L480 501C480 458.6 463.1 417.9 433.1 387.9L365.2 320L433.1 252.1C463.1 222.1 480 181.4 480 139L480 128C497.7 128 512 113.7 512 96C512 78.3 497.7 64 480 64L160 64zM224 139L224 128L416 128L416 139C416 158 410.4 176.4 400 192L240 192C229.7 176.4 224 158 224 139zM240 448C243.5 442.7 247.6 437.7 252.1 433.1L320 365.2L387.9 433.1C392.5 437.7 396.5 442.7 400.1 448L240 448z"
              />
            </svg>
            <div>
              <h3>Sessions en cours</h3>
              <p id="affichageSession" className="text-3xl font-bold">
                {sessionsList.length}
              </p>
              <p>Voir les sessions</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="60"
              width="60"
              viewBox="0 0 640 640"
            >
              <path
                fill="rgb(255, 212, 59)"
                d="M56 80L584 80C597.3 80 608 90.7 608 104C608 117.3 597.3 128 584 128L56 128C42.7 128 32 117.3 32 104C32 90.7 42.7 80 56 80zM56 528L584 528C597.3 528 608 538.7 608 552C608 565.3 597.3 576 584 576L56 576C42.7 576 32 565.3 32 552C32 538.7 42.7 528 56 528zM424 256C424 225.1 449.1 200 480 200C510.9 200 536 225.1 536 256C536 286.9 510.9 312 480 312C449.1 312 424 286.9 424 256zM451.2 356.4C460.3 353.5 470 352 480 352C533 352 576 395 576 448L576 458.7C576 470.5 566.4 480 554.7 480L475.9 480C478.6 472.5 480 464.4 480 456L480 448C480 413.9 469.4 382.3 451.2 356.4zM188.8 356.4C170.6 382.3 160 413.9 160 448L160 456C160 464.4 161.4 472.5 164.1 480L85.3 480C73.6 480 64 470.4 64 458.7L64 448C64 395 107 352 160 352C170 352 179.7 353.5 188.8 356.4zM104 256C104 225.1 129.1 200 160 200C190.9 200 216 225.1 216 256C216 286.9 190.9 312 160 312C129.1 312 104 286.9 104 256zM256 240C256 204.7 284.7 176 320 176C355.3 176 384 204.7 384 240C384 275.3 355.3 304 320 304C284.7 304 256 275.3 256 240zM208 448C208 386.1 258.1 336 320 336C381.9 336 432 386.1 432 448L432 456C432 469.3 421.3 480 408 480L232 480C218.7 480 208 469.3 208 456L208 448z"
              />
            </svg>
            <div>
              <h3>Clients présents</h3>
              <p id="affichageClients" className="text-3xl font-bold">
                {loading ? "--" : (stats?.clients_actifs ?? "--")}
              </p>
              <p>Voir les clients</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="60"
              width="60"
              viewBox="0 0 640 640"
            >
              <path
                fill="rgb(0, 255, 56)"
                d="M128 96C92.7 96 64 124.7 64 160L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 256C576 220.7 547.3 192 512 192L136 192C122.7 192 112 181.3 112 168C112 154.7 122.7 144 136 144L520 144C533.3 144 544 133.3 544 120C544 106.7 533.3 96 520 96L128 96zM480 320C497.7 320 512 334.3 512 352C512 369.7 497.7 384 480 384C462.3 384 448 369.7 448 352C448 334.3 462.3 320 480 320z"
              />
            </svg>
            <div>
              <h3>Revenus du jour</h3>
              <p id="affichageRevenu" className="text-3xl font-bold">
                {loading ? "-- Ar" : `${stats?.recette_jour ?? 0} Ar`}
              </p>
              <p>Voir les rapports</p>
            </div>
          </div>
        </section>
      </div>

      {/* Tableau des sessions */}
      <div className="p-4">
        <table className="table-auto border-collapse border border-blue-400 w-full text-center">
          <caption>Sessions en cours</caption>
          <thead className="bg-purple-500 text-lg">
            <tr>
              <th className="p-2 border">Machine</th>
              <th className="p-2 border">Clients</th>
              <th className="p-2 border">Début</th>
              <th className="p-2 border">Durée</th>
              <th className="p-2 border">Fin</th>
              <th className="p-2 border">Montant</th>
              <th className="p-2 border">Fait</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-500">
            {sessionsList.length > 0 ? (
              sessionsList.map((session) => (
                <tr key={session.id} className="hover:bg-purple-900">
                  <td className="px-4 py-2 border">{session.machine}</td>
                  <td className="px-4 py-2 border">{session.clients}</td>
                  <td className="px-4 py-2 border">{session.debut}</td>
                  <td className="px-4 py-2 border">{session.duree}</td>
                  <td className="px-4 py-2 border">{session.fin}</td>
                  <td className="px-4 py-2 border">{session.montant}</td>
                  <td className="px-4 py-2 border">{session.statut}</td>
                  <td className="px-4 py-2 border">
                    <button
                      className="p-2 bg-red-500 text-white border rounded font-medium hover:bg-red-900 hover:scale-105 cursor-pointer"
                      onClick={() => arreter(session.id)}
                    >
                      Arrêter
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-2 border text-center" colSpan="8">
                  Aucune session en cours
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
