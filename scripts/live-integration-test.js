// Live Integration Test — All Docker Services
const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const redis = require('redis');

const results = [];

async function testPostgreSQL() {
  const start = Date.now();
  try {
    const pool = new Pool({ host: 'localhost', port: 5432, database: 'pulsyn_test', user: 'pulsyn', password: 'pulsyn_test_2026' });
    const client = await pool.connect();
    await client.query('CREATE TABLE IF NOT EXISTS test_users (id SERIAL PRIMARY KEY, name TEXT, email TEXT)');
    await client.query("INSERT INTO test_users (name, email) VALUES ('test', 'test@example.com')");
    const res = await client.query('SELECT * FROM test_users');
    await client.query('DROP TABLE test_users');
    client.release();
    await pool.end();
    results.push({ connector: 'postgresql', status: 'PASS', level: 'INTEGRATION_VALIDATED', duration: Date.now() - start, details: `${res.rows.length} rows` });
  } catch (err) {
    results.push({ connector: 'postgresql', status: 'FAIL', level: 'CONTRACT', duration: Date.now() - start, error: err.message.substring(0, 100) });
  }
}

async function testMySQL() {
  const start = Date.now();
  try {
    const conn = await mysql.createConnection({ host: 'localhost', port: 3306, database: 'pulsyn_test', user: 'pulsyn', password: 'pulsyn_test_2026' });
    await conn.execute('CREATE TABLE IF NOT EXISTS test_users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255))');
    await conn.execute("INSERT INTO test_users (name, email) VALUES ('test', 'test@example.com')");
    const [rows] = await conn.execute('SELECT * FROM test_users');
    await conn.execute('DROP TABLE test_users');
    await conn.end();
    results.push({ connector: 'mysql', status: 'PASS', level: 'INTEGRATION_VALIDATED', duration: Date.now() - start, details: `${rows.length} rows` });
  } catch (err) {
    results.push({ connector: 'mysql', status: 'FAIL', level: 'CONTRACT', duration: Date.now() - start, error: err.message.substring(0, 100) });
  }
}

async function testMongoDB() {
  const start = Date.now();
  try {
    const client = new MongoClient('mongodb://pulsyn:pulsyn_test_2026@localhost:27017');
    await client.connect();
    const db = client.db('pulsyn_test');
    const coll = db.collection('test_users');
    await coll.insertOne({ name: 'test', email: 'test@example.com' });
    const docs = await coll.find().toArray();
    await coll.drop();
    await client.close();
    results.push({ connector: 'mongodb', status: 'PASS', level: 'INTEGRATION_VALIDATED', duration: Date.now() - start, details: `${docs.length} docs` });
  } catch (err) {
    results.push({ connector: 'mongodb', status: 'FAIL', level: 'CONTRACT', duration: Date.now() - start, error: err.message.substring(0, 100) });
  }
}

async function testRedis() {
  const start = Date.now();
  try {
    const client = redis.createClient({ url: 'redis://localhost:6379' });
    await client.connect();
    await client.set('test_key', 'test_value');
    const val = await client.get('test_key');
    await client.del('test_key');
    await client.quit();
    results.push({ connector: 'redis', status: 'PASS', level: 'INTEGRATION_VALIDATED', duration: Date.now() - start, details: `value: ${val}` });
  } catch (err) {
    results.push({ connector: 'redis', status: 'FAIL', level: 'CONTRACT', duration: Date.now() - start, error: err.message.substring(0, 100) });
  }
}

async function testMSSQL() {
  const start = Date.now();
  try {
    const mssql = require('mssql');
    const pool = await mssql.connect({ server: 'localhost', port: 1433, database: 'master', user: 'sa', password: 'Pulsyn_test_2026', options: { encrypt: false, trustServerCertificate: true } });
    const result = await pool.request().query('SELECT 1 as test');
    await pool.close();
    results.push({ connector: 'mssql', status: 'PASS', level: 'INTEGRATION_VALIDATED', duration: Date.now() - start, details: `query ok` });
  } catch (err) {
    results.push({ connector: 'mssql', status: 'FAIL', level: 'CONTRACT', duration: Date.now() - start, error: err.message.substring(0, 100) });
  }
}

async function testSupabase() {
  const start = Date.now();
  try {
    const pool = new Pool({ host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, database: 'postgres', user: 'postgres.cdcqmktplmliqhbcevdq', password: 'Pulsyn2026Secure!', ssl: { rejectUnauthorized: false } });
    const client = await pool.connect();
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    client.release();
    await pool.end();
    results.push({ connector: 'supabase', status: 'PASS', level: 'INTEGRATION_VALIDATED', duration: Date.now() - start, details: `${tables.rows.length} tables` });
  } catch (err) {
    results.push({ connector: 'supabase', status: 'FAIL', level: 'CONTRACT', duration: Date.now() - start, error: err.message.substring(0, 100) });
  }
}

async function main() {
  console.log('=== PULSYN LIVE INTEGRATION TESTS ===\n');
  console.log('Services: PostgreSQL, MySQL, MongoDB, Redis, MSSQL, Supabase\n');

  await Promise.all([
    testPostgreSQL(),
    testMySQL(),
    testMongoDB(),
    testRedis(),
    testMSSQL(),
    testSupabase()
  ]);

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log('=== RESULTS ===\n');
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.connector.padEnd(15)} ${r.level.padEnd(25)} ${r.duration}ms ${r.details || r.error || ''}`);
  });

  console.log(`\n✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`📊 TOTAL: ${results.length}`);
}

main().catch(console.error);
