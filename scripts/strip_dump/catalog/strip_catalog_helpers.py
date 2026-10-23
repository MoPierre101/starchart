from strip_dump.catalog.strip_catalog_constants import EXCLUDED_PUBLISHING_FORMAT_WORDS


def build_excluded_format_condition() -> str:
    """Build the SQL that rejects series whose publishing format mentions an excluded word.

    SQLite's LIKE ignores upper and lower case for English letters, so "Giveaway" is rejected too.
    """
    conditions = [
        f"series.publishing_format NOT LIKE '%{word}%'"
        for word in EXCLUDED_PUBLISHING_FORMAT_WORDS
    ]
    return " AND ".join(conditions)
