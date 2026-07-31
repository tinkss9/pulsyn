#!/usr/bin/env node
// Pulsyn MongoDB → Supabase CDC Replication Demo

const { MongoClient } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');

// Source: Local Docker MongoDB
const mongoUrl = 'mongodb://test:test@localhost:27017/demo?authSource=admin';

// Target: Supabase
const supabaseUrl = 'https://cdcqmktplmliqhbcevdq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkY3Fta3RwbG1saXFoYmNldmRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDk2MTcwMiwiZXhwIjoyMTAwNTM3NzAyfQ.8kY7qRIHgbJtuP9emvrRt5d11VHbWvZj5OUbZ14vPhc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function replicate() {
  console.log('🔗 Connecting to source (local MongoDB)...');
  const mongoClient = new MongoClient(mongoUrl);
  await mongoClient.connect();
  const db = mongoClient.db('demo');
  console.log('✅ Connected to MongoDB\n');

  // Get all orders (simulating change stream)
  const orders = await db.collection('orders').find({}).toArray();
  console.log(`📋 Found ${orders.length} orders to replicate\n`);

  if (orders.length === 0) {
    console.log('No orders to replicate.');
    await mongoClient.close();
    return;
  }

  // Clear target
  await supabase.from('target_users').delete().neq('id', 0);

  let replicated = 0;
  let errors = 0;

  for (const order of orders) {
    console.log(`─── Order: ${order.customer} ───`);
    console.log(`   Product: ${order.product}`);
    console.log(`   Quantity: ${order.quantity}, Total: $${order.total}`);
    console.log(`   Status: ${order.status}`);

    try {
      // Use hash of ObjectId for ID (fits in integer range)
      const idHash = order._id.toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100000 + 1000;
      
      const { error } = await supabase
        .from('target_users')
        .upsert({
          id: idHash,
          name: order.customer,
          email: `${order.customer.toLowerCase().replace(/\s+/g, '.')}@orders.demo`,
          created_at: order._id.getTimestamp().toISOString(),
        });

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errors++;
      } else {
        console.log(`   ✅ Replicated to Supabase`);
        replicated++;
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      errors++;
    }

    console.log('');
  }

  console.log('═══════════════════════════════════════════');
  console.log(`📊 MongoDB → Supabase Replication Summary`);
  console.log(`   Source: MongoDB (localhost:27017/demo)`);
  console.log(`   Target: Supabase (cdcqmktplmliqhbcevdq)`);
  console.log(`   Processed: ${orders.length} documents`);
  console.log(`   Replicated: ${replicated}`);
  console.log(`   Errors: ${errors}`);
  console.log('═══════════════════════════════════════════');

  await mongoClient.close();
}

replicate().catch(console.error);
