-- Tags. Tags that differ only by case or spacing become one tag, and the lowest id is kept.

create table gcd.tag as
select
    min(raw_tag.id)::integer as id,
    lower(gcd.clean_short_text(raw_tag.name)) as name,
    (array_agg(raw_tag.slug order by raw_tag.id))[1] as slug
from gcd_raw.taggit_tag as raw_tag
group by lower(gcd.clean_short_text(raw_tag.name));


-- A story that had two spellings of the same tag now has the tag once.
create table gcd.story_tag as
select distinct
    tagged_item.object_id::integer as story_id,
    merged_tag.id as tag_id
from gcd_raw.taggit_taggeditem as tagged_item
join gcd_raw.taggit_tag as raw_tag on raw_tag.id = tagged_item.tag_id
join gcd.tag as merged_tag on merged_tag.name = lower(gcd.clean_short_text(raw_tag.name))
where tagged_item.object_id in (select id from gcd.story);
