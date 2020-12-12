const config = {
  "accountId": "1232118",
  "applicationIds": {
    "costa-live-id": "996991774",
    "costa-live-ph": "997039335",
    "costa-live-my": "994598841",
    "costa-live-sg": "994598436",
    "costa-live-hk": "984245537",
    "costa-live-tw": "984245381",
    "solr-live-id": "375414486",
    "solr-live-ph": "375414270",
    "solr-live-my": "375414818",
    "solr-live-sg": "375414235",
    "solr-live-hk": "375409527",
    "solr-live-tw": "375414222"
  },
  "timeRanges": [
    // ["10 Nov 2020 23:00:00 GMT+0800", "12 Nov 2020 01:30:00 GMT+0800"],
    // ["11 Dec 2020 20:30:00 GMT+0700", "12 Dec 2020 02:00:00 GMT+0700"],
    // ["12 Dec 2020 08:30:00 GMT+0700", "12 Dec 2020 10:00:00 GMT+0700"],
    // ["12 Dec 2020 18:00:00 GMT+0700", "12 Dec 2020 23:00:00 GMT+0700"],
    ["11 Dec 2020 20:30:00 GMT+0700", "12 Dec 2020 23:55:00 GMT+0700"],
  ],
  "pages": ["Go runtime", "Solr updates", "JVMs", "Errors"],
  "selectors": {
    "page": "//a/*[contains(text(), '${page}')]/..",
    "transactionItem": "[class$=\"bar-item\"]",
    "transactionItemTitle": ".TransactionDetailedDrilldown-header-title"
  }
}

module.exports = config;