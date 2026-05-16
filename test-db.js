const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Connecting to MySQL...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'MySQL@100'
    });
    
    console.log('Connection successful!');
    
    const [rows] = await connection.query('SHOW DATABASES;');
    console.log('Databases available:');
    console.log(rows.map(r => r.Database));

    await connection.end();
  } catch (err) {
    console.error('Error connecting to MySQL:', err.message);
  }
}

testConnection();
