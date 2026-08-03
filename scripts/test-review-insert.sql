SELECT _pulsyn_exec(
  'INSERT INTO marketplace_reviews (id, connector_id, user_id, rating, title, review_text) VALUES ($1, $2, $3, $4, $5, $6)',
  ARRAY['rev-test-123', 'mkt-cmc-markets', 'test-user', '5', 'Great', 'Works well']
);
