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
        label: "ループカウンタ変数 i を 1 から n まで、1 ずつ増やしながら繰り返す",
        shortLabel: "ループカウンタ変数 i を 1 ずつ増やして繰り返す",
        hint: "ループカウンタ変数 i の開始・終了・増分を考える",
        acceptsChildren: true
      },
      {
        id: "addCurrent",
        type: "calculation",
        label: "変数 sum に、ループカウンタ変数 i の値を加える",
        shortLabel: "sum にループカウンタ変数 i の値を加える",
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
        label: "ループカウンタ変数 i を 1 から n - 1 まで、1 ずつ増やしながら繰り返す",
        shortLabel: "ループカウンタ変数 i を n - 1 まで増やして繰り返す",
        hint: "ループカウンタ変数 i の終了条件を考える",
        acceptsChildren: true
      },
      {
        id: "outputCurrent",
        type: "output",
        label: "ループカウンタ変数 i を、その都度出力する",
        shortLabel: "ループカウンタ変数 i を出力",
        hint: "途中経過を表示する"
      },
      {
        id: "addToN",
        type: "calculation",
        label: "変数 n に、ループカウンタ変数 i の値を加える",
        shortLabel: "n にループカウンタ変数 i の値を加える",
        hint: "入力値を更新する"
      },
      {
        id: "subtractCurrent",
        type: "calculation",
        label: "変数 sum から、ループカウンタ変数 i の値を引く",
        shortLabel: "sum からループカウンタ変数 i の値を引く",
        hint: "値を減らす"
      },
      {
        id: "loopFromZero",
        type: "loop",
        label: "ループカウンタ変数 i を 0 から n まで、1 ずつ増やしながら繰り返す",
        shortLabel: "ループカウンタ変数 i を 0 から増やして繰り返す",
        hint: "ループカウンタ変数 i の開始値を考える",
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
        label: "ループカウンタ変数 i に、初期値として 0 を設定する",
        shortLabel: "ループカウンタ変数 i に 0 を設定",
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
const INSTRUCTOR_MODE_STORAGE_KEY = "algobridge-instructor-mode";
const INSTRUCTOR_PASSWORD_HASH = "02006319c292b2880b56de90a7e8a1751713baae6cf9762a1ac8b216a50192e7";
const palette = document.querySelector("#block-palette");
const assemblyList = document.querySelector("#assembly-list");
const nInput = document.querySelector("#n-input");
const expectedOutputValue = document.querySelector("#expected-output-value");
const runButton = document.querySelector("#run-button");
const instructorModeButton = document.querySelector("#instructor-mode-button");
const instructorModal = document.querySelector("#instructor-modal");
const instructorForm = document.querySelector("#instructor-form");
const instructorPassword = document.querySelector("#instructor-password");
const instructorCancelButton = document.querySelector("#instructor-cancel-button");
const instructorLoginError = document.querySelector("#instructor-login-error");
const resetButton = document.querySelector("#reset-button");
const resetModal = document.querySelector("#reset-modal");
const resetConfirmButton = document.querySelector("#reset-confirm-button");
const resetCancelButton = document.querySelector("#reset-cancel-button");
const undoButton = document.querySelector("#undo-button");
const feedback = document.querySelector("#feedback");
const hintArea = document.querySelector("#hint-area");
const hintButton = document.querySelector("#hint-button");
const hintPanel = document.querySelector("#hint-panel");
const hintCount = document.querySelector("#hint-count");
const hintText = document.querySelector("#hint-text");
const previousHintButton = document.querySelector("#previous-hint-button");
const nextHintButton = document.querySelector("#next-hint-button");
const hintModal = document.querySelector("#hint-modal");
const hintConfirmButton = document.querySelector("#hint-confirm-button");
const hintCancelButton = document.querySelector("#hint-cancel-button");
const successModal = document.querySelector("#success-modal");
const successConfirmButton = document.querySelector("#success-confirm-button");
const successKicker = document.querySelector("#success-kicker");
const successModalTitle = document.querySelector("#success-modal-title");
const successModalMessage = document.querySelector("#success-modal-message");
const successBadge = document.querySelector("#success-badge");
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
const resultToggleIcon = document.querySelector("#result-toggle-icon");
const resultToggleLabel = document.querySelector("#result-toggle-label");
const workspace = document.querySelector(".workspace");
const buildPanel = document.querySelector(".build-panel");

let draggedInstanceId = null;
let instanceCounter = 0;
let availableHints = [];
let shownHintCount = 0;
let placementHistory = [];
let isInstructorMode = loadInstructorMode();

function getBlockDefinition(blockId) {
  return currentProblem.blocks.find((block) => block.id === blockId);
}

function loadInstructorMode() {
  try {
    return localStorage.getItem(INSTRUCTOR_MODE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveInstructorMode() {
  try {
    localStorage.setItem(INSTRUCTOR_MODE_STORAGE_KEY, String(isInstructorMode));
  } catch {
    // ローカル保存が使えない環境では、その画面を開いている間だけ講師モードを維持する。
  }
}

function updateInstructorMode() {
  document.body.classList.toggle("is-instructor-mode", isInstructorMode);
  instructorModeButton.textContent = isInstructorMode ? "受講者モードに戻る" : "講師用";
}

async function hashPassword(value) {
  const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function openInstructorModal() {
  instructorPassword.value = "";
  instructorLoginError.hidden = true;
  instructorModal.hidden = false;
  instructorPassword.focus();
}

async function authenticateInstructor(event) {
  event.preventDefault();

  if (!window.crypto?.subtle) {
    instructorLoginError.textContent = "このブラウザではパスワード確認を利用できません。";
    instructorLoginError.hidden = false;
    return;
  }

  const passwordHash = await hashPassword(instructorPassword.value);
  if (passwordHash !== INSTRUCTOR_PASSWORD_HASH) {
    instructorLoginError.textContent = "パスワードが正しくありません。";
    instructorLoginError.hidden = false;
    instructorPassword.focus();
    return;
  }

  isInstructorMode = true;
  saveInstructorMode();
  updateInstructorMode();
  instructorModal.hidden = true;
}

function formatBlockLabel(label) {
  const escapedLabel = label.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));

  return escapedLabel.replace(/sum|average|ループカウンタ変数 i|現在の数値|\bn\b|0|1|宣言する|設定する|繰り返す|加える|出力する|引く|入力する/g, (token) => {
    if (["sum", "average", "ループカウンタ変数 i", "現在の数値", "n"].includes(token)) {
      return `<span class="token-variable">${token}</span>`;
    }
    if (["0", "1"].includes(token)) {
      return `<span class="token-value">${token}</span>`;
    }
    return `<span class="token-verb">${token}</span>`;
  });
}

function renderPalette() {
  palette.replaceChildren();

  shuffleBlockGroups(currentProblem.blocks).forEach((block) => {
    const element = document.createElement("button");
    element.type = "button";
    element.className = `source-block block-${block.type}`;
    element.dataset.blockId = block.id;
    element.draggable = true;
    element.innerHTML = `
      <span class="block-handle" aria-hidden="true">⠿</span>
      <span class="block-copy">
        <strong>${formatBlockLabel(block.label)}</strong>
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

function shuffleBlockGroups(blocks) {
  const groups = new Map();

  blocks.forEach((block) => {
    if (!groups.has(block.type)) {
      groups.set(block.type, []);
    }
    groups.get(block.type).push(block);
  });

  return shuffleBlocks([...groups.values()])
    .flatMap((group) => shuffleBlocks(group));
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
      <strong>${formatBlockLabel(block.label)}</strong>
      <span>${block.hint}</span>
    </div>
    <button class="remove-block" type="button" aria-label="「${block.label}」を取り除く">×</button>
  `;

  if (block.acceptsChildren) {
    element.querySelector(".placed-copy").append(element.querySelector(".remove-block"));

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
    loopEnd.innerHTML = "<span>繰り返し終了</span>";
    element.append(loopEnd);
  }

  element.addEventListener("dragstart", handlePlacedDragStart);
  element.addEventListener("dragend", clearDragState);
  element.querySelector(".remove-block").addEventListener("click", (event) => {
    event.stopPropagation();
    savePlacementHistory();
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
    savePlacementHistory();
    zone.insertBefore(draggedElement, reference);
    updateWorkspaceState();
    clearResults();
  });
}

function getDropReference(zone, pointerY, draggedElement) {
  const candidates = [...zone.children].filter((child) => {
    return child.classList.contains("placed-block") && child !== draggedElement;
  });

  const reference = candidates.find((candidate) => {
    const box = candidate.getBoundingClientRect();
    return pointerY < box.top + box.height / 2;
  });

  return reference || zone.querySelector(':scope > .drop-space') || null;
}

function addBlockToZone(blockId, zone) {
  savePlacementHistory();
  zone.insertBefore(createPlacedBlock(blockId), zone.querySelector(':scope > .drop-space'));
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

function getPlacementSnapshot(zone = assemblyList) {
  return [...zone.children]
    .filter((child) => child.classList.contains("placed-block"))
    .map((block) => {
      const loopBody = block.querySelector(':scope > .loop-body');
      return {
        blockId: block.dataset.blockId,
        children: loopBody ? getPlacementSnapshot(loopBody) : []
      };
    });
}

function restorePlacementSnapshot(snapshot, zone = assemblyList) {
  snapshot.forEach((item) => {
    const block = createPlacedBlock(item.blockId);
    zone.insertBefore(block, zone.querySelector(':scope > .drop-space'));
    const loopBody = block.querySelector(':scope > .loop-body');
    if (loopBody) {
      restorePlacementSnapshot(item.children, loopBody);
    }
  });
}

function updateUndoButton() {
  undoButton.disabled = placementHistory.length === 0;
}

function savePlacementHistory() {
  placementHistory.push(getPlacementSnapshot());
  updateUndoButton();
}

function undoLastPlacement() {
  const snapshot = placementHistory.pop();
  if (!snapshot) {
    return;
  }

  assemblyList.querySelectorAll(':scope > .placed-block').forEach((block) => block.remove());
  restorePlacementSnapshot(snapshot);
  clearFeedback();
  clearResults();
  updateWorkspaceState();
  updateUndoButton();
}

function updateWorkspaceState() {
  const rootBlocks = directBlockIds(assemblyList);
  const rootEmpty = assemblyList.querySelector(':scope > [data-empty-for="root"]');
  const rootDropSpace = assemblyList.querySelector(':scope > [data-drop-space-for="root"]');
  rootEmpty.hidden = rootBlocks.length > 0;
  rootDropSpace.hidden = rootBlocks.length === 0;

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
  const expectedBlockIds = [
    ...currentProblem.expected.root,
    ...currentProblem.expected.loop
  ];
  const unexpectedBlocks = allPlaced.filter((id) => !expectedBlockIds.includes(id));
  const missingBlocks = expectedBlockIds.filter((id) => !allPlaced.includes(id));

  if (unexpectedBlocks.length > 0) {
    errors.push("この問題の合計計算には使わないブロックが含まれています。問題文に必要な処理だけを選びましょう。");
  } else if (missingBlocks.length > 0) {
    errors.push("必要な処理ブロックがまだ揃っていません。問題文を見直して、残りの処理を追加しましょう。");
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

function updateExpectedOutput() {
  const input = validateInput();
  expectedOutputValue.textContent = input === null ? "-" : currentProblem.execute(input).output;
}

function showFeedback(messages) {
  feedback.innerHTML = `
    <strong>組立てをもう一度確認しましょう</strong>
    <ul>${messages.map((message) => `<li>${message}</li>`).join("")}</ul>
  `;
  feedback.hidden = false;
}

function getFeedbackSummary() {
  const allPlaced = [...assemblyList.querySelectorAll(".placed-block")].map((item) => item.dataset.blockId);
  const expectedBlockIds = [...currentProblem.expected.root, ...currentProblem.expected.loop];
  const hasUnexpectedBlock = allPlaced.some((id) => !expectedBlockIds.includes(id));
  const hasMissingBlock = expectedBlockIds.some((id) => !allPlaced.includes(id));

  if (hasUnexpectedBlock) {
    return "この問題には使わない処理ブロックが含まれています。問題文を見直しましょう。";
  }
  if (hasMissingBlock) {
    return "必要な処理ブロックがまだ揃っていません。問題文を見直して、残りの処理を追加しましょう。";
  }
  return "ブロックの順番や、繰り返しの中の配置を見直しましょう。";
}

function getAttemptHints() {
  const hints = [];
  const root = directBlockIds(assemblyList);
  const loopElement = assemblyList.querySelector(':scope > [data-block-id="loop"]');
  const loopBody = loopElement?.querySelector(':scope > .loop-body');
  const nested = loopBody ? directBlockIds(loopBody) : [];
  const positions = Object.fromEntries(root.map((id, index) => [id, index]));
  const allPlaced = [...assemblyList.querySelectorAll(".placed-block")].map((item) => item.dataset.blockId);
  const expectedBlockIds = [...currentProblem.expected.root, ...currentProblem.expected.loop];

  if (allPlaced.some((id) => !expectedBlockIds.includes(id))) {
    hints.push("問題文の「1からnまでの合計」に関係しない変数や処理が入っていないか、見直してみましょう。");
    hints.push("この問題では、sum の宣言・初期化・繰り返し・加算・出力に関係するブロックを選びましょう。");
  }
  if (!allPlaced.includes("declareSum") || positions.declareSum > (positions.initializeSum ?? Infinity)) {
    hints.push("計算に使う値は、使い始める前に準備できているでしょうか？");
    hints.push("変数 sum は、計算を始める前に宣言しましょう。");
  }
  if (!allPlaced.includes("initializeSum") || positions.initializeSum > (positions.loop ?? Infinity)) {
    hints.push("足し算を始めるsumの最初の値は、いくつがよいでしょうか？");
    hints.push("変数 sum に、繰り返しの前に初期値 0 を設定しましょう。");
  }
  if (!loopElement) {
    hints.push("1からnまでの数を一つずつ扱うには、ループカウンタ変数 i をどう変化させるとよいでしょうか？");
    hints.push("ループカウンタ変数 i を 1 から n まで、1 ずつ増やしながら繰り返しましょう。");
  }
  if (!nested.includes("addCurrent")) {
    hints.push("各回の数をsumへ加える処理は、繰り返しの内側と外側のどちらに置くべきでしょうか？");
    hints.push("繰り返しの中に、sum へループカウンタ変数 i の値を加える処理を配置しましょう。");
  }
  if (!allPlaced.includes("outputSum") || positions.outputSum !== root.length - 1) {
    hints.push("求めた合計は、計算の途中と最後のどちらで表示するとよいでしょうか？");
    hints.push("繰り返しが終わった後、最後に変数 sum の値を出力しましょう。");
  }
  if (hints.length === 0) {
    hints.push("上から実行される順番と、繰り返しの内側にある処理を見直してみましょう。");
    hints.push("宣言 → 初期化 → 繰り返し（加算）→ 出力、の順番になっているか確認しましょう。");
  }

  return hints;
}

function prepareHints() {
  availableHints = getAttemptHints();
  shownHintCount = 0;
  hintArea.hidden = false;
  hintButton.hidden = false;
  hintPanel.hidden = true;
  previousHintButton.hidden = true;
  nextHintButton.hidden = true;
}

function clearHints() {
  availableHints = [];
  shownHintCount = 0;
  hintArea.hidden = true;
  hintPanel.hidden = true;
  hintModal.hidden = true;
}

function showNextHint() {
  if (shownHintCount >= availableHints.length) {
    return;
  }

  shownHintCount += 1;
  renderCurrentHint();
}

function showPreviousHint() {
  if (shownHintCount <= 1) {
    return;
  }

  shownHintCount -= 1;
  renderCurrentHint();
}

function renderCurrentHint() {
  hintCount.textContent = `ヒント ${shownHintCount} / ${availableHints.length}`;
  hintText.textContent = availableHints[shownHintCount - 1];
  hintPanel.hidden = false;
  hintButton.hidden = true;
  previousHintButton.hidden = shownHintCount <= 1;
  nextHintButton.hidden = shownHintCount >= availableHints.length;
}

function clearFeedback() {
  feedback.hidden = true;
  feedback.replaceChildren();
  clearHints();
}

function clearResults() {
  resultContent.hidden = true;
  resultPanel.hidden = true;
  successModal.hidden = true;
  workspace.classList.remove("is-result-open");
  clearCorrespondence();
}

function showSuccessModal(isInstructorPreview = false) {
  successKicker.textContent = isInstructorPreview ? "INSTRUCTOR MODE" : "COMPLETED!";
  successModalTitle.textContent = isInstructorPreview ? "正解例を表示します" : "正解です！";
  successModalMessage.textContent = isInstructorPreview
    ? "講師モードのため、組み立て状況にかかわらず正しい実行結果と解説を確認できます。"
    : "処理の順番と繰り返しの配置が、正しく組み立てられています。";
  successConfirmButton.textContent = isInstructorPreview ? "正解例を確認する" : "結果を確認する";
  successModal.hidden = false;
  successConfirmButton.focus();
}

function openResultPanel() {
  resultPanel.hidden = false;
  workspace.classList.add("is-result-open");
  resultDetails.open = true;
  updateResultToggle();
}

function updateResultToggle() {
  const isOpen = resultDetails.open;
  resultToggleIcon.textContent = isOpen ? "⌃" : "⌄";
  resultToggleLabel.textContent = isOpen ? "折り畳む" : "展開する";
}

function renderResult(input, result, isInstructorPreview = false) {
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

  successBadge.textContent = isInstructorPreview ? "講師用・正解例" : "実行成功";
  resultContent.hidden = false;
  showSuccessModal(isInstructorPreview);
  resultDetails.open = false;
  resultPanel.hidden = true;
  workspace.classList.remove("is-result-open");
  updateResultToggle();
  selectTab("flow");
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
    if (isInstructorMode) {
      renderResult(input, currentProblem.execute(input), true);
      return;
    }
    showFeedback([getFeedbackSummary()]);
    prepareHints();
    clearResults();
    return;
  }

  const result = currentProblem.execute(input);
  renderResult(input, result);
}

function resetWorkspace() {
  if (directBlockIds(assemblyList).length > 0) {
    savePlacementHistory();
  }
  assemblyList.querySelectorAll(':scope > .placed-block').forEach((block) => block.remove());
  nInput.value = String(currentProblem.initialInput);
  updateExpectedOutput();
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
  showCodeExplanation(block, selectedLine);
  focusCorrespondingBlock(blockId);
}

function showCodeExplanation(block, selectedLine) {
  const blockLabel = document.createElement("p");
  blockLabel.className = "code-correspondence-block";
  blockLabel.textContent = `対応する文章ブロック：${block.label}`;

  const syntaxTitle = document.createElement("strong");
  syntaxTitle.textContent = selectedLine.dataset.codeTitle;

  const syntaxDescription = document.createElement("p");
  syntaxDescription.className = "code-correspondence-description";
  syntaxDescription.textContent = selectedLine.dataset.codeDescription;

  codeCorrespondence.replaceChildren(blockLabel, syntaxTitle, syntaxDescription);
}

function focusCorrespondingBlock(blockId) {
  const correspondingBlock = assemblyList.querySelector(`[data-block-id="${blockId}"]`);
  if (!correspondingBlock) {
    return;
  }

  const panelBox = buildPanel.getBoundingClientRect();
  const blockBox = correspondingBlock.getBoundingClientRect();
  const targetTop = buildPanel.scrollTop + blockBox.top - panelBox.top - (buildPanel.clientHeight - blockBox.height) / 2;

  buildPanel.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  correspondingBlock.tabIndex = -1;
  correspondingBlock.focus({ preventScroll: true });
}

function clearCorrespondence() {
  document.querySelectorAll(".is-corresponding").forEach((element) => {
    element.classList.remove("is-corresponding");
  });
  document.querySelectorAll(".code-line.is-selected").forEach((element) => {
    element.classList.remove("is-selected");
  });
  codeCorrespondence.replaceChildren();
  codeCorrespondence.textContent = "コードの行をクリックしてください";
}

attachDropzoneEvents(assemblyList);
renderPalette();
updateWorkspaceState();
updateExpectedOutput();
updateInstructorMode();
updateResultToggle();

nInput.addEventListener("input", updateExpectedOutput);
runButton.addEventListener("click", runProgram);
instructorModeButton.addEventListener("click", () => {
  if (isInstructorMode) {
    isInstructorMode = false;
    saveInstructorMode();
    updateInstructorMode();
    return;
  }
  openInstructorModal();
});
instructorCancelButton.addEventListener("click", () => {
  instructorModal.hidden = true;
});
instructorForm.addEventListener("submit", authenticateInstructor);
resetButton.addEventListener("click", () => {
  resetModal.hidden = false;
  resetCancelButton.focus();
});
resetCancelButton.addEventListener("click", () => {
  resetModal.hidden = true;
});
resetConfirmButton.addEventListener("click", () => {
  resetModal.hidden = true;
  resetWorkspace();
});
undoButton.addEventListener("click", undoLastPlacement);
hintButton.addEventListener("click", () => {
  hintModal.hidden = false;
});
hintCancelButton.addEventListener("click", () => {
  hintModal.hidden = true;
});
hintConfirmButton.addEventListener("click", () => {
  hintModal.hidden = true;
  showNextHint();
});
previousHintButton.addEventListener("click", showPreviousHint);
nextHintButton.addEventListener("click", showNextHint);
successConfirmButton.addEventListener("click", () => {
  successModal.hidden = true;
  openResultPanel();
  requestAnimationFrame(() => {
    resultPanel.scrollTo({ top: 0, behavior: "smooth" });
    resultPanel.scrollIntoView({ block: "start", behavior: "smooth" });
  });
});
resultDetails.addEventListener("toggle", () => {
  updateResultToggle();
});
flowTab.addEventListener("click", () => selectTab("flow"));
javaTab.addEventListener("click", () => selectTab("java"));

document.querySelectorAll(".code-line[data-code-block]").forEach((line) => {
  line.addEventListener("click", () => showCorrespondence(line.dataset.codeBlock, line));
});
