import { db, getAllUsers, closeDatabase } from '../database';

async function testDatabaseConnection() {
  console.debug('='.repeat(60));
  console.debug('Starting Database Connection Test');
  console.debug('='.repeat(60));
  
  try {
    // Test 1: Basic connection test
    console.debug('\n[Test 1] Testing basic database connection...');
    const connectionTest = await db.connect();
    console.debug('✓ Successfully connected to database');
    connectionTest.done();
    console.debug('✓ Connection released back to pool');
    
    // Test 2: Simple query test
    console.debug('\n[Test 2] Testing simple query (SELECT 1)...');
    const result = await db.one('SELECT 1 as test');
    console.debug('✓ Query executed successfully');
    console.debug('Query result:', result);
    
    // Test 3: Check database version
    console.debug('\n[Test 3] Checking PostgreSQL version...');
    const versionResult = await db.one('SELECT version()');
    console.debug('✓ PostgreSQL version retrieved:');
    console.debug(versionResult.version);
    
    // Test 4: List all tables in the database
    console.debug('\n[Test 4] Listing all tables in database...');
    const tables = await db.any(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.debug('✓ Tables found:', tables.length);
    tables.forEach((table: any, index: number) => {
      console.debug(`  ${index + 1}. ${table.table_name}`);
    });
    
    // Test 5: Check if expected tables exist
    console.debug('\n[Test 5] Verifying expected tables exist...');
    const expectedTables = ['profiles', 'profile_data', 'otp_codes', 'interviews'];
    const tableNames = tables.map((t: any) => t.table_name);
    
    expectedTables.forEach(tableName => {
      if (tableNames.includes(tableName)) {
        console.debug(`  ✓ Table '${tableName}' exists`);
      } else {
        console.debug(`  ✗ Table '${tableName}' NOT FOUND`);
      }
    });
    
    // Test 6: Get row counts for each table
    console.debug('\n[Test 6] Getting row counts for each table...');
    for (const table of expectedTables) {
      if (tableNames.includes(table)) {
        try {
          const count = await db.one(`SELECT COUNT(*) as count FROM ${table}`);
          console.debug(`  ${table}: ${count.count} rows`);
        } catch (error: any) {
          console.debug(`  ${table}: Error getting count - ${error.message}`);
        }
      }
    }
    
    // Test 7: Test the exported getAllUsers function
    console.debug('\n[Test 7] Testing getAllUsers() function...');
    const users = await getAllUsers();
    console.debug(`✓ getAllUsers() executed successfully`);
    console.debug(`  Found ${users.length} profiles in database`);
    if (users.length > 0) {
      console.debug('  Sample profile (first record):');
      console.debug('  ', JSON.stringify(users[0], null, 2));
    }
    
    // Test 8: Test transaction support
    console.debug('\n[Test 8] Testing transaction support...');
    await db.tx(async t => {
      const txResult = await t.one('SELECT 1 as tx_test');
      console.debug('✓ Transaction executed successfully');
      console.debug('  Transaction result:', txResult);
    });
    
    // Test 9: Check connection pool status
    console.debug('\n[Test 9] Checking connection pool status...');
    const poolStats = await db.query('SELECT count(*) FROM pg_stat_activity WHERE datname = $1', [
      process.env.DB_NAME || 'symposic'
    ]);
    console.debug('✓ Active connections to database:', poolStats[0].count);
    
    // Final summary
    console.debug('\n' + '='.repeat(60));
    console.debug('✓✓✓ ALL TESTS PASSED ✓✓✓');
    console.debug('Database connection is working properly!');
    console.debug('='.repeat(60));
    
  } catch (error: any) {
    console.error('\n' + '='.repeat(60));
    console.error('✗✗✗ TEST FAILED ✗✗✗');
    console.error('='.repeat(60));
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.detail) {
      console.error('Error detail:', error.detail);
    }
    
    console.error('\nFull error object:');
    console.error(error);
    console.error('='.repeat(60));
    
    process.exit(1);
  } finally {
    // Clean up
    console.debug('\n[Cleanup] Closing database connection...');
    await closeDatabase();
    console.debug('✓ Database connection closed');
    console.debug('Test script completed.\n');
  }
}

// Run the test
testDatabaseConnection();
