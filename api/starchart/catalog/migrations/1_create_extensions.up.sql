-- Trigram matching for search. The pipeline's search indexes use it (gin_trgm_ops).

create extension if not exists pg_trgm;
