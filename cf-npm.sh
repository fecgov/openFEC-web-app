#!/bin/bash

echo "Installing npm..."
curl -L https://npmjs.com/install.sh | sh
echo "Installing JavaScript dependencies..."
npm install -g browserify
npm install
echo "Building client side JavaScript..."
npm run build
