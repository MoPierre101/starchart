-- Small tables that give names to ids. They only need the right types.

create table gcd.story_type as
select id::integer as id, name, sort_code::smallint as sort_code
from gcd_raw.gcd_story_type;

create table gcd.credit_type as
select id::integer as id, name, sort_code::smallint as sort_code
from gcd_raw.gcd_credit_type;

create table gcd.series_publication_type as
select id::integer as id, name, gcd.clean_long_text(notes) as notes
from gcd_raw.gcd_series_publication_type;

create table gcd.character_role as
select id::integer as id, name, sort_code::smallint as sort_code
from gcd_raw.gcd_character_role;

create table gcd.series_bond_type as
select id::integer as id, name, gcd.clean_long_text(description) as description, gcd.clean_long_text(notes) as notes
from gcd_raw.gcd_series_bond_type;

create table gcd.story_arc_relation_type as
select id::integer as id, name, description, reverse_description
from gcd_raw.gcd_story_arc_relation_type;

create table gcd.country as
select id::integer as id, code, name
from gcd_raw.stddata_country;

create table gcd.language as
select id::integer as id, code, name, native_name
from gcd_raw.stddata_language;
