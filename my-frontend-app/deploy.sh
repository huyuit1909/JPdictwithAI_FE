#!/bin/bash

echo "Building React app for production..."
npm run build

echo "Deploying to Google Cloud App Engine..."
gcloud app deploy --quiet

echo "Deployment completed!"
echo "Your app should be available at: https://[PROJECT-ID].appspot.com" 