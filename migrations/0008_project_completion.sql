-- Freeform markdown "project completion" document, shown to the client at
-- /done/<project-slug> once non-empty. One optional column, not a child
-- table, since there's exactly one completion document per project.

ALTER TABLE projects ADD COLUMN completion_md TEXT;
