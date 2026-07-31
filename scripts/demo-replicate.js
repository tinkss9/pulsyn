#!/usr/bin/env node
// Pulsyn CDC Replication Demo
// Reads changes from local PostgreSQL, applies to Supabase

const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Source: Local Docker PostgreSQL
const sourceClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'testdb',
  user: 'test',
  password: 'test',
});

// Target: Supabase
const supabaseUrl = 'https://cdcqmktplmliqhbcevdq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkY3Fta3RwbG1saXFoYmNldmRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDk2MTcwMiwiZXhwIjoyMTAwNTM3NzAyfQ.8kY7qRIHgbJtuP9emvrRt5d11VHbWvZj5OUbZ14vPhc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function replicate() {
  console.log('🔗 Connecting to source (local PostgreSQL)...');
  await sourceClient.connect();
  console.log('✅ Connected to source\n');

  // Get unprocessed changes
  const changesResult = await sourceClient.query(
    'SELECT id, table_name, operation, row_data, old_data FROM _pulsyn_changes WHERE processed = FALSE ORDER BY id'
  );

  const changes = changesResult.rows;
  console.log(`📋 Found ${changes.length} unprocessed changes\n`);

  if (changes.length === 0) {
    console.log('No changes to replicate. Insert data into demo_customers first.');
    await sourceClient.end();
    return;
  }

  let replicated = 0;
  let errors = 0;

  for (const change of changes) {
    const { id, table_name, operation, row_data, old_data } = change;
    console.log(`─── Change #${id}: ${operation} on ${table_name} ───`);

    try {
      if (operation === 'INSERT') {
        console.log(`   Data: ${JSON.stringify(row_data)}`);

        // Insert into Supabase target table
        const { error } = await supabase
          .from('target_users')
          .upsert({
            id: row_data.id,
            name: row_data.name,
            email: row_data.email,
            created_at: row_data.created_at,
          });

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errors++;
        } else {
          console.log(`   ✅ Replicated to Supabase target_users`);
          replicated++;
        }
      } else if (operation === 'UPDATE') {
        console.log(`   Old: ${JSON.stringify(old_data)}`);
        console.log(`   New: ${JSON.stringify(row_data)}`);

        const { error } = await supabase
          .from('target_users')
          .update({
            name: row_data.name,
            email: row_data.email,
          })
          .eq('id', row_data.id);

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errors++;
        } else {
          console.log(`   ✅ Updated in Supabase`);
          replicated++;
        }
      } else if (operation === 'DELETE') {
        console.log(`   Deleting ID: ${row_data.id}`);

        const { error } = await supabase
          .from('target_users')
          .delete()
          .eq('id', row_data.id);

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errors++;
        } else {
          console.log(`   ✅ Deleted from Supabase`);
          replicated++;
        }
      }

      // Mark as processed
      await sourceClient.query(
        'UPDATE _pulsyn_changes SET processed = TRUE WHERE id = $1',
        [id]
      );
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      errors++;
    }

    console.log('');
  }

  console.log('═══════════════════════════════════════════');
  console.log(`📊 Replication Summary`);
  console.log(`   Processed: ${changes.length} changes`);
  console.log(`   Replicated: ${replicated}`);
  console.log(`   Errors: ${errors}`);
  console.log('═══════════════════════════════════════════');

  await sourceClient.end();
}

replicate().catch(console.error);
