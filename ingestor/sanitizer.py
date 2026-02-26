import re
import unicodedata


def sanitize_sql(sql: str, strip_comments: bool = True) -> str:
    sql = unicodedata.normalize("NFKC", sql)
    sql = sql.replace("\ufeff", "").replace("\u200b", "")

    if strip_comments:
        sql = re.sub(r"/\*.*?\*/", "", sql, flags=re.S)
        sql = re.sub(r"--.*?$", "", sql, flags=re.M)

    return sql
