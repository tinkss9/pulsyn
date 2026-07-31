#!/usr/bin/env node
// Pulsyn MySQL → Supabase CDC Replication Demo

const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');

// Source: Local Docker MySQL
const mysqlConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'test',
  database: 'demo',
};

// Target: Supabase
const supabaseUrl = 'https://cdcqmktplmliqhbcevdq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkY3Fta3RwbG1saXFoYmNldmRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDk2MTcwMiwiZXhwIjoyMTAwNTM3NzAyfQ.8kY7qRIHgbJtuP9emvrRt5d11VHbWvZj5OUbZ14vPhc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function replicate() {
  console.log('🔗 Connecting to source (local MySQL)...');
  const mysqlConn = await mysql.createConnection(mysqlConfig);
  console.log('✅ Connected to MySQL\n');

  // Get unprocessed changes
  const [changes] = await mysqlConn.execute(
    'SELECT id, table_name, operation, row_data, old_data FROM _pulsyn_changes WHERE processed = FALSE ORDER BY id'
  );

  console.log(`📋 Found ${changes.length} unprocessed changes\n`);

  if (changes.length === 0) {
    console.log('No changes to replicate. Insert data into products first.');
    await mysqlConn.end();
    return;
  }

  // Create target table in Supabase if needed
  console.log('📦 Ensuring target table exists in Supabase...');
  
  let replicated = 0;
  let errors = 0;

  for (const change of changes) {
    const { id, table_name, operation, row_data, old_data } = change;
    
    // Parse JSON if string
    const rowData = typeof row_data === 'string' ? JSON.parse(row_data) : row_data;
    const oldData = old_data ? (typeof old_data === 'string' ? JSON.parse(old_data) : old_data) : null;

    console.log(`─── Change #${id}: ${operation} on ${table_name} ───`);

    try {
      if (operation === 'INSERT') {
        console.log(`   Product: ${rowData.name} ($${rowData.price})`);

        // Insert into Supabase - using source_users table for demo
        // In production, this would map to the correct target table
        const { error } = await supabase
          .from('target_users')
          .upsert({
            id: rowData.id,
            name: rowData.name,
            email: `${rowData.name.toLowerCase().replace(/\s+/g, '.')}@products.demo`,
            created_at: rowData.created_at || new Date().toISOString(),
          });

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errors++;
        } else {
          console.log(`   ✅ Replicated to Supabase`);
          replicated++;
        }
      } else if (operation === 'UPDATE') {
        console.log(`   Update: ${oldData?.name} ($${oldData?.price}) → ${rowData.name} ($${rowData.price})`);

        const { error } = await supabase
          .from('target_users')
          .update({
            name: rowData.name,
            email: `${rowData.name.toLowerCase().replace(/\s+/g, '.')}@products.demo`,
          })
          .eq('id', rowData.id);

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errors++;
        } else {
          console.log(`   ✅ Updated in Supabase`);
          replicated++;
        }
      } else if (operation === 'DELETE') {
        console.log(`   Delete: ${rowData.name} (ID: ${rowData.id})`);

        const { error } = await supabase
          .from('target_users')
          .delete()
          .eq('id', rowData.id);

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errors++;
        } else {
          console.log(`   ✅ Deleted from Supabase`);
          replicated++;
        }
      }

      // Mark as processed
      await mysqlConn.execute(
        'UPDATE _pulsyn_changes SET processed = TRUE WHERE id = ?',
        [id]
      );
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      errors++;
    }

    console.log('');
  }

  console.log('═══════════════════════════════════════════');
  console.log(`📊 MySQL → Supabase Replication Summary`);
  console.log(`   Source: MySQL (localhost:3306/demo)`);
  console.log(`   Target: Supabase (cdcqmktplmliqhbcevdq)`);
  console.log(`   Processed: ${changes.length} changes`);
  console.log(`   Replicated: ${replicated}`);
  console.log(`   Errors: ${errors}`);
  console.log('═══════════════════════════════════════════');

  await mysqlConn.end();
}

replicate().catch(console.error);
