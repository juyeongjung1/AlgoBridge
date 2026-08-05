"use strict";

const problems = {
  sumToN: {
    id: "sumToN",
    title: "1から n までの合計",
    initialInput: 3,
    blocks: [
      {
        id: "declareSum",
        type: "declaration",
        label: "合計を格納するための変数 sum を宣言する",
        shortLabel: "変数 sum を宣言",
        hint: "変数を用意する"
      },
      {
        id: "initializeSum",
        type: "assignment",
        label: "変数 sum に、初期値として 0 を設定する",
        shortLabel: "sum に 0 を設定",
        hint: "計算前の値を決める"
      },
      {
        id: "loop",
        type: "loop",
        label: "1 から n まで、順に繰り返す",
        shortLabel: "1 から n まで繰り返す",
        hint: "内側に処理を配置できる",
        acceptsChildren: true
      },
      {
        id: "addCurrent",
        type: "calculation",
        label: "変数 sum に、現在の数値を加える",
        shortLabel: "sum に現在の数値を加える",
        hint: "合計を更新する"
      },
      {
        id: "outputSum",
        type: "output",
        label: "変数 sum の値を出力する",
        shortLabel: "sum の値を出力",
        hint: "計算結果を表示する"
      },
      {
        id: "initializeSumOne",
        type: "assignment",
        label: "変数 sum に、初期値として 1 を設定する",
        shortLabel: "sum に 1 を設定",
        hint: "初期値を設定する"
      },
      {
        id: "loopToNMinusOne",
        type: "loop",
        label: "1 から n - 1 まで、順に繰り返す",
        shortLabel: "1 から n - 1 まで繰り返す",
        hint: "繰り返しの回数を決める",
        acceptsChildren: true
      },
      {
        id: "outputCurrent",
        type: "output",
        label: "現在の数値を、その都度出力する",
        shortLabel: "現在の数値を出力",
        hint: "途中経過を表示する"
      },
      {
        id: "addToN",
        type: "calculation",
        label: "変数 n に、現在の数値を加える",
        shortLabel: "n に現在の数値を加える",
        hint: "入力値を更新する"
      },
      {
        id: "subtractCurrent",
        type: "calculation",
        label: "変数 sum から、現在の数値を引く",
        shortLabel: "sum から現在の数値を引く",
        hint: "値を減らす"
      },
      {
        id: "loopFromZero",
        type: "loop",
        label: "0 から n まで、順に繰り返す",
        shortLabel: "0 から n まで繰り返す",
        hint: "繰り返しの回数を決める",
        acceptsChildren: true
      },
      {
        id: "declareAverage",
        type: "declaration",
        label: "平均を格納するための変数 average を宣言する",
        shortLabel: "変数 average を宣言",
        hint: "別の変数を用意する"
      },
      {
        id: "inputSum",
        type: "input",
        label: "変数 sum の値を入力する",
        shortLabel: "sum の値を入力",
        hint: "値を受け取る"
      },
      {
        id: "outputN",
        type: "output",
        label: "変数 n の値を出力する",
        shortLabel: "n の値を出力",
        hint: "入力値を表示する"
      },
      {
        id: "initializeCurrent",
        type: "assignment",
        label: "現在の数値に、初期値として 0 を設定する",
        shortLabel: "現在の数値に 0 を設定",
        hint: "別の値を初期化する"
      }
    ],
    expected: {
      root: ["declareSum", "initializeSum", "loop", "outputSum"],
      loop: ["addCurrent"]
    },
    execute(input) {
      let sum = 0;
      const trace = [{ iteration: "初期状態", current: "-", sum }];

      for (let i = 1; i <= input; i += 1) {
        sum += i;
        trace.push({ iteration: `${i}回目`, current: i, sum });
      }

      return { output: sum, trace };
    }
  }
};

const currentProblem = problems.sumToN;
const palette = document.querySelector("#block-palette");
const assemblyList = document.querySelector("#assembly-list");
const nInput = document.querySelector("#n-input");
const runButton = document.querySelector("#run-button");
const resetButton = document.querySelector("#reset-button");
const feedback = document.querySelector("#feedback");
const resultContent = document.querySelector("#result-content");
const outputValue = document.querySelector("#output-value");
const traceCaption = document.querySelector("#trace-caption");
const traceBody = document.querySelector("#trace-body");
const flowTab = document.querySelector("#flow-tab");
const javaTab = document.querySelector("#java-tab");
const flowPanel = document.querySelector("#flow-panel");
const javaPanel = document.querySelector("#java-panel");
const codeCorrespondence = document.querySelector("#code-correspondence");
const resultPanel = document.querySelector(".result-panel");
const resultDetails = document.querySelector("#result-details");
const workspace = document.querySelector(".workspace");

