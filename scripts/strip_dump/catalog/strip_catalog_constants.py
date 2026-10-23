PUBLISHER_IDS_BY_NAME = {
    "DC": 54,
    "Marvel": 78,
    "Image": 709,
    "Dark Horse": 512,
    "Archie": 71,
    "Boom! Studios": 2547,
    "Dynamite Entertainment": 2550,
    "Titan": 543,
    "Oni Press": 946,
    "Valiant Entertainment": 4052,
    "Mad Cave Studios": 11517,
    "Vault": 11896,
    "Ignition Press": 19180,
}
PUBLISHER_IDS = tuple(PUBLISHER_IDS_BY_NAME.values())

ENGLISH_LANGUAGE_ID = 25
SPANISH_LANGUAGE_ID = 27
FRENCH_LANGUAGE_ID = 34
KEPT_LANGUAGE_IDS = (ENGLISH_LANGUAGE_ID, SPANISH_LANGUAGE_ID, FRENCH_LANGUAGE_ID)

EXCLUDED_PUBLISHING_FORMAT_WORDS = ("giveaway", "promo", "ashcan")
