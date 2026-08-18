import sqlite3
try:
    conn = sqlite3.connect('backend/aegis_soc.db')
    c = conn.cursor()
    c.execute("CREATE TABLE incident_ai_analyses (id INTEGER PRIMARY KEY, incident_id INTEGER NOT NULL, provider VARCHAR(50) NOT NULL, model VARCHAR(100), analysis TEXT NOT NULL, confidence INTEGER, created_at DATETIME DEFAULT (datetime('now')))")
    conn.commit()
    c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='incident_ai_analyses'")
    result = c.fetchone()
    print("Table exists:", result)
except Exception as e:
    print("Error:", e)