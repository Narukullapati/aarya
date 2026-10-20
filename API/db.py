import os

import pymysql
import pymysql.cursors

SCHEMA = """
CREATE TABLE IF NOT EXISTS visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ts TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ip VARCHAR(45),
    user_agent TEXT,
    path VARCHAR(500),
    referrer VARCHAR(500),
    accept_language VARCHAR(255),
    INDEX idx_visits_ts (ts)
)
"""

IMAGES_SCHEMA = """
CREATE TABLE IF NOT EXISTS images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ts TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    category VARCHAR(50) NOT NULL,
    caption TEXT,
    filename VARCHAR(255) NOT NULL,
    ip VARCHAR(45),
    INDEX idx_images_category (category),
    INDEX idx_images_ts (ts)
)
"""

COLUMNS = "id, ts, ip, user_agent, path, referrer, accept_language"


def _connect():
    return pymysql.connect(
        host=os.environ["DB_HOST"],
        port=int(os.environ.get("DB_PORT", "3306")),
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        database=os.environ["DB_NAME"],
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
        connect_timeout=10,
    )


def init_db():
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(SCHEMA)
        cur.execute(IMAGES_SCHEMA)


def record_visit(ip, user_agent, path, referrer, accept_language):
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO visits (ip, user_agent, path, referrer, accept_language) VALUES (%s, %s, %s, %s, %s)",
            (ip, user_agent, path, referrer, accept_language),
        )


def list_visits(limit=100):
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(f"SELECT {COLUMNS} FROM visits ORDER BY id DESC LIMIT %s", (limit,))
        rows = cur.fetchall()
        cur.execute("SELECT COUNT(*) AS n FROM visits")
        total = cur.fetchone()["n"]
    return {"total": total, "visits": rows}


def list_images(category=None):
    with _connect() as conn, conn.cursor() as cur:
        if category:
            cur.execute(
                "SELECT id, ts, category, caption, filename FROM images WHERE category = %s ORDER BY id DESC",
                (category,),
            )
        else:
            cur.execute("SELECT id, ts, category, caption, filename FROM images ORDER BY id DESC")
        return cur.fetchall()


def add_image(category, caption, filename, ip):
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO images (category, caption, filename, ip) VALUES (%s, %s, %s, %s)",
            (category, caption, filename, ip),
        )
        image_id = cur.lastrowid
        cur.execute(
            "SELECT id, ts, category, caption, filename FROM images WHERE id = %s",
            (image_id,),
        )
        return cur.fetchone()


def get_image(image_id):
    with _connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT id, filename FROM images WHERE id = %s", (image_id,))
        return cur.fetchone()


def delete_image(image_id):
    with _connect() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM images WHERE id = %s", (image_id,))


def count_images():
    with _connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) AS n FROM images")
        return cur.fetchone()["n"]


def count_recent_images_by_ip(ip):
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT COUNT(*) AS n FROM images WHERE ip = %s AND ts > NOW() - INTERVAL 1 HOUR",
            (ip,),
        )
        return cur.fetchone()["n"]
