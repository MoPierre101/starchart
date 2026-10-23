-- Issues first, because the series fixes need the issue dates and the collection tag needs the series.

create table gcd.issue as
select
    issue.id::integer as id,
    issue.series_id::integer as series_id,
    issue.variant_of_id::integer as variant_of_id,
    issue.variant_cover_status::smallint as variant_cover_status,
    gcd.clean_short_text(issue.variant_name) as variant_name,
    gcd.clean_short_text(issue.number) as number,
    gcd.issue_number_to_number(issue.number) as number_sort,
    gcd.clean_short_text(issue.volume) as volume,
    issue.display_volume_with_number <> 0 as display_volume_with_number,
    issue.volume_not_printed <> 0 as volume_not_printed,
    gcd.clean_short_text(issue.title) as title,
    gcd.clean_short_text(issue.publication_date) as publication_date,
    key_date.date_year as key_year,
    key_date.date_month as key_month,
    key_date.date_day as key_day,
    key_date.date_precision as key_date_precision,
    key_date.sort_date as key_sort_date,
    on_sale_date.date_year as on_sale_year,
    on_sale_date.date_month as on_sale_month,
    on_sale_date.date_day as on_sale_day,
    on_sale_date.date_precision as on_sale_date_precision,
    on_sale_date.sort_date as on_sale_sort_date,
    issue.on_sale_date_uncertain <> 0 as on_sale_date_uncertain,
    price.price_amount,
    price.price_currency,
    gcd.clean_short_text(issue.price) as price_text,
    issue.page_count::numeric(7,3) as page_count,
    issue.page_count_uncertain <> 0 as page_count_uncertain,
    gcd.clean_short_text(issue.indicia_frequency) as indicia_frequency,
    nullif(gcd.clean_long_text(issue.editing), '?') as editing,
    gcd.clean_long_text(gcd.replace_link_markers(issue.notes)) as notes,
    nullif(issue.valid_isbn, '') as isbn,
    gcd.clean_short_text(issue.isbn) as isbn_text,
    gcd.split_barcodes(issue.barcode) as barcodes,
    gcd.clean_short_text(issue.rating) as rating,
    gcd.rating_class(issue.rating) as rating_class,
    issue.indicia_publisher_id::integer as indicia_publisher_id,
    issue.indicia_pub_not_printed <> 0 as indicia_publisher_not_printed,
    issue.sort_code::integer as sort_code,
    issue.is_indexed::smallint as is_indexed,
    -- A series that collects earlier issues is a collection. Otherwise an issue with an ISBN in a book binding is a graphic novel.
    case
        when series.publishing_format ilike '%collected%' then 'collection'
        when series.publishing_format ilike '%graphic novel%' then 'graphic novel'
        when issue.isbn <> '' and series.binding ~* 'trade paperback|hardcover|softcover' then 'graphic novel'
        else 'single issue'
    end as kind,
    -- What search matches against: series name, series start year, number, issue year and title, for example "Batman 2016 #50 2018 The Wedding".
    concat_ws(' ',
        gcd.clean_short_text(series.name),
        series.year_began,
        '#' || gcd.clean_short_text(issue.number),
        key_date.date_year,
        gcd.clean_short_text(issue.title)
    ) as search_text,
    issue.modified
from gcd_raw.gcd_issue as issue
join gcd_raw.gcd_series as series on series.id = issue.series_id
cross join lateral gcd.parse_date_text(issue.key_date) as key_date
cross join lateral gcd.parse_date_text(issue.on_sale_date) as on_sale_date
cross join lateral gcd.parse_price(issue.price) as price;


-- Series. The first and last issue and the issue count come from the regular issues, not from the stored values.

