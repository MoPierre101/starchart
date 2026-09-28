# Comic based movie and TV data sources

2026-09-24

## Best complement to the TMDB ID exports

- **Wikidata** has a structured `based on` relationship, property `P144`, and TMDB IDs for movies (`P4947`) and TV series (`P4983`). Querying those relationships can produce candidates already linked to the IDs in the local TMDB exports.
- Wikidata structured data is CC0. Its public query service supports SPARQL, a graph query language. Use it for bounded candidate discovery and follow its query limits. It is not a complete adaptation catalog: statements may be missing, broad, or point to a character or franchise rather than a particular comic issue.
- Practical local record: `(media_type, tmdb_id)`, Wikidata item, `based_on` item, relationship type, evidence URL, and review status. Review each candidate against the intended scope before including it.

## Other sources

- **IMDb non-commercial TSV downloads** provide title IDs, names, dates, types, and genres, but their listed free files do not include the comic-origin keywords needed for this filter. IMDb's separate bulk data product documents keywords, including title-description keywords such as “based on comic strip”; it requires its own licensing assessment.
- **TVmaze** provides show details and cross references to IMDb or TheTVDB IDs. It is useful for TV metadata and matching, not a definitive comic-origin field.
- **TheTVDB** provides film and TV metadata through a project API with licensing and attribution terms. It is another metadata option, not a direct solution to origin classification.
- **Publisher and studio pages** can verify individual adaptations and franchise membership, but require curated review rather than a universal ID join.

## Recommendation

Use Wikidata to seed candidates through `P144` plus `P4947` or `P4983`; intersect those IDs with the local TMDB exports; manually review the result and add missing titles from publisher or studio lists. Keep the accepted catalog locally. Neither title matching nor any single source gives a complete, reliable comic-origin classification.

## Sources

- https://www.wikidata.org/wiki/Property:P144
- https://www.wikidata.org/wiki/Property:P4947
- https://www.wikidata.org/wiki/Property:P4983
- https://www.wikidata.org/wiki/Wikidata:Licensing
- https://www.wikidata.org/wiki/Wikidata:Reuse
- https://www.mediawiki.org/wiki/Wikidata_query_service/User_Manual
- https://www.imdb.com/interfaces/
- https://data.imdb.com/documentation/bulk-data-documentation/data-dictionary/titles
- https://www.tvmaze.com/api
- https://thetvdb.com/api-information
