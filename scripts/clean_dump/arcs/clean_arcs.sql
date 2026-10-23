-- Story arcs.

create table gcd.story_arc as
select
    story_arc.id::integer as id,
    gcd.clean_short_text(story_arc.name) as name,
    gcd.clean_short_text(story_arc.sort_name) as sort_name,
    gcd.clean_short_text(story_arc.disambiguation) as disambiguation,
    gcd.clean_long_text(gcd.replace_link_markers(story_arc.description)) as description,
    gcd.clean_long_text(gcd.replace_link_markers(story_arc.notes)) as notes,
    story_arc.language_id::integer as language_id,
    story_arc.year_first_published::smallint as year_first_published,
    story_arc.year_first_published_uncertain <> 0 as year_first_published_uncertain,
    story_arc.modified
from gcd_raw.gcd_story_arc as story_arc;


create table gcd.story_story_arc as
select
    story_arc_link.id::integer as id,
    story_arc_link.story_id::integer as story_id,
    story_arc_link.storyarc_id::integer as story_arc_id
from gcd_raw.gcd_story_story_arc as story_arc_link
where story_arc_link.story_id in (select id from gcd.story);


create table gcd.story_arc_relation as
select
    relation.id::integer as id,
    relation.from_story_arc_id::integer as from_story_arc_id,
    relation.to_story_arc_id::integer as to_story_arc_id,
    relation.relation_type_id::integer as relation_type_id,
    gcd.clean_long_text(relation.notes) as notes,
    relation.modified
from gcd_raw.gcd_story_arc_relation as relation;
