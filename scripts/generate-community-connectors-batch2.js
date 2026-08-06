#!/usr/bin/env node
/**
 * Batch 3: More Community API Connectors
 * Uses SaaSConnector pattern for standard REST APIs
 */

const fs = require('fs');
const path = require('path');

const CONNECTORS_DIR = path.join(__dirname, '../packages/core/src/connectors');
const TESTS_DIR = path.join(__dirname, '../packages/core/src/__tests__/lab/connectors');

const apis = [
  // ── More Anime/Manga ──
  { id: 'waifupics', name: 'Waifu.pics', baseUrl: 'https://api.waifu.pics', tables: [
    { name: 'sfw', endpoint: '/sfw/waifu', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'nekoslife', name: 'Nekos.life', baseUrl: 'https://nekos.life/api/v2', tables: [
    { name: 'img', endpoint: '/img/waifu', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'waifuim', name: 'Waifu.im', baseUrl: 'https://api.waifu.im', tables: [
    { name: 'images', endpoint: '/search?limit=20', fields: [{n:'signature',t:'string',pk:true},{n:'url',t:'string'},{n:'tags',t:'json'}] }
  ]},

  // ── More Science ──
  { id: 'launchlibrary', name: 'Launch Library', baseUrl: 'https://ll.thespacedevs.com/2.2.0', tables: [
    { name: 'launches', endpoint: '/launch/upcoming?limit=10&mode=list', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'status',t:'json'},{n:'net',t:'string'}] }
  ]},
  { id: 'exoplanet', name: 'Exoplanet Archive', baseUrl: 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync', tables: [
    { name: 'planets', endpoint: '/?query=select+top+20+pl_name,hostname,disc_year,pl_rade,pl_bmasse+from+ps&format=json', fields: [{n:'pl_name',t:'string',pk:true},{n:'hostname',t:'string'},{n:'disc_year',t:'number'},{n:'pl_rade',t:'number'}] }
  ]},
  { id: 'solarsystem', name: 'Solar System API', baseUrl: 'https://api.le-systeme-solaire.net/rest', tables: [
    { name: 'bodies', endpoint: '/bodies?data=id,name,englishName,bodyType,gravity', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'englishName',t:'string'},{n:'bodyType',t:'string'},{n:'gravity',t:'number'}] }
  ]},

  // ── More Data/Reference ──
  { id: 'opendatasoft', name: 'OpenDataSoft', baseUrl: 'https://public.opendatsoutheast.fr/api/explore/v2.1', tables: [
    { name: 'datasets', endpoint: '/catalog/datasets?limit=20', fields: [{n:'dataset_id',t:'string',pk:true},{n:'title',t:'string'},{n:'description',t:'string'}] }
  ]},
  { id: 'fred', name: 'FRED Economic Data', baseUrl: 'https://api.stlouisfed.org/fred', tables: [
    { name: 'series', endpoint: '/series/search?search_text=gdp&api_key=DEMO_KEY&file_type=json&limit=20', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'frequency',t:'string'},{n:'units',t:'string'}] }
  ]},
  { id: 'bls', name: 'Bureau of Labor Stats', baseUrl: 'https://api.bls.gov/publicAPI/v2', tables: [
    { name: 'series', endpoint: '/timeseries/data/LAUCN040010000000004', fields: [{n:'seriesID',t:'string',pk:true},{n:'data',t:'json'}] }
  ]},

  // ── More Entertainment ──
  { id: 'marvel', name: 'Marvel API', baseUrl: 'https://gateway.marvel.com/v1/public', tables: [
    { name: 'characters', endpoint: '/characters?ts=1&apikey=demo&hash=demo', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'description',t:'string'}] }
  ]},
  { id: 'dcuniverse', name: 'DC Universe API', baseUrl: 'https://dcuniverseapi.com/api', tables: [
    { name: 'characters', endpoint: '/characters?limit=20', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'alias',t:'string'},{n:'powers',t:'json'}] }
  ]},
  { id: 'ghibli2', name: 'Ghibli API v2', baseUrl: 'https://ghibliapi.vercel.app', tables: [
    { name: 'films', endpoint: '/films', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'director',t:'string'},{n:'release_date',t:'string'},{n:'rt_score',t:'string'}] },
    { name: 'people', endpoint: '/people', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'gender',t:'string'},{n:'age',t:'string'}] }
  ]},
  { id: 'lotr', name: 'Lord of the Rings API', baseUrl: 'https://the-one-api.dev/v2', tables: [
    { name: 'movie', endpoint: '/movie', fields: [{n:'_id',t:'string',pk:true},{n:'name',t:'string'},{n:'runtimeInMinutes',t:'number'},{n:'budgetInMillions',t:'number'},{n:'rottenTomatoesScore',t:'number'}] }
  ]},
  { id: 'harrypotter', name: 'HP API', baseUrl: 'https://hp-api.onrender.com/api', tables: [
    { name: 'characters', endpoint: '/characters', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'house',t:'string'},{n:'species',t:'string'},{n:'patronus',t:'string'}] }
  ]},

  // ── More Dev Tools ──
  { id: 'wakatime', name: 'WakaTime Public', baseUrl: 'https://wakatime.com/api/v1', tables: [
    { name: 'leaders', endpoint: '/leaders', fields: [{n:'id',t:'string',pk:true},{n:'user',t:'json'},{n:'running_total',t:'json'}] }
  ]},
  { id: 'github-trending', name: 'GitHub Trending', baseUrl: 'https://api.gitterapp.com', tables: [
    { name: 'trending', endpoint: '/repositories?language=&since=daily', fields: [{n:'author',t:'string',pk:true},{n:'name',t:'string'},{n:'description',t:'string'},{n:'stars',t:'number'},{n:'language',t:'string'}] }
  ]},
  { id: 'codeforces', name: 'Codeforces API', baseUrl: 'https://codeforces.com/api', tables: [
    { name: 'problems', endpoint: '/problemset.problems', fields: [{n:'contestId',t:'number',pk:true},{n:'index',t:'string'},{n:'name',t:'string'},{n:'type',t:'string'},{n:'points',t:'number'}] }
  ]},
  { id: 'leetcode', name: 'LeetCode GraphQL', baseUrl: 'https://leetcode.com/graphql', tables: [
    { name: 'problems', endpoint: '', fields: [{n:'title',t:'string',pk:true},{n:'difficulty',t:'string'},{n:'categoryTitle',t:'string'}] }
  ]},

  // ── More Geography ──
  { id: 'countries-now', name: 'Countries Now', baseUrl: 'https://countriesnow.space/api/v0.1', tables: [
    { name: 'countries', endpoint: '/countries/info?returns=name,capital,currency,flag', fields: [{n:'name',t:'string',pk:true},{n:'capital',t:'string'},{n:'currency',t:'string'}] },
    { name: 'population', endpoint: '/countries/population', fields: [{n:'country',t:'string',pk:true},{n:'population_counts',t:'json'}] }
  ]},
  { id: 'zippopotam', name: 'Zippopotam.us', baseUrl: 'https://api.zippopotam.us', tables: [
    { name: 'us', endpoint: '/us/90210', fields: [{n:'post code',t:'string',pk:true},{n:'country',t:'string'},{n:'places',t:'json'}] }
  ]},
  { id: 'geocode', name: 'Nominatim Geocode', baseUrl: 'https://nominatim.openstreetmap.org', tables: [
    { name: 'search', endpoint: '/search?q=London&format=json&limit=10', fields: [{n:'place_id',t:'number',pk:true},{n:'display_name',t:'string'},{n:'lat',t:'string'},{n:'lon',t:'string'},{n:'type',t:'string'}] }
  ]},

  // ── More Finance ──
  { id: 'alpha-vantage', name: 'Alpha Vantage', baseUrl: 'https://www.alphavantage.co/query', tables: [
    { name: 'exchange_rate', endpoint: '?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=demo', fields: [{n:'From_Currency_Code',t:'string',pk:true},{n:'To_Currency_Code',t:'string'},{n:'Exchange_Rate',t:'string'}] }
  ]},
  { id: 'finnhub', name: 'Finnhub', baseUrl: 'https://finnhub.io/api/v1', tables: [
    { name: 'stock', endpoint: '/quote?symbol=AAPL&token=demo', fields: [{n:'c',t:'number'},{n:'h',t:'number'},{n:'l',t:'number'},{n:'o',t:'number'},{n:'t',t:'number',pk:true}] }
  ]},
  { id: 'polygon', name: 'Polygon.io', baseUrl: 'https://api.polygon.io', tables: [
    { name: 'tickers', endpoint: '/v3/reference/tickers?market=stocks&limit=20&apiKey=demo', fields: [{n:'ticker',t:'string',pk:true},{n:'name',t:'string'},{n:'market',t:'string'},{n:'locale',t:'string'}] }
  ]},

  // ── More Health ──
  { id: 'openfda', name: 'OpenFDA', baseUrl: 'https://api.fda.gov', tables: [
    { name: 'drugs', endpoint: '/drug/event.json?limit=20', fields: [{n:'safetyreportid',t:'string',pk:true},{n:'serious',t:'string'},{n:'receiver',t:'json'}] },
    { name: 'foods', endpoint: '/food/enforcement.json?limit=20', fields: [{n:'recall_number',t:'string',pk:true},{n:'product_description',t:'string'},{n:'reason_for_recall',t:'string'}] }
  ]},
  { id: 'nutritionix', name: 'Nutritionix', baseUrl: 'https://trackapi.nutritionix.com/v2', tables: [
    { name: 'nutrients', endpoint: '/natural/nutrients?query=apple', fields: [{n:'food_name',t:'string',pk:true},{n:'nf_calories',t:'number'},{n:'nf_protein',t:'number'},{n:'nf_total_carbohydrate',t:'number'}] }
  ]},

  // ── More Music ──
  { id: 'lastfm', name: 'Last.fm API', baseUrl: 'https://ws.audioscrobbler.com/2.0', tables: [
    { name: 'topartists', endpoint: '/?method=chart.gettopartists&api_key=demo&format=json&limit=20', fields: [{n:'mbid',t:'string',pk:true},{n:'name',t:'string'},{n:'playcount',t:'string'},{n:'listeners',t:'string'}] }
  ]},
  { id: 'spotify-public', name: 'Spotify Public', baseUrl: 'https://api.spotify.com/v1', tables: [
    { name: 'featured', endpoint: '/browse/featured-playlists?limit=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'description',t:'string'}] }
  ]},

  // ── More Games ──
  { id: 'rawg', name: 'RAWG Video Games', baseUrl: 'https://api.rawg.io/api', tables: [
    { name: 'games', endpoint: '/games?key=demo&page_size=20', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'released',t:'string'},{n:'rating',t:'number'},{n:'platforms',t:'json'}] },
    { name: 'genres', endpoint: '/genres?key=demo', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'games_count',t:'number'}] }
  ]},
  { id: 'igdb', name: 'IGDB/Twitch', baseUrl: 'https://api.igdb.com/v4', tables: [
    { name: 'games', endpoint: '/games', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'summary',t:'string'},{n:'rating',t:'number'}] }
  ]},

  // ── More Social ──
  { id: 'twitter-public', name: 'Twitter Public', baseUrl: 'https://api.twitter.com/2', tables: [
    { name: 'trends', endpoint: '/trends/by/woeid/1', fields: [{n:'name',t:'string',pk:true},{n:'tweet_volume',t:'number'}] }
  ]},
  { id: 'tumblr', name: 'Tumblr API', baseUrl: 'https://api.tumblr.com/v2', tables: [
    { name: 'blog', endpoint: '/blog/staff.tumblr.com/info', fields: [{n:'name',t:'string',pk:true},{n:'title',t:'string'},{n:'posts',t:'number'}] }
  ]},

  // ── More Government ──
  { id: 'data-gov-uk', name: 'Data.gov.uk', baseUrl: 'https://data.gov.uk/api', tables: [
    { name: 'datasets', endpoint: '/3/action/package_search?q=health&rows=20', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'notes',t:'string'}] }
  ]},
  { id: 'census', name: 'US Census', baseUrl: 'https://api.census.gov', tables: [
    { name: 'data', endpoint: '/data/2019/acs/acs5?get=NAME,B01001_001E&for=state:*', fields: [{n:'NAME',t:'string',pk:true},{n:'B01001_001E',t:'string'}] }
  ]},
  { id: 'regulations', name: 'Regulations.gov', baseUrl: 'https://api.regulations.gov/v4', tables: [
    { name: 'documents', endpoint: '/documents?filter[documentType]=Rule&page[size]=20&api_key=demo', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'documentType',t:'string'}] }
  ]},

  // ── More Misc ──
  { id: 'cameras', name: 'EarthCam', baseUrl: 'https://api.earthcam.com/v1', tables: [
    { name: 'cameras', endpoint: '/cameras', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'location',t:'string'}] }
  ]},
  { id: 'airport-info', name: 'Airport Info', baseUrl: 'https://airport-info.p.rapidapi.com', tables: [
    { name: 'airports', endpoint: '/airport?iata=LAX', fields: [{n:'iata',t:'string',pk:true},{n:'name',t:'string'},{n:'city',t:'string'},{n:'country',t:'string'}] }
  ]},
  { id: 'aviationstack', name: 'Aviationstack', baseUrl: 'http://api.aviationstack.com/v1', tables: [
    { name: 'flights', endpoint: '/flights?access_key=demo&limit=20', fields: [{n:'flight',t:'json',pk:true},{n:'departure',t:'json'},{n:'arrival',t:'json'},{n:'airline',t:'json'}] }
  ]},
  { id: 'openweathermap', name: 'OpenWeatherMap', baseUrl: 'https://api.openweathermap.org/data/2.5', tables: [
    { name: 'weather', endpoint: '/weather?q=London&appid=demo', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'main',t:'json'},{n:'weather',t:'json'}] }
  ]},
  { id: 'weatherapi', name: 'WeatherAPI', baseUrl: 'https://api.weatherapi.com/v1', tables: [
    { name: 'current', endpoint: '/current.json?key=demo&q=London', fields: [{n:'location',t:'json',pk:true},{n:'current',t:'json'}] }
  ]},
  { id: 'airquality', name: 'AQICN Air Quality', baseUrl: 'https://api.waqi.info', tables: [
    { name: 'feed', endpoint: '/feed/here/?token=demo', fields: [{n:'idx',t:'number',pk:true},{n:'city',t:'json'},{n:'aqi',t:'number'},{n:'time',t:'json'}] }
  ]},

  // ── QR/Shortener ──
  { id: 'qrserver', name: 'QR Server', baseUrl: 'https://api.qrserver.com/v1', tables: [
    { name: 'qr', endpoint: '/create-qr-code/?size=150x150&data=Example', fields: [{n:'data',t:'string',pk:true}] }
  ]},
  { id: 'cleanuri', name: 'CleanURI', baseUrl: 'https://cleanuri.com/api/v1', tables: [
    { name: 'shorten', endpoint: '/shorten', fields: [{n:'result_url',t:'string',pk:true}] }
  ]},

  // ── Image/Video ──
  { id: 'unsplash', name: 'Unsplash', baseUrl: 'https://api.unsplash.com', tables: [
    { name: 'photos', endpoint: '/photos?per_page=20&client_id=demo', fields: [{n:'id',t:'string',pk:true},{n:'description',t:'string'},{n:'user',t:'json'},{n:'urls',t:'json'}] }
  ]},
  { id: 'pexels', name: 'Pexels', baseUrl: 'https://api.pexels.com/v1', tables: [
    { name: 'photos', endpoint: '/popular?per_page=20', fields: [{n:'id',t:'number',pk:true},{n:'photographer',t:'string'},{n:'src',t:'json'}] }
  ]},
  { id: 'pixabay', name: 'Pixabay', baseUrl: 'https://pixabay.com/api', tables: [
    { name: 'images', endpoint: '/?key=demo&q=yellow+flowers&per_page=20', fields: [{n:'id',t:'number',pk:true},{n:'user',t:'string'},{n:'tags',t:'string'},{n:'webformatURL',t:'string'}] }
  ]},

  // ── Translation ──
  { id: 'libretranslate', name: 'LibreTranslate', baseUrl: 'https://libretranslate.com', tables: [
    { name: 'languages', endpoint: '/languages', fields: [{n:'code',t:'string',pk:true},{n:'name',t:'string'}] }
  ]},
  { id: 'mymemory', name: 'MyMemory Translation', baseUrl: 'https://api.mymemory.translated.net', tables: [
    { name: 'translate', endpoint: '/get?q=Hello&langpair=en|it', fields: [{n:'responseStatus',t:'number',pk:true},{n:'responseData',t:'json'}] }
  ]},

  // ── Misc Utilities ──
  { id: 'httpbin2', name: 'HTTPBin v2', baseUrl: 'https://httpbin.org', tables: [
    { name: 'get', endpoint: '/get', fields: [{n:'url',t:'string',pk:true},{n:'headers',t:'json'},{n:'origin',t:'string'}] },
    { name: 'uuid', endpoint: '/uuid', fields: [{n:'uuid',t:'string',pk:true}] }
  ]},
  { id: 'jsdelivr', name: 'jsDelivr Stats', baseUrl: 'https://data.jsdelivr.com/v1', tables: [
    { name: 'packages', endpoint: '/packages/npm/express', fields: [{n:'name',t:'string',pk:true},{n:'latest',t:'string'},{n:'description',t:'string'}] }
  ]},
  { id: 'github-user', name: 'GitHub Users', baseUrl: 'https://api.github.com', tables: [
    { name: 'users', endpoint: '/users?since=0&per_page=20', fields: [{n:'login',t:'string',pk:true},{n:'id',t:'number'},{n:'avatar_url',t:'string'},{n:'type',t:'string'}] }
  ]},
  { id: 'npm-search', name: 'NPM Search', baseUrl: 'https://registry.npmjs.org', tables: [
    { name: 'search', endpoint: '/-/v1/search?text=express&size=20', fields: [{n:'package.name',t:'string',pk:true},{n:'package.description',t:'string'},{n:'package.version',t:'string'}] }
  ]},
  { id: 'dockerhub', name: 'Docker Hub', baseUrl: 'https://hub.docker.com/v2', tables: [
    { name: 'images', endpoint: '/search/repositories/?query=node&page_size=20', fields: [{n:'repo_name',t:'string',pk:true},{n:'short_description',t:'string'},{n:'star_count',t:'number'}] }
  ]},
  { id: 'nuget', name: 'NuGet API', baseUrl: 'https://api.nuget.org/v3', tables: [
    { name: 'packages', endpoint: '/registration-semver2/newtonsoft.json/index.json', fields: [{n:'id',t:'string',pk:true},{n:'version',t:'string'}] }
  ]},
  { id: 'rubygems', name: 'RubyGems API', baseUrl: 'https://rubygems.org/api/v1', tables: [
    { name: 'gems', endpoint: '/search.json?query=rails', fields: [{n:'name',t:'string',pk:true},{n:'info',t:'string'},{n:'downloads',t:'number'},{n:'version',t:'string'}] }
  ]},
  { id: 'packagist', name: 'Packagist (PHP)', baseUrl: 'https://packagist.org', tables: [
    { name: 'packages', endpoint: '/search.json?q=laravel&per_page=20', fields: [{n:'name',t:'string',pk:true},{n:'description',t:'string'},{n:'downloads',t:'number'}] }
  ]},
  { id: 'cocoapods', name: 'CocoaPods', baseUrl: 'https://trunk.cocoapods.org/api/v1', tables: [
    { name: 'pods', endpoint: '/pods?query=alamofire', fields: [{n:'name',t:'string',pk:true},{n:'version',t:'string'}] }
  ]},

  // ── Misc ──
  { id: 'adventure', name: 'Adventure Time API', baseUrl: 'https://adventure-time-api.herokuapp.com/api/v1', tables: [
    { name: 'characters', endpoint: '/characters', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'url',t:'string'}] }
  ]},
  { id: 'automotive', name: 'NHTSA Vehicles', baseUrl: 'https://vpic.nhtsa.dot.gov/api', tables: [
    { name: 'makes', endpoint: '/vehicles/GetMakesForVehicleType/car?format=json', fields: [{n:'MakeId',t:'number',pk:true},{n:'MakeName',t:'string'}] },
    { name: 'models', endpoint: '/vehicles/GetModelsForMakeId/474?format=json', fields: [{n:'Model_ID',t:'number',pk:true},{n:'Make_Name',t:'string'},{n:'Model_Name',t:'string'}] }
  ]},
  { id: 'openlibrary-search', name: 'OpenLibrary Search', baseUrl: 'https://openlibrary.org', tables: [
    { name: 'search', endpoint: '/search.json?q=harry+potter&limit=20', fields: [{n:'key',t:'string',pk:true},{n:'title',t:'string'},{n:'author_name',t:'json'},{n:'first_publish_year',t:'number'}] }
  ]},
  { id: 'gutendex2', name: 'Gutendex v2', baseUrl: 'https://gutendex.com', tables: [
    { name: 'books', endpoint: '/books?search=shakespeare', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'authors',t:'json'},{n:'download_count',t:'number'}] }
  ]},
  { id: 'loc', name: 'Library of Congress', baseUrl: 'https://www.loc.gov', tables: [
    { name: 'books', endpoint: '/books/?q=democracy&fo=json&c=20', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'creator',t:'string'},{n:'date',t:'string'}] }
  ]},
  { id: 'europeana', name: 'Europeana', baseUrl: 'https://api.europeana.eu/record/v2', tables: [
    { name: 'search', endpoint: '/search.json?query=cat&rows=20&wskey=demo', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'json'},{n:'type',t:'string'}] }
  ]},
  { id: 'smithsonian', name: 'Smithsonian API', baseUrl: 'https://api.si.edu/openaccess/api/v1.0', tables: [
    { name: 'search', endpoint: '/search?q=cat&rows=20&api_key=demo', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'content',t:'json'}] }
  ]},

  // ── Sports ──
  { id: 'sportsdb', name: 'TheSportsDB', baseUrl: 'https://www.thesportsdb.com/api/v1/json/3', tables: [
    { name: 'leagues', endpoint: '/all_leagues.php', fields: [{n:'idLeague',t:'string',pk:true},{n:'strLeague',t:'string'},{n:'strSport',t:'string'}] },
    { name: 'teams', endpoint: '/search_all_teams.php?l=English%20Premier%20League', fields: [{n:'idTeam',t:'string',pk:true},{n:'strTeam',t:'string'},{n:'strStadium',t:'string'}] }
  ]},
  { id: 'nba-api', name: 'NBA API', baseUrl: 'https://www.balldontlie.io/api/v1', tables: [
    { name: 'players', endpoint: '/players?per_page=20', fields: [{n:'id',t:'number',pk:true},{n:'first_name',t:'string'},{n:'last_name',t:'string'},{n:'position',t:'string'},{n:'team',t:'json'}] },
    { name: 'teams', endpoint: '/teams', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'conference',t:'string'},{n:'division',t:'string'}] }
  ]},
  { id: 'football-data', name: 'Football Data', baseUrl: 'https://api.football-data.org/v4', tables: [
    { name: 'competitions', endpoint: '/competitions', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'code',t:'string'},{n:'area',t:'json'}] }
  ]},

  // ── Misc Data ──
  { id: 'httpbin3', name: 'HTTPBin v3', baseUrl: 'https://postman-echo.com', tables: [
    { name: 'get', endpoint: '/get?foo=bar', fields: [{n:'args',t:'json',pk:true},{n:'headers',t:'json'},{n:'url',t:'string'}] }
  ]},
  { id: 'beeceptor', name: 'Beeceptor Sample', baseUrl: 'https://jsonplaceholder.beeceptor.com', tables: [
    { name: 'posts', endpoint: '/posts', fields: [{n:'id',t:'number',pk:true},{n:'title',t:'string'},{n:'body',t:'string'}] }
  ]},
  { id: 'mockapi', name: 'MockAPI', baseUrl: 'https://64a7f3a2dca581467b5548ab.mockapi.io', tables: [
    { name: 'users', endpoint: '/users', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'email',t:'string'},{n:'avatar',t:'string'}] }
  ]},
  { id: 'jsonserve', name: 'JSONServe', baseUrl: 'https://jsonserve.com', tables: [
    { name: 'data', endpoint: '/api/demo', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'}] }
  ]},

  // ── More Fun ──
  { id: 'geekjokes', name: 'Geek Jokes', baseUrl: 'https://geek-jokes.sameerkumar.website', tables: [
    { name: 'jokes', endpoint: '/api?format=json', fields: [{n:'joke',t:'string',pk:true}] }
  ]},
  { id: 'corporatebs', name: 'Corporate BS', baseUrl: 'https://corporatebs-generator.sameerkumar.website', tables: [
    { name: 'phrases', endpoint: '/', fields: [{n:'phrase',t:'string',pk:true}] }
  ]},
  { id: 'forismatic', name: 'Forismatic Quotes', baseUrl: 'https://api.forismatic.com/api/1.0', tables: [
    { name: 'quotes', endpoint: '/?method=getQuote&format=json&lang=en', fields: [{n:'quoteText',t:'string',pk:true},{n:'quoteAuthor',t:'string'}] }
  ]},
  { id: 'stoic', name: 'Stoic Quotes', baseUrl: 'https://stoic-quotes.com/api', tables: [
    { name: 'quotes', endpoint: '/quote', fields: [{n:'text',t:'string',pk:true},{n:'author',t:'string'}] }
  ]},
  { id: 'zenquotes', name: 'Zen Quotes', baseUrl: 'https://zenquotes.io/api', tables: [
    { name: 'quotes', endpoint: '/random', fields: [{n:'q',t:'string',pk:true},{n:'a',t:'string'}] }
  ]},
  { id: 'kanye', name: 'Kanye Rest', baseUrl: 'https://api.kanye.rest', tables: [
    { name: 'quotes', endpoint: '/', fields: [{n:'quote',t:'string',pk:true}] }
  ]},
  { id: 'trump', name: 'Trump Quotes', baseUrl: 'https://api.whatdoestrumpthink.com/api/v1', tables: [
    { name: 'quotes', endpoint: '/quotes/random', fields: [{n:'message',t:'string',pk:true},{n:'nlp_version',t:'string'}] }
  ]},
  { id: 'ronswanson', name: 'Ron Swanson Quotes', baseUrl: 'https://ron-swanson-quotes.herokuapp.com/v2', tables: [
    { name: 'quotes', endpoint: '/quotes', fields: [{n:'quote',t:'string',pk:true}] }
  ]},
  { id: 'fizzbuzz', name: 'FizzBuzz API', baseUrl: 'https://fizzbuzz-api.com', tables: [
    { name: 'fizzbuzz', endpoint: '/fizzbuzz?limit=20', fields: [{n:'number',t:'number',pk:true},{n:'result',t:'string'}] }
  ]},
  { id: 'bacon', name: 'Bacon Ipsum', baseUrl: 'https://baconipsum.com/api', tables: [
    { name: 'meat', endpoint: '/?type=all-meat&paras=2', fields: [{n:'text',t:'string',pk:true}] }
  ]},
  { id: 'lorem', name: 'Lorem Ipsum', baseUrl: 'https://loripsum.net/api', tables: [
    { name: 'text', endpoint: '/1/plaintext', fields: [{n:'text',t:'string',pk:true}] }
  ]},
  { id: 'shibe', name: 'Shibe Online', baseUrl: 'https://shibe.online/api', tables: [
    { name: 'shibes', endpoint: '/shibes?count=10', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'placekitten', name: 'PlaceKitten', baseUrl: 'https://placekitten.com', tables: [
    { name: 'images', endpoint: '/200/300', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'placedog', name: 'PlaceDog', baseUrl: 'https://place.dog', tables: [
    { name: 'images', endpoint: '/300/200', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'placebear', name: 'PlaceBear', baseUrl: 'https://placebear.com', tables: [
    { name: 'images', endpoint: '/400/300', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'fillmurray', name: 'Fill Murray', baseUrl: 'https://www.fillmurray.com', tables: [
    { name: 'images', endpoint: '/200/300', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'stevensegallery', name: 'Steven Se Gallery', baseUrl: 'https://stevensegallery.com', tables: [
    { name: 'images', endpoint: '/200/300', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'placebeard', name: 'PlaceBeard', baseUrl: 'https://placebeard.it', tables: [
    { name: 'images', endpoint: '/300x200', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'nicenicejpg', name: 'NiceNiceJPG', baseUrl: 'https://nice-nice-jpg.com', tables: [
    { name: 'images', endpoint: '/200/300', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'placepuppy', name: 'PlacePuppy', baseUrl: 'https://place-puppy.com', tables: [
    { name: 'images', endpoint: '/300x200', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'placecorgi', name: 'PlaceCorgi', baseUrl: 'https://placecorgi.com', tables: [
    { name: 'images', endpoint: '/300/200', fields: [{n:'url',t:'string',pk:true}] }
  ]},
  { id: 'placebeyonce', name: 'PlaceBeyonce', baseUrl: 'https://placebeyonce.com', tables: [
    { name: 'images', endpoint: '/300/200', fields: [{n:'url',t:'string',pk:true}] }
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
