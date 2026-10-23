-- Credits and creators.

-- Of rows with the same story, creator and credit type, only the lowest id stays.
create table gcd.story_credit as
select
    story_credit.id::integer as id,
    story_credit.story_id::integer as story_id,
    story_credit.creator_id::integer as creator_id,
    story_credit.credit_type_id::integer as credit_type_id,
    gcd.clean_short_text(story_credit.credit_name) as credit_name,
    gcd.clean_short_text(story_credit.credited_as) as credited_as,
    story_credit.is_credited <> 0 as is_credited,
    story_credit.is_signed <> 0 as is_signed,
    gcd.clean_short_text(story_credit.signed_as) as signed_as,
    story_credit.uncertain <> 0 as uncertain,
    story_credit.is_sourced <> 0 as is_sourced,
    gcd.clean_short_text(story_credit.sourced_by) as sourced_by,
    story_credit.modified
from gcd_raw.gcd_story_credit as story_credit
where story_credit.story_id in (select id from gcd.story)
  and story_credit.id in (
    select min(id) from gcd_raw.gcd_story_credit group by story_id, creator_id, credit_type_id
);


create table gcd.issue_credit as
select
    issue_credit.id::integer as id,
    issue_credit.issue_id::integer as issue_id,
    issue_credit.creator_id::integer as creator_id,
    issue_credit.credit_type_id::integer as credit_type_id,
    gcd.clean_short_text(issue_credit.credit_name) as credit_name,
    gcd.clean_short_text(issue_credit.credited_as) as credited_as,
    issue_credit.is_credited <> 0 as is_credited,
    issue_credit.uncertain <> 0 as uncertain,
    issue_credit.is_sourced <> 0 as is_sourced,
    gcd.clean_short_text(issue_credit.sourced_by) as sourced_by,
    issue_credit.modified
from gcd_raw.gcd_issue_credit as issue_credit
where issue_credit.issue_id in (select id from gcd.issue);


-- Birth and death come from the date rows, which have text parts such as "19??".
create table gcd.creator as
select
    creator.id::integer as id,
    gcd.clean_short_text(creator.gcd_official_name) as gcd_official_name,
    gcd.clean_short_text(creator.sort_name) as sort_name,
    gcd.clean_short_text(creator.disambiguation) as disambiguation,
    gcd.clean_short_text(creator.whos_who) as whos_who,
    creator.birth_country_id::integer as birth_country_id,
    creator.birth_country_uncertain <> 0 as birth_country_uncertain,
    gcd.clean_short_text(creator.birth_province) as birth_province,
    creator.birth_province_uncertain <> 0 as birth_province_uncertain,
    gcd.clean_short_text(creator.birth_city) as birth_city,
    creator.birth_city_uncertain <> 0 as birth_city_uncertain,
    birth.date_year as birth_year,
    birth.date_month as birth_month,
    birth.date_day as birth_day,
    gcd.date_part_is_uncertain(birth_date.year, birth_date.year_uncertain) as birth_year_uncertain,
    gcd.date_part_is_uncertain(birth_date.month, birth_date.month_uncertain) as birth_month_uncertain,
    gcd.date_part_is_uncertain(birth_date.day, birth_date.day_uncertain) as birth_day_uncertain,
    creator.death_country_id::integer as death_country_id,
    creator.death_country_uncertain <> 0 as death_country_uncertain,
    gcd.clean_short_text(creator.death_province) as death_province,
    creator.death_province_uncertain <> 0 as death_province_uncertain,
    gcd.clean_short_text(creator.death_city) as death_city,
    creator.death_city_uncertain <> 0 as death_city_uncertain,
    death.date_year as death_year,
    death.date_month as death_month,
    death.date_day as death_day,
    gcd.date_part_is_uncertain(death_date.year, death_date.year_uncertain) as death_year_uncertain,
    gcd.date_part_is_uncertain(death_date.month, death_date.month_uncertain) as death_month_uncertain,
    gcd.date_part_is_uncertain(death_date.day, death_date.day_uncertain) as death_day_uncertain,
    gcd.clean_long_text(gcd.replace_link_markers(creator.bio)) as bio,
    gcd.clean_long_text(gcd.replace_link_markers(creator.notes)) as notes,
    creator.modified
from gcd_raw.gcd_creator as creator
left join gcd_raw.stddata_date as birth_date on birth_date.id = creator.birth_date_id
left join gcd_raw.stddata_date as death_date on death_date.id = creator.death_date_id
cross join lateral gcd.parse_date_parts(birth_date.year, birth_date.month, birth_date.day) as birth
cross join lateral gcd.parse_date_parts(death_date.year, death_date.month, death_date.day) as death;


create table gcd.creator_name_detail as
select
    name_detail.id::integer as id,
    name_detail.creator_id::integer as creator_id,
    gcd.clean_short_text(name_detail.name) as name,
    gcd.clean_short_text(name_detail.sort_name) as sort_name,
    name_detail.is_official_name <> 0 as is_official_name,
    gcd.clean_short_text(name_detail.family_name) as family_name,
    gcd.clean_short_text(name_detail.given_name) as given_name,
    name_detail.modified
from gcd_raw.gcd_creator_name_detail as name_detail;
