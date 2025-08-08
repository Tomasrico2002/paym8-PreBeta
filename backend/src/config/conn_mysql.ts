import mysql from 'mysql2/promise';



const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'paym8'
};

// Pool de conexiones para mejor rendimiento
export const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const createConnection = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conectado a MySQL correctamente');
        return connection;
    } catch (error) {
        console.error('Error conectando a MySQL:', error);
        throw error;
    }
};