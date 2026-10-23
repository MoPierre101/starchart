-- Reprints. Both issues are kept already, so only the story ends need work.
-- Many reprints name a story that was not kept (for example a cover). That story id becomes null.
-- The left joins give the story id only when the story exists in gcd.story.

create table gcd.reprint as
select
    reprint.id::integer as id,
    reprint.origin_issue_id::integer as origin_issue_id,
    reprint.target_issue_id::integer as target_issue_id,
    origin_story.id as origin_id,
    target_story.id as target_id,
    gcd.clean_long_text(reprint.notes) as notes,
    reprint.modified
from gcd_raw.gcd_reprint as reprint
join gcd.issue as origin_issue on origin_issue.id = reprint.origin_issue_id
join gcd.issue as target_issue on target_issue.id = reprint.target_issue_id
left join gcd.story as origin_story on origin_story.id = reprint.origin_id
left join gcd.story as target_story on target_story.id = reprint.target_id;
