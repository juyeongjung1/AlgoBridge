// 実行: NODE_PATHにPlaywrightを用意し、node tests/browser-regression.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const { pathToFileURL } = require("node:url");
const { chromium } = process.env.AUDIT_MODULES ? require(path.join(process.env.AUDIT_MODULES, "playwright")) : require("playwright");
const { repo } = require("./load-problems.cjs");
const errors = [], results = [], checks = [];
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "algobridge-browser-"));
(async () => {
  const browser = await chromium.launch({ channel:"msedge", headless:true });
  const context = await browser.newContext({viewport:{width:1600,height:1000}});
  const page = await context.newPage();
  const preview = await context.newPage();
  await preview.addStyleTag({path:path.join(repo,"styles.css")});
  await preview.addStyleTag({content:"body {min-width:0; height:auto; overflow:visible; margin:0; padding:0; background:white;} .flowchart {background:white;}"});
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(repo, "index.html")).href);
  for (let index = 0; index < 30; index++) {
    const result = await page.evaluate((index) => {
      selectProblem(index); restore(window.AlgoEngine.tree(currentProblem.expected));
      const valid = validateAssembly(); run();
      const popup = !$("#success-modal").hidden;
      $("#success-confirm-button").click();
      const flowIds = [...document.querySelectorAll("[data-flow-block]")].map(n => n.dataset.flowBlock);
      const missing = expectedIds().filter(id => !flowIds.includes(id));
      const widths = [...document.querySelectorAll(".flow-decision-branch .flow-node")].map(n => n.getBoundingClientRect().width);
      const codeIds = [...document.querySelectorAll("[data-code-block]")].map(n => n.dataset.codeBlock);
      const codeMissing = expectedIds().filter(id => !codeIds.includes(id));
      return { index:index+1, id:currentProblem.id, valid, popup, open:!resultPanel.hidden, missing, codeMissing, narrowest:widths.length ? Math.min(...widths) : null, output:$("#output-value").textContent };
    }, index);
    results.push(result);
    if (!result.valid || !result.popup || !result.open || result.missing.length || result.codeMissing.length || (result.narrowest !== null && result.narrowest < 180)) errors.push(JSON.stringify(result));
    if ([9,14,22,27,28,29].includes(index)) {
      // 実画面と同じDOM・幅・CSSを、スクロールで切れない検証用ページに複製する。
      const diagram = await page.locator("#flowchart").evaluate(node => ({html:node.outerHTML,width:node.getBoundingClientRect().width}));
      await preview.evaluate(({html,width}) => { document.body.innerHTML=html; document.querySelector("#flowchart").style.width=width+"px"; }, diagram);
      await preview.locator("#flowchart").screenshot({path:path.join(temp, result.id + ".png")});
    }
    await page.evaluate(() => closeResult());
  }
  async function test(label, fn) { try { await fn(); checks.push(label); } catch (error) { errors.push(`${label}: ${error.message}`); } }
  await test("深い分岐と問題29・30の折り畳み", async () => {
    const sizes = await page.evaluate(() => { openResult(); const small = buildPanel.getBoundingClientRect().width; closeResult(); return {small,wide:buildPanel.getBoundingClientRect().width,hidden:resultPanel.hidden}; });
    // 結果は重ねて開くパネル。閉じると枠が消え、組立て幅も維持する。
    assert.ok(sizes.hidden && sizes.wide >= sizes.small);
  });
  await test("入力変更がJavaに反映され、古い結果を消す", async () => {
    await page.evaluate(() => selectProblem(2));
    await page.locator("#input-weightKg").fill("80");
    const state = await page.evaluate(() => ({expected:expectedOutputValue.textContent, code:$("#java-code").textContent, hidden:resultPanel.hidden}));
    assert.equal(state.expected, "27.7"); assert.ok(state.code.includes("double weightKg = 80;")); assert.ok(state.hidden);
  });
  await test("不足・余分・順序のフィードバックを区別", async () => {
    const messages = await page.evaluate(() => {
      selectProblem(12); const base = window.AlgoEngine.tree(currentProblem.expected);
      restore(base.slice(0,-1)); const missing = feedbackText();
      restore([...base,{id:"dummyInput"}]); const extra = feedbackText();
      restore([...base.slice(1),base[0]]); const order = feedbackText();
      return {missing,extra,order};
    });
    assert.ok(messages.missing.includes("まだ揃って")); assert.ok(messages.extra.includes("余分")); assert.ok(messages.order.includes("実行順序"));
  });
  await test("パレットから実際にドラッグ追加→取り消し", async () => {
    await page.evaluate(() => { selectProblem(12); history = []; resetWorkspace(false); completedProblems = {}; document.querySelector(".source-panel").scrollTop = 0; });
    await page.locator('.source-block[data-block-id="inputN"]').dragTo(page.locator("#assembly-list"), {targetPosition:{x:80,y:60}});
    assert.equal(await page.locator('#assembly-list > [data-block-id="inputN"]').count(), 1);
    assert.equal(await page.locator("#undo-button").isEnabled(), true);
    await page.locator("#undo-button").click();
    assert.equal(await page.locator("#assembly-list .placed-block").count(), 0);
  });
  await test("入れ子の子だけを選択し、候補へ戻す→取り消し", async () => {
    const state = await page.evaluate(() => {
      restore(window.AlgoEngine.tree(currentProblem.expected)); history = [];
      const child = assemblyList.querySelector('[data-block-id="addCurrent"]');
      child.dispatchEvent(new DragEvent("dragstart",{bubbles:true,dataTransfer:new DataTransfer()}));
      const draggedId = dragged.id;
      palette.dispatchEvent(new DragEvent("drop",{bubbles:true,cancelable:true}));
      const after = snapshot(); $("#undo-button").click();
      return {draggedId,after,valid:validateAssembly(),history:history.length};
    });
    assert.equal(state.draggedId,"addCurrent"); assert.ok(state.after.some(n=>n.id==="loop")); assert.ok(state.valid); assert.equal(state.history,0);
  });
  await test("自分自身の内側へドロップしても消失しない", async () => {
    const state = await page.evaluate(() => {
      const before = JSON.stringify(snapshot()), loop = assemblyList.querySelector('[data-block-id="loop"]');
      loop.dispatchEvent(new DragEvent("dragstart",{bubbles:true,dataTransfer:new DataTransfer()}));
      loop.querySelector(".loop-body").dispatchEvent(new DragEvent("drop",{bubbles:true,cancelable:true}));
      endDrag(); return before === JSON.stringify(snapshot());
    }); assert.ok(state);
  });
  await test("二重ループでも子がドラッグ対象", async () => {
    const draggedId = await page.evaluate(() => { selectProblem(27); restore(window.AlgoEngine.tree(currentProblem.expected)); assemblyList.querySelector('[data-block-id="swapSortPair"]').dispatchEvent(new DragEvent("dragstart",{bubbles:true,dataTransfer:new DataTransfer()})); const id = dragged.id; endDrag(); return id; });
    assert.equal(draggedId,"swapSortPair");
  });
  await test("ドロップ領域間の移動は履歴1件・取り消しで元に戻る", async () => {
    const state = await page.evaluate(() => {
      selectProblem(12); restore(window.AlgoEngine.tree(currentProblem.expected)); history=[];
      const child = assemblyList.querySelector('[data-block-id="addCurrent"]');
      child.dispatchEvent(new DragEvent("dragstart",{bubbles:true,dataTransfer:new DataTransfer()}));
      assemblyList.querySelector(":scope > .drop-space").dispatchEvent(new DragEvent("drop",{bubbles:true,cancelable:true}));
      const moved = directIds(assemblyList).includes("addCurrent"), count = history.length;
      $("#undo-button").click(); return {moved,count,valid:validateAssembly()};
    }); assert.ok(state.moved && state.valid); assert.equal(state.count,1);
  });
  await test("別解と保存済みのJava・トレースが対応", async () => {
    const state = await page.evaluate(() => {
      restore(window.AlgoEngine.tree(currentProblem.solutions[1])); run(); $("#success-confirm-button").click();
      const initialCode = $("#java-code").textContent, trace = $("#trace-body").rows[1].cells[1].textContent;
      selectProblem(13); selectProblem(12);
      return {initialCode,trace,savedCode:$("#java-code").textContent, saved:!resultPanel.hidden};
    });
    assert.ok(state.initialCode.includes("int i = 0")); assert.equal(state.trace,"0"); assert.ok(state.savedCode.includes("int i = 0")); assert.ok(state.saved);
  });
  await test("ブラウザ再読込後も別解の解説を保持", async () => {
    await page.reload();
    const saved = await page.evaluate(() => { selectProblem(12); return $("#java-code").textContent.includes("int i = 0") && !resultPanel.hidden; });
    assert.ok(saved);
  });
  await test("講師モードに成功ポップアップなし", async () => {
    const state = await page.evaluate(() => { isInstructorMode=true; selectProblem(29); resetWorkspace(false); run(); return {modal:$("#success-modal").hidden,open:!resultPanel.hidden}; });
    assert.ok(state.modal && state.open);
  });
  await test("Javaの拡張for・break・caseの説明", async () => {
    const notes = await page.evaluate(() => ({each:syntaxNotes("for (int premium : premiums) {"), stop:syntaxNotes("break;","breakEligibleLoop"), choice:syntaxNotes('case "B":')}));
    assert.ok(notes.each.includes("拡張for文") && !notes.each.includes("for (最初;"));
    assert.ok(notes.stop.includes("ループ外") && !notes.stop.includes("switch"));
    assert.ok(notes.choice.includes("B") && !notes.choice.includes("case 0"));
  });
  await test("breakの出口をフローチャートで明示", async () => {
    const valid = await page.evaluate(() => { selectProblem(22); run(); const link = $(".flow-break-exit"); return link?.getAttribute("href") === "#flow-exit-loopAges" && Boolean($("#flow-exit-loopAges")); });
    assert.ok(valid);
  });
  await test("同文候補の誤答用重複を除去", async () => {
    const duplicates = await page.evaluate(() => problems.flatMap(p => p.paletteBlocks.filter((b,i,all)=>all.findIndex(x=>x.type===b.type && x.label===b.label)!==i && !p.correct.includes(b)).map(b=>p.id+":"+b.id)));
    assert.deepEqual(duplicates,[]);
  });
  await test("旧履歴の範囲外入力から結果を自動表示しない", async () => {
    const state = await page.evaluate(() => {
      completedProblems.arraySum = {inputValues:{premiums:"2000000000,2000000000"}};
      selectProblem(17);
      return {hidden:resultPanel.hidden, expected:expectedOutputValue.textContent, error:window.AlgoEngine.inputError(currentProblem, values())};
    }); assert.ok(state.hidden && state.error); assert.equal(state.expected,"-");
  });
  await browser.close();
  console.log(JSON.stringify({問題数:results.length,操作検証:checks.length,結果:results,errors,画面検証画像:temp},null,2));
  process.exitCode = errors.length ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode=1; });
