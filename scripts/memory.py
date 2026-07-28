#!/usr/bin/env python3
"""
Pulsyn Memory System — Knowledge Base

This script manages the knowledge base for connector development.
"""

import json
import sqlite3
import os
from pathlib import Path
from datetime import datetime

# Database path
DB_PATH = 'docs/knowledge/memory.db'

def init_db():
    """Initialize the memory database"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS connector_knowledge (
            id INTEGER PRIMARY KEY,
            connector_name TEXT NOT NULL,
            engine TEXT NOT NULL,
            pass_rate REAL,
            test_count INTEGER,
            last_tested TIMESTAMP,
            issues TEXT,
            solutions TEXT,
            patterns TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patterns (
            id INTEGER PRIMARY KEY,
            pattern_type TEXT NOT NULL,
            pattern_name TEXT NOT NULL,
            description TEXT,
            examples TEXT,
            success_rate REAL,
            usage_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS failure_analysis (
            id INTEGER PRIMARY KEY,
            connector_name TEXT,
            error_type TEXT,
            error_message TEXT,
            root_cause TEXT,
            solution TEXT,
            prevention TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agent_performance (
            id INTEGER PRIMARY KEY,
            agent_name TEXT NOT NULL,
            task_type TEXT NOT NULL,
            success_count INTEGER DEFAULT 0,
            failure_count INTEGER DEFAULT 0,
            avg_time_ms INTEGER,
            cost_usd REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def remember(key, value, context=None):
    """Store knowledge with context"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT OR REPLACE INTO connector_knowledge 
        (connector_name, engine, pass_rate, test_count, last_tested, issues, solutions, patterns)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        key,
        value.get('engine', ''),
        value.get('pass_rate', 0),
        value.get('test_count', 0),
        datetime.now().isoformat(),
        json.dumps(value.get('issues', [])),
        json.dumps(value.get('solutions', [])),
        json.dumps(value.get('patterns', []))
    ))
    
    conn.commit()
    conn.close()

def recall(query, context=None):
    """Retrieve relevant knowledge"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM connector_knowledge 
        WHERE connector_name LIKE ? OR engine LIKE ?
    ''', (f'%{query}%', f'%{query}%'))
    
    results = cursor.fetchall()
    conn.close()
    
    return results

def recognize(pattern):
    """Recognize patterns from past experience"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM patterns 
        WHERE pattern_name LIKE ? OR description LIKE ?
    ''', (f'%{pattern}%', f'%{pattern}%'))
    
    results = cursor.fetchall()
    conn.close()
    
    return results

def learn(outcome):
    """Learn from success/failure"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO failure_analysis 
        (connector_name, error_type, error_message, root_cause, solution, prevention)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        outcome.get('connector_name', ''),
        outcome.get('error_type', ''),
        outcome.get('error_message', ''),
        outcome.get('root_cause', ''),
        outcome.get('solution', ''),
        outcome.get('prevention', '')
    ))
    
    conn.commit()
    conn.close()

def main():
    """Main entry point"""
    init_db()
    print(f"Memory database initialized at {DB_PATH}")

if __name__ == '__main__':
    main()
