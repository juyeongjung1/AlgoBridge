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
  // 機能検証を外部ロゴ配信の応答時間に依存させない。
  await context.route("https://www.trainocate.co.jp/top_common/images/trainocate_logo.png", route=>route.abort());
  const page = await context.newPage();
  const preview = await context.newPage();
  await preview.addStyleTag({path:path.join(repo,"styles.css")});
  await preview.addStyleTag({content:"body {min-width:0; height:auto; overflow:visible; margin:0; padding:0; background:white;} .flowchart {background:white;}"});
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(repo, "index.html")).href);
  assert.deepEqual(await page.evaluate(() => problems.slice(0,9).map(p=>p.id)), ["name","triangle","billing","policyFormat","bmi","max","eligibility","contractStatus","evenOdd"]);
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
      const description = $("#problem-description");
      const descriptionOverflow = description.scrollWidth > description.clientWidth + 1;
      const headingMatches = $("#problem-heading").textContent === `問題 ${problemNumber(index)}：${currentProblem.title}`;
      const paletteMatches = palette.querySelectorAll(".source-block").length === currentProblem.paletteBlocks.length;
      const brokenDecisions = currentProblem.paletteBlocks.filter(b=>b.type === "decision" && b.id.includes("ExtraChoice")).filter(b=>createBlock(b.id).querySelectorAll(":scope > .branch-bodies > .branch-body").length !== (b.branches?.length || 2)).map(b=>b.id);
      return { index:index+1, id:currentProblem.id, valid, popup, open:!resultPanel.hidden, missing, codeMissing, descriptionOverflow, headingMatches, paletteMatches, brokenDecisions, narrowest:widths.length ? Math.min(...widths) : null, output:$("#output-value").textContent };
    }, index);
    results.push(result);
    if (!result.valid || !result.popup || !result.open || result.missing.length || result.codeMissing.length || result.descriptionOverflow || !result.headingMatches || !result.paletteMatches || result.brokenDecisions.length || (result.narrowest !== null && result.narrowest < 180)) errors.push(JSON.stringify(result));
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
    await page.evaluate(() => selectProblem(problems.findIndex(p=>p.id === "bmi")));
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
    await page.evaluate(() => { selectProblem(12); history = []; resetWorkspace(false); completedProblems = {}; $("#source-scroll").scrollTop = 0; });
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
  await test("候補クリックは案内のみ、分岐内へ実際にドロップできる", async () => {
    const id = await page.evaluate(() => {
      selectProblem(6);
      const nodes = window.AlgoEngine.tree(currentProblem.expected);
      const decision = nodes.find(node => node.branches?.true?.length);
      const [child] = decision.branches.true.splice(0);
      restore(nodes);
      return child.id;
    });
    try {
      const candidate = page.locator(`.source-block[data-block-id="${id}"]`);
      await candidate.click();
      assert.equal(await page.locator(`#assembly-list [data-block-id="${id}"]`).count(), 0);
      assert.equal(await page.locator("#drag-guide").isVisible(), true);
      assert.match(await page.locator("#drag-guide").innerText(), /ドラッグ.*内側の点線枠/);
      const branch = page.locator("#assembly-list .branch-body[data-branch=true]");
      await candidate.dragTo(branch, {timeout:8000});
      assert.equal(await branch.locator(`:scope > [data-block-id="${id}"]`).count(), 1);
      assert.equal(await page.locator("#drag-guide").isVisible(), false);
      assert.equal(await page.evaluate(() => validateAssembly()), true);
    } finally { await page.evaluate(() => selectProblem(12)); }
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
  await test("問題文と次の問題ボタンは候補をスクロールしても固定", async () => {
    const initialViewport = page.viewportSize();
    try {
      await page.setViewportSize({width:1280,height:800});
      const state = await page.evaluate(() => {
        selectProblem(29);
        const top = (selector) => $(selector).getBoundingClientRect().top;
        const before = [top("#problem-description"), top("#next-problem-button"), top(".source-block")];
        const scroll = $("#source-scroll");
        scroll.scrollTop = scroll.scrollHeight;
        const after = [top("#problem-description"), top("#next-problem-button"), top(".source-block")];
        const statement = $(".problem-statement");
        const withinPanel = statement.getBoundingClientRect().bottom <= scroll.getBoundingClientRect().top;
        return {before,after,scrolled:scroll.scrollTop > 0,withinPanel};
      });
      assert.ok(state.scrolled && state.withinPanel);
      assert.deepEqual(state.before.slice(0, 2), state.after.slice(0, 2));
      assert.ok(state.after[2] < state.before[2]);
    } finally { await page.setViewportSize(initialViewport); }
  });
  await test("正解後の次ボタン強調・正解済みの問題リスト表示", async () => {
    await page.evaluate(() => {
      isInstructorMode = false; completedProblems = {}; renderProblem();
      selectProblem(2);
    });
    const next = page.locator("#next-problem-button");
    const item = page.locator("#problem-list-items .problem-list-item").nth(2);
    assert.equal(await next.evaluate(n => n.classList.contains("is-next-recommended")), false);
    await page.evaluate(() => { restore(window.AlgoEngine.tree(currentProblem.expected)); run(); });
    assert.match(await page.locator("#success-navigation-note").innerText(), /次の問題/);
    await page.locator("#success-confirm-button").click();
    assert.equal(await next.evaluate(n => n.classList.contains("is-next-recommended")), true);
    assert.equal(await page.locator("#next-problem-guide").isVisible(), true);
    await page.locator("#problem-list-items").evaluate(n => { n.scrollTop = n.scrollHeight; });
    await page.locator("#problem-drawer-tab").click();
    assert.ok(await item.evaluate(n => n.classList.contains("is-completed")));
    assert.match(await item.innerText(), /正解済み/);
    assert.ok(await item.evaluate(n => {
      const itemBounds = n.getBoundingClientRect(), listBounds = n.parentElement.getBoundingClientRect();
      return itemBounds.top >= listBounds.top && itemBounds.bottom <= listBounds.bottom;
    }));
    await page.locator("#problem-drawer-close").click();
    await next.click();
    assert.match(await page.locator("#problem-heading").innerText(), /証券番号/);
    assert.equal(await next.evaluate(n => n.classList.contains("is-next-recommended")), false);
    await page.reload();
    assert.ok(await item.evaluate(n => n.classList.contains("is-completed")));
    await page.locator("#reset-completion-button").click();
    await page.locator("#completion-reset-confirm-button").click();
    assert.equal(await item.evaluate(n => n.classList.contains("is-completed")), false);
    await page.evaluate(() => { selectProblem(29); restore(window.AlgoEngine.tree(currentProblem.expected)); run(); });
    assert.equal(await next.isEnabled(), false);
    assert.match(await page.locator("#success-navigation-note").innerText(), /問題リスト/);
    await page.locator("#success-confirm-button").click();
  });
  await test("変数名の和訳と手操作入力の形が候補・配置・流れ図で一致", async () => {
    const state = await page.evaluate(() => {
      selectProblem(19);
      restore(window.AlgoEngine.tree(currentProblem.expected)); run();
      const input = '[data-block-id="inputMaxPremiums"]';
      const id = "loopMaxPremiums";
      return {
        labels: [`.source-block[data-block-id="${id}"] strong`, `.placed-block[data-block-id="${id}"] strong`, `[data-flow-block="${id}"].loop-start-node`].map(selector => $(selector).textContent),
        shapes: [
          getComputedStyle($(".source-block" + input)).clipPath,
          getComputedStyle($(".placed-block" + input + " > .placed-copy"), "::before").clipPath,
          getComputedStyle($('[data-flow-block="inputMaxPremiums"]')).clipPath,
        ],
        existingNote: formatLabel("i（添字）"),
        unchangedWord: formatLabel("premiumTotal"),
      };
    });
    assert.ok(state.labels.every(label => label.includes("premiums（保険料一覧）") && label.includes("premium（1件分の保険料）")));
    assert.equal(new Set(state.shapes).size, 1);
    assert.match(state.shapes[0], /^polygon\(0(?:px|%) 12px, 100% 0(?:px|%), 100% 100%, 0(?:px|%) 100%\)$/);
    assert.match(state.existingNote, />i<\/span>（添字）$/);
    assert.equal(state.unchangedWord, "premiumTotal");
  });
  await browser.close();
  console.log(JSON.stringify({問題数:results.length,操作検証:checks.length,結果:results,errors,画面検証画像:temp},null,2));
  process.exitCode = errors.length ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode=1; });
