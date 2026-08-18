import sqlite3
from datetime import datetime


DATABASE_NAME = "agentshield.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_NAME)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service TEXT NOT NULL,
            trust_score REAL NOT NULL,
            risk_level TEXT NOT NULL,
            decision TEXT NOT NULL,
            amount REAL NOT NULL,
            payment_protocol TEXT NOT NULL,
            authorized INTEGER NOT NULL,
            reason TEXT,
            timestamp TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


def save_transaction(
    service,
    trust_score,
    risk_level,
    decision,
    amount,
    payment_protocol,
    authorized,
    reason
):
    connection = get_connection()

    cursor = connection.execute("""
        INSERT INTO transactions (
            service,
            trust_score,
            risk_level,
            decision,
            amount,
            payment_protocol,
            authorized,
            reason,
            timestamp
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        service,
        trust_score,
        risk_level,
        decision,
        amount,
        payment_protocol,
        int(authorized),
        reason,
        datetime.utcnow().isoformat()
    ))

    connection.commit()

    transaction_id = cursor.lastrowid

    connection.close()

    return transaction_id


def get_transactions():
    connection = get_connection()

    rows = connection.execute("""
        SELECT *
        FROM transactions
        ORDER BY id DESC
    """).fetchall()

    connection.close()

    return [dict(row) for row in rows]