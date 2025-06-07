#!/bin/bash

echo "[start.sh] Scraping all job listings...."
node -r tsx/cjs src.scraper

echo "[start.sh] Grabbing descriptions from URLs....."  
node -r tsx/cjs src.description_grabber
