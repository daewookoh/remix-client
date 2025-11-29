#!/bin/bash

# Run Remix dev server and filter out Chrome DevTools errors
remix vite:dev --port 3000 2>&1 | grep -v "\.well-known/appspecific/com\.chrome" | grep -v "No routes matched location"
