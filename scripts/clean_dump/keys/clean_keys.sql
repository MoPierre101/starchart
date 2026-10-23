-- Primary keys, foreign keys and indexes. They are added last, so a row that points at nothing stops the run
-- with an error. That makes this file the final check of the cleaning.

-- Primary keys
alter table gcd.story_type add primary key (id);
alter table gcd.credit_type add primary key (id);
alter table gcd.series_publication_type add primary key (id);
alter table gcd.character_role add primary key (id);
alter table gcd.series_bond_type add primary key (id);
alter table gcd.story_arc_relation_type add primary key (id);
alter table gcd.country add primary key (id);
alter table gcd.language add primary key (id);
alter table gcd.publisher add primary key (id);
alter table gcd.indicia_publisher add primary key (id);
alter table gcd.series add primary key (id);
alter table gcd.issue add primary key (id);
alter table gcd.series_bond add primary key (id);
alter table gcd.story add primary key (id);
alter table gcd.creator add primary key (id);
alter table gcd.creator_name_detail add primary key (id);
alter table gcd.story_credit add primary key (id);
alter table gcd.issue_credit add primary key (id);
alter table gcd.character add primary key (id);
alter table gcd.character_name_detail add primary key (id);
alter table gcd.story_character add primary key (id);
alter table gcd.reprint add primary key (id);
alter table gcd.story_arc add primary key (id);
alter table gcd.story_story_arc add primary key (id);
alter table gcd.story_arc_relation add primary key (id);
alter table gcd.tag add primary key (id);
alter table gcd.story_tag add primary key (story_id, tag_id);

-- Unique values
alter table gcd.tag add unique (name);
alter table gcd.tag add unique (slug);

-- Foreign keys: catalog
alter table gcd.publisher add foreign key (country_id) references gcd.country (id);
alter table gcd.indicia_publisher add foreign key (parent_id) references gcd.publisher (id);
alter table gcd.indicia_publisher add foreign key (country_id) references gcd.country (id);
alter table gcd.series add foreign key (publisher_id) references gcd.publisher (id);
alter table gcd.series add foreign key (country_id) references gcd.country (id);
alter table gcd.series add foreign key (language_id) references gcd.language (id);
alter table gcd.series add foreign key (publication_type_id) references gcd.series_publication_type (id);
alter table gcd.series add foreign key (first_issue_id) references gcd.issue (id);
alter table gcd.series add foreign key (last_issue_id) references gcd.issue (id);
alter table gcd.issue add foreign key (series_id) references gcd.series (id);
alter table gcd.issue add foreign key (variant_of_id) references gcd.issue (id);
alter table gcd.issue add foreign key (indicia_publisher_id) references gcd.indicia_publisher (id);
alter table gcd.series_bond add foreign key (origin_id) references gcd.series (id);
alter table gcd.series_bond add foreign key (target_id) references gcd.series (id);
alter table gcd.series_bond add foreign key (origin_issue_id) references gcd.issue (id);
alter table gcd.series_bond add foreign key (target_issue_id) references gcd.issue (id);
alter table gcd.series_bond add foreign key (bond_type_id) references gcd.series_bond_type (id);

-- Foreign keys: stories, credits and creators
alter table gcd.story add foreign key (issue_id) references gcd.issue (id);
alter table gcd.story add foreign key (type_id) references gcd.story_type (id);
alter table gcd.creator add foreign key (birth_country_id) references gcd.country (id);
alter table gcd.creator add foreign key (death_country_id) references gcd.country (id);
alter table gcd.creator_name_detail add foreign key (creator_id) references gcd.creator (id);
alter table gcd.story_credit add foreign key (story_id) references gcd.story (id);
alter table gcd.story_credit add foreign key (creator_id) references gcd.creator (id);
alter table gcd.story_credit add foreign key (credit_type_id) references gcd.credit_type (id);
alter table gcd.issue_credit add foreign key (issue_id) references gcd.issue (id);
alter table gcd.issue_credit add foreign key (creator_id) references gcd.creator (id);
alter table gcd.issue_credit add foreign key (credit_type_id) references gcd.credit_type (id);

-- Foreign keys: characters, reprints, arcs and tags
alter table gcd.character add foreign key (language_id) references gcd.language (id);
alter table gcd.character_name_detail add foreign key (character_id) references gcd.character (id);
alter table gcd.story_character add foreign key (story_id) references gcd.story (id);
alter table gcd.story_character add foreign key (character_id) references gcd.character (id);
alter table gcd.story_character add foreign key (role_id) references gcd.character_role (id);
alter table gcd.reprint add foreign key (origin_issue_id) references gcd.issue (id);
alter table gcd.reprint add foreign key (target_issue_id) references gcd.issue (id);
alter table gcd.reprint add foreign key (origin_id) references gcd.story (id);
alter table gcd.reprint add foreign key (target_id) references gcd.story (id);
alter table gcd.story_arc add foreign key (language_id) references gcd.language (id);
alter table gcd.story_story_arc add foreign key (story_id) references gcd.story (id);
alter table gcd.story_story_arc add foreign key (story_arc_id) references gcd.story_arc (id);
alter table gcd.story_arc_relation add foreign key (from_story_arc_id) references gcd.story_arc (id);
alter table gcd.story_arc_relation add foreign key (to_story_arc_id) references gcd.story_arc (id);
alter table gcd.story_arc_relation add foreign key (relation_type_id) references gcd.story_arc_relation_type (id);
alter table gcd.story_tag add foreign key (story_id) references gcd.story (id);
alter table gcd.story_tag add foreign key (tag_id) references gcd.tag (id);

-- Indexes for the joins the app will make most often (Postgres does not index a foreign key by itself)
create index on gcd.issue (series_id);
create index on gcd.issue (variant_of_id);
create index on gcd.story (issue_id);
create index on gcd.story_credit (story_id);
create index on gcd.story_credit (creator_id);
create index on gcd.issue_credit (issue_id);
create index on gcd.story_character (story_id);
create index on gcd.story_character (character_id);
create index on gcd.reprint (origin_issue_id);
create index on gcd.reprint (target_issue_id);
create index on gcd.story_tag (tag_id);

-- Trigram indexes for search. gin_trgm_ops comes from the pg_trgm extension, which an Encore migration creates.
create index on gcd.issue using gin (search_text gin_trgm_ops);
create index on gcd.creator using gin (gcd_official_name gin_trgm_ops);
create index on gcd.creator_name_detail using gin (name gin_trgm_ops);
create index on gcd.character using gin (name gin_trgm_ops);
create index on gcd.character_name_detail using gin (name gin_trgm_ops);
