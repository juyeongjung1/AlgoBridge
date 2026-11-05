// 実行: node tests/diagnostics-regression.cjs
const assert = require("node:assert/strict");
const { problems, engine } = require("./load-problems.cjs");
const clone = (value) => JSON.parse(JSON.stringify(value));
const ids = (diagnostic) => Array.from(diagnostic.issues, (issue) => issue.id).sort();
let checks = 0;
function check(p, nodes) {
  checks++;
  const before = JSON.stringify(nodes), result = engine.diagnose(p, nodes);
  assert.equal(JSON.stringify(nodes), before, "診断が配置を変更してはいけない");
  const actualIds = new Set(engine.flatten(nodes).map(n=>n.id));
  assert.ok(result.issues.every(issue=>actualIds.has(issue.id) && issue.messages.length));
  assert.ok(result.regions.every(region=>!region.parentId || actualIds.has(region.parentId)));
  assert.equal(new Set(result.issues.map(issue=>issue.id)).size, result.issues.length);
  if (engine.assess(p, nodes).ok) { assert.equal(result.issues.length,0,p.id); assert.equal(result.regions.length,0,p.id); }
  else assert.ok(result.issues.length + result.regions.length > 0, `${p.id}: 確認箇所がない`);
  return result;
}
function remove(sequence, id) {
  const index = sequence.findIndex(node=>node.id===id);
  if (index>=0) return sequence.splice(index,1)[0];
  for (const node of sequence) {
    const found = remove(node.children || [],id) || Object.values(node.branches || {}).map(branch=>remove(branch,id)).find(Boolean);
    if (found) return found;
  }
}
for (const p of problems) {
  const base = engine.tree(p.expected);
  check(p, []);
  for (const layout of p.solutions) {
    const nodes = engine.tree(layout);
    check(p,nodes);
    const prep = nodes.filter(n=>["input","declaration"].includes(p.blockMap.get(n.id).type));
    check(p,[...prep.reverse(),...nodes.filter(n=>!prep.includes(n))]);
    const withExtra = [...clone(nodes),{id:"dummyInput"}];
    assert.deepEqual(ids(check(p,withExtra)),["dummyInput"],`${p.id}: 別解の正しい部分を誤り扱いしない`);
  }
  for (const original of engine.flatten(base)) {
    const missing = clone(base); remove(missing,original.id); check(p,missing);
  }
  for (const block of p.paletteBlocks.filter(b=>b.id.includes("ExtraChoice"))) {
    assert.deepEqual(ids(check(p,[...clone(base),{id:block.id}])),[block.id]);
    const replaced=clone(base), target=engine.flatten(replaced).find(n=>p.blockMap.get(n.id).type===block.type);
    if(target) { target.id=block.id; assert.ok(ids(check(p,replaced)).includes(block.id)); }
  }
  const reversed = clone(base).reverse(); check(p,reversed);
}
function scenario(id, edit) { const p=problems.find(p=>p.id===id), nodes=engine.tree(p.expected); edit(nodes); return check(p,nodes); }
let d = scenario("greeting", nodes=>engine.flatten(nodes).find(n=>n.id==="checkEvening").branches.true.push(...engine.flatten(nodes).find(n=>n.id==="checkEvening").branches.false.splice(0)));
assert.deepEqual(ids(d),["setHourGuide"]);
d = scenario("greeting", nodes=>{ const n=engine.flatten(nodes).find(n=>n.id==="checkEvening"); [n.branches.true,n.branches.false]=[n.branches.false,n.branches.true]; });
assert.deepEqual(ids(d),["setEvening","setHourGuide"]);
d = scenario("claimReception", nodes=>{
  const n=engine.flatten(nodes).find(n=>n.id==="checkClaimAge");
  n.id="claimReceptionExtraChoice5";
  [n.branches.true,n.branches.false]=[n.branches.false,n.branches.true];
});
assert.deepEqual(ids(d),["claimReceptionExtraChoice5","outputClaimAccept","outputClaimAgeGuide"]);
assert.ok(d.issues.find(i=>i.id==="outputClaimAccept").kinds.includes("placement"));
d = scenario("bubbleSort", nodes=>{ engine.flatten(nodes).find(n=>n.id==="checkSortPair").id="bubbleSortExtraChoice1"; });
assert.deepEqual(ids(d),["bubbleSortExtraChoice1"]);
d = scenario("bubbleSort", nodes=>{ const n=engine.flatten(nodes).find(n=>n.id==="checkSortPair"); n.id="bubbleSortExtraChoice1"; n.branches.true[0].id="bubbleSortExtraChoice6"; });
assert.ok(ids(d).includes("bubbleSortExtraChoice1") && ids(d).includes("bubbleSortExtraChoice6"));
d = scenario("bmi", nodes=>{ const declaration=remove(nodes,"declareBmi"); nodes.splice(nodes.findIndex(n=>n.id==="calculateBmi")+1,0,declaration); });
assert.deepEqual(ids(d),["calculateBmi","declareBmi"]);
assert.ok(d.issues.every(i=>i.kinds.includes("preparation")));
d = scenario("bmi", nodes=>remove(nodes,"declareHeightM"));
assert.deepEqual(ids(d),["calculateBmi","convertHeight"]);
d = scenario("sum", nodes=>{ const output=remove(nodes,"outputSum"); nodes.unshift(output); });
assert.ok(ids(d).includes("outputSum") && ids(d).includes("loop"));
d = scenario("sum", nodes=>{ const inner=remove(nodes,"addCurrent"); nodes.push(inner); });
assert.deepEqual(ids(d),["addCurrent"]);
assert.ok(d.issues[0].kinds.includes("placement"));
d = scenario("greeting", nodes=>remove(nodes,"setHourGuide"));
assert.deepEqual(ids(d),[]);
assert.equal(d.regions.length,1);
assert.equal(d.regions[0].parentId,"checkEvening");
assert.equal(d.regions[0].region,"false");
d = scenario("weekday", nodes=>remove(nodes,"setWednesday"));
assert.equal(d.regions[0].parentId,"selectWeekday"); assert.equal(d.regions[0].region,"3");
d = scenario("sum", nodes=>remove(nodes,"outputSum"));
assert.deepEqual(ids(d),[]); assert.equal(d.regions[0].parentId,null);
d = scenario("premiumStats", nodes=>{ engine.flatten(nodes).find(n=>n.id==="checkStatsThreshold").branches.true.reverse(); });
assert.deepEqual(ids(d),[]); assert.equal(d.regions.length,0);
d = scenario("leap", nodes=>{ const rename={setLeapByFourHundred:"setLeapByFour",setLeapByFour:"setLeapByFourHundred",setCommonByOneHundred:"setCommonByDefault",setCommonByDefault:"setCommonByOneHundred"};engine.flatten(nodes).forEach(n=>n.id=rename[n.id]||n.id); });
assert.deepEqual(ids(d),[]);
console.log(JSON.stringify({問題数:problems.length,診断検証:checks,errors:[]},null,2));
