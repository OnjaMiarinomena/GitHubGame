import { useEffect, useState, useCallback } from "react";
import "@/assets/styles/machine.css";

const API_URL = "http://127.0.0.1:5555";
const emptyForm = { id: null, nom: "", type: "" };

export default function Machine() {
  const [machines, setMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);

  const loadMachines = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/machines`);
      if (response.ok) {
        setMachines(await response.json());
        setError("");
      }
    } catch (err) {
      console.error("Erreur chargement machines:", err);
      setError("Impossible de contacter le serveur Flask.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMachines();
    const interval = setInterval(loadMachines, 5000);
    return () => clearInterval(interval);
  }, [loadMachines]);

  const filteredMachines = machines.filter((machine) =>
    machine.nom.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalMachines = machines.length;
  const disponibles = machines.filter((m) => m.statut === "Libre").length;
  const enCours = machines.filter((m) => m.statut === "Occupée").length;
  const horsService = machines.filter((m) => m.statut === "Hors service").length;

  const openAddForm = () => {
    setForm(emptyForm);
    setEditing(false);
    setShowForm(true);
  };

  const openEditForm = (machine) => {
    setForm({ id: machine.id, nom: machine.nom, type: machine.type || "" });
    setEditing(true);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(
        editing ? `${API_URL}/api/machines/${form.id}` : `${API_URL}/api/machines`,
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nom: form.nom, type: form.type }),
        },
      );
      if (response.ok) {
        setShowForm(false);
        setForm(emptyForm);
        loadMachines();
      } else {
        const data = await response.json();
        setError(data.error || "Impossible d'enregistrer cette machine.");
      }
    } catch (err) {
      console.error("Erreur enregistrement machine:", err);
      setError("Impossible de contacter le serveur Flask.");
    }
  };

  const toggleHorsService = async (machine) => {
    const nouveauStatut = machine.statut === "Hors service" ? "Libre" : "Hors service";
    try {
      const response = await fetch(`${API_URL}/api/machines/${machine.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: nouveauStatut }),
      });
      if (response.ok) {
        loadMachines();
      } else {
        const data = await response.json();
        setError(data.error || "Impossible de mettre à jour le statut.");
      }
    } catch (err) {
      console.error("Erreur changement statut machine:", err);
      setError("Impossible de contacter le serveur Flask.");
    }
  };

  const handleDelete = async (machine) => {
    if (!window.confirm(`Supprimer la machine "${machine.nom}" ?`)) return;
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/machines/${machine.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadMachines();
      } else {
        const data = await response.json();
        setError(data.error || "Impossible de supprimer cette machine.");
      }
    } catch (err) {
      console.error("Erreur suppression machine:", err);
      setError("Impossible de contacter le serveur Flask.");
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      {/* Titre principal */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2 text-[#a4b3f7]">
          Gestion des Machines
        </h2>
        <p className="text-center text-gray-400 text-lg">
          Gérez vos machines gaming de manière efficace et intuitive.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <article className="articlefort flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" height="50" width="50" viewBox="0 0 640 640">
              <path
                fill="rgb(116, 192, 252)"
                d="M380.8 96C372.7 110.1 368 126.5 368 144L368 160L96 160L96 384L368 384L368 448L96 448C60.7 448 32 419.3 32 384L32 160C32 124.7 60.7 96 96 96L380.8 96zM368 496C368 513.5 372.7 529.9 380.8 544L152 544C138.7 544 128 533.3 128 520C128 506.7 138.7 496 152 496L368 496zM464 96L560 96C586.5 96 608 117.5 608 144L608 496C608 522.5 586.5 544 560 544L464 544C437.5 544 416 522.5 416 496L416 144C416 117.5 437.5 96 464 96zM488 160C474.7 160 464 170.7 464 184C464 197.3 474.7 208 488 208L536 208C549.3 208 560 197.3 560 184C560 170.7 549.3 160 536 160L488 160zM488 256C474.7 256 464 266.7 464 280C464 293.3 474.7 304 488 304L536 304C549.3 304 560 293.3 560 280C560 266.7 549.3 256 536 256L488 256zM544 400C544 382.3 529.7 368 512 368C494.3 368 480 382.3 480 400C480 417.7 494.3 432 512 432C529.7 432 544 417.7 544 400z"
              />
            </svg>
            <div>
              <h3 className="text-xl">Total des machines</h3>
              <p className="text-xl font-bold">{totalMachines}</p>
            </div>
          </article>

          <article className="articlefort flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" height="50" width="50" viewBox="0 0 640 640">
              <path
                fill="rgb(255, 212, 59)"
                d="M544 448C561.7 448 576 462.3 576 480C576 497.7 561.7 512 544 512L96 512C78.3 512 64 497.7 64 480C64 462.3 78.3 448 96 448L544 448zM320 96C417.2 96 496 174.8 496 272C496 288.6 493.6 304.7 489.3 320L544 320C561.7 320 576 334.3 576 352C576 369.7 561.7 384 544 384L439.8 384C428 384 417.1 377.5 411.6 367.1C406.1 356.7 406.7 344 413.2 334.2C425.1 316.4 432 295.1 432 272C432 210.1 381.9 160 320 160C258.1 160 208 210.1 208 272C208 295.1 214.9 316.4 226.8 334.2C233.4 344 234 356.7 228.4 367.1C222.8 377.5 212.1 384 200.2 384L96 384C78.3 384 64 369.7 64 352C64 334.3 78.3 320 96 320L150.8 320C146.5 304.7 144 288.6 144 272C144 174.8 222.8 96 320 96z"
              />
            </svg>
            <div>
              <h3 className="text-xl">Disponibles</h3>
              <p className="text-xl font-bold">{disponibles}</p>
            </div>
          </article>

          <article className="articlefort flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" height="50" width="50" viewBox="0 0 640 640">
              <path
                fill="rgb(177, 151, 252)"
                d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"
              />
            </svg>
            <div>
              <h3 className="text-xl">En cours d'utilisation</h3>
              <p className="text-xl font-bold">{enCours}</p>
            </div>
          </article>

          <article className="articlefort flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" height="50" width="50" viewBox="0 0 640 640">
              <path
                fill="rgb(255, 0, 184)"
                d="M354.4 83.8C359.4 71.8 371.1 64 384 64L544 64C561.7 64 576 78.3 576 96L576 256C576 268.9 568.2 280.6 556.2 285.6C544.2 290.6 530.5 287.8 521.3 278.7L464 221.3L310.6 374.6C298.1 387.1 277.8 387.1 265.3 374.6C252.8 362.1 252.8 341.8 265.3 329.3L418.7 176L361.4 118.6C352.2 109.4 349.5 95.7 354.5 83.7zM64 240C64 195.8 99.8 160 144 160L224 160C241.7 160 256 174.3 256 192C256 209.7 241.7 224 224 224L144 224C135.2 224 128 231.2 128 240L128 496C128 504.8 135.2 512 144 512L400 512C408.8 512 416 504.8 416 496L416 416C416 398.3 430.3 384 448 384C465.7 384 480 398.3 480 416L480 496C480 540.2 444.2 576 400 576L144 576C99.8 576 64 540.2 64 496L64 240z"
              />
            </svg>
            <div>
              <h3 className="text-xl">Hors service</h3>
              <p className="text-xl font-bold">{horsService}</p>
            </div>
          </article>
        </div>
      </section>

      {/* Barre de recherche et action */}
      <section className="sectionall flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="search"
            placeholder="Rechercher une machine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 px-4 bg-[#0b1326] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadMachines}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition cursor-pointer"
          >
            <i className="fa-solid fa-sync mr-2"></i> Actualiser
          </button>
          <button
            onClick={openAddForm}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition cursor-pointer"
          >
            <i className="fa-solid fa-plus mr-2"></i> Ajouter une machine
          </button>
        </div>
      </section>

      {showForm && (
        <section className="sectionall mt-4">
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nom</label>
              <input
                type="text"
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="bg-[#0b1326] text-white px-3 py-2 rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Type</label>
              <input
                type="text"
                placeholder="Ex: Pc de jeu, Console, Arcade"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="bg-[#0b1326] text-white px-3 py-2 rounded border border-gray-600"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition cursor-pointer"
            >
              {editing ? "Enregistrer" : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded transition cursor-pointer"
            >
              Annuler
            </button>
          </form>
        </section>
      )}

      {/* Tableau des machines */}
      <section className="mt-6 machine-table-container">
        <table className="machine-table border border-gray-700">
          <thead>
            <tr>
              <th>Machine</th>
              <th>Statut</th>
              <th>Session actuelle</th>
              <th>Temps d'utilisation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMachines.length > 0 ? (
              filteredMachines.map((machine) => (
                <tr key={machine.id}>
                  <td className="font-semibold">{machine.nom}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        machine.statut === "Libre"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : machine.statut === "Hors service"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {machine.statut}
                    </span>
                  </td>
                  <td>{machine.session_client || "Aucune"}</td>
                  <td>{machine.session_temps || "0m"}</td>
                  <td className="space-x-2">
                    <button
                      onClick={() => openEditForm(machine)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-sm transition cursor-pointer"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => toggleHorsService(machine)}
                      disabled={machine.statut === "Occupée"}
                      className="bg-slate-600 hover:bg-slate-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-1 px-3 rounded text-sm transition cursor-pointer"
                    >
                      {machine.statut === "Hors service" ? "Remettre en service" : "Hors service"}
                    </button>
                    <button
                      onClick={() => handleDelete(machine)}
                      disabled={machine.statut === "Occupée"}
                      className="bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-1 px-3 rounded text-sm transition cursor-pointer"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-400">
                  {loading ? "Chargement..." : "Aucune machine trouvée."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
