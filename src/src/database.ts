import { Pool } from 'pg';
import { Film } from './types';

// Simple database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function connectDB() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function saveFilm(film: Film): Promise<void> {
  const query = `
    INSERT INTO raw_films (title, year, country, director, cast_members, genre, release_date, wikipedia_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  
  const values = [
    film.title,
    film.year,
    film.country,
    film.director,
    film.cast_members ? JSON.stringify(film.cast_members) : null,
    film.genre,
    film.release_date,
    film.wikipedia_url
  ];

  await pool.query(query, values);
}

export async function saveFilms(films: Film[]): Promise<number> {
  let saved = 0;
  
  for (const film of films) {
    try {
      await saveFilm(film);
      saved++;
    } catch (error) {
      console.error(`Failed to save: ${film.title}`, error);
    }
  }
  
  return saved;
}

export async function getFilmCount(): Promise<number> {
  const result = await pool.query('SELECT COUNT(*) FROM raw_films');
  return parseInt(result.rows[0].count);
}

export async function getFilms(limit = 10): Promise<Film[]> {
  const query = `
    SELECT title, year, country, director, cast_members, genre, release_date, wikipedia_url
    FROM raw_films 
    ORDER BY scraped_at DESC 
    LIMIT $1
  `;
  
  const result = await pool.query(query, [limit]);
  
  return result.rows.map(row => ({
    ...row,
    cast_members: row.cast_members ? JSON.parse(row.cast_members) : null
  }));
}
