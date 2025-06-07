import axios from 'axios';
import * as cheerio from 'cheerio';
import { Film, ScrapingResult } from './types';

// Simple delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class SimpleFilmScraper {
  private async fetchPage(url: string): Promise<string> {
    try {
      console.log(`Fetching: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'WikipediaFilmScraper/1.0 (Educational; Contact: your-email@example.com)'
        },
        timeout: 10000
      });
      
      await delay(1000); // Be respectful - 1 second delay
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      throw error;
    }
  }

  async scrapeAmericanFilms2023(): Promise<Film[]> {
    const url = 'https://en.wikipedia.org/wiki/List_of_American_films_of_2023';
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    const films: Film[] = [];

    // Look for film tables
    $('table.wikitable').each((_, table) => {
      $(table).find('tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          const titleCell = cells.eq(0);
          const titleLink = titleCell.find('a').first();
          const title = titleLink.text().trim() || titleCell.text().trim();
          
          if (title && title.length > 2) {
            const film: Film = {
              title: title.replace(/[^\w\s]/gi, '').trim(),
              year: 2023,
              country: 'United States',
              wikipedia_url: titleLink.attr('href') ? 
                `https://en.wikipedia.org${titleLink.attr('href')}` : undefined
            };

            // Try to extract other info from remaining cells
            if (cells.length > 1) {
              const secondCell = cells.eq(1).text().trim();
              // Simple heuristic: if it contains common director indicators
              if (secondCell && secondCell.length < 100) {
                film.director = secondCell;
              }
            }

            films.push(film);
          }
        }
      });
    });

    console.log(`Found ${films.length} films from 2023 American films list`);
    return films;
  }

  async scrapeAmericanFilms2022(): Promise<Film[]> {
    const url = 'https://en.wikipedia.org/wiki/List_of_American_films_of_2022';
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    const films: Film[] = [];

    $('table.wikitable').each((_, table) => {
      $(table).find('tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          const titleCell = cells.eq(0);
          const titleLink = titleCell.find('a').first();
          const title = titleLink.text().trim() || titleCell.text().trim();
          
          if (title && title.length > 2) {
            films.push({
              title: title.replace(/[^\w\s]/gi, '').trim(),
              year: 2022,
              country: 'United States',
              wikipedia_url: titleLink.attr('href') ? 
                `https://en.wikipedia.org${titleLink.attr('href')}` : undefined
            });
          }
        }
      });
    });

    console.log(`Found ${films.length} films from 2022 American films list`);
    return films;
  }

  async scrapeBritishFilms(): Promise<Film[]> {
    const url = 'https://en.wikipedia.org/wiki/List_of_British_films_of_2023';
    const films: Film[] = [];
    
    try {
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);

      $('table.wikitable').each((_, table) => {
        $(table).find('tr').each((_, row) => {
          const cells = $(row).find('td');
          if (cells.length >= 1) {
            const titleCell = cells.eq(0);
            const titleLink = titleCell.find('a').first();
            const title = titleLink.text().trim() || titleCell.text().trim();
            
            if (title && title.length > 2) {
              films.push({
                title: title.replace(/[^\w\s]/gi, '').trim(),
                year: 2023,
                country: 'United Kingdom',
                wikipedia_url: titleLink.attr('href') ? 
                  `https://en.wikipedia.org${titleLink.attr('href')}` : undefined
              });
            }
          }
        });
      });
    } catch (error) {
      console.log('Could not scrape British films, skipping...');
    }

    console.log(`Found ${films.length} British films`);
    return films;
  }

  // Main scraping method - gets a few hundred films from multiple sources
  async scrapeFilms(): Promise<ScrapingResult> {
    const allFilms: Film[] = [];
    const errors: string[] = [];

    try {
      // Scrape from multiple sources to get ~500 films
      console.log('🎬 Starting film scraping...');
      
      // American films 2023
      try {
        const films2023 = await this.scrapeAmericanFilms2023();
        allFilms.push(...films2023);
      } catch (error) {
        errors.push('Failed to scrape American films 2023');
        console.error('Error scraping 2023 films:', error);
      }

      // American films 2022
      try {
        const films2022 = await this.scrapeAmericanFilms2022();
        allFilms.push(...films2022);
      } catch (error) {
        errors.push('Failed to scrape American films 2022');
        console.error('Error scraping 2022 films:', error);
      }

      // British films 2023
      try {
        const britishFilms = await this.scrapeBritishFilms();
        allFilms.push(...britishFilms);
      } catch (error) {
        errors.push('Failed to scrape British films 2023');
        console.error('Error scraping British films:', error);
      }

      // Remove duplicates based on title + year
      const uniqueFilms = allFilms.filter((film, index, self) => 
        index === self.findIndex(f => f.title === film.title && f.year === film.year)
      );

      console.log(`✅ Scraping completed: ${uniqueFilms.length} unique films found`);
      
      return {
        success: true,
        films: uniqueFilms,
        errors,
        total_scraped: uniqueFilms.length
      };
      
    } catch (error) {
      console.error('Scraping failed:', error);
      return {
        success: false,
        films: allFilms,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
        total_scraped: allFilms.length
      };
    }
  }
}
