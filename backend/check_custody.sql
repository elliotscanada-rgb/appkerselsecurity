SELECT 
  c.consignment_number,
  COUNT(cs.id) as step_count,
  cs.title
FROM consignments c
LEFT JOIN custody_steps cs ON c.id = cs.consignment_id
GROUP BY c.id, c.consignment_number, cs.title
ORDER BY c.id, cs.step_number;
