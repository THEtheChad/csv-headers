'use strict';

const fs = require('fs');
const LineReader = require('line-by-line');

function csvHeaders(file_path, options, cb) {
  if (!fs.existsSync(file_path)) {
    cb(new Error(`No file at specified path: ${file_path}`));
  }

  let opts = Object.assign(
    {},
    { delimiter: ',', encoding: 'utf8', types: true },
    options
  );

  const reader = new LineReader(file_path, {
    encoding: opts.encoding,
    skipEmptyLines: true
  });

  let header = !opts.isHeader, headers, types;

  reader
    .on('line', function(line) {
      if (!header) {
        header = opts.isHeader(line);

        if (!header) return;
      }

      if (!headers) {
        headers = line.split(opts.delimiter).map(header => {
          if (opts.format) {
            header = opts.format(header);
          }
          return header.trim();
        });
      } else if (!types) {
        types = line.split(opts.delimiter).map(value => {
          if (value === 'true' || value === 'false') {
            return 'BOOLEAN';
          } else {
            let n = Number(value);
            if (!isNaN(n)) {
              if (/\./.test(value)) {
                return 'DECIMAL';
              } else {
                return 'INTEGER';
              }
            } else {
              let d = Date.parse(value);

              if (!isNaN(d)) {
                return 'DATE';
              }
            }
          }

          return 'STRING';
        });
      }

      if (headers && (!opts.types || types)) {
        cb(null, [headers, types]);
        reader.pause();
        reader.close();
      }
    })
    .on('error', function(err) {
      err.message = `Error while reading the headers of csv file: ${file_path}`;

      cb(err);
    });
}

module.exports = csvHeaders;
