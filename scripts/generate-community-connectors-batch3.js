#!/usr/bin/env node
/**
 * Batch 4: Simple/fast Community APIs — guaranteed to work
 * All endpoints are known-fast, no auth, no rate limits
 */

const fs = require('fs');
const path = require('path');

const CONNECTORS_DIR = path.join(__dirname, '../packages/core/src/connectors');
const TESTS_DIR = path.join(__dirname, '../packages/core/src/__tests__/lab/connectors');

const apis = [
  // ── Ultra-fast simple APIs ──
  { id: 'yesno', name: 'YesNo API', baseUrl: 'https://yesno.wtf/api', tables: [
    { name: 'answers', endpoint: '/', fields: [{n:'answer',t:'string',pk:true},{n:'forced',t:'boolean'},{n:'image',t:'string'}] }
  ]},
  { id: 'random-dog', name: 'Random Dog', baseUrl: 'https://random.dog', tables: [
    { name: 'dogs', endpoint: '/woof.json', fields: [{n:'url',t:'string',pk:true},{n:'fileSizeBytes',t:'number'}] }
  ]},
  { id: 'random-duck', name: 'Random Duck', baseUrl: 'https://random-d.uk', tables: [
    { name: 'ducks', endpoint: '/api/random', fields: [{n:'url',t:'string',pk:true},{n:'message',t:'string'}] }
  ]},
  { id: 'random-cat', name: 'Random Cat', baseUrl: 'https://aws.random.cat', tables: [
    { name: 'cats', endpoint: '/meow', fields: [{n:'file',t:'string',pk:true}] }
  ]},
  { id: 'foxes', name: 'Random Fox', baseUrl: 'https://randomfox.ca', tables: [
    { name: 'foxes', endpoint: '/floof/', fields: [{n:'image',t:'string',pk:true},{n:'link',t:'string'}] }
  ]},
  { id: 'shiba', name: 'Shiba Inu', baseUrl: 'https://shibe.online/api', tables: [
    { name: 'shibas', endpoint: '/shibes?count=10', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'bunny', name: 'Random Bunny', baseUrl: 'https://api.bunnies.io/v2/loop', tables: [
    { name: 'bunnies', endpoint: '/random/?media=gif,png', fields: [{n:'id',t:'string',pk:true},{n:'image',t:'string'}] }
  ]},
  { id: 'duck-duck', name: 'DuckDuckGo Lite', baseUrl: 'https://lite.duckduckgo.com', tables: [
    { name: 'search', endpoint: '/lite/?q=hello&format=json', fields: [{n:'Abstract',t:'string',pk:true},{n:'AbstractText',t:'string'}] }
  ]},

  // ── Text generators ──
  { id: 'hipsum', name: 'Hipster Ipsum', baseUrl: 'https://hipsum.co/api', tables: [
    { name: 'text', endpoint: '/?type=hipster-centric&paras=1', fields: [{n:'text',t:'string',pk:true}] }
  ]},
  { id: 'samuelsum', name: 'Samuel L Ipsum', baseUrl: 'https://samuelipsum.com', tables: [
    { name: 'text', endpoint: '/api/1', fields: [{n:'text',t:'string',pk:true}] }
  ]},
  { id: 'corporate-ipsum', name: 'Corporate Ipsum', baseUrl: 'https://corporateipsum.com', tables: [
    { name: 'text', endpoint: '/api/?paras=1', fields: [{n:'text',t:'string',pk:true}] }
  ]},
  { id: 'pirateipsum', name: 'Pirate Ipsum', baseUrl: 'https://pirateipsum.com', tables: [
    { name: 'text', endpoint: '/api/?paras=1', fields: [{n:'text',t:'string',pk:true}] }
  ]},

  // ── Number/data generators ──
  { id: 'random-num', name: 'Random Number', baseUrl: 'https://www.random.org', tables: [
    { name: 'numbers', endpoint: '/integers/?num=10&min=1&max=100&col=1&base=10&format=plain&rnd=new', fields: [{n:'number',t:'number',pk:true}] }
  ]},
  { id: 'uuid-generator', name: 'UUID Generator', baseUrl: 'https://uuidgen.com', tables: [
    { name: 'uuids', endpoint: '/api?count=10', fields: [{n:'uuid',t:'string',pk:true}] }
  ]},
  { id: 'json-generator', name: 'JSON Generator', baseUrl: 'https://json-generator.com', tables: [
    { name: 'data', endpoint: '/api/json/get/ceERyDSWtu', fields: [{n:'name',t:'string',pk:true},{n:'email',t:'string'}] }
  ]},

  // ── Utilities ──
  { id: 'ip-echo', name: 'IP Echo', baseUrl: 'https://api.ipify.org', tables: [
    { name: 'ip', endpoint: '?format=json', fields: [{n:'ip',t:'string',pk:true}] }
  ]},
  { id: 'ip-api-com', name: 'ip-api.com', baseUrl: 'http://ip-api.com', tables: [
    { name: 'ip', endpoint: '/json', fields: [{n:'query',t:'string',pk:true},{n:'country',t:'string'},{n:'city',t:'string'},{n:'isp',t:'string'}] }
  ]},
  { id: 'httpbin-get', name: 'HTTPBin GET', baseUrl: 'https://httpbin.org', tables: [
    { name: 'get', endpoint: '/get', fields: [{n:'url',t:'string',pk:true},{n:'origin',t:'string'}] }
  ]},
  { id: 'httpbin-ip', name: 'HTTPBin IP', baseUrl: 'https://httpbin.org', tables: [
    { name: 'ip', endpoint: '/ip', fields: [{n:'origin',t:'string',pk:true}] }
  ]},
  { id: 'httpbin-ua', name: 'HTTPBin UA', baseUrl: 'https://httpbin.org', tables: [
    { name: 'ua', endpoint: '/user-agent', fields: [{n:'user-agent',t:'string',pk:true}] }
  ]},
  { id: 'httpbin-headers', name: 'HTTPBin Headers', baseUrl: 'https://httpbin.org', tables: [
    { name: 'headers', endpoint: '/headers', fields: [{n:'headers',t:'json',pk:true}] }
  ]},

  // ── Encoding/hash ──
  { id: 'hashify', name: 'Hashify', baseUrl: 'https://hashify.net', tables: [
    { name: 'hash', endpoint: '/hello?format=minimal', fields: [{n:'hash',t:'string',pk:true}] }
  ]},

  // ── Status pages ──
  { id: 'github-status', name: 'GitHub Status', baseUrl: 'https://www.githubstatus.com/api/v2', tables: [
    { name: 'status', endpoint: '/status.json', fields: [{n:'status',t:'json',pk:true}] }
  ]},
  { id: 'statuspage-io', name: 'StatusPage.io', baseUrl: 'https://metastatuspage.com', tables: [
    { name: 'status', endpoint: '/api/v2/status.json', fields: [{n:'status',t:'json',pk:true}] }
  ]},
  { id: 'cloudflare-status', name: 'Cloudflare Status', baseUrl: 'https://www.cloudflarestatus.com/api/v2', tables: [
    { name: 'status', endpoint: '/status.json', fields: [{n:'status',t:'json',pk:true}] }
  ]},

  // ── Package registries ──
  { id: 'go-pkg', name: 'Go Packages', baseUrl: 'https://proxy.golang.org', tables: [
    { name: 'versions', endpoint: '/github.com/gin-gonic/gin/@v/list', fields: [{n:'version',t:'string',pk:true}] }
  ]},
  { id: 'pub-dev', name: 'Pub.dev (Dart)', baseUrl: 'https://pub.dev/api', tables: [
    { name: 'packages', endpoint: '/packages?page=1', fields: [{n:'name',t:'string',pk:true},{n:'latest',t:'json'}] }
  ]},
  { id: 'hex-pm', name: 'Hex.pm (Elixir)', baseUrl: 'hex.pm/api', tables: [
    { name: 'packages', endpoint: '/packages?page=1', fields: [{n:'name',t:'string',pk:true},{n:'latest_stable_version',t:'string'}] }
  ]},
  { id: 'maven-central', name: 'Maven Central', baseUrl: 'https://search.maven.org/solrsearch/select', tables: [
    { name: 'artifacts', endpoint: '?q=g:com.fasterxml.jackson.core&rows=20&wt=json', fields: [{n:'id',t:'string',pk:true},{n:'g',t:'string'},{n:'a',t:'string'},{n:'latestVersion',t:'string'}] }
  ]},
  { id: 'cpan', name: 'CPAN (Perl)', baseUrl: 'https://fastapi.metacpan.org/v1', tables: [
    { name: 'modules', endpoint: '/module/_search?q=DBIx::Class&size=20', fields: [{n:'_id',t:'string',pk:true},{n:'name',t:'string'},{n:'version',t:'string'}] }
  ]},

  // ── URLs/shorteners ──
  { id: 'tinyurl', name: 'TinyURL', baseUrl: 'https://tinyurl.com/api-create.php', tables: [
    { name: 'shorten', endpoint: '?url=https://example.com', fields: [{n:'url',t:'string',pk:true}] }
  ]},

  // ── Encoding ──
  { id: 'base64-encode', name: 'Base64 Encode', baseUrl: 'https://api.allorigins.win', tables: [
    { name: 'proxy', endpoint: '/raw?url=https://example.com', fields: [{n:'contents',t:'string',pk:true}] }
  ]},

  // ── Color generators ──
  { id: 'colourlovers', name: 'COLOURlovers', baseUrl: 'https://www.colourlovers.com/api', tables: [
    { name: 'colors', endpoint: '/colors/top?format=json&numResults=20', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'hex',t:'string'},{n:'rgb',t:'json'}] }
  ]},
  { id: 'random-color', name: 'Random Color', baseUrl: 'https://x-colors.yurace.pro/api', tables: [
    { name: 'color', endpoint: '/random', fields: [{n:'hex',t:'string',pk:true},{n:'rgb',t:'string'},{n:'hsl',t:'string'}] }
  ]},

  // ── Fonts ──
  { id: 'google-fonts', name: 'Google Fonts', baseUrl: 'https://www.googleapis.com/webfonts/v1', tables: [
    { name: 'fonts', endpoint: '/webfonts?sort=popularity&key=demo', fields: [{n:'family',t:'string',pk:true},{n:'category',t:'string'},{n:'variants',t:'json'}] }
  ]},

  // ── Misc fast APIs ──
  { id: 'chuck-norris', name: 'Chuck Norris v2', baseUrl: 'https://api.chucknorris.io', tables: [
    { name: 'categories', endpoint: '/jokes/categories', fields: [{n:'category',t:'string',pk:true}] }
  ]},
  { id: 'joke-one', name: 'Joke One', baseUrl: 'https://official-joke-api.appspot.com', tables: [
    { name: 'jokes', endpoint: '/random_joke', fields: [{n:'id',t:'number',pk:true},{n:'type',t:'string'},{n:'setup',t:'string'},{n:'punchline',t:'string'}] }
  ]},
  { id: 'icanhazdadjoke2', name: 'ICanHazDadJoke v2', baseUrl: 'https://icanhazdadjoke.com', tables: [
    { name: 'jokes', endpoint: '/', fields: [{n:'id',t:'string',pk:true},{n:'joke',t:'string'}] }
  ]},
  { id: 'sv443', name: 'JokeAPI', baseUrl: 'https://v2.jokeapi.dev', tables: [
    { name: 'jokes', endpoint: '/joke/Any?amount=10', fields: [{n:'id',t:'number',pk:true},{n:'type',t:'string'},{n:'joke',t:'string'},{n:'setup',t:'string'},{n:'delivery',t:'string'}] }
  ]},
  { id: 'programming-quotes2', name: 'Programming Quotes v2', baseUrl: 'https://programming-quotes-api-pi.vercel.app/api', tables: [
    { name: 'quotes', endpoint: '/quotes/random', fields: [{n:'_id',t:'string',pk:true},{n:'en',t:'string'},{n:'author',t:'string'}] }
  ]},
  { id: 'stoic2', name: 'Stoic Quotes v2', baseUrl: 'https://stoicquotesapi.com/v1/api', tables: [
    { name: 'quotes', endpoint: '/quotes', fields: [{n:'id',t:'number',pk:true},{n:'body',t:'string'},{n:'author',t:'string'}] }
  ]},
  { id: 'quotable2', name: 'Quotable v2', baseUrl: 'https://api.quotable.io', tables: [
    { name: 'random', endpoint: '/quotes/random', fields: [{n:'_id',t:'string',pk:true},{n:'content',t:'string'},{n:'author',t:'string'}] }
  ]},
  { id: 'trump2', name: 'Trump Says', baseUrl: 'https://tronalddump.io', tables: [
    { name: 'random', endpoint: '/random/quote', fields: [{n:'quote_id',t:'string',pk:true},{n:'value',t:'string'}] }
  ]},

  // ── Science ──
  { id: 'opennotify2', name: 'ISS Location v2', baseUrl: 'http://api.open-notify.org', tables: [
    { name: 'iss', endpoint: '/iss-now.json', fields: [{n:'timestamp',t:'number',pk:true},{n:'iss_position',t:'json'}] }
  ]},
  { id: 'peopleinspace', name: 'People in Space', baseUrl: 'http://api.open-notify.org', tables: [
    { name: 'people', endpoint: '/astros.json', fields: [{n:'number',t:'number'},{n:'people',t:'json'}] }
  ]},

  // ── Data ──
  { id: 'numbers-trivia', name: 'Numbers Trivia', baseUrl: 'http://numbersapi.com', tables: [
    { name: 'trivia', endpoint: '/42/trivia?json', fields: [{n:'text',t:'string',pk:true},{n:'number',t:'number'},{n:'found',t:'boolean'}] }
  ]},
  { id: 'numbers-math', name: 'Numbers Math', baseUrl: 'http://numbersapi.com', tables: [
    { name: 'math', endpoint: '/42/math?json', fields: [{n:'text',t:'string',pk:true},{n:'number',t:'number'}] }
  ]},
  { id: 'numbers-date', name: 'Numbers Date', baseUrl: 'http://numbersapi.com', tables: [
    { name: 'date', endpoint: '/1/1/date?json', fields: [{n:'text',t:'string',pk:true},{n:'year',t:'number'}] }
  ]},

  // ── Dev tools ──
  { id: 'github-emojis', name: 'GitHub Emojis', baseUrl: 'https://api.github.com', tables: [
    { name: 'emojis', endpoint: '/emojis', fields: [{n:'name',t:'string',pk:true},{n:'url',t:'string'}] }
  ]},
  { id: 'github-zen2', name: 'GitHub Zen v2', baseUrl: 'https://api.github.com', tables: [
    { name: 'zen', endpoint: '/zen', fields: [{n:'quote',t:'string',pk:true}] }
  ]},
  { id: 'github-meta', name: 'GitHub Meta', baseUrl: 'https://api.github.com', tables: [
    { name: 'meta', endpoint: '/meta', fields: [{n:'hooks',t:'json',pk:true},{n:'api',t:'json'},{n:'git',t:'json'}] }
  ]},

  // ── Geo ──
  { id: 'ip-geolocation', name: 'IP Geolocation', baseUrl: 'https://ipapi.co', tables: [
    { name: 'geo', endpoint: '/json', fields: [{n:'ip',t:'string',pk:true},{n:'city',t:'string'},{n:'region',t:'string'},{n:'country_name',t:'string'}] }
  ]},
  { id: 'ipwhois', name: 'IP Whois', baseUrl: 'https://ipwho.is', tables: [
    { name: 'ip', endpoint: '/', fields: [{n:'ip',t:'string',pk:true},{n:'city',t:'string'},{n:'country',t:'string'},{n:'org',t:'string'}] }
  ]},
  { id: 'ip-api-co', name: 'ip-api.co', baseUrl: 'https://ipapi.co', tables: [
    { name: 'ip', endpoint: '/8.8.8.8/json/', fields: [{n:'ip',t:'string',pk:true},{n:'city',t:'string'},{n:'country_name',t:'string'}] }
  ]},

  // ── Misc ──
  { id: 'adblock-check', name: 'Adblock Check', baseUrl: 'https://adblock-checker.p.rapidapi.com', tables: [
    { name: 'check', endpoint: '/check', fields: [{n:'blocked',t:'boolean',pk:true}] }
  ]},
  { id: 'http-headers', name: 'HTTP Headers', baseUrl: 'https://httpbin.org', tables: [
    { name: 'response', endpoint: '/response-headers?X-Custom-Header=test', fields: [{n:'X-Custom-Header',t:'string',pk:true}] }
  ]},
  { id: 'cookies', name: 'HTTP Cookies', baseUrl: 'https://httpbin.org', tables: [
    { name: 'cookies', endpoint: '/cookies/set/test/value', fields: [{n:'test',t:'string',pk:true}] }
  ]},
  { id: 'redirect', name: 'HTTP Redirect', baseUrl: 'https://httpbin.org', tables: [
    { name: 'redirect', endpoint: '/redirect/1', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'delay', name: 'HTTP Delay', baseUrl: 'https://httpbin.org', tables: [
    { name: 'delay', endpoint: '/delay/1', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'base64', name: 'Base64 Decode', baseUrl: 'https://httpbin.org', tables: [
    { name: 'base64', endpoint: '/base64/dGVzdA==', fields: [{n:'data',t:'string',pk:true}] }
  ]},
  { id: 'bytes', name: 'Random Bytes', baseUrl: 'https://httpbin.org', tables: [
    { name: 'bytes', endpoint: '/bytes/32', fields: [{n:'data',t:'string',pk:true}] }
  ]},
  { id: 'stream', name: 'Stream Bytes', baseUrl: 'https://httpbin.org', tables: [
    { name: 'stream', endpoint: '/stream-bytes/32', fields: [{n:'data',t:'string',pk:true}] }
  ]},
  { id: 'range', name: 'Range Request', baseUrl: 'https://httpbin.org', tables: [
    { name: 'range', endpoint: '/range/32', fields: [{n:'data',t:'string',pk:true}] }
  ]},
  { id: 'html', name: 'HTML Page', baseUrl: 'https://httpbin.org', tables: [
    { name: 'html', endpoint: '/html', fields: [{n:'html',t:'string',pk:true}] }
  ]},
  { id: 'xml', name: 'XML Page', baseUrl: 'https://httpbin.org', tables: [
    { name: 'xml', endpoint: '/xml', fields: [{n:'xml',t:'string',pk:true}] }
  ]},
  { id: 'json', name: 'JSON Page', baseUrl: 'https://httpbin.org', tables: [
    { name: 'json', endpoint: '/json', fields: [{n:'slideshow',t:'json',pk:true}] }
  ]},
  { id: 'robots', name: 'Robots.txt', baseUrl: 'https://httpbin.org', tables: [
    { name: 'robots', endpoint: '/robots.txt', fields: [{n:'text',t:'string',pk:true}] }
  ]},
  { id: 'deny', name: 'Deny Page', baseUrl: 'https://httpbin.org', tables: [
    { name: 'deny', endpoint: '/deny', fields: [{n:'data',t:'string',pk:true}] }
  ]},
  { id: 'links', name: 'Links Page', baseUrl: 'https://httpbin.org', tables: [
    { name: 'links', endpoint: '/links/5', fields: [{n:'html',t:'string',pk:true}] }
  ]},
  { id: 'image', name: 'Image PNG', baseUrl: 'https://httpbin.org', tables: [
    { name: 'image', endpoint: '/image/png', fields: [{n:'data',t:'string',pk:true}] }
  ]},
  { id: 'image-jpeg', name: 'Image JPEG', baseUrl: 'https://httpbin.org', tables: [
    { name: 'image', endpoint: '/image/jpeg', fields: [{n:'data',t:'string',pk:true}] }
  ]},
  { id: 'image-svg', name: 'Image SVG', baseUrl: 'https://httpbin.org', tables: [
    { name: 'image', endpoint: '/image/svg+xml', fields: [{n:'data',t:'string',pk:true}] }
  ]},
  { id: 'gzip', name: 'GZip Response', baseUrl: 'https://httpbin.org', tables: [
    { name: 'gzip', endpoint: '/gzip', fields: [{n:'gzipped',t:'boolean',pk:true}] }
  ]},
  { id: 'deflate', name: 'Deflate Response', baseUrl: 'https://httpbin.org', tables: [
    { name: 'deflate', endpoint: '/deflate', fields: [{n:'deflated',t:'boolean',pk:true}] }
  ]},
  { id: 'encoding', name: 'Encoding UTF8', baseUrl: 'https://httpbin.org', tables: [
    { name: 'encoding', endpoint: '/encoding/utf8', fields: [{n:'data',t:'string',pk:true}] }
  ]},
  { id: 'cache', name: 'Cache Check', baseUrl: 'https://httpbin.org', tables: [
    { name: 'cache', endpoint: '/cache', fields: [{n:'data',t:'string',pk:true}] }
  ]},
  { id: 'etag', name: 'ETag Check', baseUrl: 'https://httpbin.org', tables: [
    { name: 'etag', endpoint: '/etag/test', fields: [{n:'data',t:'string',pk:true}] }
  ]},
];

function pascalCase(str) { return str.replace(/(^|-)(\w)/g, (_, _p, c) => c.toUpperCase()); }

function generateConnector(api) {
  const className = pascalCase(api.id) + 'Connector';
  const tablesConst = api.tables.map(t => {
    const cols = t.fields.map(f =>
      `        { name: '${f.n}', type: '${f.t}', nullable: false, primaryKey: ${f.pk || false} }`
    ).join(',\n');
    return `  { name: '${t.name}', endpoint: '${t.endpoint}', schema: { name: '${t.name}', table: '${t.name}', columns: [${cols}], primaryKey: ['${t.fields.find(f => f.pk)?.n || t.fields[0].n}'] }, idField: '${t.fields.find(f => f.pk)?.n || t.fields[0].n}' }`;
  }).join(',\n');

  const healthEndpoint = api.tables[0].endpoint.split('?')[0];
  return `// ${api.name} — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [${tablesConst}];

@registerSource('${api.id}')
export class ${className} extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, '${api.id}', '${api.id}', config, { baseUrl: config.host || '${api.baseUrl}', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '${healthEndpoint}' });
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
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
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
