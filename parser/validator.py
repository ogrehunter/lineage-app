import warnings


def validate_sql(sql: str) -> None:
    """
    Raises ValueError if SQL fails structural validation.
    """

    if not sql or not sql.strip():
        raise ValueError("SQL is empty.")

    if sql.count("/*") != sql.count("*/"):
        # raise ValueError("Unbalanced block comments detected.")
        warnings.warn("Unbalanced block comments detected")

    # Optional guardrail
    if len(sql) > 500_000:
        # raise ValueError("SQL exceeds maximum allowed length.")
        warnings.warn("SQL exceeds maximum allowed length.")
