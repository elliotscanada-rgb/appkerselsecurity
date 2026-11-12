#!/usr/bin/env python
"""
Clean up bad token blacklist data
"""
import sqlite3

db_path = 'db.sqlite3'

print("Cleaning up token blacklist table...")
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Delete all records from token blacklist tables
    cursor.execute("DELETE FROM token_blacklist_outstandingtoken")
    cursor.execute("DELETE FROM token_blacklist_blacklistedtoken")
    
    conn.commit()
    print("[OK] Cleaned token blacklist tables")
    
    conn.close()
except Exception as e:
    print(f"[ERROR] {e}")
