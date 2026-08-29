import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import "@/assets/styles/clients.css";

const API_URL = "http://127.0.0.1:5555";

const emptyForm = { id: null, nom: "", email: "", telephone: "" };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);

  // Chargement de la liste des clients depuis Flask
  const loadClients = useCallback(() => {
    axios
      .get(`${API_URL}/api/clients`)
      .then((response) => {
        setClients(response.data);
        setError("");
      })
      .catch((err) => {
        console.error("Erreur de chargement des clients :", err);
        setError("Impossible de contacter le serveur Flask.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadClients();
    const interval = setInterval(loadClients, 5000);
    return () => clearInterval(interval);
  }, [loadClients]);

  // Filtre pour la recherche
  const clientsFiltres = clients.filter(
    (c) =>
      c.nom?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.telephone?.includes(search),
  );

  const openAddForm = () => {
    setForm(emptyForm);
    setEditing(false);
    setShowForm(true);
  };

  const openEditForm = (client) => {
    setForm({
      id: client.id,
      nom: client.nom,
      email: client.email || "",
      telephone: client.telephone || "",
    });
    setEditing(true);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await axios.put(`${API_URL}/api/clients/${form.id}`, {
          nom: form.nom,
          email: form.email,
          telephone: form.telephone,
        });
      } else {
        await axios.post(`${API_URL}/api/clients`, {
          nom: form.nom,
          email: form.email,
          telephone: form.telephone,
        });
      }
      setShowForm(false);
      setForm(emptyForm);
      loadClients();
    } catch (err) {
      console.error("Erreur enregistrement client :", err);
      setError(err.response?.data?.error || "Impossible d'enregistrer ce client.");
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Supprimer le client "${client.nom}" ?`)) return;
    setError("");
    try {
      await axios.delete(`${API_URL}/api/clients/${client.id}`);
      loadClients();
    } catch (err) {
      console.error("Erreur suppression client :", err);
      setError(err.response?.data?.error || "Impossible de supprimer ce client.");
    }
  };

  return (
    <div className="parent">
      <div className="main">
        {error && (
          <div className="m-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Section Actions & Recherche */}
        <section className="content1 flex items-center justify-between">
          <div>
            <h3>Gestion des clients</h3>
            <p>Consultez et gérez les informations de vos clients.</p>
          </div>
          <div>
            <input
              type="text"
              placeholder="Rechercher un client..."
              className="text-black font-bold p-2 rounded"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <button className="cursor-pointer" onClick={openAddForm}>
              Ajouter Client
            </button>
          </div>
        </section>

        {showForm && (
          <section className="content1">
            <form
              onSubmit={handleSubmit}
              className="flex flex-wrap gap-3 items-end"
            >
              <div>
                <label className="block text-sm text-slate-300 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="bg-slate-900 text-white px-3 py-2 rounded border border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-slate-900 text-white px-3 py-2 rounded border border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="bg-slate-900 text-white px-3 py-2 rounded border border-slate-600"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                {editing ? "Enregistrer" : "Ajouter"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>
            </form>
          </section>
        )}

        {/* Tableau des Clients */}
        <section className="content2">
          <table className="table-auto w-full border-collapse border border-gray-300 mt-4">
            <thead className="bg-purple-500 text-white font-bold text-lg border border-gray-300 p-4">
              <tr className="border border-gray-300 p-4">
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="clientTableBody">
              {clientsFiltres.length > 0 ? (
                clientsFiltres.map((client) => (
                  <tr key={client.id} className="border border-gray-300 p-4">
                    <td>{client.nom}</td>
                    <td>{client.email || "N/A"}</td>
                    <td>{client.telephone || "N/A"}</td>
                    <td>
                      <span
                        className={
                          client.statut === "Présent"
                            ? "text-green-400 font-semibold"
                            : "text-slate-400 font-semibold"
                        }
                      >
                        {client.statut || "Absent"}
                      </span>
                    </td>
                    <td className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditForm(client)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border border-gray-300 p-4">
                  <td colSpan="5" className="text-center py-4 text-gray-400">
                    {loading ? "Chargement..." : "Aucun client trouvé."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
