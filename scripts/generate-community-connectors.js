#!/usr/bin/env node
/**
 * Bulk Community API Connector Generator
 * Generates connector + test files for free/no-auth public APIs
 */

const fs = require('fs');
const path = require('path');

const CONNECTORS_DIR = path.join(__dirname, '../packages/core/src/connectors');
const TESTS_DIR = path.join(__dirname, '../packages/core/src/__tests__/lab/connectors');

// ═══════════════════════════════════════════════════════════════
// COMMUNITY API DEFINITIONS
// Each entry: { id, name, baseUrl, tables, authType }
// ═══════════════════════════════════════════════════════════════

const apis = [
  // ── Science & Space ──
  { id: 'nasa-apod', name: 'NASA APOD', baseUrl: 'https://api.nasa.gov/planetary', tables: [
    { name: 'apod', endpoint: '/apod?api_key=DEMO_KEY', fields: [{n:'title',t:'string'},{n:'explanation',t:'string'},{n:'url',t:'string'},{n:'date',t:'string',pk:true},{n:'media_type',t:'string'}] }
  ]},
  { id: 'nasa-neo', name: 'NASA Near Earth Objects', baseUrl: 'https://api.nasa.gov/neo/rest/v1', tables: [
    { name: 'neo', endpoint: '/feed?start_date=2026-08-01&end_date=2026-08-02&api_key=DEMO_KEY', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'nasa_jpl_url',t:'string'},{n:'absolute_magnitude_h',t:'number'}] }
  ]},
  { id: 'opennotify', name: 'OpenNotify ISS', baseUrl: 'http://api.open-notify.org', tables: [
    { name: 'iss_position', endpoint: '/iss-now.json', fields: [{n:'timestamp',t:'number',pk:true},{n:'latitude',t:'string'},{n:'longitude',t:'string'}] },
    { name: 'people', endpoint: '/astros.json', fields: [{n:'name',t:'string',pk:true},{n:'craft',t:'string'}] }
  ]},
  { id: 'spacex', name: 'SpaceX API', baseUrl: 'https://api.spacexdata.com/v4', tables: [
    { name: 'rockets', endpoint: '/rockets', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'type',t:'string'},{n:'company',t:'string'},{n:'country',t:'string'},{n:'cost_per_launch',t:'number'}] },
    { name: 'launches', endpoint: '/launches', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'date_utc',t:'string'},{n:'success',t:'boolean'}] },
    { name: 'capsules', endpoint: '/capsules', fields: [{n:'id',t:'string',pk:true},{n:'type',t:'string'},{n:'status',t:'string'},{n:'reuse_count',t:'number'}] }
  ]},

  // ── Geography & Weather ──
  { id: 'restcountries', name: 'RestCountries', baseUrl: 'https://restcountries.com/v3.1', tables: [
    { name: 'countries', endpoint: '/all', fields: [{n:'name',t:'json'},{n:'cca2',t:'string',pk:true},{n:'cca3',t:'string'},{n:'capital',t:'json'},{n:'region',t:'string'},{n:'subregion',t:'string'},{n:'population',t:'number'},{n:'area',t:'number'}] }
  ]},
  { id: 'worldbank', name: 'World Bank API', baseUrl: 'https://api.worldbank.org/v2', tables: [
    { name: 'countries', endpoint: '/country?format=json&per_page=50', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'capitalCity',t:'string'},{n:'longitude',t:'string'},{n:'latitude',t:'string'}] },
    { name: 'indicators', endpoint: '/indicator?format=json&per_page=50', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'source',t:'json'}] }
  ]},
  { id: 'opentripmap', name: 'OpenTripMap', baseUrl: 'https://api.opentripmap.com/0.1/en', tables: [
    { name: 'places', endpoint: '/places/bbox?lon_min=-180&lat_min=-90&lon_max=180&lat_max=90&kinds=interesting_places&limit=50&apikey=5ae2e3f221c38a28845f05b6b1b8e6e3e6b1b8e6e3e6b1b8e6e3e6b1b8', fields: [{n:'xid',t:'string',pk:true},{n:'name',t:'string'},{n:'kinds',t:'string'},{n:'point',t:'json'}] }
  ]},
  { id: 'geonames', name: 'GeoNames', baseUrl: 'http://api.geonames.org', tables: [
    { name: 'cities', endpoint: '/searchJSON?q=London&maxRows=50&username=demo', fields: [{n:'geonameId',t:'number',pk:true},{n:'name',t:'string'},{n:'countryName',t:'string'},{n:'population',t:'number'},{n:'lat',t:'number'},{n:'lng',t:'number'}] }
  ]},

  // ── Finance & Crypto ──
  { id: 'exchangerate-api', name: 'ExchangeRate API', baseUrl: 'https://open.er-api.com/v6', tables: [
    { name: 'rates', endpoint: '/latest/USD', fields: [{n:'base_code',t:'string',pk:true},{n:'time_last_update_utc',t:'string'},{n:'rates',t:'json'}] }
  ]},
  { id: 'coindesk', name: 'CoinDesk', baseUrl: 'https://api.coindesk.com/v1', tables: [
    { name: 'bpi', endpoint: '/bpi/currentprice.json', fields: [{n:'code',t:'string',pk:true},{n:'rate',t:'string'},{n:'description',t:'string'}] }
  ]},
  { id: 'coinbase-rates', name: 'Coinbase Rates', baseUrl: 'https://api.coinbase.com/v2', tables: [
    { name: 'currencies', endpoint: '/currencies', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'min_size',t:'string'}] },
    { name: 'exchange_rates', endpoint: '/exchange-rates?currency=BTC', fields: [{n:'currency',t:'string',pk:true},{n:'rate',t:'string'}] }
  ]},
  { id: 'blockchain-info', name: 'Blockchain.info', baseUrl: 'https://blockchain.info', tables: [
    { name: 'ticker', endpoint: '/ticker', fields: [{n:'symbol',t:'string',pk:true},{n:'last',t:'number'},{n:'buy',t:'number'},{n:'sell',t:'number'}] }
  ]},

  // ── Entertainment & Media ──
  { id: 'tmdb', name: 'TMDB (The Movie DB)', baseUrl: 'https://api.themoviedb.org/3', tables: [
    { name: 'trending', endpoint: '/trending/all/week?api_key=DEMO_KEY', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'name',t:'string'},{n:'overview',t:'string'},{n:'vote_average',t:'number'},{n:'media_type',t:'string'}] }
  ]},
  { id: 'omdb', name: 'OMDB API', baseUrl: 'https://www.omdbapi.com', tables: [
    { name: 'movies', endpoint: '/?apikey=DEMO_KEY&s=batman', fields: [{n:'imdbID',t:'string',pk:true},{n:'Title',t:'string'},{n:'Year',t:'string'},{n:'Type',t:'string'},{n:'Poster',t:'string'}] }
  ]},
  { id: 'disneyapi', name: 'Disney API', baseUrl: 'https://api.disneyapi.dev', tables: [
    { name: 'characters', endpoint: '/character?pageSize=50', fields: [{n:'_id',t:'number',pk:true},{n:'name',t:'string'},{n:'films',t:'json'},{n:'tvShows',t:'json'},{n:'videoGames',t:'json'}] }
  ]},
  { id: 'potterapi', name: 'Potter API', baseUrl: 'https://potterapi-fedeperin.vercel.app/en', tables: [
    { name: 'characters', endpoint: '/characters', fields: [{n:'index',t:'number',pk:true},{n:'name',t:'string'},{n:'nickname',t:'string'},{n:'hogwartsHouse',t:'string'},{n:'interpretedBy',t:'string'}] },
    { name: 'spells', endpoint: '/spells', fields: [{n:'index',t:'number',pk:true},{n:'spell',t:'string'},{n:'use',t:'string'}] }
  ]},
  { id: 'dragonball', name: 'Dragon Ball API', baseUrl: 'https://dragonball-api.com/api', tables: [
    { name: 'characters', endpoint: '/characters?limit=50', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'ki',t:'string'},{n:'maxKi',t:'string'},{n:'race',t:'string'},{n:'gender',t:'string'}] }
  ]},
  { id: 'naruto', name: 'Naruto API', baseUrl: 'https://narutodb.xyz/api', tables: [
    { name: 'characters', endpoint: '/character?limit=50', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'personal',t:'json'}] }
  ]},
  { id: 'rickandmorty', name: 'Rick and Morty API', baseUrl: 'https://rickandmortyapi.com/api', tables: [
    { name: 'characters', endpoint: '/character', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'status',t:'string'},{n:'species',t:'string'},{n:'gender',t:'string'},{n:'origin',t:'json'}] },
    { name: 'locations', endpoint: '/location', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'type',t:'string'},{n:'dimension',t:'string'}] },
    { name: 'episodes', endpoint: '/episode', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'air_date',t:'string'},{n:'episode',t:'string'}] }
  ]},
  { id: 'swapi', name: 'Star Wars API', baseUrl: 'https://swapi.dev/api', tables: [
    { name: 'people', endpoint: '/people', fields: [{n:'name',t:'string',pk:true},{n:'height',t:'string'},{n:'mass',t:'string'},{n:'hair_color',t:'string'},{n:'skin_color',t:'string'},{n:'birth_year',t:'string'}] },
    { name: 'planets', endpoint: '/planets', fields: [{n:'name',t:'string',pk:true},{n:'climate',t:'string'},{n:'terrain',t:'string'},{n:'population',t:'string'}] },
    { name: 'starships', endpoint: '/starships', fields: [{n:'name',t:'string',pk:true},{n:'model',t:'string'},{n:'manufacturer',t:'string'},{n:'cost_in_credits',t:'string'}] }
  ]},
  { id: 'trekgeneric', name: 'Star Trek API', baseUrl: 'https://stapi.co/api/v1/rest', tables: [
    { name: 'species', endpoint: '/species/search?pageSize=50', fields: [{n:'uid',t:'string',pk:true},{n:'name',t:'string'},{n:'homeworld',t:'string'},{n:'quadrant',t:'string'}] }
  ]},

  // ── Food & Drink ──
  { id: 'themealdb', name: 'TheMealDB', baseUrl: 'https://www.themealdb.com/api/json/v1/1', tables: [
    { name: 'categories', endpoint: '/categories.php', fields: [{n:'idCategory',t:'string',pk:true},{n:'strCategory',t:'string'},{n:'strCategoryDescription',t:'string'},{n:'strCategoryThumb',t:'string'}] },
    { name: 'areas', endpoint: '/list.php?a=list', fields: [{n:'strArea',t:'string',pk:true}] }
  ]},
  { id: 'thecocktaildb', name: 'TheCocktailDB', baseUrl: 'https://www.thecocktaildb.com/api/json/v1/1', tables: [
    { name: 'categories', endpoint: '/list.php?c=list', fields: [{n:'strCategory',t:'string',pk:true}] },
    { name: 'glasses', endpoint: '/list.php?g=list', fields: [{n:'strGlass',t:'string',pk:true}] },
    { name: 'ingredients', endpoint: '/list.php?i=list', fields: [{n:'strIngredient1',t:'string',pk:true}] }
  ]},
  { id: 'openfoodfacts', name: 'Open Food Facts', baseUrl: 'https://world.openfoodfacts.org/api/v2', tables: [
    { name: 'products', endpoint: '/search?json=true&page_size=50', fields: [{n:'code',t:'string',pk:true},{n:'product_name',t:'string'},{n:'brands',t:'string'},{n:'categories',t:'string'}] }
  ]},

  // ── Animals ──
  { id: 'dogapi', name: 'Dog API', baseUrl: 'https://dogapi.dog/api/v2', tables: [
    { name: 'breeds', endpoint: '/breeds', fields: [{n:'id',t:'string',pk:true},{n:'type',t:'string'},{n:'attributes',t:'json'}] }
  ]},
  { id: 'fishbase', name: 'FishWatch API', baseUrl: 'https://www.fishwatch.gov/api', tables: [
    { name: 'species', endpoint: '/species', fields: [{n:'Species_Name',t:'string',pk:true},{n:'Scientific_Name',t:'string'},{n:'Habitat',t:'string'},{n:'Location',t:'string'}] }
  ]},
  { id: 'butterfly', name: 'Butterfly API', baseUrl: 'https://butterfly.watch/api', tables: [
    { name: 'species', endpoint: '/species', fields: [{n:'id',t:'string',pk:true},{n:'common_name',t:'string'},{n:'scientific_name',t:'string'}] }
  ]},

  // ── Books & Literature ──
  { id: 'openlibrary-books', name: 'OpenLibrary Books', baseUrl: 'https://openlibrary.org', tables: [
    { name: 'trending', endpoint: '/trending/daily.json?limit=50', fields: [{n:'key',t:'string',pk:true},{n:'title',t:'string'},{n:'author_name',t:'json'}] }
  ]},
  { id: 'gutendex', name: 'Gutenberg API', baseUrl: 'https://gutendex.com', tables: [
    { name: 'books', endpoint: '/books?mime_type=text/plain', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'authors',t:'json'},{n:'languages',t:'json'},{n:'download_count',t:'number'}] }
  ]},

  // ── Government & Data ──
  { id: 'datausa', name: 'Data USA', baseUrl: 'https://datausa.io/api', tables: [
    { name: 'population', endpoint: '/data?Geography=04000US06&drilldowns=Nation&measures=Population', fields: [{n:'ID_Nation',t:'string',pk:true},{n:'Nation',t:'string'},{n:'Population',t:'number'},{n:'Year',t:'string'}] }
  ]},
  { id: 'fda', name: 'FDA API', baseUrl: 'https://api.fda.gov', tables: [
    { name: 'drugs', endpoint: '/drug/event.json?limit=50', fields: [{n:'safetyreportid',t:'string',pk:true},{n:'receiver',t:'json'},{n:'patient',t:'json'}] }
  ]},
  { id: 'edealer', name: 'EPA Air Quality', baseUrl: 'https://www.airnowapi.org/aq', tables: [
    { name: 'observation', endpoint: '/observation/zipCode/current?format=application/json&zipCode=10001&distance=25&API_KEY=DEMO_KEY', fields: [{n:'DateObserved',t:'string',pk:true},{n:'HourObserved',t:'number'},{n:'ReportingArea',t:'string'},{n:'AQI',t:'number'},{n:'Category',t:'json'}] }
  ]},
  { id: 'congress', name: 'ProPublica Congress', baseUrl: 'https://api.propublica.org/congress/v1', tables: [
    { name: 'members', endpoint: '/118/senate/members.json', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'party',t:'string'},{n:'state',t:'string'},{n:'title',t:'string'}] }
  ]},

  // ── Developer & Tools ──
  { id: 'httpstatuscats', name: 'HTTP Status Cats', baseUrl: 'https://http.cat', tables: [
    { name: 'statuses', endpoint: '/200', fields: [{n:'status',t:'number',pk:true},{n:'image_url',t:'string'}] }
  ]},
  { id: 'githubzen', name: 'GitHub Zen', baseUrl: 'https://api.github.com', tables: [
    { name: 'zen', endpoint: '/zen', fields: [{n:'quote',t:'string',pk:true}] },
    { name: 'emojis', endpoint: '/emojis', fields: [{n:'name',t:'string',pk:true},{n:'url',t:'string'}] }
  ]},
  { id: 'gitlab-public', name: 'GitLab Public', baseUrl: 'https://gitlab.com/api/v4', tables: [
    { name: 'projects', endpoint: '/projects?visibility=public&per_page=20', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'description',t:'string'},{n:'web_url',t:'string'}] }
  ]},
  { id: 'npm-registry', name: 'NPM Registry', baseUrl: 'https://registry.npmjs.org', tables: [
    { name: 'package', endpoint: '/express', fields: [{n:'name',t:'string',pk:true},{n:'description',t:'string'},{n:'version',t:'string'},{n:'license',t:'string'}] }
  ]},
  { id: 'pypi', name: 'PyPI', baseUrl: 'https://pypi.org/pypi', tables: [
    { name: 'package', endpoint: '/requests/json', fields: [{n:'name',t:'string',pk:true},{n:'summary',t:'string'},{n:'version',t:'string'},{n:'license',t:'string'}] }
  ]},
  { id: 'crates-io', name: 'Crates.io', baseUrl: 'https://crates.io/api/v1', tables: [
    { name: 'crates', endpoint: '/crates?per_page=50', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'description',t:'string'},{n:'downloads',t:'number'},{n:'max_version',t:'string'}] }
  ]},

  // ── Music ──
  { id: 'musicbrainz', name: 'MusicBrainz', baseUrl: 'https://musicbrainz.org/ws/2', tables: [
    { name: 'artists', endpoint: '/artist/?query=radiohead&fmt=json&limit=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'type',t:'string'},{n:'country',t:'string'}] }
  ]},
  { id: 'deezer', name: 'Deezer API', baseUrl: 'https://api.deezer.com', tables: [
    { name: 'chart', endpoint: '/chart', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'artist',t:'json'}] },
    { name: 'genres', endpoint: '/genre', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'}] }
  ]},
  { id: 'audiodb', name: 'TheAudioDB', baseUrl: 'https://www.theaudiodb.com/api/v1/json/2', tables: [
    { name: 'artists', endpoint: '/search.php?s=coldplay', fields: [{n:'idArtist',t:'string',pk:true},{n:'strArtist',t:'string'},{n:'strGenre',t:'string'},{n:'strCountry',t:'string'}] }
  ]},

  // ── Art & Culture ──
  { id: 'harvardart', name: 'Harvard Art Museums', baseUrl: 'https://api.harvardartmuseums.org', tables: [
    { name: 'objects', endpoint: '/object?apikey=DEMO_KEY&size=50', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'people',t:'json'},{n:'classification',t:'string'},{n:'period',t:'string'}] }
  ]},
  { id: 'rijksmuseum', name: 'Rijksmuseum', baseUrl: 'https://www.rijksmuseum.nl/api/en', tables: [
    { name: 'artworks', endpoint: '/collection?key=0fiuZFh4&ps=50', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'principalOrFirstMaker',t:'string'},{n:'longTitle',t:'string'}] }
  ]},
  { id: 'clevelandart', name: 'Cleveland Museum of Art', baseUrl: 'https://openaccess-api.clevelandart.org/api', tables: [
    { name: 'artworks', endpoint: '/artworks/?limit=50', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'artist',t:'json'},{n:'creation_date',t:'string'},{n:'technique',t:'string'}] }
  ]},

  // ── Health & Fitness ──
  { id: 'disease-sh', name: 'Disease.sh COVID', baseUrl: 'https://disease.sh/v3/covid-19', tables: [
    { name: 'global', endpoint: '/all', fields: [{n:'cases',t:'number'},{n:'deaths',t:'number'},{n:'recovered',t:'number'},{n:'active',t:'number'},{n:'updated',t:'number',pk:true}] },
    { name: 'countries', endpoint: '/countries?limit=50', fields: [{n:'country',t:'string',pk:true},{n:'cases',t:'number'},{n:'deaths',t:'number'},{n:'recovered',t:'number'}] }
  ]},
  { id: 'opendota', name: 'OpenDota', baseUrl: 'https://api.opendota.com/api', tables: [
    { name: 'heroes', endpoint: '/heroes', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'localized_name',t:'string'},{n:'primary_attr',t:'string'},{n:'attack_type',t:'string'}] }
  ]},

  // ── Jobs & Education ──
  { id: 'arbeitnow', name: 'Arbeitnow Jobs', baseUrl: 'https://www.arbeitnow.com/api', tables: [
    { name: 'jobs', endpoint: '/job-board-api', fields: [{n:'slug',t:'string',pk:true},{n:'title',t:'string'},{n:'company_name',t:'string'},{n:'remote',t:'boolean'},{n:'url',t:'string'}] }
  ]},
  { id: 'github-jobs', name: 'GitHub Jobs', baseUrl: 'https://jobs.github.com', tables: [
    { name: 'positions', endpoint: '/positions.json?description=python', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'company',t:'string'},{n:'location',t:'string'},{n:'type',t:'string'}] }
  ]},

  // ── Random & Fun ──
  { id: 'boredapi', name: 'Bored API', baseUrl: 'https://bored-api.appbrewery.com', tables: [
    { name: 'activities', endpoint: '/random', fields: [{n:'activity',t:'string',pk:true},{n:'type',t:'string'},{n:'participants',t:'number'},{n:'price',t:'number'}] }
  ]},
  { id: 'advice-slip', name: 'Advice Slip', baseUrl: 'https://api.adviceslip.com', tables: [
    { name: 'advice', endpoint: '/advice', fields: [{n:'id',t:'number',pk:true},{n:'advice',t:'string'}] }
  ]},
  { id: 'numbersapi', name: 'Numbers API', baseUrl: 'http://numbersapi.com', tables: [
    { name: 'trivia', endpoint: '/1..10?json', fields: [{n:'number',t:'number',pk:true},{n:'text',t:'string'},{n:'found',t:'boolean'},{n:'type',t:'string'}] }
  ]},
  { id: 'uselessfacts', name: 'Useless Facts', baseUrl: 'https://uselessfacts.jsph.pl/api/v2', tables: [
    { name: 'facts', endpoint: '/facts/random', fields: [{n:'id',t:'string',pk:true},{n:'text',t:'string'},{n:'source',t:'string'}] }
  ]},
  { id: 'tronalddump', name: 'Tronald Dump', baseUrl: 'https://api.tronalddump.io', tables: [
    { name: 'quotes', endpoint: '/random/quote', fields: [{n:'quote_id',t:'string',pk:true},{n:'value',t:'string'},{n:'appeared_at',t:'string'},{n:'tags',t:'json'}] }
  ]},
  { id: 'quotegarden', name: 'Quote Garden', baseUrl: 'https://quotegarden.herokuapp.com/api/v3', tables: [
    { name: 'quotes', endpoint: '/quotes/random', fields: [{n:'_id',t:'string',pk:true},{n:'quoteText',t:'string'},{n:'quoteAuthor',t:'string'}] }
  ]},

  // ── Transport ──
  { id: 'transport-gb', name: 'Transport for GB', baseUrl: 'https://transportapi.com/v3', tables: [
    { name: 'places', endpoint: '/places.json?query=London&type=train_station&app_id=demo&app_key=demo', fields: [{n:'atcocode',t:'string',pk:true},{n:'name',t:'string'},{n:'type',t:'string'}] }
  ]},

  // ── Open Data ──
  { id: 'pokemontcg', name: 'Pokemon TCG', baseUrl: 'https://api.pokemontcg.io/v2', tables: [
    { name: 'cards', endpoint: '/cards?pageSize=50', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'supertype',t:'string'},{n:'hp',t:'string'},{n:'types',t:'json'}] },
    { name: 'types', endpoint: '/types', fields: [{n:'name',t:'string',pk:true}] }
  ]},
  { id: 'scryfall', name: 'Scryfall MTG', baseUrl: 'https://api.scryfall.com', tables: [
    { name: 'cards', endpoint: '/cards/search?q=c%3Ared+cmc%3D1', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'type_line',t:'string'},{n:'mana_cost',t:'string'},{n:'rarity',t:'string'}] }
  ]},
  { id: 'keycloak', name: 'Yu-Gi-Oh API', baseUrl: 'https://db.ygoprodeck.com/api/v7', tables: [
    { name: 'cards', endpoint: '/cardinfo.php?num=50&offset=0', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'type',t:'string'},{n:'race',t:'string'},{n:'atk',t:'number'},{n:'def',t:'number'}] }
  ]},
  { id: 'magicthegathering', name: 'MTG API', baseUrl: 'https://api.magicthegathering.io/v1', tables: [
    { name: 'cards', endpoint: '/cards?pageSize=50', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'type',t:'string'},{n:'rarity',t:'string'},{n:'manaCost',t:'string'}] }
  ]},

  // ── More Data APIs ──
  { id: 'agify', name: 'Agify', baseUrl: 'https://api.agify.io', tables: [
    { name: 'predictions', endpoint: '?name=michael', fields: [{n:'name',t:'string',pk:true},{n:'age',t:'number'},{n:'count',t:'number'}] }
  ]},
  { id: 'genderize', name: 'Genderize', baseUrl: 'https://api.genderize.io', tables: [
    { name: 'predictions', endpoint: '?name=james', fields: [{n:'name',t:'string',pk:true},{n:'gender',t:'string'},{n:'probability',t:'number'},{n:'count',t:'number'}] }
  ]},
  { id: 'nationalize', name: 'Nationalize', baseUrl: 'https://api.nationalize.io', tables: [
    { name: 'predictions', endpoint: '?name=michael', fields: [{n:'name',t:'string',pk:true},{n:'country',t:'json'}] }
  ]},
  { id: 'ipapi', name: 'IP API', baseUrl: 'https://ipapi.co', tables: [
    { name: 'ip', endpoint: '/json', fields: [{n:'ip',t:'string',pk:true},{n:'city',t:'string'},{n:'region',t:'string'},{n:'country_name',t:'string'},{n:'latitude',t:'number'},{n:'longitude',t:'number'}] }
  ]},
  { id: 'ipinfo', name: 'IPInfo', baseUrl: 'https://ipinfo.io', tables: [
    { name: 'ip', endpoint: '/json', fields: [{n:'ip',t:'string',pk:true},{n:'city',t:'string'},{n:'region',t:'string'},{n:'country',t:'string'},{n:'loc',t:'string'}] }
  ]},
  { id: 'timezoneapi', name: 'Timezone API', baseUrl: 'https://worldtimeapi.org/api', tables: [
    { name: 'timezones', endpoint: '/timezone', fields: [{n:'timezone',t:'string',pk:true}] },
    { name: 'current', endpoint: '/ip', fields: [{n:'abbreviation',t:'string',pk:true},{n:'datetime',t:'string'},{n:'timezone',t:'string'}] }
  ]},
  { id: 'publicapis', name: 'Public APIs Directory', baseUrl: 'https://api.publicapis.org', tables: [
    { name: 'entries', endpoint: '/entries?https=true&limit=50', fields: [{n:'API',t:'string',pk:true},{n:'Description',t:'string'},{n:'Auth',t:'string'},{n:'HTTPS',t:'boolean'},{n:'Category',t:'string'}] }
  ]},
  { id: 'fakestore', name: 'FakeStore API', baseUrl: 'https://fakestoreapi.com', tables: [
    { name: 'products', endpoint: '/products', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'price',t:'number'},{n:'category',t:'string'},{n:'description',t:'string'}] },
    { name: 'users', endpoint: '/users', fields: [{n:'id',t:'number',pk:true},{n:'email',t:'string'},{n:'username',t:'string'},{n:'name',t:'json'}] },
    { name: 'carts', endpoint: '/carts', fields: [{n:'id',t:'number',pk:true},{n:'userId',t:'number'},{n:'products',t:'json'}] }
  ]},
  { id: 'dummyjson', name: 'DummyJSON', baseUrl: 'https://dummyjson.com', tables: [
    { name: 'products', endpoint: '/products?limit=50', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'price',t:'number'},{n:'category',t:'string'},{n:'brand',t:'string'}] },
    { name: 'users', endpoint: '/users?limit=50', fields: [{n:'id',t:'number',pk:true},{n:'firstName',t:'string'},{n:'lastName',t:'string'},{n:'email',t:'string'},{n:'age',t:'number'}] },
    { name: 'todos', endpoint: '/todos?limit=50', fields: [{n:'id',t:'number',pk:true},{n:'todo',t:'string'},{n:'completed',t:'boolean'},{n:'userId',t:'number'}] }
  ]},
  { id: 'jsonserver', name: 'JSONServer', baseUrl: 'https://jsonplaceholder.typicode.com', tables: [
    { name: 'posts', endpoint: '/posts', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'body',t:'string'},{n:'userId',t:'number'}] },
    { name: 'comments', endpoint: '/comments', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'email',t:'string'},{n:'body',t:'string'}] },
    { name: 'albums', endpoint: '/albums', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'userId',t:'number'}] },
    { name: 'photos', endpoint: '/photos', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'url',t:'string'},{n:'thumbnailUrl',t:'string'}] }
  ]},
  { id: 'reqres-api', name: 'ReqRes API', baseUrl: 'https://reqres.in/api', tables: [
    { name: 'users', endpoint: '/users', fields: [{n:'id',t:'number',pk:true},{n:'email',t:'string'},{n:'first_name',t:'string'},{n:'last_name',t:'string'},{n:'avatar',t:'string'}] }
  ]},
  { id: 'httpbin-api', name: 'HTTPBin API', baseUrl: 'https://httpbin.org', tables: [
    { name: 'ip', endpoint: '/ip', fields: [{n:'origin',t:'string',pk:true}] },
    { name: 'headers', endpoint: '/headers', fields: [{n:'headers',t:'json',pk:true}] },
    { name: 'user_agent', endpoint: '/user-agent', fields: [{n:'user-agent',t:'string',pk:true}] }
  ]},

  // ── Weather ──
  { id: 'wttr', name: 'wttr.in Weather', baseUrl: 'https://wttr.in', tables: [
    { name: 'weather', endpoint: '/London?format=j1', fields: [{n:'current_condition',t:'json',pk:true},{n:'nearest_area',t:'json'},{n:'weather',t:'json'}] }
  ]},

  // ── Misc ──
  { id: 'dictionary', name: 'Free Dictionary', baseUrl: 'https://api.dictionaryapi.dev/api/v2', tables: [
    { name: 'entries', endpoint: '/entries/en/hello', fields: [{n:'word',t:'string',pk:true},{n:'meanings',t:'json'},{n:'phonetics',t:'json'}] }
  ]},
  { id: 'programming-quotes', name: 'Programming Quotes', baseUrl: 'https://programming-quotes-api.azurewebsites.net/api', tables: [
    { name: 'quotes', endpoint: '/quotes/random/50', fields: [{n:'id',t:'string',pk:true},{n:'en',t:'string'},{n:'author',t:'string'}] }
  ]},
  { id: 'quotable', name: 'Quotable', baseUrl: 'https://api.quotable.io', tables: [
    { name: 'quotes', endpoint: '/quotes?limit=50', fields: [{n:'_id',t:'string',pk:true},{n:'content',t:'string'},{n:'author',t:'string'},{n:'tags',t:'json'}] },
    { name: 'authors', endpoint: '/authors?limit=50', fields: [{n:'_id',t:'string',pk:true},{n:'name',t:'string'},{n:'bio',t:'string'}] }
  ]},
  { id: 'inspirobot', name: 'InspiroBot', baseUrl: 'https://inspirobot.me/api', tables: [
    { name: 'quotes', endpoint: '?generate=true', fields: [{n:'data',t:'string',pk:true}] }
  ]},
  { id: 'affirmations', name: 'Affirmations', baseUrl: 'https://www.affirmations.dev', tables: [
    { name: 'affirmations', endpoint: '/', fields: [{n:'affirmation',t:'string',pk:true}] }
  ]},
  { id: 'activity-suggestion', name: 'Activity Suggestion', baseUrl: 'https://www.boredapi.com/api', tables: [
    { name: 'activities', endpoint: '/activity', fields: [{n:'key',t:'string',pk:true},{n:'activity',t:'string'},{n:'type',t:'string'},{n:'participants',t:'number'},{n:'price',t:'number'}] }
  ]},

  // ── Board Games ──
  { id: 'boardgamegeek', name: 'BoardGameGeek XML', baseUrl: 'https://boardgamegeek.com/xmlapi2', tables: [
    { name: 'hot', endpoint: '/hot?type=boardgame', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'yearpublished',t:'string'},{n:'rank',t:'string'}] }
  ]},

  // ── Comics ──
  { id: 'xkcd', name: 'XKCD Comics', baseUrl: 'https://xkcd.com', tables: [
    { name: 'comics', endpoint: '/info.0.json', fields: [{n:'num',t:'number',pk:true},{n:'title',t:'string'},{n:'alt',t:'string'},{n:'img',t:'string'},{n:'year',t:'string'}] }
  ]},
  { id: 'calvinandhobbes', name: 'Calvin and Hobbes', baseUrl: 'https://calvinandhobbes.fandom.com/api.php', tables: [
    { name: 'comics', endpoint: '?action=query&list=categorymembers&cmtitle=Category:Strips&cmlimit=50&format=json', fields: [{n:'pageid',t:'number',pk:true},{n:'title',t:'string'}] }
  ]},

  // ── Additional SaaS-like ──
  { id: 'notion-public', name: 'Notion Public Pages', baseUrl: 'https://notion-api.splitbee.io/v1', tables: [
    { name: 'table', endpoint: '/table/89f4e0b7c453409bb67a7b16b89d2e6f', fields: [{n:'id',t:'string',pk:true},{n:'Name',t:'string'},{n:'Tags',t:'json'}] }
  ]},
  { id: 'sheetdb', name: 'SheetDB', baseUrl: 'https://sheetdb.io/api/v1', tables: [
    { name: 'rows', endpoint: '/a1b2c3d4e5f6g?limit=10', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'}] }
  ]},
  { id: 'jsonbin', name: 'JSONBin', baseUrl: 'https://api.jsonbin.io/v3', tables: [
    { name: 'bins', endpoint: '/b/60f1a7c399803d1b08564b39/latest', fields: [{n:'record',t:'json',pk:true}] }
  ]},

  // ── Anime & Manga ──
  { id: 'kitsu', name: 'Kitsu Anime', baseUrl: 'https://kitsu.io/api/edge', tables: [
    { name: 'anime', endpoint: '/anime?page[limit]=20', fields: [{n:'id',t:'string',pk:true},{n:'canonicalTitle',t:'string'},{n:'synopsis',t:'string'},{n:'averageRating',t:'string'},{n:'startDate',t:'string'}] }
  ]},
  { id: 'aniapi', name: 'AniList GraphQL', baseUrl: 'https://graphql.anilist.co', tables: [
    { name: 'trending', endpoint: '', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'json'},{n:'description',t:'string'},{n:'averageScore',t:'number'}] }
  ]},

  // ── Jobs ──
  { id: 'remoteok', name: 'RemoteOK', baseUrl: 'https://remoteok.com/api', tables: [
    { name: 'jobs', endpoint: '', fields: [{n:'id',t:'string',pk:true},{n:'position',t:'string'},{n:'company',t:'string'},{n:'location',t:'string'},{n:'salary',t:'string'}] }
  ]},
  { id: 'findwork', name: 'FindWork', baseUrl: 'https://findwork.dev/api/jobs', tables: [
    { name: 'jobs', endpoint: '/', fields: [{n:'id',t:'number',pk:true},{n:'role',t:'string'},{n:'company_name',t:'string'},{n:'location',t:'string'},{n:'remote',t:'boolean'}] }
  ]},

  // ── NFT & Blockchain ──
  { id: 'opensea-public', name: 'OpenSea Public', baseUrl: 'https://api.opensea.io/api/v2', tables: [
    { name: 'collections', endpoint: '/collections?limit=20', fields: [{n:'collection',t:'string',pk:true},{n:'name',t:'string'},{n:'description',t:'string'}] }
  ]},

  // ── Social ──
  { id: 'mastodon-public', name: 'Mastodon Public', baseUrl: 'https://mastodon.social/api/v1', tables: [
    { name: 'trending', endpoint: '/trends?limit=20', fields: [{n:'name',t:'string',pk:true},{n:'url',t:'string'},{n:'history',t:'json'}] }
  ]},
  { id: 'reddit-public', name: 'Reddit Public', baseUrl: 'https://www.reddit.com', tables: [
    { name: 'subreddits', endpoint: '/r/popular.json?limit=25', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'subreddit',t:'string'},{n:'author',t:'string'}] }
  ]},
  { id: 'hackernews', name: 'Hacker News', baseUrl: 'https://hacker-news.firebaseio.com/v0', tables: [
    { name: 'top', endpoint: '/topstories.json', fields: [{n:'id',t:'number',pk:true}] },
    { name: 'item', endpoint: '/item/8863.json', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'by',t:'string'},{n:'score',t:'number'},{n:'url',t:'string'}] }
  ]},

  // ── More Data ──
  { id: 'ventura', name: 'Ventura API', baseUrl: 'https://ventura-api.herokuapp.com', tables: [
    { name: 'people', endpoint: '/people', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'age',t:'number'}] }
  ]},
  { id: 'sheety', name: 'Sheety API', baseUrl: 'https://api.sheety.co', tables: [
    { name: 'users', endpoint: '/3a1d7a1c7d5a3a5e5a5a5a5a5a5a5a5a/pulsyn/users', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'email',t:'string'}] }
  ]},
  { id: 'cloudflare-dns', name: 'Cloudflare DNS', baseUrl: 'https://cloudflare-dns.com/dns-query', tables: [
    { name: 'resolve', endpoint: '?name=example.com&type=A', fields: [{n:'name',t:'string',pk:true},{n:'type',t:'number'},{n:'data',t:'string'}] }
  ]},

  // ── US Government ──
  { id: 'data-gov', name: 'Data.gov', baseUrl: 'https://api.data.gov', tables: [
    { name: 'usda', endpoint: '/usda/ndb/search/?api_key=DEMO_KEY&q=butter&max=25', fields: [{n:'ndbno',t:'string',pk:true},{n:'name',t:'string'},{n:'group',t:'string'}] }
  ]},

  // ── EU Open Data ──
  { id: 'ecb', name: 'European Central Bank', baseUrl: 'https://data-api.ecb.europa.eu/service/data', tables: [
    { name: 'exchange_rates', endpoint: '/EXR/D.USD.EUR.SP00.A?format=csvdata&lastNObservations=10', fields: [{n:'TIME_PERIOD',t:'string',pk:true},{n:'OBS_VALUE',t:'string'},{n:'CURRENCY',t:'string'}] }
  ]},

  // ── Misc Fun ──
  { id: 'officequotes', name: 'Office Quotes', baseUrl: 'https://officeapi.akashrajpurohit.com', tables: [
    { name: 'quotes', endpoint: '/quote/random', fields: [{n:'quote',t:'string',pk:true},{n:'character',t:'string'},{n:'character_avatar_url',t:'string'}] }
  ]},
  { id: 'futurama', name: 'Futurama API', baseUrl: 'https://futuramaapi.herokuapp.com/api', tables: [
    { name: 'quotes', endpoint: '/quotes', fields: [{n:'quote',t:'string',pk:true},{n:'character',t:'string'},{n:'image',t:'string'}] }
  ]},
  { id: 'simpsons', name: 'Simpsons Quotes', baseUrl: 'https://thesimpsonsquoteapi.glitch.me', tables: [
    { name: 'quotes', endpoint: '/quotes?count=50', fields: [{n:'quote',t:'string',pk:true},{n:'character',t:'string'},{n:'image',t:'string'},{n:'characterDirection',t:'string'}] }
  ]},
  { id: 'breakingbad', name: 'Breaking Bad API', baseUrl: 'https://www.breakingbadapi.com/api', tables: [
    { name: 'characters', endpoint: '/characters', fields: [{n:'char_id',t:'number',pk:true},{n:'name',t:'string'},{n:'birthday',t:'string'},{n:'occupation',t:'json'},{n:'status',t:'string'}] },
    { name: 'episodes', endpoint: '/episodes', fields: [{n:'episode_id',t:'number',pk:true},{n:'title',t:'string'},{n:'season',t:'string'},{n:'episode',t:'string'},{n:'air_date',t:'string'}] }
  ]},
  { id: 'spongebob', name: 'SpongeBob API', baseUrl: 'https://spongebob-api.glitch.me', tables: [
    { name: 'characters', endpoint: '/characters', fields: [{n:'name',t:'string',pk:true},{n:'image',t:'string'},{n:'description',t:'string'}] }
  ]},
  { id: 'trivia', name: 'Trivia API', baseUrl: 'https://opentdb.com/api.php', tables: [
    { name: 'questions', endpoint: '?amount=50', fields: [{n:'question',t:'string',pk:true},{n:'correct_answer',t:'string'},{n:'incorrect_answers',t:'json'},{n:'category',t:'string'},{n:'difficulty',t:'string'}] }
  ]},
  { id: 'deckofcards2', name: 'Deck of Cards', baseUrl: 'https://deckofcardsapi.com/api/deck', tables: [
    { name: 'deck', endpoint: '/new/shuffle/?deck_count=1', fields: [{n:'deck_id',t:'string',pk:true},{n:'remaining',t:'number'},{n:'shuffled',t:'boolean'}] }
  ]},
  { id: 'coin-flip', name: 'Coin Flip', baseUrl: 'https://coinflip-api.vercel.app', tables: [
    { name: 'flip', endpoint: '/flip', fields: [{n:'result',t:'string',pk:true}] }
  ]},
  { id: 'dadjokes', name: 'Dad Jokes', baseUrl: 'https://icanhazdadjoke.com', tables: [
    { name: 'jokes', endpoint: '/', fields: [{n:'id',t:'string',pk:true},{n:'joke',t:'string'}] }
  ]},
];

