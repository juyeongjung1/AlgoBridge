// 実行: node tests/problem-regression.cjs（Java比較にはJDK 17以上が必要）
const assert = require("node:assert/strict");
const fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const { spawnSync } = require("node:child_process");
const { problems, engine } = require("./load-problems.cjs");
const { variations, reference } = require("./cases.cjs");
const clone = (value) => JSON.parse(JSON.stringify(value));
const defaults = (p) => Object.fromEntries(p.inputs.map((i) => [i.id, String(i.value)]));
const errors = [], totals = { 問題数: 0, 配置判定: 0, 入力検証: 0, 出力比較: 0, Java比較: 0, トレース検証: 0 };
function check(label, fn) { try { fn(); } catch (error) { errors.push(`${label}: ${error.message}`); } }
function layout(p, nodes, expected, label) { totals.配置判定++; check(`${p.id}/${label}`, () => assert.equal(engine.assess(p, nodes).ok, expected)); }
function same(actual, expected) { if (typeof expected === "number") assert.ok(Number.isFinite(Number(actual)) && Math.abs(Number(actual) - expected) < 1e-8, `${actual} != ${expected}`); else assert.equal(String(actual).replace(/\r\n/g, "\n"), expected); }
const javaCases = [];
const rejectedBoundaryCases = new Set(["arraySum/4", "arraySum/5", "premiumMax/4", "firstEligible/5", "swapPremium/3", "bubblePass/5", "bubbleSort/5"]);
function javaCase(p, nodes, values, label) { javaCases.push({ label: `${p.id}/${label}`, code: engine.javaRows(p, nodes, values).map((r) => r[1]).join("\n"), expected: reference(p.id, values) }); }
function permutations(items) { return items.length ? items.flatMap((x, i) => permutations(items.filter((_, j) => j !== i)).map((rest) => [x, ...rest])) : [[]]; }
for (const p of problems) {
  totals.問題数++;
  const base = engine.tree(p.expected), values = defaults(p);
  layout(p, base, true, "模範配置");
  check(`${p.id}/初期入力`, () => assert.equal(engine.inputError(p, values), ""));
  const prep = base.filter((node) => ["input", "declaration"].includes(p.blockMap.get(node.id).type));
  const rest = base.filter((node) => !prep.includes(node));
  for (const [index, reordered] of permutations(prep).entries()) {
    const nodes = [...reordered, ...rest];
    layout(p, nodes, true, `準備順${index}`);
    javaCase(p, nodes, values, `準備順${index}`);
  }
  const missing = clone(base); missing.pop();
  layout(p, missing, false, "最後の処理が不足");
  check(`${p.id}/不足の案内`, () => assert.equal(engine.assess(p, missing).reason, "missing"));
  const extra = [...base, { id: "dummyInput" }];
  layout(p, extra, false, "余分な入力");
  check(`${p.id}/余分の案内`, () => assert.equal(engine.assess(p, extra).reason, "extra"));
  const earlyUse = [...base.slice(1), base[0]];
  layout(p, earlyUse, false, "入力前に使用");
  check(`${p.id}/順序の案内`, () => assert.equal(engine.assess(p, earlyUse).reason, "structure"));
  const container = engine.flatten(base).find((n) => n.children.length || Object.values(n.branches).some((b) => b.length));
  if (container) {
    const wrong = clone(base), nested = engine.flatten(wrong).find((n) => n.id === container.id);
    const region = nested.children.length ? nested.children : Object.values(nested.branches).find((b) => b.length);
    wrong.push(region.shift());
    layout(p, wrong, false, "子をルートへ誤配置");
  }
  for (const solution of p.solutions) layout(p, engine.tree(solution), true, "許容別解");
  for (const [alias, original] of Object.entries(p.aliases)) {
    if (!engine.flatten(base).some((n) => n.id === original) || engine.flatten(base).some((n) => n.id === alias)) continue;
    const nodes = clone(base); engine.flatten(nodes).find((n) => n.id === original).id = alias;
    layout(p, nodes, true, `同義ブロック${alias}`);
    javaCase(p, nodes, values, `同義ブロック${alias}`);
  }
  for (const input of p.inputs) {
    const invalid = ["", "   "];
    if (input.type === "number" || input.listType === "integer") {
      invalid.push("NaN", "Infinity", String(input.min - 1), String(input.max + 1));
      if (input.step !== "any") invalid.push("1.5");
    }
    if (input.listType) invalid.push(Array(21).fill(input.listType === "integer" ? 1 : "A").join(","));
    for (const value of invalid) { totals.入力検証++; check(`${p.id}/${input.id}=${value}`, () => assert.ok(engine.inputError(p, { ...values, [input.id]: value }))); }
  }
  for (const [index, override] of [{}, ...(variations[p.id] || [])].entries()) {
    const v = { ...values, ...override };
    const inputError = engine.inputError(p, v);
    totals.入力検証++;
    check(`${p.id}/境界値${index}の受理`, () => assert.equal(Boolean(inputError), rejectedBoundaryCases.has(`${p.id}/${index}`), inputError));
    if (inputError) continue;
    for (const [variant, solution] of p.solutions.entries()) {
      const nodes = engine.tree(solution);
      totals.出力比較++;
      check(`${p.id}/入力${index}/別解${variant}`, () => same(engine.execute(p, v, nodes).output, reference(p.id, v)));
      javaCase(p, nodes, v, `入力${index}/別解${variant}`);
    }
  }
}
function example(id, mutate, expected = true) {
  const p = problems.find((p) => p.id === id), nodes = engine.tree(p.expected);
  mutate(nodes); layout(p, nodes, expected, "回帰配置");
  if (expected) javaCase(p, nodes, defaults(p), "回帰配置");
}
function moveAfter(nodes, id, after) { const index = nodes.findIndex((n) => n.id === id), [node] = nodes.splice(index, 1); nodes.splice(nodes.findIndex((n) => n.id === after) + 1, 0, node); }
example("bmi", (nodes) => moveAfter(nodes, "declareBmi", "convertHeight"));
example("arrayAverage", (nodes) => moveAfter(nodes, "declareAverage", "loopAveragePremiums"));
example("sum", (nodes) => moveAfter(nodes, "inputN", "initializeSum"));
example("bmi", (nodes) => moveAfter(nodes, "declareBmi", "calculateBmi"), false);
example("sum", (nodes) => moveAfter(nodes, "initializeSum", "loop"), false);
example("premiumStats", (nodes) => { moveAfter(nodes, "initializeStatsCount", "initializeStatsSum"); engine.flatten(nodes).find((n) => n.id === "checkStatsThreshold").branches.true.reverse(); });
example("leap", (nodes) => { const aliases = { setLeapByFour: "setLeapByFourHundred", setLeapByFourHundred: "setLeapByFour", setCommonByDefault: "setCommonByOneHundred", setCommonByOneHundred: "setCommonByDefault" }; engine.flatten(nodes).forEach((n) => { n.id = aliases[n.id] || n.id; }); });
function trace(id, fn) { const p = problems.find((p) => p.id === id); totals.トレース検証++; check(`${id}/途中経過`, () => fn(p)); }
trace("arrayAverage", (p) => assert.equal(p.execute(defaults(p)).trace.length, 5));
trace("policySearch", (p) => assert.deepEqual(Array.from(p.execute({policyNumbers:"P-1,P-2",target:"P-1"}).trace, (r) => r[3]), [false,true,true]));
trace("firstEligible", (p) => { const r = p.execute({ages:"15,18,25"}); assert.equal(r.trace.length, 3); assert.equal(r.trace[2][2], "18"); });
trace("swapPremium", (p) => { const r = p.execute({first:1,second:2}); assert.equal(r.trace.length, 4); assert.equal(r.trace[1][1], 1); assert.equal(r.trace[2][2], 2); assert.equal(r.trace[3][3], 1); });
trace("bubbleSort", (p) => assert.equal(p.execute({premiums:"4,3,2,1"}).trace.length, 7));
trace("sum", (p) => assert.equal(engine.execute(p, {n:3}, engine.tree(p.solutions[1])).trace[1][1], 0));
trace("arraySum", (p) => assert.equal(engine.execute(p, {premiums:"1,2,3"}, engine.tree(p.solutions[1])).trace[0][1], 3));

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "algobridge-regression-"));
const javaSource = `import java.util.Arrays;
public class RegressionCases {
${javaCases.map((c, i) => `static void c${i}() {\n${c.code}\n}`).join("\n")}
public static void main(String[] args) throws Exception {
java.io.PrintStream original = System.out;
${javaCases.map((_, i) => `{ java.io.ByteArrayOutputStream b = new java.io.ByteArrayOutputStream(); System.setOut(new java.io.PrintStream(b, true, "UTF-8")); c${i}(); System.setOut(original); original.println(java.util.Base64.getEncoder().encodeToString(b.toByteArray())); }`).join("\n")}
}}
`;
fs.writeFileSync(path.join(temp, "RegressionCases.java"), javaSource);
const compiled = spawnSync("javac", ["-encoding", "UTF-8", "RegressionCases.java"], {cwd:temp,encoding:"utf8",maxBuffer:10*1024*1024});
check("Javaコンパイル", () => assert.equal(compiled.status, 0, compiled.error?.message || compiled.stderr));
if (compiled.status === 0) {
  const run = spawnSync("java", ["-cp", temp, "RegressionCases"], {encoding:"utf8",maxBuffer:10*1024*1024});
  check("Java実行", () => assert.equal(run.status, 0, run.stderr));
  const outputs = run.stdout.trim().split(/\r?\n/);
  check("Java比較件数", () => assert.equal(outputs.length, javaCases.length));
  javaCases.forEach((c, i) => { totals.Java比較++; check(c.label, () => same(Buffer.from(outputs[i] || "", "base64").toString("utf8").replace(/\r?\n$/, ""), c.expected)); });
}
console.log(JSON.stringify({ totals, errors, Java検証ファイル: temp }, null, 2));
process.exitCode = errors.length ? 1 : 0;
