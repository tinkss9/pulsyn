-- Seed marketplace with 25+ connectors across all categories
-- Run: supabase db query --linked --file scripts/seed-marketplace-v2.sql

INSERT INTO marketplace_connectors (id, publisher_id, name, slug, description, engine, category, config_template, is_verified, is_published, version)
VALUES
  -- FOREX
  ('mkt-ig-group', 'pulsyn-team', 'IG Group', 'ig-group',
   'Real-time forex, indices, and commodities from IG Group REST API. Streaming prices, positions, and account activity.',
   'ig-group', 'forex',
   '{"baseUrl":"https://demo-api.ig.com/gateway/deal","authType":"apikey","resources":[{"name":"prices","endpoint":"/prices/{epic}","idField":"epic","modifiedField":"snapshotTime"},{"name":"positions","endpoint":"/positions","idField":"position","modifiedField":"updated"}],"rateLimit":{"requestsPerSecond":10}}',
   true, true, '1.0.0'),

  ('mkt-fxcm', 'pulsyn-team', 'FXCM', 'fxcm',
   'Real-time forex streaming from FXCM REST API. Candle data, tick data, account activity, and order management.',
   'fxcm', 'forex',
   '{"baseUrl":"https://api-demo.fxcm.com:443","authType":"apikey","resources":[{"name":"candles","endpoint":"/candles/{symbol}/{timeframe}","idField":"Timestamp","modifiedField":"Timestamp"},{"name":"trades","endpoint":"/trades","idField":"TradeId","modifiedField":"Opened"}],"rateLimit":{"requestsPerSecond":8}}',
   true, true, '1.0.0'),

  -- CRYPTO
  ('mkt-coinbase', 'pulsyn-team', 'Coinbase', 'coinbase',
   'Real-time cryptocurrency data from Coinbase Advanced Trade API. Candles, trades, order book, and ticker data.',
   'coinbase', 'crypto',
   '{"baseUrl":"https://api.coinbase.com/api/v3","authType":"apikey","resources":[{"name":"candles","endpoint":"/brokerage/market/products/{product_id}/candles","idField":"start","modifiedField":"start"},{"name":"trades","endpoint":"/brokerage/market/products/{product_id}/ticker","idField":"trade_id","modifiedField":"time"}],"rateLimit":{"requestsPerSecond":10}}',
   true, true, '1.0.0'),

  ('mkt-kraken', 'pulsyn-team', 'Kraken', 'kraken',
   'Real-time cryptocurrency data from Kraken REST API. OHLC, trades, spread, ticker, and order book.',
   'kraken', 'crypto',
   '{"baseUrl":"https://api.kraken.com/0","authType":"apikey","resources":[{"name":"ohlc","endpoint":"/public/OHLC?pair={pair}","idField":"time","modifiedField":"time"},{"name":"trades","endpoint":"/public/Trades?pair={pair}","idField":"trade_id","modifiedField":"time"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0'),

  ('mkt-coingecko', 'pulsyn-team', 'CoinGecko', 'coingecko',
   'Free cryptocurrency market data from CoinGecko. Prices, market cap, volume, exchanges, and trending coins.',
   'coingecko', 'crypto',
   '{"baseUrl":"https://api.coingecko.com/api/v3","authType":"none","resources":[{"name":"coins","endpoint":"/coins/markets?vs_currency=usd","idField":"id","modifiedField":"last_updated"},{"name":"trending","endpoint":"/search/trending","idField":"item_id","modifiedField":"data"}],"rateLimit":{"requestsPerSecond":10}}',
   true, true, '1.0.0'),

  -- DATABASES
  ('mkt-supabase', 'pulsyn-team', 'Supabase', 'supabase',
   'Real-time PostgreSQL replication from Supabase. Auth users, database tables, storage objects, and Edge Functions.',
   'supabase', 'database',
   '{"baseUrl":"https://{project_ref}.supabase.co","authType":"apikey","resources":[{"name":"tables","endpoint":"/rest/v1/{table}","idField":"id","modifiedField":"updated_at"},{"name":"auth_users","endpoint":"/auth/v1/admin/users","idField":"id","modifiedField":"updated_at"}],"rateLimit":{"requestsPerSecond":20}}',
   true, true, '1.0.0'),

  ('mkt-plantstore', 'pulsyn-team', 'PlanetScale', 'planetscale',
   'Serverless MySQL replication from PlanetScale. Database branches, deploy requests, and schema changes.',
   'planetscale', 'database',
   '{"baseUrl":"https://api.planetscale.com/v1","authType":"apikey","resources":[{"name":"databases","endpoint":"/organizations/{org}/databases","idField":"id","modifiedField":"updated_at"},{"name":"branches","endpoint":"/organizations/{org}/databases/{db}/branches","idField":"id","modifiedField":"updated_at"}],"rateLimit":{"requestsPerSecond":10}}',
   true, true, '1.0.0'),

  -- SAAS
  ('mkt-salesforce', 'pulsyn-team', 'Salesforce', 'salesforce',
   'Real-time CRM data from Salesforce REST API. Accounts, contacts, opportunities, leads, and custom objects.',
   'salesforce', 'saas',
   '{"baseUrl":"https://{instance}.salesforce.com/services/data/v58.0","authType":"oauth2_refresh","resources":[{"name":"accounts","endpoint":"/sobjects/Account","idField":"Id","modifiedField":"LastModifiedDate"},{"name":"contacts","endpoint":"/sobjects/Contact","idField":"Id","modifiedField":"LastModifiedDate"},{"name":"opportunities","endpoint":"/sobjects/Opportunity","idField":"Id","modifiedField":"LastModifiedDate"}],"rateLimit":{"requestsPerSecond":25}}',
   true, true, '1.0.0'),

  ('mkt-hubspot', 'pulsyn-team', 'HubSpot', 'hubspot',
   'Real-time CRM data from HubSpot API. Contacts, companies, deals, tickets, and custom objects.',
   'hubspot', 'saas',
   '{"baseUrl":"https://api.hubapi.com","authType":"apikey","resources":[{"name":"contacts","endpoint":"/crm/v3/objects/contacts","idField":"id","modifiedField":"updatedAt"},{"name":"companies","endpoint":"/crm/v3/objects/companies","idField":"id","modifiedField":"updatedAt"},{"name":"deals","endpoint":"/crm/v3/objects/deals","idField":"id","modifiedField":"updatedAt"}],"rateLimit":{"requestsPerSecond":10}}',
   true, true, '1.0.0'),

  ('mkt-shopify', 'pulsyn-team', 'Shopify', 'shopify',
   'Real-time e-commerce data from Shopify Admin API. Orders, products, customers, inventory, and webhooks.',
   'shopify', 'saas',
   '{"baseUrl":"https://{store}.myshopify.com/admin/api/2024-01","authType":"apikey","resources":[{"name":"orders","endpoint":"/orders.json","idField":"id","modifiedField":"updated_at"},{"name":"products","endpoint":"/products.json","idField":"id","modifiedField":"updated_at"},{"name":"customers","endpoint":"/customers.json","idField":"id","modifiedField":"updated_at"}],"rateLimit":{"requestsPerSecond":2}}',
   true, true, '1.0.0'),

  ('mkt-slack', 'pulsyn-team', 'Slack', 'slack',
   'Real-time workspace data from Slack API. Messages, channels, users, files, and reactions.',
   'slack', 'saas',
   '{"baseUrl":"https://slack.com/api","authType":"apikey","resources":[{"name":"conversations","endpoint":"/conversations.list","idField":"id","modifiedField":"updated"},{"name":"messages","endpoint":"/conversations.history","idField":"ts","modifiedField":"ts"},{"name":"users","endpoint":"/users.list","idField":"id","modifiedField":"updated"}],"rateLimit":{"requestsPerSecond":1}}',
   true, true, '1.0.0'),

  ('mkt-github', 'pulsyn-team', 'GitHub', 'github',
   'Real-time repository data from GitHub API. Commits, issues, pull requests, releases, and webhooks.',
   'github', 'saas',
   '{"baseUrl":"https://api.github.com","authType":"apikey","resources":[{"name":"repos","endpoint":"/user/repos","idField":"id","modifiedField":"updated_at"},{"name":"issues","endpoint":"/repos/{owner}/{repo}/issues","idField":"id","modifiedField":"updated_at"},{"name":"pulls","endpoint":"/repos/{owner}/{repo}/pulls","idField":"id","modifiedField":"updated_at"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0'),

  ('mkt-notion', 'pulsyn-team', 'Notion', 'notion',
   'Real-time workspace data from Notion API. Pages, databases, blocks, and users.',
   'notion', 'saas',
   '{"baseUrl":"https://api.notion.com/v1","authType":"apikey","resources":[{"name":"databases","endpoint":"/databases","idField":"id","modifiedField":"last_edited_time"},{"name":"pages","endpoint":"/pages","idField":"id","modifiedField":"last_edited_time"}],"rateLimit":{"requestsPerSecond":3}}',
   true, true, '1.0.0'),

  -- PAYMENTS
  ('mkt-stripe-payments', 'pulsyn-team', 'Stripe Payments', 'stripe-payments',
   'Real-time payment data from Stripe API. Charges, refunds, disputes, payouts, and balance transactions.',
   'stripe', 'payments',
   '{"baseUrl":"https://api.stripe.com/v1","authType":"apikey","resources":[{"name":"charges","endpoint":"/charges","idField":"id","modifiedField":"created"},{"name":"refunds","endpoint":"/refunds","idField":"id","modifiedField":"created"},{"name":"payouts","endpoint":"/payouts","idField":"id","modifiedField":"created"}],"rateLimit":{"requestsPerSecond":25}}',
   true, true, '1.0.0'),

  ('mkt-paypal', 'pulsyn-team', 'PayPal', 'paypal',
   'Real-time payment data from PayPal API. Payments, invoices, subscriptions, and webhooks.',
   'paypal', 'payments',
   '{"baseUrl":"https://api-m.paypal.com/v1","authType":"oauth2_client","resources":[{"name":"payments","endpoint":"/payments/payment","idField":"id","modifiedField":"update_time"},{"name":"invoices","endpoint":"/invoicing/invoices","idField":"id","modifiedField":"last_updated_date"}],"rateLimit":{"requestsPerSecond":10}}',
   true, true, '1.0.0'),

  -- ANALYTICS
  ('mkt-amplitude', 'pulsyn-team', 'Amplitude', 'amplitude',
   'Real-time product analytics from Amplitude API. Events, user profiles, cohorts, and behavioral data.',
   'amplitude', 'analytics',
   '{"baseUrl":"https://amplitude.com/api/2","authType":"apikey","resources":[{"name":"events","endpoint":"/events","idField":"event_id","modifiedField":"event_time"},{"name":"users","endpoint":"/usersearch","idField":"user_id","modifiedField":"last_device_time"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0'),

  ('mkt-mixpanel', 'pulsyn-team', 'Mixpanel', 'mixpanel',
   'Real-time product analytics from Mixpanel API. Events, funnels, retention, and user profiles.',
   'mixpanel', 'analytics',
   '{"baseUrl":"https://data.mixpanel.com/api/2.0","authType":"apikey","resources":[{"name":"events","endpoint":"/export?from_date={from}&to_date={to}","idField":"event","modifiedField":"properties.time"},{"name":"engage","endpoint":"/engage","idField":"distinct_id","modifiedField":"$last_seen"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0'),

  -- HEALTHCARE
  ('mkt-epic', 'pulsyn-team', 'Epic EHR', 'epic',
   'Real-time healthcare data from Epic EHR via FHIR R4 API. Patients, encounters, observations, and medications.',
   'epic', 'healthcare',
   '{"baseUrl":"https://fhir.epic.com/interconnect-fhir-oauth","authType":"oauth2_refresh","resources":[{"name":"patients","endpoint":"/Patient","idField":"id","modifiedField":"meta.lastUpdated"},{"name":"encounters","endpoint":"/Encounter","idField":"id","modifiedField":"meta.lastUpdated"},{"name":"observations","endpoint":"/Observation","idField":"id","modifiedField":"meta.lastUpdated"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0'),

  ('mkt-cerner', 'pulsyn-team', 'Oracle Health (Cerner)', 'cerner',
   'Real-time healthcare data from Oracle Health (Cerner) via FHIR R4 API. Clinical data, demographics, and workflows.',
   'cerner', 'healthcare',
   '{"baseUrl":"https://fhir-myrecord.cerner.com/r4","authType":"oauth2_refresh","resources":[{"name":"patients","endpoint":"/Patient","idField":"id","modifiedField":"meta.lastUpdated"},{"name":"conditions","endpoint":"/Condition","idField":"id","modifiedField":"meta.lastUpdated"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0'),

  -- FINTECH
  ('mkt-plaid', 'pulsyn-team', 'Plaid', 'plaid',
   'Real-time banking data from Plaid API. Accounts, transactions, balances, and identity verification.',
   'plaid', 'fintech',
   '{"baseUrl":"https://production.plaid.com","authType":"apikey","resources":[{"name":"accounts","endpoint":"/accounts/get","idField":"account_id","modifiedField":"updated_at"},{"name":"transactions","endpoint":"/transactions/get","idField":"transaction_id","modifiedField":"date"}],"rateLimit":{"requestsPerSecond":10}}',
   true, true, '1.0.0'),

  ('mkt-mercury', 'pulsyn-team', 'Mercury', 'mercury',
   'Real-time banking data from Mercury API. Accounts, transactions, recipients, and treasury data.',
   'mercury', 'fintech',
   '{"baseUrl":"https://api.mercury.com/api/v1","authType":"apikey","resources":[{"name":"accounts","endpoint":"/accounts","idField":"id","modifiedField":"createdAt"},{"name":"transactions","endpoint":"/accounts/{id}/transactions","idField":"id","modifiedField":"createdAt"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0'),

  -- EDUCATION
  ('mkt-canvas-lms', 'pulsyn-team', 'Canvas LMS', 'canvas-lms',
   'Real-time learning management data from Canvas LMS API. Courses, enrollments, assignments, and submissions.',
   'canvas-lms', 'education',
   '{"baseUrl":"https://{institution}.instructure.com/api/v1","authType":"apikey","resources":[{"name":"courses","endpoint":"/courses","idField":"id","modifiedField":"updated_at"},{"name":"enrollments","endpoint":"/courses/{id}/enrollments","idField":"id","modifiedField":"updated_at"},{"name":"assignments","endpoint":"/courses/{id}/assignments","idField":"id","modifiedField":"updated_at"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0'),

  -- GOVERNMENT
  ('mkt-salesforce-gov', 'pulsyn-team', 'Salesforce Gov Cloud', 'salesforce-gov',
   'Real-time government CRM data from Salesforce Government Cloud. FedRAMP compliant. Contacts, cases, and programs.',
   'salesforce-gov', 'government',
   '{"baseUrl":"https://{instance}.salesforce.com/services/data/v58.0","authType":"oauth2_refresh","resources":[{"name":"contacts","endpoint":"/sobjects/Contact","idField":"Id","modifiedField":"LastModifiedDate"},{"name":"cases","endpoint":"/sobjects/Case","idField":"Id","modifiedField":"LastModifiedDate"}],"rateLimit":{"requestsPerSecond":25}}',
   true, true, '1.0.0'),

  -- LOGISTICS
  ('mkt-shipbob', 'pulsyn-team', 'ShipBob', 'shipbob',
   'Real-time fulfillment data from ShipBob API. Orders, inventory, shipments, and tracking.',
   'shipbob', 'logistics',
   '{"baseUrl":"https://api.shipbob.com/2023-10","authType":"apikey","resources":[{"name":"orders","endpoint":"/order","idField":"id","modifiedField":"lastUpdatedDate"},{"name":"inventory","endpoint":"/inventory","idField":"id","modifiedField":"lastUpdatedDate"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0'),

  -- TRAVEL
  ('mkt-amadeus', 'pulsyn-team', 'Amadeus', 'amadeus',
   'Real-time travel data from Amadeus API. Flights, hotels, car rentals, and airport information.',
   'amadeus', 'travel',
   '{"baseUrl":"https://api.amadeus.com/v1","authType":"oauth2_client","resources":[{"name":"flights","endpoint":"/shopping/flight-offers","idField":"id","modifiedField":"lastTicketingDate"},{"name":"hotels","endpoint":"/shopping/hotel-offers","idField":"hotelId","modifiedField":"lastUpdate"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0')

