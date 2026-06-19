# Fichier app.py

import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash

# Initialisation de l'app
# template_folder='templates' (par défaut) pour trouver index.html et gerant/
# static_folder='assets' pour que Flask trouve tes fichiers CSS dans assets/css/
app = Flask(__name__, static_folder='assets')

# Clé secrète obligatoire pour gérer les sessions
app.secret_key = 'votre_phrase_secrete_tres_tres_super_secrete'

# ==========================================
# BASE DE DONNÉES
# ==========================================

def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()
    print("✅ Base de données 'database.db' prête")

# ==========================================
# ROUTES (Les pages)
# ==========================================

# 1. Page d'accueil (Connexion / Inscription)
@app.route('/')
def index():
    return render_template('index.html')

# 2. Inscription
@app.route('/signup', methods=['POST'])
def signup():
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')
    hashed_password = generate_password_hash(password)

    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    try:
        c.execute('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', 
                  (username, email, hashed_password))
        conn.commit()
        user_id = c.lastrowid
        session['user_id'] = user_id
        conn.close()
        return redirect(url_for('dashboard'))
    except sqlite3.IntegrityError:
        conn.close()
        return "Erreur : Cet email est déjà utilisé. <a href='/'>Retour</a>"

# 3. Connexion
@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')

    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('SELECT id, password_hash FROM users WHERE email = ?', (email,))
    user = c.fetchone()
    conn.close()

    if user:
        user_id, stored_hash = user
        if check_password_hash(stored_hash, password):
            session['user_id'] = user_id
            return redirect(url_for('dashboard'))
        else:
            return "Erreur : Mot de passe incorrect. <a href='/'>Retour</a>"
    else:
        return "Erreur : Aucun compte avec cet email. <a href='/'>Retour</a>"

# ==========================================
# ROUTES DU DASHBOARD ET DES AUTRES PAGES (GERANT)
# ==========================================

# 4. Dashboard (Page d'accueil du gérant)
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('gerant/dash.html')

# 5. Page Clients
@app.route('/clients')
def clients():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('gerant/clients.html')

# 6. Page Machines
@app.route('/machine')
def machines():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('gerant/machine.html')

# 7. Page Paiements
@app.route('/paiement')
def paiements():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('gerant/paiement.html')

# 8. Page Rapports
@app.route('/report')
def reports():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('gerant/report.html')

# 9. Page Sessions
@app.route('/session')
def sessions():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('gerant/session.html')

# 10. Page Tarifs
@app.route('/tarifs')
def tarifs():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('gerant/tarifs.html')

# ==========================================
# LANCEMENT
# ==========================================
if __name__ == '__main__':
    init_db()
    print("🚀 Serveur lancé sur http://127.0.0.1:5555")
    app.run(debug=True, port=5555)