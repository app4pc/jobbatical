SELECT
  r.id,
  MIN(r.name) as name,
  MIN(r.created_at) AS "createdAt",
  r.u_count::int as count,
  CASE WHEN count(l) = 0 THEN '[]' ELSE json_agg(l.name) END AS listings
FROM (
  SELECT
    u.id,
    u.name,
    u.created_at,
    count(a)::int AS u_count
  FROM users u
    LEFT JOIN (
      SELECT * FROM applications
      WHERE created_at > now()::DATE - 7
    ) a ON (u.id=a.user_id)
  GROUP BY u.id
  ORDER BY u_count DESC
  LIMIT  ${limit}
  OFFSET  ${offset}
) r
  LEFT JOIN (
    SELECT * FROM (
      SELECT
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn,
        *
      FROM applications
    ) ap
    WHERE ap.rn <= 3
  ) a ON a.user_id=r.id
  LEFT JOIN listings l ON l.id=a.listing_id
GROUP BY r.id, r.u_count
ORDER BY r.u_count DESC
