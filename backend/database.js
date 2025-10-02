const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
  constructor(dbPath = './symposic.db') {
    this.dbPath = dbPath;
    this.db = new sqlite3.Database(dbPath);
  }

  // Run all migration files in order
  runMigrations() {
    const migrationsDir = path.join(__dirname, 'db', 'migrations');
    
    console.log('Running database migrations...');
    
    // Read migration files
    try {
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      migrationFiles.forEach(file => {
        const migrationPath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log(`Running migration: ${file}`);
        
        // Split SQL into individual statements (simple approach)
        const statements = migrationSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        statements.forEach(statement => {
          if (statement.trim()) {
            this.db.exec(statement, (err) => {
              if (err) {
                console.error(`Error running statement: ${statement}`);
                console.error(err);
              } else {
                console.log(`✓ Executed: ${statement.substring(0, 50)}...`);
              }
            });
          }
        });
      });
      
      console.log('✓ Database migrations completed');
    } catch (error) {
      console.error('Error reading migration files:', error);
    }
  }

  // Close database connection
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = Database;

