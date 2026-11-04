"use strict";

// 判定とJava表示で同じ木構造を使う。問題に定義された解法だけを受け入れる。
window.AlgoEngine = (() => {
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const list = (value) => String(value).split(/[、,\s]+/).filter(Boolean);
  const flatten = (nodes) => nodes.flatMap((node) => [node, ...flatten(node.children || []), ...Object.values(node.branches || {}).flatMap(flatten)]);
  const tree = (layout) => {
    const entry = (id) => ({ id, children: (layout.nested?.[id] || []).map(entry), branches: Object.fromEntries(Object.entries(layout.branches?.[id] || {}).map(([name, ids]) => [name, ids.map(entry)])) });
    return layout.root.map(entry);
  };
  const canonical = (problem, id) => problem.aliases[id] || id;
  const counts = (problem, nodes) => {
    const result = new Map();
    flatten(nodes).forEach(({ id }) => { const key = canonical(problem, id); result.set(key, (result.get(key) || 0) + 1); });
    return result;
  };
  const sameCounts = (a, b) => a.size === b.size && [...a].every(([id, n]) => b.get(id) === n);
  const codeFor = (problem, id) => problem.blockCode[id] || problem.blockCode[canonical(problem, id)];
  const preparation = (problem, id) => ["input", "declaration"].includes(problem.blockMap.get(id)?.type);
  const variable = (problem, id) => codeFor(problem, id)?.line.match(/^(?:int|double|String|boolean)(?:\[\])?\s+(\w+)/)?.[1];
  const mentions = (problem, node, name) => flatten([node]).some(({ id }) => {
    const code = codeFor(problem, id);
    const executable = [code?.line, ...(code?.prefix || []), ...(code?.extra || [])].join(" ").replace(/"(?:\\.|[^"\\])*"|\/\/[^\n]*/g, "");
    return new RegExp(`\\b${name}\\b`).test(executable);
  });

  function sequenceMatches(problem, actual, expected) {
    if (!sameCounts(counts(problem, actual.map((n) => ({ id: n.id }))), counts(problem, expected.map((n) => ({ id: n.id }))))) return false;
    const key = (node) => canonical(problem, node.id);
    const flow = expected.filter((node) => !preparation(problem, node.id));
    const positions = new Map(actual.map((node, index) => [key(node), index]));
    // 入力・宣言は、同じ領域内で最初に使用する処理より前ならよい。
    for (const node of actual.filter((n) => preparation(problem, n.id))) {
      const name = variable(problem, node.id);
      if (!name || actual.some((other, index) => key(other) !== key(node) && index < positions.get(key(node)) && mentions(problem, other, name))) return false;
    }
    for (let i = 0; i < flow.length; i += 1) {
      for (let j = i + 1; j < flow.length; j += 1) {
        const independent = (problem.independent || []).some((group) => group.includes(key(flow[i])) && group.includes(key(flow[j])));
        if (!independent && positions.get(key(flow[i])) >= positions.get(key(flow[j]))) return false;
      }
    }
    return expected.every((expectedNode) => {
      const actualNode = actual.find((node) => key(node) === key(expectedNode));
      if (!sequenceMatches(problem, actualNode.children || [], expectedNode.children || [])) return false;
      const branches = new Set([...Object.keys(actualNode.branches || {}), ...Object.keys(expectedNode.branches || {})]);
      return [...branches].every((name) => sequenceMatches(problem, actualNode.branches?.[name] || [], expectedNode.branches?.[name] || []));
    });
  }

  function assess(problem, nodes) {
    const actual = counts(problem, nodes);
    const candidates = problem.solutions.map((layout) => ({ layout, nodes: tree(layout) }));
    for (const candidate of candidates) {
      if (sameCounts(actual, counts(problem, candidate.nodes)) && sequenceMatches(problem, nodes, candidate.nodes)) return { ok: true, layout: candidate.layout };
    }
    if (candidates.some((candidate) => sameCounts(actual, counts(problem, candidate.nodes)))) return { ok: false, reason: "structure" };
    const subset = candidates.some((candidate) => {
      const required = counts(problem, candidate.nodes);
      return [...actual].every(([id, n]) => n <= (required.get(id) || 0));
    });
    return { ok: false, reason: subset ? "missing" : "extra" };
  }

  function inputError(problem, values) {
    for (const input of problem.inputs) {
      const raw = String(values[input.id] ?? "").trim();
      if (!raw) return `${input.label}を入力してください。`;
      const items = input.listType ? list(raw) : [raw];
      if (input.listType && (items.length < 1 || items.length > 20)) return `${input.label}は1〜20個で入力してください。`;
      if (input.type !== "number" && input.listType !== "integer") continue;
      if (items.some((item) => !Number.isFinite(Number(item)) || (input.step !== "any" && !Number.isInteger(Number(item))))) return `${input.label}には${input.step === "any" ? "有限の数値" : "整数"}を入力してください。`;
      if (items.some((item) => Number(item) < input.min || Number(item) > input.max)) return `${input.label}は${input.min}〜${input.max}の範囲で入力してください。`;
    }
    return problem.valid && !problem.valid(values) ? "入力値の範囲や組み合わせを確認してください。" : "";
  }

  function inputCode(input, code, values) {
    const match = code.match(/^(int|double|String)(\[\])?\s+(\w+)\s*=/);
    if (!match) return code;
    const [, type, array, name] = match;
    const literal = (value) => type === "String" ? JSON.stringify(String(value)) : String(Number(value));
    const value = values[input.id];
    return `${type}${array || ""} ${name} = ${array ? `{${list(value).map(literal).join(", ")}}` : literal(value)};`;
  }

  function javaRows(problem, nodes, values) {
    const rows = [];
    const emit = (node, line, depth, title, description) => {
      const code = codeFor(problem, node.id);
      rows.push([node.id, "    ".repeat(depth) + line, title || code.title, description || code.description]);
    };
    function visit(sequence, depth) {
      sequence.forEach((node) => {
        const block = problem.blockMap.get(node.id), code = codeFor(problem, node.id);
        let line = code.line;
        if (block.type === "input") line = inputCode(problem.inputs.find((input) => input.id === variable(problem, node.id)), line, values);
        emit(node, line, depth);
        if (block.type === "loop") {
          (code.prefix || []).forEach((prefix) => emit(node, prefix, depth + 1));
          visit(node.children || [], depth + 1);
          emit(node, "}", depth, "繰り返しの終わり", "ここで繰り返しのまとまりが終わり、継続条件の確認へ戻ります。");
        } else if (block.type === "decision") {
          if (line.startsWith("switch")) {
            Object.entries(node.branches).forEach(([name, branch]) => {
              const value = /^\d+$/.test(name) ? name : JSON.stringify(name);
              emit(node, name === "default" ? "default:" : `case ${value}:`, depth + 1, "分岐先", "値が一致する場合の処理へ進みます。defaultはどれにも一致しない場合です。");
              visit(branch, depth + 2);
              emit(node, "break;", depth + 2, "switchを終了する", "選択した処理を終え、switchの後へ進みます。");
            });
          } else {
            visit(node.branches?.true || [], depth + 1);
            if (node.branches?.false?.length) {
              emit(node, "} else {", depth, "偽の経路", "条件が成り立たなかった場合はこちらへ進みます。");
              visit(node.branches.false, depth + 1);
            }
          }
          emit(node, "}", depth, "分岐の終わり", "ここで条件分岐のまとまりが終わります。");
        } else {
          (code.extra || []).forEach((extra) => emit(node, extra, depth));
        }
      });
    }
    visit(nodes, 0);
    return rows;
  }

  function configure(problem) {
    problem.blockMap = new Map([...problem.correct, ...problem.dummies].map((block) => [block.id, block]));
    problem.aliases = {};
    const labels = new Map();
    problem.blockMap.forEach((block) => {
      const key = `${block.type}:${block.label}`;
      if (labels.has(key)) problem.aliases[block.id] = labels.get(key); else labels.set(key, block.id);
    });
    if (problem.id === "evenSum") problem.aliases.addAll = "addEven";
    if (problem.id === "premiumStats") Object.assign(problem.aliases, { addAllStatsPremium: "addStatsPremium", incrementStatsAlways: "incrementStatsCount" });
    problem.blockCode = {};
    problem.correct.forEach((block) => {
      const source = problem.code.filter(([id]) => id === block.id);
      const meaningful = source.find(([, line]) => {
        if (block.type === "decision") return /\b(if|switch)\s*\(/.test(line);
        return !/^\s*}\s*(else\s*{\s*)?$/.test(line);
      });
      if (!meaningful) throw new Error(`Javaの対応がありません: ${problem.id}/${block.id}`);
      let line = meaningful[1].trim().replace(/^}\s*else\s+if/, "if");
      line = line.replace(/^}\s*else\s*{\s*(.*?)\s*}$/, "$1").replace(/^case\s+(?:"[^"]*"|\d+)\s*:\s*|^default:\s*/, "").replace(/\s*break;$/, "");
      if (block.id === "breakEligibleLoop") line = "break;";
      const statements = block.type === "calculation" && line.startsWith("int temporary") ? line.split(/;\s*/).filter(Boolean).map((part) => `${part};`) : [line];
      problem.blockCode[block.id] = { line: statements[0], extra: statements.slice(1), title: block.type === "decision" && line.startsWith("if") ? "条件分岐（if）" : meaningful[2], description: meaningful[3] };
    });
    problem.solutions = [clone(problem.expected)];
    const alternative = (edit) => { const next = clone(problem.expected); edit(next); problem.solutions.push(next); };
    const code = (id, line, prefix = []) => { problem.blockCode[id] = { line, prefix, title: "別の組み立て方", description: problem.blockMap.get(id).label }; };
    if (problem.id === "sum") {
      code("loopFromZero", "for (int i = 0; i <= n; i++) {");
      code("initializeSumN", "sum = n;");
      code("loopUntilBeforeN", "for (int i = 1; i < n; i++) {");
      alternative((s) => { s.root[3] = "loopFromZero"; s.nested = { loopFromZero: ["addCurrent"] }; });
      alternative((s) => { s.root[2] = "initializeSumN"; s.root[3] = "loopUntilBeforeN"; s.nested = { loopUntilBeforeN: ["addCurrent"] }; });
    }
    if (problem.id === "evenSum") {
      code("loopOnlyEven", "for (int i = 0; i <= n; i += 2) {");
      code("checkOddInLoop", "if (i % 2 == 1) {");
      alternative((s) => { s.root[3] = "loopOnlyEven"; s.nested = { loopOnlyEven: ["addEven"] }; s.branches = {}; });
      alternative((s) => { s.root[3] = "loopOnlyEven"; s.nested = { loopOnlyEven: ["checkEvenInLoop"] }; });
      alternative((s) => { s.nested.loopEven = ["checkOddInLoop"]; s.branches = { checkOddInLoop: { true: [], false: ["addEven"] } }; });
    }
    if (problem.id === "fizzBuzz") alternative((s) => {
      s.branches = { checkFifteen: { true: ["outputFizzBuzz"], false: ["checkFive"] }, checkFive: { true: ["outputBuzz"], false: ["checkThree"] }, checkThree: { true: ["outputFizz"], false: ["outputFizzNumber"] } };
    });
    if (problem.id === "arraySum") {
      code("loopPremiumsReverse", "for (int i = premiums.length - 1; i >= 0; i--) {", ["int premium = premiums[i];"]);
      alternative((s) => { s.root[3] = "loopPremiumsReverse"; s.nested = { loopPremiumsReverse: ["addPremium"] }; });
    }
    if (problem.id === "premiumMax") {
      code("initializeMaxZeroPremium", "maxPremium = 0;");
      code("checkLowerPremium", "if (premium < maxPremium) {");
      alternative((s) => { s.root[2] = "initializeMaxZeroPremium"; });
      for (const initial of ["initializeMaxPremium", "initializeMaxZeroPremium"]) alternative((s) => {
        s.root[2] = initial; s.nested.loopMaxPremiums = ["checkLowerPremium"]; s.branches = { checkLowerPremium: { true: [], false: ["updateMaxPremium"] } };
      });
    }
    if (problem.id === "thresholdCount") {
      code("checkBelowThreshold", "if (premium < threshold) {");
      alternative((s) => { s.nested.loopThresholdPremiums = ["checkBelowThreshold"]; s.branches = { checkBelowThreshold: { true: [], false: ["incrementCount"] } }; });
    }
    if (problem.id === "firstEligible") {
      code("checkMinorAge", "if (age < 18) {");
      alternative((s) => { s.nested.loopAges = ["checkMinorAge"]; s.branches = { checkMinorAge: { true: [], false: ["setEligibleAge", "breakEligibleLoop"] } }; });
    }
    if (problem.id === "premiumStats") problem.independent = [["initializeStatsCount", "initializeStatsSum"], ["incrementStatsCount", "addStatsPremium"]];
    // 同文の候補を重複表示しない。分岐内で2回使う正解ブロックは残す。
    const seen = new Set(problem.correct.map((b) => `${b.type}:${b.label}`));
    problem.paletteBlocks = [...problem.correct, ...problem.dummies.filter((b) => { const key = `${b.type}:${b.label}`; if (seen.has(key)) return false; seen.add(key); return true; })];
    const money = new Set(["basePremium", "discount", "monthlyPremium", "first", "second", "threshold"]);
    problem.inputs.forEach((input) => {
      if (["premiums", "ages", "policyNumbers", "statuses"].includes(input.id)) input.listType = ["premiums", "ages"].includes(input.id) ? "integer" : "text";
      if (input.type === "number" || input.listType === "integer") {
        input.step = ["triangle", "bmi"].includes(problem.id) ? "any" : "1";
        input.min ??= money.has(input.id) || input.listType === "integer" || ["age", "paidMonths", "policyYears"].includes(input.id) ? 0 : -1000000;
        input.max ??= ["age", "ages"].includes(input.id) ? 150 : input.step === "any" ? 10000 : 1000000;
        if (input.step === "any") input.min = input.id === "heightCm" ? 1 : 0.000001;
        if (input.id === "year") { input.min = 1; input.max = 9999; }
        if (input.id === "paidMonths") input.max = 1200;
        if (input.id === "policyYears") input.max = 100;
      }
    });
    const limits = problem.inputs.filter((i) => i.type === "number" || i.listType).map((i) => i.listType === "text" ? `${i.label}：1〜20個` : `${i.label}：${i.min}〜${i.max}の${i.step === "any" ? "数値（小数可）" : "整数"}${i.listType ? "を1〜20個" : ""}`);
    problem.inputNote += ` ${limits.join("。")}${limits.length ? "。" : ""}`;
  }

  // 別解で処理順が変わる問題は、その組み立てに沿って途中経過も計算する。
  function execute(problem, values, nodes = tree(problem.expected)) {
    const ids = new Set(flatten(nodes).map((node) => node.id));
    if (problem.id === "sum") {
      const n = Number(values.n), start = ids.has("loopFromZero") ? 0 : 1, end = ids.has("loopUntilBeforeN") ? n - 1 : n;
      let sum = ids.has("initializeSumN") ? n : 0;
      const trace = [["初期状態", "-", sum]];
      for (let i = start; i <= end; i += 1) { sum += i; trace.push([`${i - start + 1}回目`, i, sum]); }
      return { output: sum, traceColumns: ["繰り返し回数", "ループカウンタ変数 i", "sum の値"], trace };
    }
    if (problem.id === "evenSum" && ids.has("loopOnlyEven")) {
      let sum = 0;
      const trace = [["初期状態", "-", sum]];
      for (let i = 0; i <= Number(values.n); i += 2) { sum += i; trace.push([i, "加算する", sum]); }
      return { output: sum, traceColumns: ["ループカウンタ変数 i", "処理", "sumの値"], trace };
    }
    if (problem.id === "arraySum" && ids.has("loopPremiumsReverse")) {
      const premiums = list(values.premiums).map(Number), trace = [];
      let sum = 0;
      for (let i = premiums.length - 1; i >= 0; i -= 1) { sum += premiums[i]; trace.push([i, premiums[i], sum]); }
      return { output: sum, traceColumns: ["ループカウンタ変数 i（添字）", "保険料", "sumの値"], trace };
    }
    return problem.execute(values);
  }

  return { configure, tree, flatten, assess, javaRows, inputError, execute, list };
})();
