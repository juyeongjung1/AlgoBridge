// 実行: AUDIT_MODULESでPlaywrightを指定し、node tests/diagnostics-browser.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = process.env.AUDIT_MODULES ? require(path.join(process.env.AUDIT_MODULES,"playwright")) : require("playwright");
const { repo } = require("./load-problems.cjs");
const temp = fs.mkdtempSync(path.join(os.tmpdir(),"algobridge-diagnostics-"));
const errors = [];
let checks = 0;
(async () => {
  const browser = await chromium.launch({channel:"msedge",headless:true});
  try {
    const context = await browser.newContext({viewport:{width:1600,height:1000},reducedMotion:"no-preference"});
    await context.route("https://www.trainocate.co.jp/top_common/images/trainocate_logo.png",route=>route.abort());
    const page = await context.newPage();
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(pathToFileURL(path.join(repo,"index.html")).href);
    for (let index=0; index<30; index++) {
      const result = await page.evaluate(index=>{
        selectProblem(index); isInstructorMode=false;
        const nodes=window.AlgoEngine.tree(currentProblem.expected);
        restore(nodes); run(); $("#success-confirm-button").click();
        const correct = !assemblyList.querySelector(".is-diagnostic,.diagnostic-target") && $("#diagnostic-summary").hidden;
        restore([...nodes,{id:"dummyInput"},{id:"dummyOutput"}]);
        const before=JSON.stringify(snapshot()); run();
        const ids=blocks().filter(b=>b.classList.contains("is-diagnostic")).map(b=>b.dataset.blockId).sort();
        const frames=[...assemblyList.querySelectorAll(".block-diagnostic-frame")];
        const pulse=frames.every(n=>getComputedStyle(n).animationName==="diagnostic-pulse" && getComputedStyle(n).borderTopWidth==="3px");
        const shape=assemblyList.querySelector('[data-block-id="dummyOutput"]');
        const outputShapePreserved=getComputedStyle(shape).clipPath==="none" && getComputedStyle(shape.querySelector(":scope > .placed-copy")).clipPath.startsWith("polygon");
        const after=JSON.stringify(snapshot());
        const notes=assemblyList.querySelectorAll(".diagnostic-target");
        const focused=document.activeElement===notes[0];
        $("#diagnostic-summary .diagnostic-next").click();
        const nextFocused=document.activeElement===notes[1];
        restore(nodes.slice(0,-1)); run();
        const missing=assemblyList.querySelectorAll(".diagnostic-gap").length>0 && !assemblyList.querySelector(".is-diagnostic");
        return {id:currentProblem.id,correct,ids,pulse,outputShapePreserved,same:before===after,focused,nextFocused,missing};
      },index);
      checks++;
      assert.ok(result.correct && result.pulse && result.outputShapePreserved && result.same && result.focused && result.nextFocused && result.missing,JSON.stringify(result));
      assert.deepEqual(result.ids,["dummyInput","dummyOutput"]);
    }
    await page.emulateMedia({reducedMotion:"reduce"});
    await page.evaluate(()=>{
      selectProblem(problems.findIndex(p=>p.id==="claimReception"));
      const nodes=window.AlgoEngine.tree(currentProblem.expected);
      const n=window.AlgoEngine.flatten(nodes).find(n=>n.id==="checkClaimAge");
      n.id="claimReceptionExtraChoice5";
      [n.branches.true,n.branches.false]=[n.branches.false,n.branches.true];
      restore(nodes); run();
    });
    const deep = await page.evaluate(()=>{
      const parent=assemblyList.querySelector('[data-block-id="claimReceptionExtraChoice5"]');
      const frame=parent.querySelector(":scope > .block-diagnostic-frame").getBoundingClientRect();
      const copy=parent.querySelector(":scope > .placed-copy").getBoundingClientRect();
      const body=parent.querySelector(":scope > .branch-bodies").getBoundingClientRect();
      return {ids:blocks().filter(b=>b.classList.contains("is-diagnostic")).map(b=>b.dataset.blockId).sort(), frameHeight:frame.height, copyHeight:copy.height, bodyTop:body.top, frameBottom:frame.bottom, reduced:getComputedStyle(parent.querySelector(":scope > .block-diagnostic-frame")).animationName};
    });
    checks++;
    assert.deepEqual(deep.ids,["claimReceptionExtraChoice5","outputClaimAccept","outputClaimAgeGuide"]);
    assert.ok(Math.abs(deep.frameHeight-deep.copyHeight)<=1 && deep.frameBottom<deep.bodyTop);
    assert.equal(deep.reduced,"none");
    await page.locator(".build-panel").screenshot({path:path.join(temp,"deep-branch.png")});
    await page.evaluate(()=>{
      selectProblem(problems.findIndex(p=>p.id==="bubbleSort"));
      const nodes=window.AlgoEngine.tree(currentProblem.expected);
      window.AlgoEngine.flatten(nodes).find(n=>n.id==="checkSortPair").id="bubbleSortExtraChoice1";
      restore(nodes); run();
    });
    checks++;
    assert.deepEqual(await page.evaluate(()=>blocks().filter(b=>b.classList.contains("is-diagnostic")).map(b=>b.dataset.blockId)),["bubbleSortExtraChoice1"]);
    await page.locator(".build-panel").screenshot({path:path.join(temp,"nested-loop.png")});
    const dragAndUndo=await page.evaluate(()=>{
      const child=assemblyList.querySelector('[data-block-id="bubbleSortExtraChoice1"]');
      child.dispatchEvent(new DragEvent("dragstart",{bubbles:true,dataTransfer:new DataTransfer()}));
      const id=dragged.id; palette.dispatchEvent(new DragEvent("drop",{bubbles:true,cancelable:true}));
      const cleared=!assemblyList.querySelector(".is-diagnostic,.diagnostic-target") && $("#diagnostic-summary").hidden;
      $("#undo-button").click();
      return {id,cleared,restored:Boolean(assemblyList.querySelector('[data-block-id="bubbleSortExtraChoice1"]')),noOldMarks:!assemblyList.querySelector(".is-diagnostic,.diagnostic-target")};
    });
    checks++;
    assert.ok(dragAndUndo.id==="bubbleSortExtraChoice1" && dragAndUndo.cleared && dragAndUndo.restored && dragAndUndo.noOldMarks);
    const loopAndAssignment=await page.evaluate(()=>{
      selectProblem(problems.findIndex(p=>p.id==="sum"));
      const nodes=window.AlgoEngine.tree(currentProblem.expected);
      nodes.find(n=>n.id==="initializeSum").id="initializeSumOne";
      nodes.find(n=>n.id==="loop").id="loopByTwo";
      restore(nodes);run();
      const loop=assemblyList.querySelector('[data-block-id="loopByTwo"]');
      const frame=loop.querySelector(":scope > .block-diagnostic-frame").getBoundingClientRect();
      const copy=loop.querySelector(":scope > .placed-copy").getBoundingClientRect();
      return {ids:blocks().filter(b=>b.classList.contains("is-diagnostic")).map(b=>b.dataset.blockId).sort(), sameHeight:Math.abs(frame.height-copy.height)<=1, bodyBelow:frame.bottom<loop.querySelector(":scope > .loop-body").getBoundingClientRect().top};
    });
    checks++;
    assert.deepEqual(loopAndAssignment.ids,["initializeSumOne","loopByTwo"]);
    assert.ok(loopAndAssignment.sameHeight && loopAndAssignment.bodyBelow);
    const missing=await page.evaluate(()=>{
      selectProblem(problems.findIndex(p=>p.id==="greeting"));
      const nodes=window.AlgoEngine.tree(currentProblem.expected);
      window.AlgoEngine.flatten(nodes).find(n=>n.id==="checkEvening").branches.false=[];
      restore(nodes);run();
      const parent=assemblyList.querySelector('[data-block-id="checkEvening"]');
      return {count:assemblyList.querySelectorAll(".diagnostic-gap").length,rightLevel:Boolean(parent.querySelector(':scope > .branch-bodies > .branch-body[data-branch="false"] > .diagnostic-gap')),blocks:assemblyList.querySelectorAll(".is-diagnostic").length};
    });
    checks++;
    assert.equal(missing.count,1); assert.ok(missing.rightLevel); assert.equal(missing.blocks,0);
    const reRun=await page.evaluate(()=>{
      selectProblem(problems.findIndex(p=>p.id==="bmi"));
      const nodes=window.AlgoEngine.tree(currentProblem.expected);
      const index=nodes.findIndex(n=>n.id==="declareBmi"), [declaration]=nodes.splice(index,1);
      nodes.splice(nodes.findIndex(n=>n.id==="calculateBmi")+1,0,declaration);
      restore(nodes);run();
      const ids=blocks().filter(b=>b.classList.contains("is-diagnostic")).map(b=>b.dataset.blockId).sort();
      restore(window.AlgoEngine.tree(currentProblem.expected));run();
      const good=!$("#success-modal").hidden && !assemblyList.querySelector(".is-diagnostic,.diagnostic-target");
      $("#success-confirm-button").click();
      return {ids,good};
    });
    checks++;
    assert.deepEqual(reRun.ids,["calculateBmi","declareBmi"]); assert.ok(reRun.good);
    await page.evaluate(()=>{restore([...window.AlgoEngine.tree(currentProblem.expected),{id:"dummyInput"}]);run();});
    await page.locator("#input-weightKg").fill("");
    checks++;
    assert.ok(await page.evaluate(()=>!assemblyList.querySelector(".is-diagnostic,.diagnostic-target") && $("#diagnostic-summary").hidden));
    await page.locator("#run-button").click();
    assert.ok(await page.evaluate(()=>!assemblyList.querySelector(".is-diagnostic") && !feedback.hidden));
    const cleanup=await page.evaluate(()=>{
      $("#input-weightKg").value="65";run();
      $("#reset-button").click();$("#reset-confirm-button").click();
      const reset=!assemblyList.querySelector(".is-diagnostic,.diagnostic-target");
      restore([...window.AlgoEngine.tree(currentProblem.expected),{id:"dummyInput"}]);run();
      isInstructorMode=true;run();
      return {reset,instructor:!assemblyList.querySelector(".is-diagnostic") && $("#diagnostic-summary").hidden && !resultPanel.hidden};
    });
    checks++;assert.ok(cleanup.reset && cleanup.instructor);
    const switched=await page.evaluate(()=>{isInstructorMode=false;run();selectProblem(0);return !assemblyList.querySelector(".is-diagnostic,.diagnostic-target") && $("#diagnostic-summary").hidden;});
    checks++;assert.ok(switched);
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({問題数:30,診断画面の検証:checks,errors,検証画像:temp},null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
