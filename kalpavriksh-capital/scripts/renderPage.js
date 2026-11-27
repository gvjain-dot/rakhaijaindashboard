/** Lets Node load the React source (JSX, ES modules, CSS imports) and renders a page to HTML. */
const Module = require('node:module');
const path = require('node:path');

// babel-preset-react-app picks its Node/CommonJS output from BABEL_ENV=test; React itself renders in production mode.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const babel = require('@babel/core');

const SOURCE_DIR = path.join(__dirname, '..', 'src') + path.sep;
const compileJavaScript = Module._extensions['.js'];

Module._extensions['.js'] = (module, filename) => {
  if (!filename.startsWith(SOURCE_DIR)) return compileJavaScript(module, filename);
  const { code } = babel.transformFileSync(filename, {
    babelrc: false,
    configFile: false,
    presets: [require.resolve('babel-preset-react-app')],
  });
  return module._compile(code, filename);
};
Module._extensions['.css'] = () => {}; // styles are already in the built CSS file

const loadSource = (relative) => require(path.join(SOURCE_DIR, relative));

/** The HTML inside #root for one address of the main site. */
function renderPath(location) {
  const React = require('react');
  const { renderToString } = require('react-dom/server');
  const { StaticRouter } = require('react-router');
  const App = loadSource('App').default;
  return renderToString(React.createElement(StaticRouter, { location }, React.createElement(App)));
}

module.exports = { renderPath, loadSource };
