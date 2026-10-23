import re

# Matches [gcd_link_issue](702) and [gcd_link_name_issue](702). The kind is "issue", the id is 702.
# A few markers have a space before the bracket or inside it, so spaces are allowed there.
LINK_MARKER_PATTERN = re.compile(r"\[gcd_link_(?:name_)?([a-z_]+)\]\s*\(\s*(\d+)\s*\)")

LINK_TEXT_COLUMNS = (
    ("gcd_story", "notes"),
    ("gcd_issue", "notes"),
    ("gcd_series", "notes"),
    ("gcd_series", "tracking_notes"),
    ("gcd_character", "notes"),
    ("gcd_character", "description"),
    ("gcd_creator", "bio"),
    ("gcd_creator", "notes"),
    ("gcd_story_arc", "description"),
    ("gcd_story_arc", "notes"),
)

ISSUE_NAME = "series.name || ' #' || issue.number"
ISSUE_DATE = "CASE WHEN issue.publication_date = '' THEN '' ELSE ' (' || issue.publication_date || ')' END"
ISSUE_TABLES = "FROM source.gcd_issue AS issue JOIN source.gcd_series AS series ON series.id = issue.series_id"
STORY_TABLES = (
    "FROM source.gcd_story AS story "
    "JOIN source.gcd_issue AS issue ON issue.id = story.issue_id "
    "JOIN source.gcd_series AS series ON series.id = issue.series_id"
)

# A story link reads as the issue the story is in, because that is how the notes use it.
NAME_QUERY_BY_KIND = {
    "issue": f"SELECT {ISSUE_NAME} {ISSUE_TABLES} WHERE issue.id = ?",
    "issue_with_date": f"SELECT {ISSUE_NAME} || {ISSUE_DATE} {ISSUE_TABLES} WHERE issue.id = ?",
    "story": f"SELECT {ISSUE_NAME} {STORY_TABLES} WHERE story.id = ?",
    "story_with_date": f"SELECT {ISSUE_NAME} || {ISSUE_DATE} {STORY_TABLES} WHERE story.id = ?",
    "series": "SELECT name FROM source.gcd_series WHERE id = ?",
    "creator": "SELECT gcd_official_name FROM source.gcd_creator WHERE id = ?",
    "character": "SELECT name FROM source.gcd_character WHERE id = ?",
    "story_arc": "SELECT name FROM source.gcd_story_arc WHERE id = ?",
    "feature": "SELECT name FROM source.gcd_feature WHERE id = ?",
    "publisher": "SELECT name FROM source.gcd_publisher WHERE id = ?",
    "group": "SELECT name FROM source.gcd_group WHERE id = ?",
}
