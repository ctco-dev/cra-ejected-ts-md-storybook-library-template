Azure set-up to support 12 factor app configuration
===================================================

To force the production build on Azure Web Services to use environment variables
from the web server:

1. copy `index.js` and `Web.Config` to `public` directory.
2. Add changes to `config/webpack.config.prod.js` (see below).

Then all requests to `index.html` will be redirected to the `index.js`, which
injects environment variables, filtered by prefix `REACT_APP_`, into index.html,
making them acceptable in run time inside browser, by using global object `process.env`

Special notes
-------------
ATTENTION! `index.js` is not intended to use as a static web server. It returns
`index.html` content for any request. Please, set up your web server configuration properly.

webpack.config.prod.js
----------------------

Update `DefinePlugin` options. Instead of substituting all of the process.env properties,
use only `process.env.NODE_ENV` substitution, to keep production build minified.

```js
new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify('production'), // DO NOT inline whole process.env!
})
```

Update `UglifyJsPlugin` options to disable mangling of `process` object name:

```js
new webpack.optimize.UglifyJsPlugin({
  // ...
  mangle: {
    except: ['process'], // DO NOT mangle 'process'!
  },
})
```

Update `node` webpack options to disable mocking of the `process` object during building:

```js
module.exports = {
  // ... the rest of webpack configuration ...
  node: {
    // ...
    process: false, // DO NOT mock 'process'!
  },
}
```
