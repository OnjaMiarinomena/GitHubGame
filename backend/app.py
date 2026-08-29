import os
import sqlite3
from datetime import datetime, date
from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "database.db")

# Clé secrète pour les sessions
app.secret_key = 'votre_phrase_secrete_tres_tres_super_secrete'

# Tarif horaire unique appliqué à toutes les sessions (en Ariary)
TARIF_HORAIRE_AR = 3000

# ==========================================
# GESTION DU CORS (SANS BIBLIOTHÈQUE EXTERNE)
# ==========================================
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    # Domaines frontend autorisés
    allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"]
    
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

# Gestion globale pour intercepter toutes les requêtes preflight (OPTIONS)
@app.before_request
def handle_options_requests():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response

# ==========================================
# BASE DE DONNÉES
# ==========================================

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Pour récupérer les colonnes sous forme de dict
    conn.execute('PRAGMA foreign_keys = ON')
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()

    # Table Utilisateurs
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')

    # Table Machines
    c.execute('''
        CREATE TABLE IF NOT EXISTS machines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            type TEXT,
            statut TEXT DEFAULT 'Libre'
        )
    ''')

    # Table Clients
    c.execute('''
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            email TEXT,
            telephone TEXT,
            statut TEXT DEFAULT 'Absent'
        )
    ''')

    # Table Sessions (une session = un client sur une machine, du début à la fin)
    c.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id INTEGER NOT NULL,
            client_id INTEGER NOT NULL,
            jeu TEXT,
            debut TEXT NOT NULL,
            fin TEXT,
            duree_minutes INTEGER,
            montant INTEGER,
            statut TEXT DEFAULT 'En cours',
            FOREIGN KEY (machine_id) REFERENCES machines (id),
            FOREIGN KEY (client_id) REFERENCES clients (id)
        )
    ''')

    # Table Paiements (générés automatiquement à la fin de chaque session)
    c.execute('''
        CREATE TABLE IF NOT EXISTS paiements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            client_id INTEGER NOT NULL,
            montant INTEGER NOT NULL,
            date TEXT NOT NULL,
            statut TEXT DEFAULT 'Terminé',
            FOREIGN KEY (session_id) REFERENCES sessions (id),
            FOREIGN KEY (client_id) REFERENCES clients (id)
        )
    ''')

    # Crée un compte administrateur par défaut s'il n'existe pas déjà
    # (vérifié par nom d'utilisateur, et non par le nombre total d'utilisateurs,
    # pour ne jamais perdre l'accès admin même si d'autres comptes ont déjà été créés)
    c.execute('SELECT COUNT(*) AS count FROM users WHERE username = ?', ('admin',))
    admin_count = c.fetchone()['count']
    if admin_count == 0:
        default_password = generate_password_hash('admin123')
        c.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            ('admin', 'admin@example.com', default_password)
        )

    # Créé quelques machines de démonstration si la table est vide
    c.execute('SELECT COUNT(*) AS count FROM machines')
    if c.fetchone()['count'] == 0:
        machines = [
            ('PC Gamer 1', 'Pc de jeu', 'Libre'),
            ('PC Gamer 2', 'Pc de jeu', 'Libre'),
            ('PC Gamer 3', 'Pc de jeu', 'Libre'),
            ('Console PS5', 'Console', 'Libre'),
            ('Console PS4', 'Console', 'Libre'),
            ('Xbox Series X', 'Console', 'Libre'),
            ("Nintendo Switch", 'Console', 'Libre'),
            ("Jeu d'arcade", 'Arcade', 'Libre'),
        ]
        c.executemany('INSERT INTO machines (nom, type, statut) VALUES (?, ?, ?)', machines)

    # Créé quelques clients de démonstration si la table est vide
    c.execute('SELECT COUNT(*) AS count FROM clients')
    if c.fetchone()['count'] == 0:
        clients = [
            ('Jean Dupont', 'jean.dupont@example.com', '0601020304', 'Absent'),
            ('Marie Curie', 'marie.curie@example.com', '0605060708', 'Absent'),
        ]
        c.executemany('INSERT INTO clients (nom, email, telephone, statut) VALUES (?, ?, ?, ?)', clients)

    conn.commit()
    conn.close()
    print("✅ Base de données 'database.db' prête")


def row_to_dict(row):
    return dict(row) if row else None


def calculer_duree_et_montant(debut_str, fin_dt):
    """Calcule la durée (en minutes) et le montant (Ar) d'une session."""
    debut_dt = datetime.fromisoformat(debut_str)
    duree_secondes = (fin_dt - debut_dt).total_seconds()
    duree_minutes = max(1, round(duree_secondes / 60))
    montant = max(TARIF_HORAIRE_AR // 6, round(TARIF_HORAIRE_AR * duree_minutes / 60))
    return duree_minutes, montant


def formater_duree(minutes):
    if minutes is None:
        return "--"
    h, m = divmod(int(minutes), 60)
    if h > 0:
        return f"{h}h {m:02d}m" if m else f"{h}h"
    return f"{m}m"


# ==========================================
# ROUTE DE TEST (HEALTH CHECK)
# ==========================================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Backend Flask fonctionnel !"})

# ==========================================
# ROUTES API AUTHENTIFICATION
# ==========================================

# 1. Inscription
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "Tous les champs sont requis"}), 400

    hashed_password = generate_password_hash(password)

    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', 
                  (username, email, hashed_password))
        conn.commit()
        user_id = c.lastrowid
        session['user_id'] = user_id
        conn.close()
        return jsonify({"message": "Compte créé avec succès", "user_id": user_id}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Cet email est déjà utilisé"}), 400

# 2. Connexion
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = data.get('email') or data.get('username')
    password = data.get('password')

    if not identifier or not password:
        return jsonify({"error": "Email / nom d'utilisateur et mot de passe sont requis"}), 400

    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        'SELECT id, username, password_hash FROM users WHERE email = ? OR username = ?',
        (identifier, identifier)
    )
    user = c.fetchone()
    conn.close()

    if user and check_password_hash(user['password_hash'], password):
        session['user_id'] = user['id']
        return jsonify({
            "message": "Connexion réussie",
            "user": {"id": user['id'], "username": user['username']}
        }), 200
    else:
        return jsonify({"error": "Email, nom d'utilisateur ou mot de passe incorrect"}), 401

# 3. Déconnexion
@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Déconnexion réussie"}), 200

# ==========================================
# ROUTES API — MACHINES
# ==========================================

@app.route('/api/machines', methods=['GET'])
def get_machines():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM machines ORDER BY id')
    rows = c.fetchall()

    machines = []
    for row in rows:
        machine = dict(row)
        # Session en cours sur cette machine (s'il y en a une)
        c.execute('''
            SELECT sessions.*, clients.nom AS client_nom
            FROM sessions
            JOIN clients ON clients.id = sessions.client_id
            WHERE sessions.machine_id = ? AND sessions.statut = 'En cours'
        ''', (machine['id'],))
        active = c.fetchone()
        if active:
            machine['session_client'] = active['client_nom']
            debut_dt = datetime.fromisoformat(active['debut'])
            minutes_ecoulees = (datetime.now() - debut_dt).total_seconds() / 60
            machine['session_temps'] = formater_duree(minutes_ecoulees)
            machine['session_id'] = active['id']
        else:
            machine['session_client'] = None
            machine['session_temps'] = None
            machine['session_id'] = None
        machines.append(machine)

    conn.close()
    return jsonify(machines)


@app.route('/api/machines', methods=['POST'])
def create_machine():
    data = request.get_json() or {}
    nom = data.get('nom')
    type_ = data.get('type', '')

    if not nom:
        return jsonify({"error": "Le nom de la machine est requis"}), 400

    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO machines (nom, type, statut) VALUES (?, ?, ?)', (nom, type_, 'Libre'))
    conn.commit()
    new_id = c.lastrowid
    c.execute('SELECT * FROM machines WHERE id = ?', (new_id,))
    machine = row_to_dict(c.fetchone())
    conn.close()
    return jsonify(machine), 201


@app.route('/api/machines/<int:machine_id>', methods=['PUT'])
def update_machine(machine_id):
    data = request.get_json() or {}
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM machines WHERE id = ?', (machine_id,))
    machine = c.fetchone()
    if not machine:
        conn.close()
        return jsonify({"error": "Machine introuvable"}), 404

    nom = data.get('nom', machine['nom'])
    type_ = data.get('type', machine['type'])
    statut = data.get('statut', machine['statut'])

    c.execute('UPDATE machines SET nom = ?, type = ?, statut = ? WHERE id = ?',
              (nom, type_, statut, machine_id))
    conn.commit()
    c.execute('SELECT * FROM machines WHERE id = ?', (machine_id,))
    updated = row_to_dict(c.fetchone())
    conn.close()
    return jsonify(updated)


@app.route('/api/machines/<int:machine_id>', methods=['DELETE'])
def delete_machine(machine_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) AS n FROM sessions WHERE machine_id = ? AND statut = 'En cours'", (machine_id,))
    if c.fetchone()['n'] > 0:
        conn.close()
        return jsonify({"error": "Impossible de supprimer une machine avec une session en cours"}), 400

    try:
        # Supprime d'abord les paiements liés aux sessions de cette machine,
        # puis les sessions elles-mêmes, pour respecter les clés étrangères.
        c.execute('SELECT id FROM sessions WHERE machine_id = ?', (machine_id,))
        session_ids = [row['id'] for row in c.fetchall()]
        if session_ids:
            placeholders = ",".join("?" for _ in session_ids)
            c.execute(f'DELETE FROM paiements WHERE session_id IN ({placeholders})', session_ids)
            c.execute('DELETE FROM sessions WHERE machine_id = ?', (machine_id,))

        c.execute('DELETE FROM machines WHERE id = ?', (machine_id,))
        deleted = c.rowcount
        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        conn.close()
        return jsonify({"error": "Impossible de supprimer cette machine (des données y sont encore liées)"}), 400

    conn.close()
    if deleted == 0:
        return jsonify({"error": "Machine introuvable"}), 404
    return jsonify({"message": "Machine supprimée"})

# ==========================================
# ROUTES API — CLIENTS
# ==========================================

@app.route('/api/clients', methods=['GET'])
def get_clients():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM clients ORDER BY id')
    clients = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(clients)


@app.route('/api/clients', methods=['POST'])
def create_client():
    data = request.get_json() or {}
    nom = data.get('nom')
    email = data.get('email', '')
    telephone = data.get('telephone', '')

    if not nom:
        return jsonify({"error": "Le nom du client est requis"}), 400

    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO clients (nom, email, telephone, statut) VALUES (?, ?, ?, ?)',
              (nom, email, telephone, 'Absent'))
    conn.commit()
    new_id = c.lastrowid
    c.execute('SELECT * FROM clients WHERE id = ?', (new_id,))
    client = row_to_dict(c.fetchone())
    conn.close()
    return jsonify(client), 201


@app.route('/api/clients/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    data = request.get_json() or {}
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM clients WHERE id = ?', (client_id,))
    client = c.fetchone()
    if not client:
        conn.close()
        return jsonify({"error": "Client introuvable"}), 404

    nom = data.get('nom', client['nom'])
    email = data.get('email', client['email'])
    telephone = data.get('telephone', client['telephone'])

    c.execute('UPDATE clients SET nom = ?, email = ?, telephone = ? WHERE id = ?',
              (nom, email, telephone, client_id))
    conn.commit()
    c.execute('SELECT * FROM clients WHERE id = ?', (client_id,))
    updated = row_to_dict(c.fetchone())
    conn.close()
    return jsonify(updated)


@app.route('/api/clients/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) AS n FROM sessions WHERE client_id = ? AND statut = 'En cours'", (client_id,))
    if c.fetchone()['n'] > 0:
        conn.close()
        return jsonify({"error": "Impossible de supprimer un client avec une session en cours"}), 400

    try:
        # Supprime d'abord son historique de paiements et de sessions terminées
        # (clés étrangères), puis le client lui-même.
        c.execute('DELETE FROM paiements WHERE client_id = ?', (client_id,))
        c.execute('DELETE FROM sessions WHERE client_id = ?', (client_id,))
        c.execute('DELETE FROM clients WHERE id = ?', (client_id,))
        deleted = c.rowcount
        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        conn.close()
        return jsonify({"error": "Impossible de supprimer ce client (des données y sont encore liées)"}), 400

    conn.close()
    if deleted == 0:
        return jsonify({"error": "Client introuvable"}), 404
    return jsonify({"message": "Client supprimé"})

# ==========================================
# ROUTES API — SESSIONS
# ==========================================

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    statut_filtre = request.args.get('statut', 'En cours')

    conn = get_db_connection()
    c = conn.cursor()
    if statut_filtre == 'all':
        c.execute('''
            SELECT sessions.*, machines.nom AS machine_nom, clients.nom AS client_nom
            FROM sessions
            JOIN machines ON machines.id = sessions.machine_id
            JOIN clients ON clients.id = sessions.client_id
            ORDER BY sessions.id DESC
        ''')
    else:
        c.execute('''
            SELECT sessions.*, machines.nom AS machine_nom, clients.nom AS client_nom
            FROM sessions
            JOIN machines ON machines.id = sessions.machine_id
            JOIN clients ON clients.id = sessions.client_id
            WHERE sessions.statut = ?
            ORDER BY sessions.id DESC
        ''', (statut_filtre,))

    rows = c.fetchall()
    conn.close()

    resultats = []
    for row in rows:
        s = dict(row)
        debut_dt = datetime.fromisoformat(s['debut'])
        if s['statut'] == 'En cours':
            minutes = (datetime.now() - debut_dt).total_seconds() / 60
            montant_estime = round(TARIF_HORAIRE_AR * minutes / 60)
        else:
            minutes = s['duree_minutes']
            montant_estime = s['montant']

        resultats.append({
            "id": s['id'],
            "machine": s['machine_nom'],
            "clients": s['client_nom'],
            "jeu": s['jeu'] or "—",
            "debut": debut_dt.strftime("%H:%M"),
            "duree": formater_duree(minutes),
            "fin": datetime.fromisoformat(s['fin']).strftime("%H:%M") if s['fin'] else "—",
            "montant": f"{montant_estime} Ar",
            "statut": s['statut'],
        })

    return jsonify(resultats)


@app.route('/api/sessions', methods=['POST'])
def start_session():
    data = request.get_json() or {}
    machine_id = data.get('machine_id')
    client_id = data.get('client_id')
    jeu = data.get('jeu', '')

    if not machine_id or not client_id:
        return jsonify({"error": "La machine et le client sont requis"}), 400

    conn = get_db_connection()
    c = conn.cursor()

    c.execute('SELECT * FROM machines WHERE id = ?', (machine_id,))
    machine = c.fetchone()
    if not machine:
        conn.close()
        return jsonify({"error": "Machine introuvable"}), 404
    if machine['statut'] != 'Libre':
        conn.close()
        return jsonify({"error": "Cette machine n'est pas disponible"}), 400

    c.execute('SELECT * FROM clients WHERE id = ?', (client_id,))
    client = c.fetchone()
    if not client:
        conn.close()
        return jsonify({"error": "Client introuvable"}), 404

    debut = datetime.now().isoformat()
    c.execute('''
        INSERT INTO sessions (machine_id, client_id, jeu, debut, statut)
        VALUES (?, ?, ?, ?, 'En cours')
    ''', (machine_id, client_id, jeu, debut))
    session_id = c.lastrowid

    c.execute("UPDATE machines SET statut = 'Occupée' WHERE id = ?", (machine_id,))
    c.execute("UPDATE clients SET statut = 'Présent' WHERE id = ?", (client_id,))

    conn.commit()
    conn.close()
    return jsonify({"message": "Session démarrée", "session_id": session_id}), 201


@app.route('/api/sessions/<int:session_id>/stop', methods=['PUT'])
def stop_session(session_id):
    conn = get_db_connection()
    c = conn.cursor()

    c.execute('SELECT * FROM sessions WHERE id = ?', (session_id,))
    s = c.fetchone()
    if not s:
        conn.close()
        return jsonify({"error": "Session introuvable"}), 404
    if s['statut'] != 'En cours':
        conn.close()
        return jsonify({"error": "Cette session est déjà terminée"}), 400

    fin_dt = datetime.now()
    duree_minutes, montant = calculer_duree_et_montant(s['debut'], fin_dt)

    c.execute('''
        UPDATE sessions SET fin = ?, duree_minutes = ?, montant = ?, statut = 'Terminée'
        WHERE id = ?
    ''', (fin_dt.isoformat(), duree_minutes, montant, session_id))

    # Libère la machine
    c.execute("UPDATE machines SET statut = 'Libre' WHERE id = ?", (s['machine_id'],))

    # Le client redevient "Absent" s'il n'a plus d'autre session en cours
    c.execute("SELECT COUNT(*) AS n FROM sessions WHERE client_id = ? AND statut = 'En cours' AND id != ?",
              (s['client_id'], session_id))
    if c.fetchone()['n'] == 0:
        c.execute("UPDATE clients SET statut = 'Absent' WHERE id = ?", (s['client_id'],))

    # Crée automatiquement le paiement correspondant
    c.execute('''
        INSERT INTO paiements (session_id, client_id, montant, date, statut)
        VALUES (?, ?, ?, ?, 'Terminé')
    ''', (session_id, s['client_id'], montant, date.today().isoformat()))

    conn.commit()
    conn.close()
    return jsonify({
        "message": "Session terminée",
        "duree_minutes": duree_minutes,
        "montant": montant
    })

# ==========================================
# ROUTES API — PAIEMENTS
# ==========================================

@app.route('/api/paiements', methods=['GET'])
def get_paiements():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        SELECT paiements.*, clients.nom AS client_nom
        FROM paiements
        JOIN clients ON clients.id = paiements.client_id
        ORDER BY paiements.id DESC
    ''')
    rows = c.fetchall()
    conn.close()

    resultats = [{
        "id": row['id'],
        "client": row['client_nom'],
        "montant": f"{row['montant']} Ar",
        "montant_brut": row['montant'],
        "date": row['date'],
        "status": "completed" if row['statut'] == 'Terminé' else "pending",
    } for row in rows]

    return jsonify(resultats)