let draggedInstanceId = null;
let instanceCounter = 0;

function getBlockDefinition(blockId) {
  return currentProblem.blocks.find((block) => block.id === blockId);
}

function renderPalette() {
  palette.replaceChildren();

  shuffleBlocks(currentProblem.blocks).forEach((block) => {
    const element = document.createElement("button");
    element.type = "button";
    element.className = `source-block block-${block.type}`;
    element.dataset.blockId = block.id;
    element.draggable = true;
    element.innerHTML = `
      <span class="block-handle" aria-hidden="true">⠿</span>
      <span class="block-copy">
        <strong>${block.label}</strong>
        <small>${block.hint}</small>
      </span>
    `;

    element.addEventListener("dragstart", handlePaletteDragStart);
    element.addEventListener("dragend", clearDragState);
    element.addEventListener("click", () => {
      if (!isBlockUsed(block.id)) {
        addBlockToZone(block.id, assemblyList);
      }
    });

    palette.append(element);
  });
}

function shuffleBlocks(blocks) {
  const shuffled = [...blocks];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createPlacedBlock(blockId) {
  const block = getBlockDefinition(blockId);
  const element = document.createElement("div");
  instanceCounter += 1;
  element.className = `placed-block block-${block.type}`;
  element.dataset.blockId = block.id;
  element.dataset.instanceId = `block-${instanceCounter}`;
  element.draggable = true;
  element.innerHTML = `
    <div class="placed-copy">
      <strong>${block.label}</strong>
      <span>${block.hint}</span>
    </div>
    <button class="remove-block" type="button" aria-label="「${block.label}」を取り除く">×</button>
  `;

  if (block.acceptsChildren) {
    const loopBody = document.createElement("div");
    loopBody.className = "loop-body dropzone";
    loopBody.dataset.zone = "loop";
    loopBody.innerHTML = `
      <span class="loop-body-label">繰り返しの中で実行する処理</span>
      <div class="nested-empty" data-empty-for="loop">ここに処理を配置</div>
    `;
    attachDropzoneEvents(loopBody);
    element.append(loopBody);

    const loopEnd = document.createElement("div");
    loopEnd.className = "loop-end-symbol";
    loopEnd.textContent = "繰り返し終了";
    element.append(loopEnd);
  }

  element.addEventListener("dragstart", handlePlacedDragStart);
  element.addEventListener("dragend", clearDragState);
  element.querySelector(".remove-block").addEventListener("click", (event) => {
    event.stopPropagation();
    element.remove();
    updateWorkspaceState();
    clearResults();
  });

  return element;
}

function handlePaletteDragStart(event) {
  const blockId = event.currentTarget.dataset.blockId;
  if (isBlockUsed(blockId)) {
    event.preventDefault();
    return;
  }

  draggedInstanceId = null;
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("text/plain", JSON.stringify({
    source: "palette",
    blockId
  }));
}

function handlePlacedDragStart(event) {
  if (event.target !== event.currentTarget && event.target.closest(".placed-block") !== event.currentTarget) {
    return;
  }

  const element = event.currentTarget;
  draggedInstanceId = element.dataset.instanceId;
  element.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", JSON.stringify({
    source: "workspace",
    blockId: element.dataset.blockId,
    instanceId: draggedInstanceId
  }));
  event.stopPropagation();
}

function clearDragState() {
  document.querySelectorAll(".is-dragging, .is-drag-over").forEach((element) => {
    element.classList.remove("is-dragging", "is-drag-over");
  });
  draggedInstanceId = null;
}

