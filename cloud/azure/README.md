Azure set-up
============

Content
-------
- [Deployment](#deployment)
- [12 Factor App configuration](#12-factor-app-configuration)

Deployment
----------

Kudu Deployment Hook & Web Configuration.

### Purpose
[Kudu Deployment Hook](https://github.com/projectkudu/kudu/wiki/Deployment-hooks) script and the [IIS web.config](https://support.microsoft.com/en-us/help/815179/how-to-create-the-web.config-file-for-an-asp.net-application) starter to streamline [create react app](https://github.com/facebookincubator/create-react-app) deployment to [Azure Web App Services](https://azure.microsoft.com/en-us/services/app-service/web/)

### Features
- `npm install` instead of [default Kudu behavior](https://medium.com/@trstringer/custom-build-logic-post-git-push-with-azure-app-service-and-kudu-for-a-node-js-web-app-1b2719598916#.653ti9o5l)
- `npm run build`
- `Web.Config` (inside `public/`)with
    - [Route configuration that supports HTML5 pushState](https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries)
    - [Sensible](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching) default [Cache-Control directives](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9) for static and dynamic resources.
    - `woff` and `woff2` mime type support
    - 12 Factor App configuration related changes (see [below](#12-factor-app-configuration)).
- `azuredeploy.json` (inside root directory) - Azure Resource Manager template for instant deployment.

### Azure Web App Configuration
Make sure that [Kudu Node version](https://github.com/projectkudu/kudu/wiki/Configurable-settings#change-the-node-version) is set to Node >= 4.

6.x is recommended to improve the build performance.

ATTENTION! Currently if you specify _node_ version restrictions inside `package.json` in `engine.node` section,
then automated deployment to Azure will fail due to `selectNodeVersion` script errors called inside `deploy.com`.

To set a specific version of _node.js_ to deploy to, use `WEBSITE_NODE_DEFAULT_VERSION` env var
 (inside `appsettings` resource of `azuredeploy.json`, or directly on Azure App Service).


12 Factor App configuration
---------------------------

By default, the _production build_ is set up to use environment variables
from the web server (see explanations [here](https://12factor.net/config)).
All requests to `index.html` are redirected to the `index.js`, which
injects environment variables, filtered by prefix `REACT_APP_`, into index.html,
making them acceptable in run time inside browser, by using global object `process.env`

To achieve that some changes were made:

1. `config/webpack.config.prod.js` was patched (see [below](#webpackconfigprodjs)).
2. `index.js` and `Web.Config` was added to `public` directory.

### webpack.config.prod.js
Follow up changes were made to set up 12 Factor App configuration available on production build.

1. Updated `DefinePlugin` options. Instead of substituting all of the process.env properties,
use only `process.env.NODE_ENV` substitution, to keep production build minified.

```js
new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify('production'), // DO NOT inline whole process.env!
})
```

2. Updated `UglifyJsPlugin` options to disable mangling of `process` object name:

```js
new webpack.optimize.UglifyJsPlugin({
  // ...
  mangle: {
    except: ['process'], // DO NOT mangle 'process'!
  },
})
```

3. Updated `node` webpack options to disable mocking of the `process` object during building:

```js
module.exports = {
  // ... the rest of webpack configuration ...
  node: {
    // ...
    process: false, // DO NOT mock 'process'!
  },
}
```

### Special notes

ATTENTION! `index.js` is not intended to use as a static web server. It returns
`index.html` content for any request. Please, set up your web server configuration properly.
