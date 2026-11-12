#!/usr/bin/env python
import sqlite3
import os

db_path = 'db.sqlite3'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if image column exists
        cursor.execute("PRAGMA table_info(consignments)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'image' not in columns:
            # Add image column
            cursor.execute("ALTER TABLE consignments ADD COLUMN image VARCHAR(100) DEFAULT NULL")
            conn.commit()
            print('✓ Added image column to consignments table')
        else:
            print('✓ image column already exists')
    except Exception as e:
        print(f'Error: {e}')
        conn.rollback()
    finally:
        conn.close()
else:
    print('Database not found')
