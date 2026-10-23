-- Helper functions used by the cleaning files. They are created in the gcd schema.

-- Text -------------------------------------------------------------------------------------

-- Zero-width characters, the byte-order mark and control characters (tabs, line breaks and
-- carriage returns are not removed here).
create function gcd.remove_invisible_characters(value text) returns text
language sql immutable as $$
    select regexp_replace(value, '[​‌‍﻿\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]', '', 'g')
$$;

-- The only mojibake left in the kept data. A blanket fixer would be riskier than these three.
create function gcd.fix_mojibake(value text) returns text
language sql immutable as $$
    select replace(replace(replace(value, 'Ã©', 'é'), 'Ã¡', 'á'), 'â€™', '’')
$$;

-- One line, single spaces. Empty becomes null.
create function gcd.clean_short_text(value text) returns text
language sql immutable as $$
    select nullif(
        btrim(regexp_replace(gcd.remove_invisible_characters(gcd.fix_mojibake(value)), '[\s ]+', ' ', 'g')),
        ''
    )
$$;

-- Keeps line breaks, collapses spaces. Empty becomes null.
create function gcd.clean_long_text(value text) returns text
language sql immutable as $$
    select nullif(
        btrim(
            regexp_replace(
                regexp_replace(
                    regexp_replace(gcd.remove_invisible_characters(gcd.fix_mojibake(value)), '\r\n?', E'\n', 'g'),
                    '[\t  ]+', ' ', 'g'
                ),
                ' ?\n ?', E'\n', 'g'
            ),
            E' \n'
        ),
        ''
    )
$$;

-- Replaces a GCD link marker such as [gcd_link_issue](702) with the name saved in
-- gcd_raw.link_target_name. A marker with no saved name, or a broken one like [gcd_link_series](), is removed.
-- A link written as [label][id] keeps only its label, and the [id]: https://... lines that belong to it are removed.
create function gcd.replace_link_markers(value text) returns text
language plpgsql stable as $$
declare
    marker record;
    target_name text;
begin
    if value is null or position('[' in value) = 0 then
        return value;
    end if;

    for marker in
        select distinct found.parts[1] as marker_text, found.parts[2] as kind, found.parts[3]::bigint as target_id
        from regexp_matches(value, '(\[gcd_link_(?:name_)?([a-z_]+)\]\s*\(\s*(\d+)\s*\))', 'g') as found(parts)
    loop
        select name into target_name
        from gcd_raw.link_target_name
        where kind = marker.kind and target_id = marker.target_id;

        value := replace(value, marker.marker_text, coalesce(target_name, ''));
    end loop;

    value := regexp_replace(value, '\[gcd_link[^\]]*\]\s*\([^)]*\)', '', 'g');

    -- The label may hold one level of brackets of its own.
    value := regexp_replace(value, '\[((?:[^\[\]]|\[[^\]]*\])+)\]\[\d+\]', '\1', 'g');
    return regexp_replace(value, '(^|\n)[ \t]*\[\d+\]: [^\n]*', '', 'g');
end
$$;

-- Dates ------------------------------------------------------------------------------------

-- Only a 4 digit year that does not start with 0.
create function gcd.year_from_text(value text) returns smallint
language sql immutable as $$
    select case when btrim(value) ~ '^[1-9]\d{3}$' then btrim(value)::smallint end
$$;

create function gcd.month_or_day_from_text(value text) returns smallint
language sql immutable as $$
    select case when btrim(value) ~ '^\d{1,2}$' then btrim(value)::smallint end
$$;

create function gcd.last_day_of_month(date_year smallint, date_month smallint) returns smallint
language sql immutable as $$
    select extract(day from make_date(date_year, date_month, 1) + interval '1 month - 1 day')::smallint
$$;

-- Turns the text parts of a date into numbers that are safe to store.
-- A part with a "?" or a wrong value becomes null.
-- Month 13 is GCD's code for a date across the year boundary (for example "Winter 1957-1958").
-- Its month becomes null and the year is kept, so the precision is year.
-- A zero or impossible month becomes null, and so does a day that does not exist in its month.
-- sort_date is the first day of the period. A month 13 date sorts on the last day of the year,
-- so it keeps its place at the end of its year.
create function gcd.parse_date_parts(year_text text, month_text text, day_text text)
returns table (date_year smallint, date_month smallint, date_day smallint, date_precision text, sort_date date)
language sql immutable as $$
    with year_checked as (
        select gcd.year_from_text(year_text) as date_year,
               gcd.month_or_day_from_text(month_text) as date_month,
               gcd.month_or_day_from_text(day_text) as date_day
    ),
    month_checked as (
        select date_year,
               case when date_year is not null and date_month between 1 and 12 then date_month end as date_month,
               date_year is not null and date_month = 13 as is_year_end,
               date_day
        from year_checked
    ),
    day_checked as (
        -- Nested CASE, so the month is known to be 1 to 12 before the day is compared with its last day.
        select date_year,
               date_month,
               is_year_end,
               case when date_month between 1 and 12 then
                   case when date_day between 1 and gcd.last_day_of_month(date_year, date_month) then date_day end
               end as date_day
        from month_checked
    )
    select date_year,
           date_month,
           date_day,
           case when date_year is null then null
                when date_day is not null then 'day'
                when date_month is not null then 'month'
                else 'year' end,
           case when date_year is null then null
                when date_day is not null then make_date(date_year, date_month, date_day)
                when is_year_end then make_date(date_year, 12, 31)
                when date_month is not null then make_date(date_year, date_month, 1)
                else make_date(date_year, 1, 1) end
    from day_checked
$$;

-- Splits "1957-06-12", "1957-06" or "1957" and passes the parts on.
create function gcd.parse_date_text(date_text text)
returns table (date_year smallint, date_month smallint, date_day smallint, date_precision text, sort_date date)
language sql immutable as $$
    select *
    from gcd.parse_date_parts(
        split_part(date_text, '-', 1),
        split_part(date_text, '-', 2),
        split_part(date_text, '-', 3)
    )
$$;

-- True when the uncertain flag is set, or when the text itself has a "?" in it.
create function gcd.date_part_is_uncertain(part_text text, uncertain_flag bigint) returns boolean
language sql immutable as $$
    select coalesce(uncertain_flag, 0) <> 0 or coalesce(part_text ~ '\?', false)
$$;
