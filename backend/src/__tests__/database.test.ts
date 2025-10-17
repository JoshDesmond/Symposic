import { db, getAllUsers, closeDatabase } from '../database';

describe('Database Connection Tests', () => {
  afterAll(async () => {
    await closeDatabase();
  });

  test('should connect to database', async () => {
    const connectionTest = await db.connect();
    expect(connectionTest).toBeDefined();
    connectionTest.done();
  });

  test('should execute simple query', async () => {
    const result = await db.one('SELECT 1 as test');
    expect(result.test).toBe(1);
  });

  test('should get PostgreSQL version', async () => {
    const versionResult = await db.one('SELECT version()');
    expect(versionResult.version).toContain('PostgreSQL');
  });

  test('should list all tables', async () => {
    const tables = await db.any(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    expect(Array.isArray(tables)).toBe(true);
  });

  test('should verify expected tables exist', async () => {
    const tables = await db.any(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const expectedTables = ['profiles', 'profile_data', 'otp_codes', 'interviews'];
    const tableNames = tables.map((t: any) => t.table_name);
    
    expectedTables.forEach(tableName => {
      expect(tableNames).toContain(tableName);
    });
  });

  test('should get row counts for each table', async () => {
    const expectedTables = ['profiles', 'profile_data', 'otp_codes', 'interviews'];
    
    for (const table of expectedTables) {
      const count = await db.one(`SELECT COUNT(*) as count FROM ${table}`);
      expect(typeof count.count).toBe('string');
    }
  });

  test('should test getAllUsers function', async () => {
    const users = await getAllUsers();
    expect(Array.isArray(users)).toBe(true);
  });

  test('should support transactions', async () => {
    await db.tx(async t => {
      const txResult = await t.one('SELECT 1 as tx_test');
      expect(txResult.tx_test).toBe(1);
    });
  });

  test('should check connection pool status', async () => {
    const poolStats = await db.query('SELECT count(*) FROM pg_stat_activity WHERE datname = $1', [
      process.env.DB_NAME || 'symposic'
    ]);
    expect(poolStats[0].count).toBeDefined();
  });
});
