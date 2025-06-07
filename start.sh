#!/bin/sh

echo "[start.sh] Scraping Wikipedia films and saving to database..."
node -r tsx/cjs src/scraper
