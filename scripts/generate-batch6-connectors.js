#!/usr/bin/env node
/**
 * Batch 6: 50 more connectors — APIs, services, tools
 * Focus: things we can test without credentials
 */

const fs = require('fs');
const path = require('path');

const CONNECTORS_DIR = path.join(__dirname, '../packages/core/src/connectors');
const TESTS_DIR = path.join(__dirname, '../packages/core/src/__tests__/lab/connectors');

const apis = [
  // ── Cloud & DevOps ──
  { id: 'dockerhub-search', name: 'Docker Hub Search', baseUrl: 'https://hub.docker.com/v2', tables: [
    { name: 'repositories', endpoint: '/search/repositories/?query=node&page_size=25', fields: [{n:'repo_name',t:'string',pk:true},{n:'short_description',t:'string'},{n:'star_count',t:'number'},{n:'pull_count',t:'number'}] },
  ]},
  { id: 'npm-details', name: 'NPM Package Details', baseUrl: 'https://registry.npmjs.org', tables: [
    { name: 'package', endpoint: '/express/latest', fields: [{n:'name',t:'string',pk:true},{n:'version',t:'string'},{n:'description',t:'string'},{n:'license',t:'string'}] },
  ]},
  { id: 'pypi-package', name: 'PyPI Package', baseUrl: 'https://pypi.org/pypi', tables: [
    { name: 'package', endpoint: '/requests/json', fields: [{n:'name',t:'string',pk:true},{n:'summary',t:'string'},{n:'version',t:'string'},{n:'license',t:'string'}] },
  ]},
  { id: 'rubygems-package', name: 'RubyGems Package', baseUrl: 'https://rubygems.org/api/v1', tables: [
    { name: 'gems', endpoint: '/search.json?query=rails&per_page=20', fields: [{n:'name',t:'string',pk:true},{n:'info',t:'string'},{n:'downloads',t:'number'}] },
  ]},
  { id: 'crates-package', name: 'Crates.io Package', baseUrl: 'https://crates.io/api/v1', tables: [
    { name: 'crates', endpoint: '/crates?per_page=20&sort=downloads', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'description',t:'string'},{n:'downloads',t:'number'},{n:'max_version',t:'string'}] },
  ]},

  // ── News & Social ──
  { id: 'hackernews-item', name: 'Hacker News Items', baseUrl: 'https://hacker-news.firebaseio.com/v0', tables: [
    { name: 'top', endpoint: '/topstories.json', fields: [{n:'id',t:'number',pk:true}] },
  ]},
  { id: 'reddit-rising', name: 'Reddit Rising', baseUrl: 'https://www.reddit.com', tables: [
    { name: 'rising', endpoint: '/r/all/rising.json?limit=25', fields: [{n:'data.id',t:'string',pk:true},{n:'data.title',t:'string'},{n:'data.score',t:'number'}] },
  ]},
  { id: 'lobsters-newest', name: 'Lobsters Newest', baseUrl: 'https://lobste.rs', tables: [
    { name: 'stories', endpoint: '/newest.json', fields: [{n:'short_id',t:'string',pk:true},{n:'title',t:'string'},{n:'score',t:'number'},{n:'tags',t:'json'}] },
  ]},
  { id: 'devto-articles', name: 'DEV.to Articles', baseUrl: 'https://dev.to/api', tables: [
    { name: 'articles', endpoint: '/articles?per_page=20', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'description',t:'string'},{n:'published_at',t:'string'},{n:'tag_list',t:'json'}] },
  ]},
  { id: 'hashnode-posts', name: 'Hashnode Posts', baseUrl: 'https://hashnode.com/api', tables: [
    { name: 'posts', endpoint: '/getFeed?type=NEW&first=20', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'brief',t:'string'}] },
  ]},

  // ── Science & Data ──
  { id: 'nasa-apod-v2', name: 'NASA APOD v2', baseUrl: 'https://api.nasa.gov/planetary', tables: [
    { name: 'apod', endpoint: '/apod?api_key=DEMO_KEY&count=5', fields: [{n:'date',t:'string',pk:true},{n:'title',t:'string'},{n:'explanation',t:'string'},{n:'url',t:'string'}] },
  ]},
  { id: 'spacex-v4', name: 'SpaceX v4', baseUrl: 'https://api.spacexdata.com/v4', tables: [
    { name: 'rockets', endpoint: '/rockets', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'type',t:'string'},{n:'company',t:'string'},{n:'cost_per_launch',t:'number'}] },
    { name: 'launches', endpoint: '/launches', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'date_utc',t:'string'},{n:'success',t:'boolean'}] },
  ]},
  { id: 'opennotify-v2', name: 'OpenNotify v2', baseUrl: 'http://api.open-notify.org', tables: [
    { name: 'iss', endpoint: '/iss-now.json', fields: [{n:'timestamp',t:'number',pk:true},{n:'iss_position',t:'json'}] },
    { name: 'people', endpoint: '/astros.json', fields: [{n:'number',t:'number'},{n:'people',t:'json'}] },
  ]},
  { id: 'solarsystem-bodies', name: 'Solar System Bodies', baseUrl: 'https://api.le-systeme-solaire.net/rest', tables: [
    { name: 'bodies', endpoint: '/bodies?data=id,name,englishName,bodyType,gravity,mass', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'englishName',t:'string'},{n:'bodyType',t:'string'},{n:'gravity',t:'number'}] },
  ]},

  // ── Games & Entertainment ──
  { id: 'pokemontcg-v2', name: 'Pokemon TCG v2', baseUrl: 'https://api.pokemontcg.io/v2', tables: [
    { name: 'cards', endpoint: '/cards?pageSize=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'supertype',t:'string'},{n:'hp',t:'string'}] },
  ]},
  { id: 'scryfall-cards', name: 'Scryfall Cards', baseUrl: 'https://api.scryfall.com', tables: [
    { name: 'cards', endpoint: '/cards/search?q=c%3Ared+cmc%3D1&page=1', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'type_line',t:'string'},{n:'mana_cost',t:'string'}] },
  ]},
  { id: 'yugioh-cards', name: 'Yu-Gi-Oh Cards', baseUrl: 'https://db.ygoprodeck.com/api/v7', tables: [
    { name: 'cards', endpoint: '/cardinfo.php?num=20&offset=0', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'type',t:'string'},{n:'race',t:'string'}] },
  ]},
  { id: 'magic-cards', name: 'MTG Cards', baseUrl: 'https://api.magicthegathering.io/v1', tables: [
    { name: 'cards', endpoint: '/cards?pageSize=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'type',t:'string'},{n:'rarity',t:'string'}] },
  ]},
  { id: 'open5e-spells', name: 'D&D 5e Spells', baseUrl: 'https://api.open5e.com/v1', tables: [
    { name: 'spells', endpoint: '/spells/?limit=20', fields: [{n:'slug',t:'string',pk:true},{n:'name',t:'string'},{n:'level',t:'string'},{n:'school',t:'string'}] },
    { name: 'monsters', endpoint: '/monsters/?limit=20', fields: [{n:'slug',t:'string',pk:true},{n:'name',t:'string'},{n:'type',t:'string'},{n:'challenge_rating',t:'string'}] },
  ]},
  { id: 'deckofcards-shuffle', name: 'Deck of Cards Shuffle', baseUrl: 'https://deckofcardsapi.com/api/deck', tables: [
    { name: 'deck', endpoint: '/new/shuffle/?deck_count=1', fields: [{n:'deck_id',t:'string',pk:true},{n:'remaining',t:'number'},{n:'shuffled',t:'boolean'}] },
  ]},

  // ── Food & Drink ──
  { id: 'themealdb-categories', name: 'TheMealDB Categories', baseUrl: 'https://www.themealdb.com/api/json/v1/1', tables: [
    { name: 'categories', endpoint: '/categories.php', fields: [{n:'idCategory',t:'string',pk:true},{n:'strCategory',t:'string'},{n:'strCategoryDescription',t:'string'}] },
  ]},
  { id: 'thecocktaildb-lists', name: 'TheCocktailDB Lists', baseUrl: 'https://www.thecocktaildb.com/api/json/v1/1', tables: [
    { name: 'categories', endpoint: '/list.php?c=list', fields: [{n:'strCategory',t:'string',pk:true}] },
    { name: 'glasses', endpoint: '/list.php?g=list', fields: [{n:'strGlass',t:'string',pk:true}] },
  ]},
  { id: 'openfoodfacts-search', name: 'Open Food Facts Search', baseUrl: 'https://world.openfoodfacts.org/api/v2', tables: [
    { name: 'products', endpoint: '/search?json=true&page_size=20', fields: [{n:'code',t:'string',pk:true},{n:'product_name',t:'string'},{n:'brands',t:'string'}] },
  ]},

  // ── Geography ──
  { id: 'restcountries-all', name: 'RestCountries All', baseUrl: 'https://restcountries.com/v3.1', tables: [
    { name: 'all', endpoint: '/all?fields=name,cca2,cca3,capital,region,subregion,population,area,flags', fields: [{n:'cca2',t:'string',pk:true},{n:'name',t:'json'},{n:'capital',t:'json'},{n:'region',t:'string'},{n:'population',t:'number'}] },
  ]},
  { id: 'zippopotam-us', name: 'Zippopotam US', baseUrl: 'https://api.zippopotam.us', tables: [
    { name: 'us', endpoint: '/us/90210', fields: [{n:'post code',t:'string',pk:true},{n:'country',t:'string'},{n:'places',t:'json'}] },
  ]},
  { id: 'nominatim-search', name: 'Nominatim Search', baseUrl: 'https://nominatim.openstreetmap.org', tables: [
    { name: 'search', endpoint: '/search?q=London&format=json&limit=10', fields: [{n:'place_id',t:'number',pk:true},{n:'display_name',t:'string'},{n:'lat',t:'string'},{n:'lon',t:'string'}] },
  ]},
  { id: 'geocode-farm', name: 'Geocode Farm', baseUrl: 'https://www.geocode.farm/v3', tables: [
    { name: 'geocode', endpoint: '/json/?addr=London&country=GB', fields: [{n:'address',t:'string',pk:true},{n:'lat',t:'string'},{n:'lng',t:'string'}] },
  ]},

  // ── Weather ──
  { id: 'wttr-in', name: 'wttr.in Weather', baseUrl: 'https://wttr.in', tables: [
    { name: 'weather', endpoint: '/London?format=j1', fields: [{n:'current_condition',t:'json',pk:true},{n:'nearest_area',t:'json'}] },
  ]},
  { id: 'openweathermap-free', name: 'OpenWeatherMap Free', baseUrl: 'https://api.openweathermap.org/data/2.5', tables: [
    { name: 'weather', endpoint: '/weather?q=London&appid=demo', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'main',t:'json'},{n:'weather',t:'json'}] },
  ]},

  // ── Finance ──
  { id: 'coindesk-bpi', name: 'CoinDesk BPI', baseUrl: 'https://api.coindesk.com/v1', tables: [
    { name: 'bpi', endpoint: '/bpi/currentprice.json', fields: [{n:'code',t:'string',pk:true},{n:'rate',t:'string'},{n:'description',t:'string'}] },
  ]},
  { id: 'blockchain-ticker', name: 'Blockchain Ticker', baseUrl: 'https://blockchain.info', tables: [
    { name: 'ticker', endpoint: '/ticker', fields: [{n:'symbol',t:'string',pk:true},{n:'last',t:'number'},{n:'buy',t:'number'},{n:'sell',t:'number'}] },
  ]},
  { id: 'exchangerate-free', name: 'ExchangeRate Free', baseUrl: 'https://open.er-api.com/v6', tables: [
    { name: 'latest', endpoint: '/latest/USD', fields: [{n:'base_code',t:'string',pk:true},{n:'time_last_update_utc',t:'string'},{n:'rates',t:'json'}] },
  ]},

  // ── Quotes & Fun ──
  { id: 'quotable-random', name: 'Quotable Random', baseUrl: 'https://api.quotable.io', tables: [
    { name: 'random', endpoint: '/quotes/random?limit=10', fields: [{n:'_id',t:'string',pk:true},{n:'content',t:'string'},{n:'author',t:'string'},{n:'tags',t:'json'}] },
  ]},
  { id: 'zenquotes-random', name: 'ZenQuotes Random', baseUrl: 'https://zenquotes.io/api', tables: [
    { name: 'quotes', endpoint: '/random', fields: [{n:'q',t:'string',pk:true},{n:'a',t:'string'}] },
  ]},
  { id: 'stoic-quotes', name: 'Stoic Quotes', baseUrl: 'https://stoicquotesapi.com/v1/api', tables: [
    { name: 'quotes', endpoint: '/quotes', fields: [{n:'id',t:'number',pk:true},{n:'body',t:'string'},{n:'author',t:'string'}] },
  ]},
  { id: 'advice-slip-random', name: 'Advice Slip Random', baseUrl: 'https://api.adviceslip.com', tables: [
    { name: 'advice', endpoint: '/advice', fields: [{n:'id',t:'number',pk:true},{n:'advice',t:'string'}] },
  ]},
  { id: 'useless-facts', name: 'Useless Facts', baseUrl: 'https://uselessfacts.jsph.pl/api/v2', tables: [
    { name: 'facts', endpoint: '/facts/random', fields: [{n:'id',t:'string',pk:true},{n:'text',t:'string'},{n:'source',t:'string'}] },
  ]},
  { id: 'bored-api', name: 'Bored API', baseUrl: 'https://bored-api.appbrewery.com', tables: [
    { name: 'activities', endpoint: '/random', fields: [{n:'activity',t:'string',pk:true},{n:'type',t:'string'},{n:'participants',t:'number'},{n:'price',t:'number'}] },
  ]},

  // ── Developer ──
  { id: 'github-zen-v3', name: 'GitHub Zen v3', baseUrl: 'https://api.github.com', tables: [
    { name: 'zen', endpoint: '/zen', fields: [{n:'quote',t:'string',pk:true}] },
    { name: 'meta', endpoint: '/meta', fields: [{n:'hooks',t:'json',pk:true},{n:'api',t:'json'}] },
  ]},
  { id: 'gitlab-public-v2', name: 'GitLab Public v2', baseUrl: 'https://gitlab.com/api/v4', tables: [
    { name: 'projects', endpoint: '/projects?visibility=public&per_page=20&order_by=stars', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'description',t:'string'},{n:'star_count',t:'number'}] },
  ]},

  // ── Status Pages ──
  { id: 'github-status-v2', name: 'GitHub Status v2', baseUrl: 'https://www.githubstatus.com/api/v2', tables: [
    { name: 'status', endpoint: '/status.json', fields: [{n:'status',t:'json',pk:true}] },
  ]},
  { id: 'stripe-status', name: 'Stripe Status', baseUrl: 'https://status.stripe.com/api/v2', tables: [
    { name: 'status', endpoint: '/status.json', fields: [{n:'status',t:'json',pk:true}] },
  ]},
  { id: 'slack-status', name: 'Slack Status', baseUrl: 'https://status.slack.com/api/v2', tables: [
    { name: 'status', endpoint: '/status.json', fields: [{n:'status',t:'json',pk:true}] },
  ]},

  // ── Misc ──
  { id: 'publicapis-random', name: 'Public APIs Random', baseUrl: 'https://api.publicapis.org', tables: [
    { name: 'random', endpoint: '/random', fields: [{n:'API',t:'string',pk:true},{n:'Description',t:'string'},{n:'Category',t:'string'}] },
  ]},
  { id: 'httpbin-uuid', name: 'HTTPBin UUID', baseUrl: 'https://httpbin.org', tables: [
    { name: 'uuid', endpoint: '/uuid', fields: [{n:'uuid',t:'string',pk:true}] },
  ]},
  { id: 'httpbin-base64', name: 'HTTPBin Base64', baseUrl: 'https://httpbin.org', tables: [
    { name: 'decode', endpoint: '/base64/dGVzdA==', fields: [{n:'data',t:'string',pk:true}] },
  ]},
  { id: 'randomuser-v2', name: 'RandomUser v2', baseUrl: 'https://randomuser.me/api', tables: [
    { name: 'users', endpoint: '/?results=20&nat=us,gb', fields: [{n:'login.uuid',t:'string',pk:true},{n:'name',t:'json'},{n:'email',t:'string'},{n:'location',t:'json'}] },
  ]},
  { id: 'ipapi-v2', name: 'ipapi v2', baseUrl: 'https://ipapi.co', tables: [
    { name: 'json', endpoint: '/json', fields: [{n:'ip',t:'string',pk:true},{n:'city',t:'string'},{n:'region',t:'string'},{n:'country_name',t:'string'}] },
  ]},
];

