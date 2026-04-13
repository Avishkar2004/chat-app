const tailwindcss = require("tailwindcss");
const flexbugs = require("postcss-flexbugs-fixes");
const presetEnv = require("postcss-preset-env");

/** CRA passes PostCSS plugin names as strings; resolution can fail when packages are not hoisted. Load from the app root instead. */
function patchPostcssLoaders(webpackConfig) {
  const plugins = [
    tailwindcss,
    flexbugs,
    presetEnv({
      autoprefixer: { flexbox: "no-2009" },
      stage: 3,
    }),
  ];

  const patchUse = (use) => {
    if (!use) return;
    const list = Array.isArray(use) ? use : [use];
    for (const entry of list) {
      if (!entry || typeof entry !== "object") continue;
      const loaderPath = entry.loader || "";
      if (!String(loaderPath).includes("postcss-loader")) continue;
      entry.options = entry.options || {};
      entry.options.postcssOptions = {
        ...(entry.options.postcssOptions || {}),
        config: false,
        plugins,
      };
    }
  };

  const walk = (rules) => {
    if (!rules) return;
    for (const rule of rules) {
      if (rule.oneOf) walk(rule.oneOf);
      if (rule.rules) walk(rule.rules);
      patchUse(rule.use);
    }
  };

  walk(webpackConfig.module.rules);
  return webpackConfig;
}

module.exports = {
  webpack: {
    configure: patchPostcssLoaders,
  },
};