function attachDropzoneEvents(zone) {
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = draggedInstanceId ? "move" : "copy";
    document.querySelectorAll(".dropzone.is-drag-over").forEach((element) => {
      if (element !== zone) {
        element.classList.remove("is-drag-over");
      }
    });
    zone.classList.add("is-drag-over");
  });

  zone.addEventListener("dragleave", (event) => {
    if (!zone.contains(event.relatedTarget)) {
      zone.classList.remove("is-drag-over");
    }
  });

  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    zone.classList.remove("is-drag-over");

    let payload;
    try {
      payload = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch {
      return;
    }

    if (payload.blockId === "loop" && zone.dataset.zone === "loop") {
      showFeedback(["繰り返しブロックは、別の繰り返しの中には配置できません。"]);
      return;
    }

    const draggedElement = payload.source === "workspace"
      ? document.querySelector(`[data-instance-id="${payload.instanceId}"]`)
      : createPlacedBlock(payload.blockId);

    if (!draggedElement || draggedElement.contains(zone)) {
      return;
    }

    const reference = getDropReference(zone, event.clientY, draggedElement);
    zone.insertBefore(draggedElement, reference);
    updateWorkspaceState();
    clearResults();
  });
}

function getDropReference(zone, pointerY, draggedElement) {
  const candidates = [...zone.children].filter((child) => {
    return child.classList.contains("placed-block") && child !== draggedElement;
  });

  return candidates.find((candidate) => {
    const box = candidate.getBoundingClientRect();
    return pointerY < box.top + box.height / 2;
  }) || null;
}

function addBlockToZone(blockId, zone) {
  zone.append(createPlacedBlock(blockId));
  updateWorkspaceState();
  clearResults();
}

function isBlockUsed(blockId) {
  return Boolean(assemblyList.querySelector(`[data-block-id="${blockId}"]`));
}

function directBlockIds(zone) {
  return [...zone.children]
    .filter((child) => child.classList.contains("placed-block"))
    .map((child) => child.dataset.blockId);
}

function updateWorkspaceState() {
  const rootBlocks = directBlockIds(assemblyList);
  const rootEmpty = assemblyList.querySelector(':scope > [data-empty-for="root"]');
  rootEmpty.hidden = rootBlocks.length > 0;

  document.querySelectorAll(".loop-body").forEach((loopBody) => {
    const nestedEmpty = loopBody.querySelector(':scope > [data-empty-for="loop"]');
    nestedEmpty.hidden = directBlockIds(loopBody).length > 0;
  });

  palette.querySelectorAll(".source-block").forEach((sourceBlock) => {
    const used = isBlockUsed(sourceBlock.dataset.blockId);
    sourceBlock.classList.toggle("is-used", used);
    sourceBlock.disabled = used;
    sourceBlock.draggable = !used;
    sourceBlock.setAttribute("aria-disabled", String(used));
  });
}

function validateAssembly() {
  const errors = [];
  const root = directBlockIds(assemblyList);
  const loopElement = assemblyList.querySelector(':scope > [data-block-id="loop"]');
  const loopBody = loopElement?.querySelector(':scope > .loop-body');
  const nested = loopBody ? directBlockIds(loopBody) : [];
  const positions = Object.fromEntries(root.map((id, index) => [id, index]));
  const allPlaced = [...assemblyList.querySelectorAll(".placed-block")].map((item) => item.dataset.blockId);
  const unexpectedBlocks = allPlaced.filter((id) => ![
    ...currentProblem.expected.root,
    ...currentProblem.expected.loop
  ].includes(id));

  if (unexpectedBlocks.length > 0) {
    errors.push("この問題の合計計算には使わないブロックが含まれています。問題文に必要な処理だけを選びましょう。");
  }

  if (!allPlaced.includes("declareSum") ||
      (positions.declareSum ?? Number.POSITIVE_INFINITY) > Math.min(
        positions.initializeSum ?? Number.POSITIVE_INFINITY,
        positions.loop ?? Number.POSITIVE_INFINITY,
        positions.outputSum ?? Number.POSITIVE_INFINITY
      )) {
    errors.push("sum を使う前に、変数を宣言する必要があります。");
  }

  if (!loopElement) {
    errors.push("1 から n まで繰り返す処理を配置してください。");
  }

  if (!nested.includes("addCurrent")) {
    errors.push("合計を求める処理は、繰り返しの中に配置してください。");
  }

  if (!allPlaced.includes("initializeSum") ||
      positions.initializeSum === undefined ||
      positions.loop === undefined ||
      positions.initializeSum > positions.loop) {
    errors.push("繰り返しの前に、sum の初期値を設定してください。");
  }

  if (!allPlaced.includes("outputSum") ||
      positions.outputSum === undefined ||
      positions.outputSum !== root.length - 1 ||
      (positions.loop !== undefined && positions.outputSum < positions.loop)) {
    errors.push("最後に、計算した sum の値を出力してください。");
  }

  const rootMatches = arraysEqual(root, currentProblem.expected.root);
  const nestedMatches = arraysEqual(nested, currentProblem.expected.loop);
  if (!rootMatches || !nestedMatches) {
    if (errors.length === 0) {
      errors.push("ブロックの順番と、繰り返しの内側にある処理を確認してください。");
    }
  }

  return errors;
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function validateInput() {
  const value = Number(nInput.value);
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    return null;
  }
  return value;
}

