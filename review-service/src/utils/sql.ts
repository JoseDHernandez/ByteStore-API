import { ISO_DATE_FORMAT } from "./date.ts";

export const REVIEW_SELECT_FIELDS = `
  r.id as id,
  r.user_id as user_id,
  r.product_id as product_id,
  r.qualification as qualification,
  r.comment as comment,
  DATE_FORMAT(r.review_date, '${ISO_DATE_FORMAT}') as review_date,
  u.user_name as user_name
`;