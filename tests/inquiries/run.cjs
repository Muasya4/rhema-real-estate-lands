/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "server-only") {
    return {};
  }

  return originalLoad.call(this, request, parent, isMain);
};

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  module._compile(output, filename);
};

require("./submission.test.cjs");
require("./turnstile.test.cjs");
require("../properties/properties.test.cjs");
require("../properties/data.test.cjs");
require("../properties/slug.test.cjs");
require("../properties/admin-validation.test.cjs");
require("../journal/model.test.cjs");
require("../journal/data.test.cjs");
require("../journal/admin-validation.test.cjs");
require("../journal/admin-data.test.cjs");
require("../journal/admin-actions.test.cjs");
require("../properties/admin-data.test.cjs");
require("../properties/admin-actions.test.cjs");
require("../auth/auth.test.cjs");
require("../regions/model.test.cjs");
require("../regions/data.test.cjs");
require("../regions/admin-actions.test.cjs");
require("../seo/site-url.test.cjs");
require("../seo/json-ld.test.cjs");
require("../seo/sitemap.test.cjs");
