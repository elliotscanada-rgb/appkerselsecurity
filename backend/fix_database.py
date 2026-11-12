#!/usr/bin/env python
"""
Fix database schema issues by creating missing tables
"""
import os
import django
import sqlite3

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

db_path = 'db.sqlite3'

print("=" * 60)
print("FIXING DATABASE SCHEMA")
print("=" * 60)

# Run Django's syncdb to create missing tables
from django.core.management import call_command

print("\n1. Running Django migrations and syncdb...")
try:
    call_command('migrate', verbosity=1)
    print("[OK] Migrations completed")
except Exception as e:
    print(f"[ERROR] Migration error: {e}")

# Verify tables exist
print("\n2. Verifying database tables...")
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    
    required_tables = [
        'consignments',
        'valuations',
        'service_charges',
        'custody_records',
        'shipments',
        'documents',
        'notifications',
        'audit_logs'
    ]
    
    for table in required_tables:
        if table in tables:
            print(f"[OK] Table '{table}' exists")
        else:
            print(f"[MISSING] Table '{table}' MISSING")
    
    conn.close()
except Exception as e:
    print(f"[ERROR] Error checking tables: {e}")

print("\n" + "=" * 60)
print("DATABASE FIX COMPLETE")
print("=" * 60)
