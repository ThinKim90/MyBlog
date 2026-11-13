/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */

const fs = require('fs');
const path = require('path');
const React = require('react');

const SNAPSHOT_PATH = path.join(process.cwd(), 'static', 'blog-view-counts.json');

const readViewCountSnapshot = () => {
  try {
    const raw = fs.readFileSync(SNAPSHOT_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed?.counts || {};
  } catch {
    return {};
  }
};

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
exports.onRenderBody = ({ setHtmlAttributes, setHeadComponents }) => {
  setHtmlAttributes({ lang: `en` });

  const counts = readViewCountSnapshot();
  setHeadComponents([
    React.createElement('script', {
      key: 'goatcounter-config',
      dangerouslySetInnerHTML: {
        __html: 'window.goatcounter=Object.assign(window.goatcounter||{},{no_onload:true});',
      },
    }),
    React.createElement('script', {
      key: 'blog-view-counts-snapshot',
      dangerouslySetInnerHTML: {
        __html: `window.__BLOG_VIEW_COUNTS__=${JSON.stringify(counts)};`,
      },
    }),
  ]);
};

// Helmet also inserts the async tracker into the head. Configure manual tracking
// before that script can execute, even when it is already in the browser cache.
exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
  const head = getHeadComponents();
  replaceHeadComponents([
    ...head.filter(component => component?.key === 'goatcounter-config'),
    ...head.filter(component => component?.key !== 'goatcounter-config'),
  ]);
};
