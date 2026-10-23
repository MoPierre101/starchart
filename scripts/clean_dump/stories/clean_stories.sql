-- Stories. Needs gcd.issue for the rating class. Ends by marking issues that have an erotica story as mature.

create table gcd.story as
with character_names as (
    -- Used only for stories that have no characters text of their own.
    select
        story_character.story_id,
        string_agg(gcd.clean_short_text(character_detail.name), '; ' order by story_character.id) as names
    from gcd_raw.gcd_story_character as story_character
    join gcd_raw.gcd_character as character_detail on character_detail.id = story_character.character_id
    group by story_character.story_id
)
select
    story.id::integer as id,
    story.issue_id::integer as issue_id,
    story.sequence_number::smallint as sequence_number,
    story.type_id::smallint as type_id,
    gcd.clean_short_text(story.title) as title,
    story.title_inferred <> 0 as title_inferred,
    gcd.clean_short_text(story.feature) as feature,
    genres.genre_list as genres,
    story.page_count::numeric(7,3) as page_count,
    story.page_count_uncertain <> 0 as page_count_uncertain,
    coalesce(gcd.clean_short_text(story.characters), character_names.names) as characters_text,
    gcd.clean_long_text(gcd.replace_link_markers(story.synopsis)) as synopsis,
    gcd.clean_long_text(gcd.replace_link_markers(story.notes)) as notes,
    gcd.clean_long_text(gcd.replace_link_markers(story.reprint_notes)) as reprint_notes,
    gcd.clean_short_text(story.first_line) as first_line,
    gcd.clean_short_text(story.job_number) as job_number,
    nullif(gcd.clean_short_text(story.script), '?') as script,
    nullif(gcd.clean_short_text(story.pencils), '?') as pencils,
    nullif(gcd.clean_short_text(story.inks), '?') as inks,
    nullif(gcd.clean_short_text(story.colors), '?') as colors,
    nullif(gcd.clean_short_text(story.letters), '?') as letters,
    -- A story takes its issue's rating class, except that the erotica genre makes it mature.
    case when 'erotica' = any(genres.genre_list) then 'mature' else issue.rating_class end as rating_class,
    story.modified
from gcd_raw.gcd_story as story
join gcd.issue as issue on issue.id = story.issue_id
left join character_names on character_names.story_id = story.id
cross join lateral (
    select array_agg(btrim(genre_part)) filter (where btrim(genre_part) <> '') as genre_list
    from unnest(string_to_array(lower(gcd.clean_short_text(story.genre)), ';')) as genre_part
) as genres;

-- An issue with an erotica story is mature too.
update gcd.issue
set rating_class = 'mature'
from (select distinct issue_id from gcd.story where 'erotica' = any(genres)) as erotica_story
where gcd.issue.id = erotica_story.issue_id;
