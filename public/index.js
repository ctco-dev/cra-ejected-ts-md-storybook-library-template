const http = require('http');
const fs = require('fs');
const path = require('path');

const ENV_VAR_MASK = 'REACT_APP_';
const SRC_FILENAME = path.join(__dirname, 'index.html');
const PORT = process.env.PORT || 1337;

// Find marker inside provided string content and replace it
// with browser's env variables init block. Env variables are filtered by mask.
const injectEnv = (mask, env, content) => content.replace(
  /<\/head>/i,
  `<script>window.process = { env: ${JSON.stringify(filterEnv(mask, env))} };</script></head>`
);

// Extract env variables by mask
const filterEnv = (mask, env) => Object.keys(env)
  .filter(key => key.startsWith(mask))
  .reduce((acc, curr) => Object.assign({}, acc, {[curr]: env[curr]}), {});

const src = fs.readFileSync(SRC_FILENAME, 'utf8');
const dest = injectEnv(ENV_VAR_MASK, process.env, src);

// serve
http.createServer((request, response) => {

  response.writeHead(200, {
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache' // don't cache index.html!
  });
  response.end(dest, 'utf8');

}).listen(PORT, (err) => {
  if (err) {
    console.log('Error occurred: ', err);
    return;
  }
  console.log(`Server is listening on ${PORT}`);
  console.log('  ATTENTION! The only purpose of this HTTP server is to inject ENV into index.html.');
  console.log('  This server is not intended to use as a static web server for any other content except index.html.')
});
