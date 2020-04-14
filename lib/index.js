"use strict";

const {
  createServer
} = require('http');

const {
  parse
} = require('url');

const data2XML = require('data2xml');

const FileSystem = require('fs');

const {
  join
} = require('path');

const estimator = require('./estimator').default;

const port = process.env.PORT || 5000;
const apiUrl = '/api/v1/on-covid-19';

const respondWithXML = (res, obj) => {
  res.setHeader('Content-Type', 'application/xml');
  const convert = data2XML();
  const xml = convert('result', obj);
  res.write(xml);
};

const respondWithJSON = (res, obj) => {
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(obj));
};

const respondWithPlainText = (res, obj) => {
  res.setHeader('Content-Type', 'text/plain');
  res.write(obj);
};

const log = (method, path, status, startTime) => {
  FileSystem.appendFileSync(join(__dirname, 'logs.log'), `${method} ${path} ${status} ${(new Date().getTime() - startTime.getTime()).toString().padStart(2, '0')}ms\n`);
};

const getLogs = () => {
  const logPath = join(__dirname, 'logs.log');

  if (FileSystem.existsSync(logPath)) {
    return FileSystem.readFileSync(logPath, 'utf8').toString();
  }

  return '';
};

const server = createServer((req, res) => {
  const reqUrl = parse(req.url, true);
  const start = new Date();

  try {
    if (reqUrl.pathname.startsWith(apiUrl)) {
      const [, route] = reqUrl.pathname.split(apiUrl);
      const data = [];
      req.on('data', chunk => {
        data.push(chunk);
      });
      req.on('end', () => {
        let requestBody;

        if (data.length > 0) {
          requestBody = JSON.parse(data.join(''));
          const isXML = route.toLowerCase().startsWith('/xml');
          const estimations = estimator(requestBody);

          if (isXML) {
            respondWithXML(res, estimations);
          } else {
            respondWithJSON(res, estimations);
          }

          res.statusCode = 200;
        } else if (route === '/logs' && req.method === 'GET') {
          res.statusCode = 200;
          respondWithPlainText(res, getLogs());
        } else {
          res.statusCode = 400;
          respondWithPlainText(res, 'NO DATA FOUND IN REQUEST');
        }

        res.end();
      });
      res.on('close', () => {
        if (route === '/logs' && req.method === 'GET') {
          log(req.method, reqUrl.pathname, res.statusCode, start);
        } else {
          log(req.method, reqUrl.pathname, res.statusCode, start);
        }
      });
    } else {
      console.log(req.url);
      const url = req.url === '/' ? 'index.html' : req.url;
      FileSystem.readFile(join(__dirname, `ui/${url}`), (err, data) => {
        if (!err) {
          const dotoffset = url.lastIndexOf('.');
          const mimetype = dotoffset === -1 ? 'text/plain' : {
            '.html': 'text/html',
            '.ico': 'image/x-icon',
            '.jpg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.css': 'text/css',
            '.js': 'text/javascript'
          }[url.substr(dotoffset)];
          res.setHeader('Content-type', mimetype);
          res.end(data);
          console.log(url, mimetype);
        } else {
          console.log(`file not found: ${req.url}`);
          res.writeHead(404, 'Not Found');
          res.end();
        }
      });
    }
  } catch (error) {
    res.statusCode = 500;
    respondWithPlainText(res, error.message);
    res.end();
  }
});
server.listen(port, () => {
  console.log(`Server running on :${port}`);
});