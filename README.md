# gen-newrelic-snapshots

Take NewRelic screenshots as snapshots 

## Usage

- Start your Chrome in debugging mode, and get ws endpoint
`"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" --remote-debugging-port=9222`

- Make sure you already logged in into NR.

- Configure your account ids, application ids, time ranges in main.js, then run:
`WS_ENDPOINT=ws://127.0.0.1:9222/devtools/browser/xxx node app.js`