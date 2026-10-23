-- Helper functions for the catalog (issues and series). They are created in the gcd schema.

-- First price in the text, for example "2.95 USD; 4.50 CAD" gives 2.95 and USD.
-- Brackets are ignored, "0.00 FREE" gives 0.00 with no currency, and the typos USB, USC and UDD mean USD.
-- Anything else (none, 3d [0-0-3 GBP]) gives nothing. The original text is kept separately.
create function gcd.parse_price(price_text text)
returns table (price_amount numeric(8,2), price_currency text)
language sql immutable as $$
    with first_price as (
        select regexp_match(price_text, '^\s*\[?\s*(\d+(?:\.\d+)?)\s+([A-Z]{3})(?![A-Z])') as found
    )
    select case when found is not null then found[1]::numeric(8,2)
                when price_text ~* '^\s*\[?\s*0\.00\s+free' then 0.00
           end,
           case found[2] when 'USB' then 'USD' when 'USC' then 'USD' when 'UDD' then 'USD' else found[2] end
    from first_price
$$;

-- Groups the many spellings of a rating into six classes.
-- The checks run in this order, so "Parental Advisory" is mature before anything else can match it.
create function gcd.rating_class(rating text) returns text
language sql immutable as $$
    with normalized as (
        select lower(regexp_replace(btrim(coalesce(rating, '')), '\s+', ' ', 'g')) as normalized_rating
    )
    select case
        when normalized_rating = '' or normalized_rating ~ '^\d+$' then 'none'
        when normalized_rating ~ 'comics code'
             or replace(replace(normalized_rating, '.', ''), ' ', '') ~ 'acmp' then 'comics code'
        when normalized_rating ~ 'mature|explicit|17\+|18\+|ages 17|ages 18|rated m\y|^m$|adults|parental advisory|\ypa\y' then 'mature'
        when normalized_rating ~ 'all[- ]ages|everyone|^e$|rated e\y|ages [0-9]\+|^a$|rated a\y|\ypg\y|kids|age 8|children' then 'all ages'
        when normalized_rating ~ '^t\+|\yt\+|teen|^t$|rated? t\y|13\+|13 (and|&) up|ages 1[2-6]|psr|parental supervision' then 'teen'
        else 'other'
    end
    from normalized
$$;

-- The first number in an issue number, so 23.1 sorts after 23. No digits (for example [nn]) gives null.
create function gcd.issue_number_to_number(issue_number text) returns numeric(10,3)
language sql immutable as $$
    select replace((regexp_match(issue_number, '-?\d[\d,]*(?:\.\d+)?'))[1], ',', '')::numeric(10,3)
$$;

-- Digits only, and one entry per barcode when a field holds several separated by ";".
create function gcd.split_barcodes(barcode_text text) returns text[]
language sql immutable as $$
    select array_agg(digits)
    from (
        select regexp_replace(barcode_part, '\D', '', 'g') as digits
        from unnest(string_to_array(barcode_text, ';')) as barcode_part
    ) as barcode_digits
    where digits <> ''
$$;