create table gcd.series as
with regular_issue_summary as (
    select
        series_id,
        count(*)::integer as issue_count,
        (array_agg(id order by sort_code))[1] as first_issue_id,
        (array_agg(id order by sort_code desc))[1] as last_issue_id,
        max(key_year) as last_issue_year
    from gcd.issue
    where variant_of_id is null
    group by series_id
),
last_issue_years as (
    -- The year of the last issue, but only when it is not before the series started.
    select series.id as series_id,
           case when summary.last_issue_year >= series.year_began then summary.last_issue_year end as last_issue_year
    from gcd_raw.gcd_series as series
    join regular_issue_summary as summary on summary.series_id = series.id
)
select
    series.id::integer as id,
    gcd.clean_short_text(series.name) as name,
    gcd.clean_short_text(series.sort_name) as sort_name,
    series.year_began::smallint as year_began,
    series.year_began_uncertain <> 0 as year_began_uncertain,
    case
        -- An impossible end year, or one before the start year, becomes the year of the last issue.
        when series.year_ended is not null
             and (series.year_ended not between 1900 and 2100 or series.year_ended < series.year_began)
            then last_issue_years.last_issue_year
        -- A series that has ended but has no end year gets the year of the last issue.
        when series.year_ended is null and series.is_current = 0
            then last_issue_years.last_issue_year
        else series.year_ended::smallint
    end as year_ended,
    series.year_ended_uncertain <> 0 as year_ended_uncertain,
    gcd.clean_short_text(series.publication_dates) as publication_dates,
    summary.first_issue_id::integer as first_issue_id,
    summary.last_issue_id::integer as last_issue_id,
    -- An end year means the series is over, even when GCD still marks it as current.
    series.is_current <> 0 and series.year_ended is null as is_current,
    series.publisher_id::integer as publisher_id,
    series.country_id::integer as country_id,
    series.language_id::integer as language_id,
    gcd.clean_long_text(gcd.replace_link_markers(series.tracking_notes)) as tracking_notes,
    gcd.clean_long_text(gcd.replace_link_markers(series.notes)) as notes,
    summary.issue_count,
    gcd.clean_short_text(series.color) as color,
    gcd.clean_short_text(series.dimensions) as dimensions,
    gcd.clean_short_text(series.paper_stock) as paper_stock,
    gcd.clean_short_text(series.binding) as binding,
    lower(gcd.clean_short_text(series.publishing_format)) as publishing_format,
    series.publication_type_id::integer as publication_type_id,
    series.is_singleton <> 0 as is_singleton,
    series.modified
from gcd_raw.gcd_series as series
join regular_issue_summary as summary on summary.series_id = series.id
join last_issue_years on last_issue_years.series_id = series.id;

-- A series with no regular issue is dropped (the join above), and so are the variants that sat in it.
delete from gcd.issue
where series_id not in (select id from gcd.series);


-- Publishers. The stored counts were out of date, so the counts are worked out here.

create table gcd.publisher as
select
    publisher.id::integer as id,
    gcd.clean_short_text(publisher.name) as name,
    publisher.country_id::integer as country_id,
    publisher.year_began::smallint as year_began,
    publisher.year_began_uncertain <> 0 as year_began_uncertain,
    publisher.year_ended::smallint as year_ended,
    publisher.year_ended_uncertain <> 0 as year_ended_uncertain,
    publisher.year_overall_began::smallint as year_overall_began,
    publisher.year_overall_began_uncertain <> 0 as year_overall_began_uncertain,
    publisher.year_overall_ended::smallint as year_overall_ended,
    publisher.year_overall_ended_uncertain <> 0 as year_overall_ended_uncertain,
    gcd.clean_long_text(gcd.replace_link_markers(publisher.notes)) as notes,
    gcd.clean_short_text(publisher.url) as url,
    (select count(*) from gcd.series where series.publisher_id = publisher.id)::integer as series_count,
    (select count(*) from gcd.series join gcd.issue on issue.series_id = series.id and issue.variant_of_id is null
     where series.publisher_id = publisher.id)::integer as issue_count,
    publisher.modified
from gcd_raw.gcd_publisher as publisher;


create table gcd.indicia_publisher as
select
    indicia_publisher.id::integer as id,
    gcd.clean_short_text(indicia_publisher.name) as name,
    indicia_publisher.parent_id::integer as parent_id,
    indicia_publisher.country_id::integer as country_id,
    indicia_publisher.year_began::smallint as year_began,
    indicia_publisher.year_began_uncertain <> 0 as year_began_uncertain,
    indicia_publisher.year_ended::smallint as year_ended,
    indicia_publisher.year_ended_uncertain <> 0 as year_ended_uncertain,
    indicia_publisher.is_surrogate <> 0 as is_surrogate,
    gcd.clean_long_text(indicia_publisher.notes) as notes,
    gcd.clean_short_text(indicia_publisher.url) as url,
    indicia_publisher.modified
from gcd_raw.gcd_indicia_publisher as indicia_publisher;


create table gcd.series_bond as
select
    series_bond.id::integer as id,
    series_bond.origin_id::integer as origin_id,
    series_bond.target_id::integer as target_id,
    case when series_bond.origin_issue_id in (select id from gcd.issue) then series_bond.origin_issue_id::integer end as origin_issue_id,
    case when series_bond.target_issue_id in (select id from gcd.issue) then series_bond.target_issue_id::integer end as target_issue_id,
    series_bond.bond_type_id::integer as bond_type_id,
    gcd.clean_long_text(series_bond.notes) as notes
from gcd_raw.gcd_series_bond as series_bond
where series_bond.origin_id in (select id from gcd.series)
  and series_bond.target_id in (select id from gcd.series);
