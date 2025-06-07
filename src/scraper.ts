import 'dotenv/config';
import { SimpleFilmScraper } from './scraper_logic';
import { connectDB, saveFilms, getFilmCount } from './database';

async function main() {
  try {
    console.log('[scraper] Starting Wikipedia Film Scraper...');
    
    await connectDB();
    
    const currentCount = await getFilmCount();
    console.log(`[scraper] Current films in database: ${currentCount}`);
    
    const scraper = new SimpleFilmScraper();
    const result = await scraper.scrapeFilms();
    
    if (result.success && result.films.length > 0) {
      console.log(`[scraper] Saving ${result.films.length} films...`);
      const saved = await saveFilms(result.films);
      console.log(`[scraper] ✅ Saved ${saved} films to database`);
    }
    
  } catch (error) {
    console.error('[scraper] ❌ Failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
