require('dotenv').config({path: '../../.env'});
const sql = require('mssql');
const config = {server:'localhost',port:1433,database:'master',user:'sa',password:'Test@12345',options:{encrypt:false,trustServerCertificate:true}};
(async () => {
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  const pks = await pool.request().input('schema', sql.NVarChar, 'dbo').input('table', sql.NVarChar, 'users').query(`SELECT col.COLUMN_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE col ON tc.CONSTRAINT_NAME = col.CONSTRAINT_NAME WHERE tc.TABLE_SCHEMA = @schema AND tc.TABLE_NAME = @table AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'`);
  console.log('PKs:', JSON.stringify(pks.recordset));
  const pk = pks.recordset[0]?.COLUMN_NAME || 'id';
  console.log('Using PK:', pk);
  const result = await pool.request().input('batchSize', sql.Int, 10000).query(`SELECT TOP (10) * FROM [dbo].[users] ORDER BY [${pk}]`);
  console.log('Rows:', result.recordset.length);
  console.log('First row:', JSON.stringify(result.recordset[0]));
  await pool.close();
})().catch(e => console.error('Error:', e.message));
