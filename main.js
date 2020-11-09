const run = require('./run')

const accountId = 1232118

const aplicationIds = {
  'costa-live-id': 996991774,
  'costa-live-ph': 997039335,
  'costa-live-my': 994598841,
  'costa-live-sg': 994598436,
  'costa-live-hk': 984245537,
  'costa-live-tw': 984245381,

  'solr-live-id': 375414486,
  'solr-live-ph': 375414270,
  'solr-live-my': 375414818,
  'solr-live-sg': 375414235,
  'solr-live-hk': 375409527,
  'solr-live-tw': 375414222
}

const timeRanges = [
  ['8 Nov 2020 21:00:00 GMT+0800', '9 Nov 2020 03:00:00 GMT+0800'],
  ['9 Nov 2020 08:00:00 GMT+0800', '9 Nov 2020 14:00:00 GMT+0800'],
  ['9 Nov 2020 20:00:00 GMT+0800', '10 Nov 2020 02:00:00 GMT+0800']
]

;(async () => {
  for (let applicationName of Object.keys(aplicationIds)) {
    for (let timeRange of timeRanges) {
      const [start, end] = timeRange

      await run({
        accountId,
        applicationId: aplicationIds[applicationName],
        applicationName,
        start,
        end
      })
    }
  }
})()
