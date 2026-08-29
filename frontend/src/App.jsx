import { useEffect, useState } from "react";
import {
  NavLink,
  Route,
  BrowserRouter as Router,
  Routes,
  Outlet,
  Navigate,
} from "react-router-dom";

// Importation des pages
import Login from "@/pages/Login";
import Dash from "@/pages/Dash";
import Clients from "@/pages/Clients";
import Machine from "@/pages/Machine";
import Sessions from "@/pages/Sessions";
import Paiements from "@/pages/Paiement";
import Rapports from "@/pages/Rapports";

function Layout() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-shell min-h-screen flex text-white bg-slate-950">
      {/* Sidebar Navigation */}
      <aside className="sidebar w-1/5 min-w-[250px] bg-slate-900/60 border-r border-white/10 p-6 flex flex-col justify-between backdrop-blur-md">
        <div>
          <div className="logo flex items-center gap-4 mb-8">
            <span>
              <h2 className="text-2xl font-bold text-indigo-200">GameRoom</h2>
              <h3 className="text-xl font-bold text-purple-400">Manager</h3>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="50"
              width="50"
              viewBox="0 0 640 640"
            >
              <path
                fill="rgb(255, 212, 59)"
                d="M603 436.3C591.7 450.5 564.2 460.6 564.2 460.6L359.1 534.2L359.1 479.9L510 426.1C527.1 420 529.8 411.3 515.8 406.7C501.9 402.1 476.7 403.4 459.6 409.6L359.1 445.1L359.1 388.7C382.3 380.9 406.2 375.1 434.8 371.9C475.7 367.4 525.7 372.5 565 387.4C609.2 401.4 614.2 422.1 603 436.3zM378.6 343.8L378.6 204.8C378.6 188.5 375.6 173.5 360.3 169.2C348.6 165.4 341.3 176.3 341.3 192.6L341.3 540.5L247.5 510.7L247.5 96C287.4 103.4 345.5 120.9 376.7 131.4C456.2 158.7 483.1 192.7 483.1 269.2C483.1 343.7 437.1 372 378.6 343.8zM75.3 474.2C29.9 461.4 22.3 434.7 43 419.4C62.1 405.2 94.7 394.5 94.7 394.5L229.2 346.7L229.2 401.2L132.4 435.8C115.3 441.9 112.7 450.6 126.6 455.2C140.5 459.8 165.7 458.5 182.8 452.3L229.2 435.4L229.2 484.2C177.6 493.5 127.8 491.5 75.3 474.2z"
              />
            </svg>
          </div>

          <ul className="menu space-y-2">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/30"
                      : "text-slate-300 hover:bg-purple-500/20 hover:text-white"
                  }`
                }
              >
                <i className="fa-solid fa-house"></i> Tableau de bord
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/sessions"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/30"
                      : "text-slate-300 hover:bg-purple-500/20 hover:text-white"
                  }`
                }
              >
                <i className="fa-solid fa-clock"></i> Sessions en cours
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/machines"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/30"
                      : "text-slate-300 hover:bg-purple-500/20 hover:text-white"
                  }`
                }
              >
                <i className="fa-solid fa-gamepad"></i> Machines
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/clients"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/30"
                      : "text-slate-300 hover:bg-purple-500/20 hover:text-white"
                  }`
                }
              >
                <i className="fa-solid fa-users"></i> Clients
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/paiements"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/30"
                      : "text-slate-300 hover:bg-purple-500/20 hover:text-white"
                  }`
                }
              >
                <i className="fa-solid fa-wallet"></i> Paiement
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/30"
                      : "text-slate-300 hover:bg-purple-500/20 hover:text-white"
                  }`
                }
              >
                <i className="fa-solid fa-chart-line"></i> Rapports
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Widget Horloge */}
        <div className="flex items-center p-4 my-2 border-t border-slate-700 justify-between gap-3 bg-slate-900/40 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="32"
            width="32"
            viewBox="0 0 640 640"
          >
            <path
              fill="rgb(227, 0, 255)"
              d="M568.4 196.5C563.9 207 550 206.3 543.5 196.9C515.7 156.9 477.4 124.7 432.5 104.3C422.1 99.6 418.8 86 428.4 79.7C443.4 69.8 461.4 64 480.7 64C533.3 64 575.9 106.6 575.9 159.2C575.9 172.4 573.2 185 568.3 196.5zM96.5 196.9C90 206.3 76 207 71.6 196.5C66.7 185 64 172.4 64 159.2C64 106.6 106.6 64 159.2 64C178.5 64 196.5 69.8 211.5 79.7C221.1 86 217.8 99.6 207.4 104.3C162.6 124.7 124.3 156.9 96.4 196.9zM454.2 531.4C416.8 559.4 370.3 576 320 576C269.7 576 223.2 559.4 185.9 531.4L150.6 566.6C138.1 579.1 117.8 579.1 105.3 566.6C92.8 554.1 92.8 533.8 105.3 521.3L140.5 486.1C112.6 448.8 96 402.3 96 352C96 228.3 196.3 128 320 128C443.7 128 544 228.3 499.4 486.2L534.6 521.4C547.1 533.9 547.1 554.2 534.6 566.7C522.1 579.2 501.8 579.2 489.3 566.7L454.1 531.5zM344 248C344 234.7 333.3 224 320 224C306.7 224 296 234.7 296 248L296 352C296 358.4 298.5 364.5 303 369L359 425C368.4 434.4 383.6 434.4 392.9 425C402.2 415.6 402.3 400.4 392.9 391.1L343.9 342.1L343.9 248z"
            />
          </svg>
          <div>
            <p className="text-xs font-medium text-slate-400">
              Heure actuelle:
            </p>
            <p className="text-lg font-bold text-purple-400">
              {time || "--:--:--"}
            </p>
          </div>
        </div>
      </aside>

      {/* Zone principale */}
      <div className="app-content flex-1 flex flex-col">
        {/* Barre supérieure */}
        <header className="topbar h-20 px-8 flex justify-between items-center bg-slate-900/60 border-b border-white/10 backdrop-blur-md">
          <div>
            <h2 className="text-2xl font-bold">Bonjour Gérant !</h2>
            <p className="text-slate-400 text-sm">
              Voici un aperçu de votre interface aujourd'hui.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-white rounded-full transition-colors">
              <i className="fa-solid fa-bell"></i>
            </button>
            <NavLink
              to="/"
              className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              <span>Déconnexion</span>
              <i className="fa-solid fa-sign-out-alt"></i>
            </NavLink>
          </div>
        </header>

        {/* Contenu dynamique */}
        <div className="flex-1 bg-slate-950/40 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 1. La route racine ( / ) affiche UNIQUEMENT la page Login sans Sidebar */}
        <Route path="/" element={<Login />} />

        {/* 2. Les routes sous Layout affichent la Sidebar */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dash />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/machines" element={<Machine />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/paiements" element={<Paiements />} />
          <Route path="/reports" element={<Rapports />} />
        </Route>

        {/* Redirection vers Login si route inconnue */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}