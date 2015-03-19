#!/bin/bash

# usage:
# ./deploy.sh space-name app-name web-username web-password
# You must be logged into Cloud Foundry
# You must also follow the npm installation instructions here:
# https://github.com/18F/openFEC-web-app#installing
# if you haven't already set this up in your environment

api_url=""
debug=""

if [ "$#" -ne 4 ]; then
  echo "Please pass in the name of the Cloud Foundry app you want,"
  echo "the space it is in, and the HTTP username and password"
  echo "Example: './deploy.sh dev-web fec-web-dev username password'"
  echo "Run 'cf spaces' to see possible spaces."
  echo "Run 'cf apps' to see possible apps within your current space."
  exit 1
fi

if [ $2 = "fec-web-dev" ]; then
  api_url="http://fec-api-dev.cf.18f.us"
  debug="true"
elif [ $2 = "fec-web-stage" ]; then
  api_url="http://fec-api-stage.cf.18f.us"
else
  api_url="prod"
fi

echo "Building JS..."
npm run build

if [ $? -ne 0 ]; then
  echo "JS build failed."
  exit $?
fi

echo "Targeting Cloud Foundry space..."
cf target -o fec -s "$1"
echo " "
echo "Setting Cloud Foundry environment variables..."
cf set-env "$2" FEC_WEB_API_URL "$api_url"
cf set-env "$2" FEC_WEB_DEBUG "$debug"
# the username and password should be the same for both the
# web app and API
cf set-env "$2" FEC_WEB_USERNAME "$3"
cf set-env "$2" FEC_WEB_PASSWORD "$4"
echo " "
echo "Pushing to Cloud Foundry..."
echo " "
cf push "$2"
exit $?
