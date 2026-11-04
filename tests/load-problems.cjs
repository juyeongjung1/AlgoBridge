const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const repo = path.resolve(__dirname, "..");
const context = vm.createContext({ window: {} });
for (const file of ["additional-problems.js", "problem-engine.js"]) vm.runInContext(fs.readFileSync(path.join(repo, file), "utf8"), context);
const source = fs.readFileSync(path.join(repo, "script.js"), "utf8");
vm.runInContext(source.slice(0, source.indexOf("const $ =")) + "\nglobalThis.catalog = problems;", context);
module.exports = { repo, problems: context.catalog, engine: context.window.AlgoEngine };
