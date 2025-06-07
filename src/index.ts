import 'dotenv/config';
import { SimpleFilmScraper } from './scraper';
import { connectDB, saveFilms, getFilmCount } from './database';

async function main() {
  try {
    console.log('🚀 Starting Wikipedia Film Scraper MVP');
    
    // Connect to database
    await connectDB();
    
    // Check current count
    const currentCount = await getFilmCount();
    console.log(`📊 Current films in database: ${currentCount}`);
    
    // If we already have films, just show the count
    if (currentCount > 0) {
      console.log('✅ Database already has films. Run the scraper script to add more.');
      return;
    }
    
    // Initialize scraper
    const scraper = new SimpleFilmScraper();
    
    // Scrape films
    console.log('🎬 Starting scraping process...');
    const result = await scraper.scrapeFilms();
    
    if (result.success && result.films.length > 0) {
      console.log(`💾 Saving ${result.films.length} films to database...`);
      const saved = await saveFilms(result.films);
      console.log(`✅ Successfully saved ${saved} films to database`);
      
      // Show some stats
      const finalCount = await getFilmCount();
      console.log(`📊 Total films in database: ${finalCount}`);
      
      // Show sample of what we scraped
      console.log('\n🎭 Sample films:');
      result.films.slice(0, 5).forEach((film, i) => {
        console.log(`${i + 1}. ${film.title} (${film.year}) - ${film.country}`);
      });
      
    } else {
      console.error('❌ Scraping failed or no films found');
      if (result.errors.length > 0) {
        console.error('Errors:', result.errors);
      }
    }
    
  } catch (error) {
    console.error('💥 Application failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };
