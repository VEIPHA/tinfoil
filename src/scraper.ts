import 'dotenv/config';
import { SimpleFilmScraper } from './scraper_logic';
import { connectDB, saveFilms, getFilmCount } from './database';

async function main() {
  try {
    console.log('[scraper] Starting Wikipedia Film Scraper...');
    
    // Connect to database
    await connectDB();
    
    // Check current count
    const currentCount = await getFilmCount();
    console.log(`[scraper] Current films in database: ${currentCount}`);
    
    // Initialize scraper
    const scraper = new SimpleFilmScraper();
    
    // Scrape films
    console.log('[scraper] Starting scraping process...');
    const result = await scraper.scrapeFilms();
    
    if (result.success && result.films.length > 0) {
      console.log(`[scraper] Saving ${result.films.length} films to database...`);
      const saved = await saveFilms(result.films);
      console.log(`[scraper] Successfully saved ${saved} films to database`);
      
      // Show some stats
      const finalCount = await getFilmCount();
      console.log(`[scraper] Total films in database: ${finalCount}`);
      
    } else {
      console.error('[scraper] Scraping failed or no films found');
      if (result.errors.length > 0) {
        console.error('[scraper] Errors:', result.errors);
      }
    }
    
  } catch (error) {
    console.error('[scraper] Application failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