ON CONFLICT (id) DO NOTHING;

-- Update download counts for popular connectors
UPDATE marketplace_connectors SET download_count = 847 WHERE id = 'mkt-cmc-markets';
UPDATE marketplace_connectors SET download_count = 623 WHERE id = 'mkt-oanda';
UPDATE marketplace_connectors SET download_count = 512 WHERE id = 'mkt-polygon-io';
UPDATE marketplace_connectors SET download_count = 445 WHERE id = 'mkt-binance';
UPDATE marketplace_connectors SET download_count = 334 WHERE id = 'mkt-dexscreener';
UPDATE marketplace_connectors SET download_count = 289 WHERE id = 'mkt-alpha-vantage';
UPDATE marketplace_connectors SET download_count = 201 WHERE id = 'mkt-stripe-payments';
UPDATE marketplace_connectors SET download_count = 178 WHERE id = 'mkt-supabase';
UPDATE marketplace_connectors SET download_count = 156 WHERE id = 'mkt-hubspot';
UPDATE marketplace_connectors SET download_count = 134 WHERE id = 'mkt-shopify';

-- Update ratings for popular connectors
UPDATE marketplace_connectors SET avg_rating = 4.8, rating_count = 42 WHERE id = 'mkt-cmc-markets';
UPDATE marketplace_connectors SET avg_rating = 4.6, rating_count = 38 WHERE id = 'mkt-oanda';
UPDATE marketplace_connectors SET avg_rating = 4.5, rating_count = 31 WHERE id = 'mkt-polygon-io';
UPDATE marketplace_connectors SET avg_rating = 4.4, rating_count = 28 WHERE id = 'mkt-binance';
UPDATE marketplace_connectors SET avg_rating = 4.3, rating_count = 19 WHERE id = 'mkt-stripe-payments';
UPDATE marketplace_connectors SET avg_rating = 4.7, rating_count = 25 WHERE id = 'mkt-supabase';
UPDATE marketplace_connectors SET avg_rating = 4.5, rating_count = 22 WHERE id = 'mkt-hubspot';
UPDATE marketplace_connectors SET avg_rating = 4.2, rating_count = 15 WHERE id = 'mkt-github';

NOTIFY pgrst, 'reload schema';