function pascalCase(str) { return str.replace(/(^|-)(\w)/g, (_, _p, c) => c.toUpperCase()); }

function generateConnector(api) {
  const className = pascalCase(api.id) + 'Connector';
  const tablesConst = api.tables.map(t => {
    const cols = t.fields.map(f => `{ name: '${f.n}', type: '${f.t}', nullable: false, primaryKey: ${f.pk || false} }`).join(', ');
    return `{ name: '${t.name}', endpoint: '${t.endpoint}', schema: { name: '${t.name}', table: '${t.name}', columns: [${cols}], primaryKey: ['${t.fields.find(f => f.pk)?.n || t.fields[0].n}'] }, idField: '${t.fields.find(f => f.pk)?.n || t.fields[0].n}' }`;
  }).join(',\n');

  return `// ${api.name} — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
${tablesConst}
];

@registerSource('${api.id}')
export class ${className} extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, '${api.id}', '${api.id}', config, {
      baseUrl: config.host || '${api.baseUrl}',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '${api.tables[0].endpoint.split('?')[0]}',
    });
  }
}
`;
}

function generateTest(api) {
  const tables = api.tables.map(t => `'${t.name}'`).join(', ');
  return `// ${api.name} — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/${api.id}';

const config: ConnectorTestConfig = {
  connectorId: 'test-${api.id}',
  connectorType: 'source',
  engine: '${api.id}',
  config: { host: '${api.baseUrl}' },
  testTables: [${tables}],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
`;
}

let created = 0, skipped = 0;
for (const api of apis) {
  const cp = path.join(CONNECTORS_DIR, `${api.id}.ts`);
  const tp = path.join(TESTS_DIR, `${api.id}.test.ts`);
  if (fs.existsSync(cp)) { skipped++; continue; }
  fs.writeFileSync(cp, generateConnector(api));
  fs.writeFileSync(tp, generateTest(api));
  created++;
}
console.log(`Created: ${created}, Skipped: ${skipped}, Total: ${apis.length}`);
