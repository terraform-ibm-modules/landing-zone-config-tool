# updates the timestamp in client/public/manifest.json to force a git diff, which will cause Github Pages to be re-deployed

sed -i "/timestamp/c\  \"timestamp\": \"$(date +%s)\"" ./public/manifest.json;
npm run build;