// ═══════════════════════════════════════════════════════════════
// GENERATOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function pascalCase(str) {
  return str.replace(/(^|-)(\w)/g, (_, _p, c) => c.toUpperCase());
}

function generateConnector(api) {
  const className = pascalCase(api.id) + 'Connector';
  const tablesConst = api.tables.map((t, i) => {
    const cols = t.fields.map(f =>
      `        { name: '${f.n}', type: '${f.t}', nullable: false, primaryKey: ${f.pk || false} }`
    ).join(',\n');
    return `  {
    name: '${t.name}',
    endpoint: '${t.endpoint}',
    schema: {
      name: '${t.name}',
      table: '${t.name}',
      columns: [
${cols}
      ],
      primaryKey: ['${t.fields.find(f => f.pk)?.n || t.fields[0].n}'],
    },
    idField: '${t.fields.find(f => f.pk)?.n || t.fields[0].n}',
  }`;
  }).join(',\n');

  const healthEndpoint = api.tables[0].endpoint.split('?')[0];

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
      healthEndpoint: '${healthEndpoint}',
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
  config: {
    host: '${api.baseUrl}',
  },
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

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

let created = 0;
let skipped = 0;

for (const api of apis) {
  const connectorPath = path.join(CONNECTORS_DIR, `${api.id}.ts`);
  const testPath = path.join(TESTS_DIR, `${api.id}.test.ts`);

  if (fs.existsSync(connectorPath)) {
    console.log(`SKIP ${api.id} (already exists)`);
    skipped++;
    continue;
  }

  fs.writeFileSync(connectorPath, generateConnector(api));
  fs.writeFileSync(testPath, generateTest(api));
  console.log(`CREATED ${api.id} — ${api.tables.length} table(s)`);
  created++;
}

console.log(`\n=== DONE ===`);
console.log(`Created: ${created}`);
console.log(`Skipped: ${skipped}`);
console.log(`Total APIs defined: ${apis.length}`);
