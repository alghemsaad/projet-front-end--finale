const mysql = require('mysql2/promise');

async function fixDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'university_events',
  });

  try {
    console.log('Connected to database...');
    
    // Check current column type
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'university_events' 
      AND TABLE_NAME = 'events' 
      AND COLUMN_NAME = 'imageUrl'
    `);
    
    console.log('Current imageUrl column:', columns[0]);
    
    // Alter the column to TEXT type
    await connection.query(`
      ALTER TABLE events MODIFY COLUMN imageUrl TEXT
    `);
    
    console.log('✅ Successfully changed imageUrl column to TEXT type!');
    
    // Verify the change
    const [updatedColumns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'university_events' 
      AND TABLE_NAME = 'events' 
      AND COLUMN_NAME = 'imageUrl'
    `);
    
    console.log('Updated imageUrl column:', updatedColumns[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixDatabase();
