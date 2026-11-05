// 実行: node tests/lesson-content-regression.cjs
const assert = require("node:assert/strict");
const { problems } = require("./load-problems.cjs");
const required = {
  name: ["半角スペースを1個", "括弧は半角"],
  triangle: ["面積 = 底辺 × 高さ ÷ 2", "同じ単位"],
  billing: ["円単位", "割合（％）ではなく"],
  policyFormat: ["括弧とコロンは全角", "空白は入れません"],
  bmi: ["身長(m) = 身長(cm) ÷ 100", "BMI = 体重(kg) ÷ 身長(m) ÷ 身長(m)"],
  evenOdd: ["余りが0", "負の整数"],
  max: ["より大きい場合", "それ以外の場合"],
  eligibility: ["18歳以上", "それ以外"],
  contractStatus: ["「有効」なら", "それ以外"],
  greeting: ["0〜11", "12〜17", "18〜23", "0〜23時で指定してください"],
  weekday: ["2：火曜日", "3：水曜日", "4：木曜日", "5：金曜日", "Error"],
  accidentCategory: ["A：", "B：", "C：", "大文字と小文字は区別"],
  sum: ["終点のnも", "1 + 2 + 3 = 6"],
  evenSum: ["余りが0", "対象の偶数がない場合"],
  fizzBuzz: ["3と5の両方", "3だけ", "5だけ", "1行に1つ"],
  annualPremium: ["毎月同じ金額", "月数回足した値"],
  leap: ["400", "100", "4", "うるう年です", "うるう年ではありません"],
  arraySum: ["要素", "今回取り出した1件分"],
  arrayAverage: ["平均 = 合計 ÷ 契約件数", "要素数", "小数第1位"],
  premiumMax: ["金額は1回だけ", "1件だけ"],
  thresholdCount: ["同額の場合も含み", "合計ではなく件数"],
  policySearch: ["番号全体が一致", "部分一致では", "true", "false"],
  firstEligible: ["最小の年齢ではなく", "見つかった時点で", "文字列に変換"],
  paymentStatusCount: ["完全に一致", "それ以外の状態は数えません"],
  premiumStats: ["同額も含む", "件数：2 / 合計：27000", "件数も合計も0"],
  swapPremium: ["一時的に保管", "first、secondの順"],
  bubblePass: ["1巡", "昇順になるとは限りません", "0から始まり"],
  bubbleSort: ["昇順（小さい値から大きい値の順）", "比較範囲を1つ短く", "N−1回", "1要素なら"],
  claimReception: ["① 契約状態", "② 契約状態が「有効」の場合", "③ 契約状態が「有効」かつ事故区分が「事故」", "案内だけ"],
  coverageDecision: ["月数が12未満", "年数が3未満", "割引額を計算する問題ではありません"]
};
assert.equal(problems.length, 30);
assert.equal(problems[4].id, "bmi");
assert.equal(problems[8].id, "evenOdd");
const bmiHints = problems[4].hints;
assert.equal(bmiHints.length, 4);
assert.ok(bmiHints[0].concrete.includes("変数を使う前に宣言が必要"));
assert.ok(bmiHints[0].concrete.includes("宣言しただけでは値は入らない"));
assert.ok(bmiHints[1].concrete.includes("100で割ってmに換算"));
const parityCandidates = problems.find(p=>p.id === "evenOdd").paletteBlocks;
assert.ok(parityCandidates.some(b=>b.id === "checkMultipleOfThree" && b.type === "decision" && b.label === "変数 number を 3 で割った余りが 0 か判定する"));
assert.ok(!parityCandidates.some(b=>b.id === "checkDivideTwo" || (b.type === "decision" && b.label.includes("入力値を 2 で割った結果"))));
let literalChecks = 0;
for (const p of problems) {
  assert.ok(required[p.id], p.id);
  for (const text of required[p.id]) assert.ok(p.description.includes(text), `${p.id}: ${text}`);
  for (const block of p.correct.filter(b => ["assignment", "calculation", "output"].includes(b.type))) {
    const line = p.blockCode[block.id].line;
    if (line.includes("printf")) continue;
    for (const quoted of line.match(/"(?:\\.|[^"\\])*"/g) || []) {
      const literal = JSON.parse(quoted);
      if (literal.trim().length <= 1) continue;
      literalChecks++;
      assert.ok(p.description.includes(literal), `${p.id}: 出力・結合に使う文字列 ${literal} が問題文にない`);
    }
  }
}
const examples = [
  ["triangle", {base:6,height:4}, "12"],
  ["billing", {basePremium:12000,discount:1500}, "10500"],
  ["policyFormat", {customerName:"山田太郎",policyNumber:"P-1001"}, "山田太郎（証券番号：P-1001）"],
  ["bmi", {heightCm:170,weightKg:65}, "22.5"],
  ["evenOdd", {number:-3}, "奇数"], ["evenOdd", {number:0}, "偶数"],
  ["sum", {n:3}, "6"], ["evenSum", {n:6}, "12"],
  ["fizzBuzz", {n:5}, "1\n2\nFizz\n4\nBuzz"],
  ["annualPremium", {monthlyPremium:1000,months:3}, "3000"],
  ["leap", {year:2400}, "うるう年です"], ["leap", {year:2100}, "うるう年ではありません"],
  ["arraySum", {premiums:"1000,2000,3000"}, "6000"],
  ["arrayAverage", {premiums:"1000,2000"}, "1500.0"],
  ["premiumMax", {premiums:"1000,3000,3000"}, "3000"],
  ["thresholdCount", {premiums:"1000,2000,3000",threshold:2000}, "2"],
  ["policySearch", {policyNumbers:"P-10",target:"P-1"}, "見つかりません"],
  ["firstEligible", {ages:"20,18,25"}, "20"],
  ["paymentStatusCount", {statuses:"支払済,未払,未払"}, "2"],
  ["premiumStats", {premiums:"12000,8000,15000",threshold:10000}, "件数：2 / 合計：27000"],
  ["swapPremium", {first:12000,second:8000}, "8000, 12000"],
  ["bubblePass", {premiums:"3,2,1"}, "[2, 1, 3]"],
  ["bubbleSort", {premiums:"3,1,2"}, "[1, 2, 3]"]
];
for (const [id, input, expected] of examples) assert.equal(String(problems.find(p=>p.id===id).execute(input).output), expected, id);
console.log(JSON.stringify({問題文の確認:problems.length,出力文字列の照合:literalChecks,掲載例等の出力確認:examples.length,errors:[]},null,2));
