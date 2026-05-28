"""
Database Module — SQLite (local development)
"""
import os
import json
import sqlite3
from datetime import datetime


def get_conn():
    db_path = os.path.join(os.path.dirname(__file__), "log_analyzer.db")
    return sqlite3.connect(db_path)


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def init_db():
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS analysis_results (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                filename    TEXT NOT NULL,
                result      TEXT NOT NULL,
                benchmarks  TEXT DEFAULT '{}',
                insights    TEXT DEFAULT '[]',
                uploaded_by TEXT NOT NULL,
                created_at  TEXT DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
    finally:
        conn.close()


def save_result(filename, result_dict, uploaded_by, benchmarks=None, insights=None):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO analysis_results (filename, result, benchmarks, insights, uploaded_by)
               VALUES (?, ?, ?, ?, ?)""",
            (filename, json.dumps(result_dict),
             json.dumps(benchmarks or {}),
             json.dumps(insights or []),
             uploaded_by)
        )
        row_id = cur.lastrowid
        conn.commit()
        return row_id
    finally:
        conn.close()


def get_results(limit=20):
    conn = get_conn()
    conn.row_factory = dict_factory
    try:
        cur = conn.cursor()
        cur.execute(
            """SELECT id, filename, result, benchmarks, insights, uploaded_by, created_at
               FROM analysis_results
               ORDER BY created_at DESC LIMIT ?""",
            (limit,)
        )
        rows = cur.fetchall()
        for row in rows:
            row["result"] = json.loads(row["result"])
            row["benchmarks"] = json.loads(row["benchmarks"])
            row["insights"] = json.loads(row["insights"])
            if row["created_at"]:
                row["created_at"] = datetime.fromisoformat(row["created_at"])
        return rows
    finally:
        conn.close()


def get_result_by_id(result_id):
    conn = get_conn()
    conn.row_factory = dict_factory
    try:
        cur = conn.cursor()
        cur.execute(
            """SELECT id, filename, result, benchmarks, insights, uploaded_by, created_at
               FROM analysis_results WHERE id = ?""",
            (result_id,)
        )
        row = cur.fetchone()
        if row:
            row["result"] = json.loads(row["result"])
            row["benchmarks"] = json.loads(row["benchmarks"])
            row["insights"] = json.loads(row["insights"])
            if row["created_at"]:
                row["created_at"] = datetime.fromisoformat(row["created_at"])
        return row
    finally:
        conn.close()