function showFeedback(messages) {
  feedback.innerHTML = `
    <strong>組立てをもう一度確認しましょう</strong>
    <ul>${messages.map((message) => `<li>${message}</li>`).join("")}</ul>
  `;
  feedback.hidden = false;
}

function clearFeedback() {
  feedback.hidden = true;
  feedback.replaceChildren();
}

function clearResults() {
  resultContent.hidden = true;
  resultPanel.hidden = true;
  workspace.classList.remove("is-result-open");
  clearCorrespondence();
}

function renderResult(input, result) {
  outputValue.textContent = `出力結果：${result.output}`;
  traceCaption.textContent = `n = ${input}`;
  traceBody.replaceChildren();

  result.trace.forEach((row) => {
    const tableRow = document.createElement("tr");
    tableRow.innerHTML = `
      <td>${row.iteration}</td>
      <td>${row.current}</td>
      <td>${row.sum}</td>
    `;
    traceBody.append(tableRow);
  });

  resultPanel.hidden = false;
  workspace.classList.add("is-result-open");
  resultContent.hidden = false;
  resultDetails.open = true;
  selectTab("flow");
  requestAnimationFrame(() => {
    resultPanel.scrollTo({ top: 0, behavior: "smooth" });
    resultPanel.scrollIntoView({ block: "start", behavior: "smooth" });
  });
}

function runProgram() {
  clearFeedback();
  const input = validateInput();
  if (input === null) {
    showFeedback(["入力値 n には、1〜100の整数を設定してください。"]);
    clearResults();
    nInput.focus();
    return;
  }

  const errors = validateAssembly();
  if (errors.length > 0) {
    showFeedback(errors);
    clearResults();
    return;
  }

  const result = currentProblem.execute(input);
  renderResult(input, result);
}

function resetWorkspace() {
  assemblyList.querySelectorAll(':scope > .placed-block').forEach((block) => block.remove());
  nInput.value = String(currentProblem.initialInput);
  clearFeedback();
  clearResults();
  renderPalette();
  updateWorkspaceState();
}

function selectTab(tabName) {
  const flowSelected = tabName === "flow";
  flowTab.classList.toggle("is-active", flowSelected);
  javaTab.classList.toggle("is-active", !flowSelected);
  flowTab.setAttribute("aria-selected", String(flowSelected));
  javaTab.setAttribute("aria-selected", String(!flowSelected));
  flowPanel.hidden = !flowSelected;
  javaPanel.hidden = flowSelected;
  clearCorrespondence();
}

function showCorrespondence(blockId, selectedLine) {
  const block = getBlockDefinition(blockId);
  clearCorrespondence();

  document.querySelectorAll(`[data-block-id="${blockId}"]`).forEach((element) => {
    element.classList.add("is-corresponding");
  });
  document.querySelectorAll(`[data-flow-block="${blockId}"]`).forEach((element) => {
    element.classList.add("is-corresponding");
  });
  document.querySelectorAll(`[data-code-block="${blockId}"]`).forEach((element) => {
    element.classList.add("is-selected");
  });

  if (selectedLine) {
    selectedLine.classList.add("is-selected");
  }
  codeCorrespondence.textContent = `対応する文章ブロック：${block.label}`;
}

function clearCorrespondence() {
  document.querySelectorAll(".is-corresponding").forEach((element) => {
    element.classList.remove("is-corresponding");
  });
  document.querySelectorAll(".code-line.is-selected").forEach((element) => {
    element.classList.remove("is-selected");
  });
  codeCorrespondence.textContent = "コードの行をクリックしてください";
}

attachDropzoneEvents(assemblyList);
renderPalette();
updateWorkspaceState();

runButton.addEventListener("click", runProgram);
resetButton.addEventListener("click", resetWorkspace);
flowTab.addEventListener("click", () => selectTab("flow"));
javaTab.addEventListener("click", () => selectTab("java"));

document.querySelectorAll(".code-line[data-code-block]").forEach((line) => {
  line.addEventListener("click", () => showCorrespondence(line.dataset.codeBlock, line));
});
