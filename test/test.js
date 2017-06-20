'use strict';

const path = require('path');

const csvHeaders = require('../');

csvHeaders(
  path.resolve(__dirname, '../example.csv'),
  {
    isHeader: line => /date,/i.test(line),
    format: header =>
      header.replace(/[^A-Za-z_]/g, '_').replace(/_{2,}/, '_').toLowerCase()
  },
  function(err, res) {
    if (err) throw err;
    console.log(res);
  }
);
