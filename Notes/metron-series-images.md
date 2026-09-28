# Metron Series Images

2026-09-24

- `GET /api/series/` returns `SeriesList` entries without an image field. `GET /api/series/{id}/` also has no series image field.
- To display a representative cover, request `GET /api/series/{id}/issue_list/` and use an issue's nullable `image` URL. Issue #1 is a sensible choice when present; otherwise choose an available issue with an image.
- This requires another request per series, so cache the selected cover URL when building series grids. A series may have no issue cover at all.

## Sources

- https://github.com/Metron-Project/metron/blob/master/api/README.md
- https://github.com/Metron-Project/metron/discussions/179
- Attached `Metron Comicbook Database.yaml` OpenAPI schema
