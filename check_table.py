import sqlite3
conn = sqlite3.connect('backend/aegis_soc.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='incident_ai_analyses'")
print(c.fetchone())