# ==========================================
# ROUTES API — TABLEAU DE BORD & RAPPORTS
# ==========================================

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    conn = get_db_connection()
    c = conn.cursor()

    c.execute('SELECT COUNT(*) AS n FROM machines')
    total_machines = c.fetchone()['n']

    c.execute("SELECT COUNT(*) AS n FROM machines WHERE statut = 'Occupée'")
    machines_occupees = c.fetchone()['n']

    c.execute("SELECT COUNT(*) AS n FROM clients WHERE statut = 'Présent'")
    clients_actifs = c.fetchone()['n']

    c.execute("SELECT COALESCE(SUM(montant), 0) AS total FROM paiements WHERE date = ?",
              (date.today().isoformat(),))
    recette_jour = c.fetchone()['total']

    conn.close()

    return jsonify({
        "total_machines": total_machines,
        "machines_occupees": machines_occupees,
        "machines_disponibles": total_machines - machines_occupees,
        "clients_actifs": clients_actifs,
        "recette_jour": recette_jour
    })


@app.route('/api/reports/summary', methods=['GET'])
def get_reports_summary():
    conn = get_db_connection()
    c = conn.cursor()

    c.execute('SELECT COUNT(*) AS n FROM clients')
    total_clients = c.fetchone()['n']

    c.execute('SELECT COUNT(*) AS n FROM machines')
    total_machines = c.fetchone()['n']

    c.execute("SELECT COUNT(*) AS n FROM sessions WHERE statut = 'Terminée'")
    sessions_terminees = c.fetchone()['n']

    c.execute("SELECT COUNT(*) AS n FROM sessions WHERE statut = 'En cours'")
    sessions_en_cours = c.fetchone()['n']

    c.execute('SELECT COALESCE(SUM(montant), 0) AS total FROM paiements')
    recette_totale = c.fetchone()['total']

    c.execute("SELECT COALESCE(SUM(montant), 0) AS total FROM paiements WHERE date = ?",
              (date.today().isoformat(),))
    recette_jour = c.fetchone()['total']

    c.execute('''
        SELECT machines.nom AS machine, COUNT(*) AS utilisations
        FROM sessions JOIN machines ON machines.id = sessions.machine_id
        GROUP BY sessions.machine_id
        ORDER BY utilisations DESC
        LIMIT 5
    ''')
    machines_populaires = [dict(row) for row in c.fetchall()]

    conn.close()

    return jsonify({
        "total_clients": total_clients,
        "total_machines": total_machines,
        "sessions_terminees": sessions_terminees,
        "sessions_en_cours": sessions_en_cours,
        "recette_totale": recette_totale,
        "recette_jour": recette_jour,
        "machines_populaires": machines_populaires
    })

# ==========================================
# LANCEMENT DU SERVEUR
# ==========================================
if __name__ == '__main__':
    init_db()
    print("🚀 Serveur API lancé sur http://127.0.0.1:5555")
    app.run(debug=True, port=5555)
