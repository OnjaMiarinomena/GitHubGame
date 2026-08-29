import { useEffect, useState, useCallback } from "react";
import "@/assets/styles/session.css";

const API_URL = "http://127.0.0.1:5555";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [machinesLibres, setMachinesLibres] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Formulaire de démarrage de session
  const [machineId, setMachineId] = useState("");
  const [clientId, setClientId] = useState("");
  const [jeu, setJeu] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [sessionsRes, machinesRes, clientsRes] = await Promise.all([
        fetch(`${API_URL}/api/sessions`),
        fetch(`${API_URL}/api/machines`),
        fetch(`${API_URL}/api/clients`),
      ]);

      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (machinesRes.ok) {
        const allMachines = await machinesRes.json();
        setMachinesLibres(allMachines.filter((m) => m.statut === "Libre"));
      }
      if (clientsRes.ok) setClients(await clientsRes.json());
      setError("");
    } catch (err) {
      console.error("Erreur chargement sessions:", err);
      setError("Impossible de contacter le serveur Flask.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 5000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const handleStop = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/${id}/stop`, {
        method: "PUT",
      });
      if (response.ok) {
        loadAll();
      } else {
        const data = await response.json();
        setError(data.error || "Impossible d'arrêter la session");
      }
    } catch (err) {
      console.error("Erreur arrêt session:", err);
      setError("Impossible de contacter le serveur Flask.");
    }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    if (!machineId || !clientId) {
      setError("Choisissez une machine et un client");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machine_id: Number(machineId),
          client_id: Number(clientId),
          jeu,
        }),
      });
      if (response.ok) {
        setMachineId("");
        setClientId("");
        setJeu("");
        setShowForm(false);
        loadAll();
      } else {
        const data = await response.json();
        setError(data.error || "Impossible de démarrer la session");
      }
    } catch (err) {
      console.error("Erreur démarrage session:", err);
      setError("Impossible de contacter le serveur Flask.");
    } finally {
      setSubmitting(false);
    }
  };

  const tempsTotalMinutes = sessions.reduce((total, s) => {
    const match = s.duree?.match(/(?:(\d+)h)?\s*(\d+)?m?/);
    if (!match) return total;
    const h = parseInt(match[1] || "0", 10);
    const m = parseInt(match[2] || "0", 10);
    return total + h * 60 + m;
  }, 0);

  const montantEnCours = sessions.reduce((total, s) => {
    const n = parseInt((s.montant || "0").replace(/\D/g, ""), 10);
    return total + (Number.isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div className="parent">
      <div className="main">
        {error && (
          <div className="m-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Stats Section */}
        <section className="stats">
          <div className="card flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="45"
              width="45"
              viewBox="0 0 640 640"
            >
              <path
                fill="rgb(255, 0, 184)"
                d="M160 64C142.3 64 128 78.3 128 96C128 113.7 142.3 128 160 128L160 139C160 181.4 176.9 222.1 206.9 252.1L274.8 320L206.9 387.9C176.9 417.9 160 458.6 160 501L160 512C142.3 512 128 526.3 128 544C128 561.7 142.3 576 160 576L480 576C497.7 576 512 561.7 512 544C512 526.3 497.7 512 480 512L480 501C480 458.6 463.1 417.9 433.1 387.9L365.2 320L433.1 252.1C463.1 222.1 480 181.4 480 139L480 128C497.7 128 512 113.7 512 96C512 78.3 497.7 64 480 64L160 64zM224 139L224 128L416 128L416 139C416 164.5 405.9 188.9 387.9 206.9L320 274.8L252.1 206.9C234.1 188.9 224 164.4 224 139z"
              />
            </svg>
            <div>
              <h2>{sessions.length}</h2>
              <p>Sessions actives</p>
            </div>
          </div>

          <div className="card flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="45"
              width="45"
              viewBox="0 0 640 640"
            >
              <path
                fill="rgb(255, 212, 59)"
                d="M568.4 196.5C563.9 207 550 206.3 543.5 196.9C515.7 156.9 477.4 124.7 432.5 104.3C422.1 99.6 418.8 86 428.4 79.7C443.4 69.8 461.4 64 480.7 64C533.3 64 575.9 106.6 575.9 159.2C575.9 172.4 573.2 185 568.3 196.5zM96.5 196.9C90 206.3 76 207 71.6 196.5C66.7 185 64 172.4 64 159.2C64 106.6 106.6 64 159.2 64C178.5 64 196.5 69.8 211.5 79.7C221.1 86 217.8 99.6 207.4 104.3C162.6 124.7 124.3 156.9 96.4 196.9zM454.2 531.4C416.8 559.4 370.3 576 320 576C269.7 576 223.2 559.4 185.9 531.4L150.6 566.6C138.1 579.1 117.8 579.1 105.3 566.6C92.8 554.1 92.8 533.8 105.3 521.3L140.5 486.1C112.6 448.8 96 402.3 96 352C96 228.3 196.3 128 320 128C443.7 128 544 228.3 544 352C544 402.3 527.4 448.8 499.4 486.2L534.6 521.4C547.1 533.9 547.1 554.2 534.6 566.7C522.1 579.2 501.8 579.2 489.3 566.7L454.1 531.5zM344 248C344 234.7 333.3 224 320 224C306.7 224 296 234.7 296 248L296 352C296 358.4 298.5 364.5 303 369L359 425C368.4 434.4 383.6 434.4 392.9 425C402.2 415.6 402.3 400.4 392.9 391.1L343.9 342.1L343.9 248z"
              />
            </svg>
            <div>
              <h2>{Math.floor(tempsTotalMinutes / 60)}h {tempsTotalMinutes % 60}m</h2>
              <p>Temps Total</p>
            </div>
          </div>

          <div className="card flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="45"
              width="45"
              viewBox="0 0 640 640"
            >
              <path
                fill="rgb(99, 230, 190)"
                d="M320 128C426 128 512 214 512 320C512 426 426 512 320 512C254.8 512 197.1 479.5 162.4 429.7C152.3 415.2 132.3 411.7 117.8 421.8C103.3 431.9 99.8 451.9 109.9 466.4C156.1 532.6 233 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C234.3 64 158.5 106.1 112 170.7L112 144C112 126.3 97.7 112 80 112C62.3 112 48 126.3 48 144L48 256C48 273.7 62.3 288 80 288L104.6 288C105.1 288 105.6 288 106.1 288L192.1 288C209.8 288 224.1 273.7 224.1 256C224.1 238.3 209.8 224 192.1 224L153.8 224C186.9 166.6 249 128 320 128zM344 216C344 202.7 333.3 192 320 192C306.7 192 296 202.7 296 216L296 320C296 326.4 298.5 332.5 303 337L375 409C384.4 418.4 399.6 418.4 408.9 409C418.2 399.6 418.3 384.4 408.9 375.1L343.9 310.1L343.9 216z"
              />
            </svg>
            <div>
              <h2>{montantEnCours} Ar</h2>
              <p>En cours</p>
            </div>
          </div>

          <div className="card flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="45"
              width="45"
              viewBox="0 0 640 640"
            >
              <path
                fill="rgb(116, 192, 252)"
                d="M64 160C64 124.7 92.7 96 128 96L512 96C547.3 96 576 124.7 576 160L576 400L512 400L512 160L128 160L128 400L64 400L64 160zM0 467.2C0 456.6 8.6 448 19.2 448L620.8 448C631.4 448 640 456.6 640 467.2C640 509.6 605.6 544 563.2 544L76.8 544C34.4 544 0 509.6 0 467.2zM281 273L250 304L281 335C290.4 344.4 290.4 359.6 281 368.9C271.6 378.2 256.4 378.3 247.1 368.9L199.1 320.9C189.7 311.5 189.7 296.3 199.1 287L247.1 239C256.5 229.6 271.7 229.6 281 239C290.3 248.4 290.4 263.6 281 272.9zM393 239L441 287C450.4 296.4 450.4 311.6 441 320.9L393 368.9C383.6 378.3 368.4 378.3 359.1 368.9C349.8 359.5 349.7 344.3 359.1 335L390.1 304L359.1 273C349.7 263.6 349.7 248.4 359.1 239.1C368.5 229.8 383.7 229.7 393 239.1z"
              />
            </svg>
            <div>
              <h2>{machinesLibres.length}</h2>
              <p>Machines libres</p>
            </div>
          </div>
        </section>

        {/* Démarrer une nouvelle session */}
        <section className="session-info">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2>Sessions en cours</h2>
              <p>Voici la liste des sessions actuellement en cours :</p>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {showForm ? "Annuler" : "+ Démarrer une session"}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleStart}
              className="mt-4 p-4 bg-slate-800/60 rounded-xl flex flex-wrap gap-3 items-end"
            >
              <div>
                <label className="block text-sm text-slate-300 mb-1">Machine</label>
                <select
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  required
                  className="bg-slate-900 text-white px-3 py-2 rounded border border-slate-600"
                >
                  <option value="">-- Choisir --</option>
                  {machinesLibres.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Client</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  className="bg-slate-900 text-white px-3 py-2 rounded border border-slate-600"
                >
                  <option value="">-- Choisir --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Jeu (optionnel)</label>
                <input
                  type="text"
                  value={jeu}
                  onChange={(e) => setJeu(e.target.value)}
                  placeholder="Ex: FIFA 26"
                  className="bg-slate-900 text-white px-3 py-2 rounded border border-slate-600"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                {submitting ? "Démarrage..." : "Démarrer"}
              </button>
            </form>
          )}

          <div className="overflow-x-auto mt-4">
            <table className="table-auto border-collapse border border-blue-400/30 w-full text-center">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="px-4 py-3 border border-blue-400/30">Clients</th>
                  <th className="px-4 py-3 border border-blue-400/30">Machines</th>
                  <th className="px-4 py-3 border border-blue-400/30">Jeux</th>
                  <th className="px-4 py-3 border border-blue-400/30">Début</th>
                  <th className="px-4 py-3 border border-blue-400/30">Durée</th>
                  <th className="px-4 py-3 border border-blue-400/30">Montant</th>
                  <th className="px-4 py-3 border border-blue-400/30">Statut</th>
                  <th className="px-4 py-3 border border-blue-400/30">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sessions.length > 0 ? (
                  sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-2 border border-blue-400/20">{s.clients}</td>
                      <td className="px-4 py-2 border border-blue-400/20">{s.machine}</td>
                      <td className="px-4 py-2 border border-blue-400/20">{s.jeu}</td>
                      <td className="px-4 py-2 border border-blue-400/20">{s.debut}</td>
                      <td className="px-4 py-2 border border-blue-400/20">{s.duree}</td>
                      <td className="px-4 py-2 border border-blue-400/20 text-green-400 font-semibold">
                        {s.montant}
                      </td>
                      <td className="px-4 py-2 border border-blue-400/20">
                        <span className="bg-green-500/20 text-green-400 font-bold px-3 py-1 rounded-full border border-green-500/40">
                          {s.statut}
                        </span>
                      </td>
                      <td className="px-4 py-2 border border-blue-400/20">
                        <button
                          onClick={() => handleStop(s.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-200 cursor-pointer"
                        >
                          Arrêter
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-4 text-center text-gray-400">
                      {loading ? "Chargement..." : "Aucune session en cours"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
