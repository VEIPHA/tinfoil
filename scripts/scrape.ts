#!/usr/bin/env tsx

import 'dotenv/config';
import { SimpleFilmScraper } from '../src/scraper';
import { connectDB, saveFilms, getFilmCount, getFilms } from '../src/database';

async function runScraping() {
  try {
    console.log('🎬 Wikipedia Film Scraper - Manual Run');
    console.log('=====================================');
    
    // Connect to database
    await connectDB();
    
    // Show current stats
    const currentCount = await getFilmCount();
    console.log(`📊 Current films in database: ${currentCount}`);
    
    // Initialize scraper
    const scraper = new SimpleFilmScraper();
    
    // Run scraping
    console.log('\n🔍 Starting scraping...');
    const result = await scraper.scrapeFilms();
    
    if (result.success) {
      console.log(`\n✅ Scraping completed successfully!`);
      console.log(`📦 Found ${result.films.length} films`);
      
      if (result.films.length > 0) {
        console.log(`💾 Saving to database...`);
        const saved = await saveFilms(result.films);
        console.log(`✅ Saved ${saved} new films`);
        
        const newCount = await getFilmCount();
        console.log(`📊 Total films now: ${newCount}`);
      }
      
      // Show errors if any
      if (result.errors.length > 0) {
        console.log(`\n⚠️  ${result.errors.length} errors occurred:`);
        result.errors.forEach(error => console.log(`  - ${error}`));
      }
      
      // Show sample of recent films
      console.log('\n🎭 Recent films in database:');
      const recentFilms = await getFilms(10);
      recentFilms.forEach((film, i) => {
        console.log(`${i + 1}. ${film.title} (${film.year || 'Unknown'}) - ${film.country}`);
        if (film.director) console.log(`   Director: ${film.director}`);
      });
      
    } else {
      console.error('\n❌ Scraping failed');
      console.error('Errors:', result.errors);
    }
    
  } catch (error) {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }
}

// Run the script
runScraping().catch(console.error);
