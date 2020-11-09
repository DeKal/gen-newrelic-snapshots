# gen-newrelic-snapshots

Take NewRelic screenshots as snapshots

![image](https://user-images.githubusercontent.com/261283/48404138-99578700-e76a-11e8-9ab5-e84439fa4665.png)

## Usage

- Download Google Chrome Canary (if you are on Macos, the link to Google Chrome Canary should be same with the next step)


- Start your Chrome in debugging mode
`"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" --remote-debugging-port=9222`
![image](images/open-canary-debug.png)

- Get ws endpoint `ws://127.0.0.1:9222/devtools/browser/xxx`

- Make sure you already logged in into NR.

- Configure your account ids, application ids, time ranges in main.js, then run:
`WS_ENDPOINT=ws://127.0.0.1:9222/devtools/browser/xxx node main.js`

## Improvements
- Publish to npm
