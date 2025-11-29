#!/bin/bash

# Run Remix dev server and filter out Chrome DevTools errors
remix vite:dev --port 3000 2>&1 | grep --line-buffered -v "\.well-known/appspecific/com\.chrome" | grep --line-buffered -v "No routes matched location"
