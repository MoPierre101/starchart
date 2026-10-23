-- Characters and the stories they appear in.

-- Of rows with the same story, character and universe, only the lowest id stays.
-- The universe is used to find the duplicates, and then it is dropped.
create table gcd.story_character as
select
    story_character.id::integer as id,
    story_character.story_id::integer as story_id,
    story_character.character_id::integer as character_id,
    story_character.role_id::integer as role_id,
    story_character.is_flashback <> 0 as is_flashback,
    story_character.is_origin <> 0 as is_origin,
    story_character.is_death <> 0 as is_death,
    gcd.clean_short_text(story_character.notes) as notes,
    story_character.modified
from gcd_raw.gcd_story_character as story_character
where story_character.story_id in (select id from gcd.story)
  and story_character.id in (
    select min(id) from gcd_raw.gcd_story_character group by story_id, character_id, universe_id
);


-- The description and notes are kept only when they are in English, Spanish or French (language ids 25, 27, 34).
create table gcd.character as
select
    source_character.id::integer as id,
    gcd.clean_short_text(source_character.name) as name,
    gcd.clean_short_text(source_character.sort_name) as sort_name,
    gcd.clean_short_text(source_character.disambiguation) as disambiguation,
    source_character.year_first_published::smallint as year_first_published,
    source_character.year_first_published_uncertain <> 0 as year_first_published_uncertain,
    case when source_character.language_id in (25, 27, 34)
        then gcd.clean_long_text(gcd.replace_link_markers(source_character.description))
    end as description,
    case when source_character.language_id in (25, 27, 34)
        then gcd.clean_long_text(gcd.replace_link_markers(source_character.notes))
    end as notes,
    source_character.language_id::integer as language_id,
    source_character.modified
from gcd_raw.gcd_character as source_character;


create table gcd.character_name_detail as
select
    name_detail.id::integer as id,
    name_detail.character_id::integer as character_id,
    gcd.clean_short_text(name_detail.name) as name,
    gcd.clean_short_text(name_detail.sort_name) as sort_name,
    name_detail.is_official_name <> 0 as is_official_name,
    name_detail.modified
from gcd_raw.gcd_character_name_detail as name_detail;
