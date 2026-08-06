#!/usr/bin/env node
/**
 * Batch 5: 50 more connectors — free APIs, developer tools, cloud services
 * All have free tiers or no auth required
 */

const fs = require('fs');
const path = require('path');

const CONNECTORS_DIR = path.join(__dirname, '../packages/core/src/connectors');
const TESTS_DIR = path.join(__dirname, '../packages/core/src/__tests__/lab/connectors');

const apis = [
  // ── Developer Tools (free APIs) ──
  { id: 'github-repos', name: 'GitHub Repos', baseUrl: 'https://api.github.com', tables: [
    { name: 'repos', endpoint: '/repositories?per_page=30', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'full_name',t:'string'},{n:'description',t:'string'},{n:'stargazers_count',t:'number'},{n:'language',t:'string'}] },
    { name: 'trending', endpoint: '/search/repositories?q=stars:>1000&sort=stars&per_page=30', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'stargazers_count',t:'number'}] },
  ]},
  { id: 'github-users-explore', name: 'GitHub Users Explore', baseUrl: 'https://api.github.com', tables: [
    { name: 'users', endpoint: '/users?since=0&per_page=30', fields: [{n:'login',t:'string',pk:true},{n:'id',t:'number'},{n:'type',t:'string'}] },
  ]},
  { id: 'gitlab-projects', name: 'GitLab Projects', baseUrl: 'https://gitlab.com/api/v4', tables: [
    { name: 'projects', endpoint: '/projects?visibility=public&per_page=20&order_by=stars', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'description',t:'string'},{n:'web_url',t:'string'},{n:'star_count',t:'number'}] },
  ]},
  { id: 'npm-trending', name: 'NPM Trending', baseUrl: 'https://registry.npmjs.org', tables: [
    { name: 'search', endpoint: '/-/v1/search?text=keywords:react&size=20&popularity=1.0', fields: [{n:'package.name',t:'string',pk:true},{n:'package.description',t:'string'},{n:'package.version',t:'string'},{n:'score.final',t:'number'}] },
  ]},
  { id: 'pypi-trending', name: 'PyPI Trending', baseUrl: 'https://hugovk.github.io/top-pypi-packages', tables: [
    { name: 'top', endpoint: '/top-pypi-packages-30-days.min.json', fields: [{n:'project',t:'string',pk:true},{n:'download_count',t:'number'}] },
  ]},
  { id: 'crates-trending', name: 'Crates.io Trending', baseUrl: 'https://crates.io/api/v1', tables: [
    { name: 'crates', endpoint: '/crates?sort=recent-downloads&per_page=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'description',t:'string'},{n:'downloads',t:'number'},{n:'max_version',t:'string'}] },
  ]},

  // ── Package Managers ──
  { id: 'maven-search', name: 'Maven Search', baseUrl: 'https://search.maven.org/solrsearch/select', tables: [
    { name: 'artifacts', endpoint: '?q=g:org.springframework&rows=20&wt=json', fields: [{n:'id',t:'string',pk:true},{n:'g',t:'string'},{n:'a',t:'string'},{n:'latestVersion',t:'string'},{n:'timestamp',t:'number'}] },
  ]},
  { id: 'rubygems-search', name: 'RubyGems Search', baseUrl: 'https://rubygems.org/api/v1', tables: [
    { name: 'gems', endpoint: '/search.json?query=rails&per_page=20', fields: [{n:'name',t:'string',pk:true},{n:'info',t:'string'},{n:'downloads',t:'number'},{n:'version',t:'string'}] },
  ]},
  { id: 'packagist-search', name: 'Packagist Search', baseUrl: 'https://packagist.org', tables: [
    { name: 'packages', endpoint: '/search.json?q=laravel&per_page=20', fields: [{n:'name',t:'string',pk:true},{n:'description',t:'string'},{n:'downloads',t:'number'}] },
  ]},
  { id: 'pub-search', name: 'Pub.dev Search', baseUrl: 'https://pub.dev/api', tables: [
    { name: 'packages', endpoint: '/packages?page=1', fields: [{n:'name',t:'string',pk:true},{n:'latest',t:'json'}] },
  ]},

  // ── Cloud Providers ──
  { id: 'aws-status', name: 'AWS Health', baseUrl: 'https://health.aws.amazon.com', tables: [
    { name: 'status', endpoint: '/health/status', fields: [{n:'service',t:'string',pk:true},{n:'status',t:'string'}] },
  ]},
  { id: 'gcp-status', name: 'GCP Status', baseUrl: 'https://status.cloud.google.com', tables: [
    { name: 'status', endpoint: '/incidents.json', fields: [{n:'id',t:'number',pk:true},{n:'external_desc',t:'string'},{n:'severity',t:'string'},{n:'begin',t:'string'}] },
  ]},
  { id: 'azure-status', name: 'Azure Status', baseUrl: 'https://azure.status.microsoft/en-us', tables: [
    { name: 'status', endpoint: '/status', fields: [{n:'service',t:'string',pk:true},{n:'status',t:'string'}] },
  ]},
  { id: 'vercel-status', name: 'Vercel Status', baseUrl: 'https://www.vercel-status.com/api/v2', tables: [
    { name: 'status', endpoint: '/status.json', fields: [{n:'status',t:'json',pk:true}] },
  ]},
  { id: 'netlify-status', name: 'Netlify Status', baseUrl: 'https://www.netlifystatus.com/api/v2', tables: [
    { name: 'status', endpoint: '/status.json', fields: [{n:'status',t:'json',pk:true}] },
  ]},

  // ── Data & Open Data ──
  { id: 'open-meteo', name: 'Open-Meteo Weather', baseUrl: 'https://api.open-meteo.com/v1', tables: [
    { name: 'forecast', endpoint: '/forecast?latitude=52.52&longitude=13.41&current_weather=true', fields: [{n:'latitude',t:'number'},{n:'longitude',t:'number'},{n:'current_weather',t:'json'}] },
  ]},
  { id: 'worldbank-indicators', name: 'World Bank Indicators', baseUrl: 'https://api.worldbank.org/v2', tables: [
    { name: 'indicators', endpoint: '/indicator?format=json&per_page=30', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'source',t:'json'}] },
    { name: 'countries', endpoint: '/country?format=json&per_page=30', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'capitalCity',t:'string'}] },
  ]},
  { id: 'open-food-facts', name: 'Open Food Facts v2', baseUrl: 'https://world.openfoodfacts.org/cgi', tables: [
    { name: 'products', endpoint: '/search.pl?json=true&page_size=20', fields: [{n:'code',t:'string',pk:true},{n:'product_name',t:'string'},{n:'brands',t:'string'},{n:'categories',t:'string'}] },
  ]},
  { id: 'rest-countries-v3', name: 'RestCountries v3', baseUrl: 'https://restcountries.com/v3.1', tables: [
    { name: 'all', endpoint: '/all', fields: [{n:'cca2',t:'string',pk:true},{n:'name',t:'json'},{n:'capital',t:'json'},{n:'region',t:'string'},{n:'population',t:'number'}] },
    { name: 'fields', endpoint: '/all?fields=name,capital,population,area,region,subregion,languages,currencies', fields: [{n:'name',t:'json',pk:true},{n:'capital',t:'json'},{n:'population',t:'number'}] },
  ]},

  // ── Science & Space ──
  { id: 'nasa-techport', name: 'NASA TechPort', baseUrl: 'https://techport.nasa.gov/api', tables: [
    { name: 'projects', endpoint: '/projects?updatedSince=2026-01-01', fields: [{n:'projectId',t:'number',pk:true},{n:'title',t:'string'},{n:'status',t:'string'}] },
  ]},
  { id: 'launch-library-2', name: 'Launch Library 2', baseUrl: 'https://ll.thespacedevs.com/2.2.0', tables: [
    { name: 'launches', endpoint: '/launch/upcoming?limit=10&mode=list', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'net',t:'string'},{n:'status',t:'json'}] },
  ]},
  { id: 'opennotify-iss', name: 'ISS Location', baseUrl: 'http://api.open-notify.org', tables: [
    { name: 'iss', endpoint: '/iss-now.json', fields: [{n:'timestamp',t:'number',pk:true},{n:'iss_position',t:'json'}] },
    { name: 'people', endpoint: '/astros.json', fields: [{n:'number',t:'number'},{n:'people',t:'json'}] },
  ]},

  // ── News & Media ──
  { id: 'hackernews-top', name: 'Hacker News Top', baseUrl: 'https://hacker-news.firebaseio.com/v0', tables: [
    { name: 'top', endpoint: '/topstories.json', fields: [{n:'id',t:'number',pk:true}] },
    { name: 'best', endpoint: '/beststories.json', fields: [{n:'id',t:'number',pk:true}] },
    { name: 'new', endpoint: '/newstories.json', fields: [{n:'id',t:'number',pk:true}] },
  ]},
  { id: 'reddit-popular', name: 'Reddit Popular', baseUrl: 'https://www.reddit.com', tables: [
    { name: 'popular', endpoint: '/r/popular.json?limit=25', fields: [{n:'data.id',t:'string',pk:true},{n:'data.title',t:'string'},{n:'data.subreddit',t:'string'},{n:'data.score',t:'number'}] },
  ]},
  { id: 'lobsters', name: 'Lobsters', baseUrl: 'https://lobste.rs', tables: [
    { name: 'hottest', endpoint: '/hottest.json', fields: [{n:'short_id',t:'string',pk:true},{n:'title',t:'string'},{n:'score',t:'number'},{n:'url',t:'string'},{n:'tags',t:'json'}] },
    { name: 'newest', endpoint: '/newest.json', fields: [{n:'short_id',t:'string',pk:true},{n:'title',t:'string'},{n:'score',t:'number'}] },
  ]},
  { id: 'producthunt', name: 'Product Hunt', baseUrl: 'https://www.producthunt.com/frontend/graphql', tables: [
    { name: 'posts', endpoint: '', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'tagline',t:'string'},{n:'votesCount',t:'number'}] },
  ]},

  // ── Crypto & Finance ──
  { id: 'coingecko-coins', name: 'CoinGecko Coins', baseUrl: 'https://api.coingecko.com/api/v3', tables: [
    { name: 'coins', endpoint: '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50', fields: [{n:'id',t:'string',pk:true},{n:'symbol',t:'string'},{n:'name',t:'string'},{n:'current_price',t:'number'},{n:'market_cap',t:'number'}] },
    { name: 'global', endpoint: '/global', fields: [{n:'active_cryptocurrencies',t:'number'},{n:'markets',t:'number'},{n:'total_market_cap',t:'json'}] },
  ]},
  { id: 'coinbase-currencies', name: 'Coinbase Currencies', baseUrl: 'https://api.coinbase.com/v2', tables: [
    { name: 'currencies', endpoint: '/currencies', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'min_size',t:'string'}] },
  ]},
  { id: 'exchangerate-latest', name: 'ExchangeRate Latest', baseUrl: 'https://open.er-api.com/v6', tables: [
    { name: 'latest', endpoint: '/latest/USD', fields: [{n:'base_code',t:'string',pk:true},{n:'rates',t:'json'}] },
  ]},
  { id: 'frankfurter-latest', name: 'Frankfurter Latest', baseUrl: 'https://api.frankfurter.app', tables: [
    { name: 'latest', endpoint: '/latest', fields: [{n:'base',t:'string',pk:true},{n:'rates',t:'json'},{n:'date',t:'string'}] },
  ]},

  // ── Entertainment ──
  { id: 'tmdb-trending', name: 'TMDB Trending', baseUrl: 'https://api.themoviedb.org/3', tables: [
    { name: 'trending', endpoint: '/trending/all/week?api_key=DEMO_KEY', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'name',t:'string'},{n:'overview',t:'string'},{n:'vote_average',t:'number'}] },
  ]},
  { id: 'omdb-search', name: 'OMDB Search', baseUrl: 'https://www.omdbapi.com', tables: [
    { name: 'search', endpoint: '/?apikey=DEMO_KEY&s=star+wars', fields: [{n:'imdbID',t:'string',pk:true},{n:'Title',t:'string'},{n:'Year',t:'string'},{n:'Type',t:'string'}] },
  ]},
  { id: 'anime-chan', name: 'Anime Chan', baseUrl: 'https://animechan.io/api', tables: [
    { name: 'quotes', endpoint: '/random/available/anime', fields: [{n:'anime',t:'string',pk:true}] },
  ]},

  // ── Utilities ──
  { id: 'worldtimeapi', name: 'WorldTimeAPI', baseUrl: 'https://worldtimeapi.org/api', tables: [
    { name: 'timezones', endpoint: '/timezone', fields: [{n:'timezone',t:'string',pk:true}] },
    { name: 'ip', endpoint: '/ip', fields: [{n:'abbreviation',t:'string',pk:true},{n:'datetime',t:'string'},{n:'timezone',t:'string'}] },
  ]},
  { id: 'ipinfo-free', name: 'IPInfo Free', baseUrl: 'https://ipinfo.io', tables: [
    { name: 'ip', endpoint: '/json', fields: [{n:'ip',t:'string',pk:true},{n:'city',t:'string'},{n:'region',t:'string'},{n:'country',t:'string'},{n:'org',t:'string'}] },
  ]},
  { id: 'ip-api-free', name: 'ip-api Free', baseUrl: 'http://ip-api.com', tables: [
    { name: 'json', endpoint: '/json', fields: [{n:'query',t:'string',pk:true},{n:'country',t:'string'},{n:'city',t:'string'},{n:'isp',t:'string'},{n:'org',t:'string'}] },
  ]},
  { id: 'randomuser-me', name: 'RandomUser.me', baseUrl: 'https://randomuser.me/api', tables: [
    { name: 'users', endpoint: '/?results=20', fields: [{n:'login.uuid',t:'string',pk:true},{n:'name',t:'json'},{n:'email',t:'string'},{n:'location',t:'json'}] },
  ]},

  // ── Fun & Quotes ──
  { id: 'kanye-rest', name: 'Kanye Rest', baseUrl: 'https://api.kanye.rest', tables: [
    { name: 'quotes', endpoint: '/', fields: [{n:'quote',t:'string',pk:true}] },
  ]},
  { id: 'ron-swanson', name: 'Ron Swanson Quotes', baseUrl: 'https://ron-swanson-quotes.herokuapp.com/v2', tables: [
    { name: 'quotes', endpoint: '/quotes', fields: [{n:'quote',t:'string',pk:true}] },
  ]},
  { id: 'tronalddump-random', name: 'Tronald Dump Random', baseUrl: 'https://api.tronalddump.io', tables: [
    { name: 'random', endpoint: '/random/quote', fields: [{n:'quote_id',t:'string',pk:true},{n:'value',t:'string'},{n:'appeared_at',t:'string'}] },
  ]},
  { id: 'chuck-norris-random', name: 'Chuck Norris Random', baseUrl: 'https://api.chucknorris.io', tables: [
    { name: 'random', endpoint: '/jokes/random', fields: [{n:'id',t:'string',pk:true},{n:'value',t:'string'},{n:'categories',t:'json'}] },
    { name: 'categories', endpoint: '/jokes/categories', fields: [{n:'category',t:'string',pk:true}] },
  ]},
  { id: 'jokeapi-random', name: 'JokeAPI Random', baseUrl: 'https://v2.jokeapi.dev', tables: [
    { name: 'jokes', endpoint: '/joke/Any?amount=10', fields: [{n:'id',t:'number',pk:true},{n:'type',t:'string'},{n:'joke',t:'string'},{n:'setup',t:'string'},{n:'delivery',t:'string'}] },
  ]},

  // ── Misc APIs ──
  { id: 'public-apis-list', name: 'Public APIs List', baseUrl: 'https://api.publicapis.org', tables: [
    { name: 'entries', endpoint: '/entries?https=true&limit=50', fields: [{n:'API',t:'string',pk:true},{n:'Description',t:'string'},{n:'Auth',t:'string'},{n:'Category',t:'string'}] },
  ]},
  { id: 'httpbin-all', name: 'HTTPBin Full', baseUrl: 'https://httpbin.org', tables: [
    { name: 'get', endpoint: '/get', fields: [{n:'url',t:'string',pk:true},{n:'origin',t:'string'}] },
    { name: 'ip', endpoint: '/ip', fields: [{n:'origin',t:'string',pk:true}] },
    { name: 'headers', endpoint: '/headers', fields: [{n:'headers',t:'json',pk:true}] },
    { name: 'user-agent', endpoint: '/user-agent', fields: [{n:'user-agent',t:'string',pk:true}] },
    { name: 'uuid', endpoint: '/uuid', fields: [{n:'uuid',t:'string',pk:true}] },
  ]},
  { id: 'reqres-users', name: 'ReqRes Users', baseUrl: 'https://reqres.in/api', tables: [
    { name: 'users', endpoint: '/users?per_page=12', fields: [{n:'id',t:'number',pk:true},{n:'email',t:'string'},{n:'first_name',t:'string'},{n:'last_name',t:'string'}] },
    { name: 'unknown', endpoint: '/unknown?per_page=12', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'year',t:'number'},{n:'color',t:'string'}] },
  ]},
  { id: 'fakestore-v2', name: 'FakeStore v2', baseUrl: 'https://fakestoreapi.com', tables: [
    { name: 'products', endpoint: '/products', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'price',t:'number'},{n:'category',t:'string'}] },
    { name: 'carts', endpoint: '/carts', fields: [{n:'id',t:'number',pk:true},{n:'userId',t:'number'},{n:'products',t:'json'}] },
    { name: 'users', endpoint: '/users', fields: [{n:'id',t:'number',pk:true},{n:'email',t:'string'},{n:'username',t:'string'}] },
  ]},
  { id: 'dummyjson-products', name: 'DummyJSON Products', baseUrl: 'https://dummyjson.com', tables: [
    { name: 'products', endpoint: '/products?limit=30', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'price',t:'number'},{n:'brand',t:'string'},{n:'category',t:'string'}] },
    { name: 'users', endpoint: '/users?limit=30', fields: [{n:'id',t:'number',pk:true},{n:'firstName',t:'string'},{n:'lastName',t:'string'},{n:'email',t:'string'}] },
    { name: 'todos', endpoint: '/todos?limit=30', fields: [{n:'id',t:'number',pk:true},{n:'todo',t:'string'},{n:'completed',t:'boolean'}] },
    { name: 'posts', endpoint: '/posts?limit=30', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'body',t:'string'}] },
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
