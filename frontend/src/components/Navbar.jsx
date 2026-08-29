import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        background: "#1a1a1a",
        padding: "15px",
        color: "#fff",
        display: "flex",
        gap: "20px",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "1.2rem" }}>GameRoom Manager</h2>
      <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>
        Dashboard
      </Link>
      <Link to="/machines" style={{ color: "#fff", textDecoration: "none" }}>
        Machines
      </Link>
      <Link to="/clients" style={{ color: "#fff", textDecoration: "none" }}>
        Clients
      </Link>
      <Link to="/paiements" style={{ color: "#fff", textDecoration: "none" }}>
        Paiements
      </Link>
    </nav>
  );
}
