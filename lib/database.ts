import { Pool } from 'pg';

export type Congratulation = {
  id: number;
  name: string;
  message: string;
  created_at: Date;
};

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export async function getCongratulations(): Promise<Congratulation[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM congratulations ORDER BY created_at DESC');
    return result.rows;
  } finally {
    client.release();
  }
}

export async function addCongratulation(name: string, message: string): Promise<Congratulation | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO congratulations (name, message) VALUES ($1, $2) RETURNING *',
      [name, message]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}
