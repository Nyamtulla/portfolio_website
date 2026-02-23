const LIMITS = {
  maxDepth: 80,
  maxNodes: 700
};

const ui = {
  appShell: document.getElementById("appShell"),
  studentGate: document.getElementById("studentGate"),
  studentForm: document.getElementById("studentForm"),
  studentName: document.getElementById("studentName"),
  studentId: document.getElementById("studentId"),
  startActivityBtn: document.getElementById("startActivityBtn"),
  gateStatus: document.getElementById("gateStatus"),
  startN: document.getElementById("startN"),
  baseCondition: document.getElementById("baseCondition"),
  baseReturn: document.getElementById("baseReturn"),
  recursiveExpr: document.getElementById("recursiveExpr"),
  exampleButtons: document.querySelectorAll(".example-btn"),
  runBtn: document.getElementById("runBtn"),
  resetBtn: document.getElementById("resetBtn"),
  statusLine: document.getElementById("statusLine"),
  summary: document.getElementById("summary"),
  treeOutput: document.getElementById("treeOutput"),
  analysisLog: document.getElementById("analysisLog")
};

const GOOGLE_APPS_SCRIPT_URL = window.EECS268_CONFIG?.GOOGLE_APPS_SCRIPT_URL || "";
const STUDENT_NAME_STORAGE_KEY = "eecs268_recursion_student_name";
const STUDENT_ID_STORAGE_KEY = "eecs268_recursion_student_id";
const EXAMPLES = {
  fibonacci: {
    label: "Fibonacci",
    startN: "6",
    baseCondition: "n <= 1",
    baseReturn: "n",
    recursiveExpr: "f(n - 1) + f(n - 2)"
  },
  factorial: {
    label: "Factorial",
    startN: "5",
    baseCondition: "n === 0",
    baseReturn: "1",
    recursiveExpr: "n * f(n - 1)"
  },
  sumToN: {
    label: "Sum 1..n",
    startN: "6",
    baseCondition: "n <= 0",
    baseReturn: "0",
    recursiveExpr: "n + f(n - 1)"
  },
  powerOfTwo: {
    label: "Power of 2",
    startN: "5",
    baseCondition: "n === 0",
    baseReturn: "1",
    recursiveExpr: "2 * f(n - 1)"
  },
  countdown: {
    label: "Countdown Steps",
    startN: "5",
    baseCondition: "n <= 0",
    baseReturn: "0",
    recursiveExpr: "1 + f(n - 1)"
  }
};

let isUnlocked = false;

function setStatus(text, type = "") {
  ui.statusLine.textContent = text;
  ui.statusLine.classList.remove("ok", "error");
  if (type) ui.statusLine.classList.add(type);
}

function setSummary(html, isError) {
  ui.summary.classList.remove("hidden");
  ui.summary.classList.toggle("error", Boolean(isError));
  ui.summary.innerHTML = html;
}

function hideSummary() {
  ui.summary.classList.add("hidden");
  ui.summary.classList.remove("error");
  ui.summary.innerHTML = "";
}

function clearOutput() {
  ui.treeOutput.innerHTML = "";
  ui.analysisLog.innerHTML = "";
  hideSummary();
}

function addLog(text) {
  const li = document.createElement("li");
  li.textContent = text;
  ui.analysisLog.appendChild(li);
  ui.analysisLog.scrollTop = ui.analysisLog.scrollHeight;
}

function setGateMessage(text, isError = false) {
  ui.gateStatus.textContent = text;
  ui.gateStatus.classList.toggle("error", Boolean(isError));
}

function unlockActivity() {
  isUnlocked = true;
  ui.appShell.classList.remove("locked");
  ui.studentGate.style.display = "none";
}

async function saveStudentToGoogleSheet(studentName, studentId) {
  if (!GOOGLE_APPS_SCRIPT_URL) {
    return { ok: false, reason: "missing_url" };
  }

  const payload = new URLSearchParams({
    name: studentName,
    id: studentId,
    studentId,
    activity: "Recursion",
    timestamp: new Date().toISOString()
  });

  try {
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: payload
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: "network_error" };
  }
}

function compileExpr(argName, expr, label) {
  try {
    return new Function(argName, `"use strict"; return (${expr});`);
  } catch (err) {
    throw new Error(`${label} is not valid JavaScript expression.`);
  }
}

function compileRecursiveExpr(expr) {
  try {
    return new Function("n", "f", `"use strict"; return (${expr});`);
  } catch (err) {
    throw new Error("Recursive expression is not valid JavaScript.");
  }
}

function isIdentifierChar(ch) {
  return /[A-Za-z0-9_$]/.test(ch);
}

function findMatchingParen(text, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "(") depth += 1;
    if (ch === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractCallArgExpressions(expr) {
  const calls = [];
  let i = 0;
  while (i < expr.length) {
    if (expr[i] !== "f") {
      i += 1;
      continue;
    }

    const prev = i > 0 ? expr[i - 1] : "";
    if (prev && isIdentifierChar(prev)) {
      i += 1;
      continue;
    }

    let j = i + 1;
    while (j < expr.length && /\s/.test(expr[j])) j += 1;
    if (expr[j] !== "(") {
      i += 1;
      continue;
    }

    const closeIdx = findMatchingParen(expr, j);
    if (closeIdx < 0) {
      throw new Error("Recursive expression has unbalanced parentheses.");
    }

    const argExpr = expr.slice(j + 1, closeIdx).trim();
    if (!argExpr) {
      throw new Error("Recursive call f(...) has empty argument.");
    }
    calls.push(argExpr);
    i = closeIdx + 1;
  }
  return calls;
}

function normalizeKey(n) {
  if (Object.is(n, -0)) return "0";
  return String(n);
}

function renderTree(node) {
  const ul = document.createElement("ul");
  const li = renderNode(node);
  ul.appendChild(li);
  return ul;
}

function renderNode(node) {
  const li = document.createElement("li");
  const label = document.createElement("span");
  label.textContent = `f(${node.n}) => ${node.valueText}`;

  if (node.kind === "base") label.className = "tree-node-base";
  if (node.kind === "infinite" || node.kind === "error") label.className = "tree-node-error";
  li.appendChild(label);

  if (node.children.length > 0) {
    const ul = document.createElement("ul");
    node.children.forEach((child) => {
      ul.appendChild(renderNode(child));
    });
    li.appendChild(ul);
  }
  return li;
}

function buildEvaluator(startN, baseCondExpr, baseReturnExpr, recursiveExpr) {
  const baseCondFn = compileExpr("n", baseCondExpr, "Base condition");
  const baseReturnFn = compileExpr("n", baseReturnExpr, "Base return");
  const recursiveFn = compileRecursiveExpr(recursiveExpr);
  const callArgExprs = extractCallArgExpressions(recursiveExpr);
  const callArgFns = callArgExprs.map((argExpr, idx) => compileExpr("n", argExpr, `Recursive call argument #${idx + 1}`));

  let nodeCount = 0;
  let maxDepthSeen = 0;

  function visit(n, depth, activeSet) {
    nodeCount += 1;
    maxDepthSeen = Math.max(maxDepthSeen, depth);

    const node = {
      n,
      kind: "normal",
      value: null,
      valueText: "?",
      children: []
    };

    if (nodeCount > LIMITS.maxNodes || depth > LIMITS.maxDepth) {
      node.kind = "infinite";
      node.valueText = "infinite recursion (limit exceeded)";
      return { node, infinite: true, reason: "Expansion limit exceeded. Rule likely does not terminate." };
    }

    let baseHit;
    try {
      baseHit = Boolean(baseCondFn(n));
    } catch (err) {
      node.kind = "error";
      node.valueText = "error in base condition";
      return { node, infinite: false, reason: `Base condition runtime error at n=${n}.` };
    }

    if (baseHit) {
      try {
        node.value = baseReturnFn(n);
      } catch (err) {
        node.kind = "error";
        node.valueText = "error in base return";
        return { node, infinite: false, reason: `Base return runtime error at n=${n}.` };
      }
      node.kind = "base";
      node.valueText = String(node.value);
      return { node, infinite: false, reason: null };
    }

    const cycleKey = normalizeKey(n);
    if (activeSet.has(cycleKey)) {
      node.kind = "infinite";
      node.valueText = "cycle detected";
      return { node, infinite: true, reason: `Cycle detected at n=${n}.` };
    }

    if (callArgFns.length === 0) {
      node.kind = "infinite";
      node.valueText = "no recursive call and base not reached";
      return { node, infinite: true, reason: "Base not reached and recursive expression has no f(...)." };
    }

    activeSet.add(cycleKey);
    const childValuesByKey = new Map();

    for (let i = 0; i < callArgFns.length; i += 1) {
      let childN;
      try {
        childN = callArgFns[i](n);
      } catch (err) {
        node.kind = "error";
        node.valueText = `error evaluating call #${i + 1}`;
        activeSet.delete(cycleKey);
        return { node, infinite: false, reason: `Call argument #${i + 1} failed at n=${n}.` };
      }

      if (typeof childN !== "number" || Number.isNaN(childN) || !Number.isFinite(childN)) {
        node.kind = "error";
        node.valueText = `call #${i + 1} produced invalid n`;
        activeSet.delete(cycleKey);
        return { node, infinite: false, reason: `Call argument #${i + 1} did not produce a finite number.` };
      }

      const childResult = visit(childN, depth + 1, activeSet);
      node.children.push(childResult.node);
      if (childResult.infinite) {
        node.kind = "infinite";
        node.valueText = "infinite recursion occurs";
        activeSet.delete(cycleKey);
        return { node, infinite: true, reason: childResult.reason };
      }
      if (childResult.node.kind === "error") {
        node.kind = "error";
        node.valueText = "child evaluation error";
        activeSet.delete(cycleKey);
        return { node, infinite: false, reason: childResult.reason };
      }
      childValuesByKey.set(normalizeKey(childN), childResult.node.value);
    }

    activeSet.delete(cycleKey);

    try {
      const resolver = (x) => {
        const key = normalizeKey(x);
        if (!childValuesByKey.has(key)) {
          throw new Error("call argument mismatch");
        }
        return childValuesByKey.get(key);
      };
      node.value = recursiveFn(n, resolver);
      node.valueText = String(node.value);
    } catch (err) {
      node.kind = "error";
      node.valueText = "error in recursive expression";
      return { node, infinite: false, reason: `Recursive expression failed at n=${n}.` };
    }

    return { node, infinite: false, reason: null };
  }

  const result = visit(startN, 0, new Set());
  return {
    ...result,
    nodeCount,
    maxDepth: maxDepthSeen
  };
}

function runAnalysis() {
  if (!isUnlocked) {
    setStatus("Complete check-in to begin.", "error");
    return;
  }

  clearOutput();
  const startN = Number(ui.startN.value);
  if (!Number.isFinite(startN)) {
    setStatus("Start n must be a number.", "error");
    setSummary("Invalid start value.", true);
    return;
  }

  const baseCondExpr = ui.baseCondition.value.trim();
  const baseReturnExpr = ui.baseReturn.value.trim();
  const recursiveExpr = ui.recursiveExpr.value.trim();

  if (!baseCondExpr || !baseReturnExpr || !recursiveExpr) {
    setStatus("Fill all three rule fields.", "error");
    setSummary("Missing rule input.", true);
    return;
  }

  addLog(`Start n = ${startN}`);
  addLog(`Base condition: ${baseCondExpr}`);
  addLog(`Base return: ${baseReturnExpr}`);
  addLog(`Recursive expression: ${recursiveExpr}`);

  let evaluation;
  try {
    evaluation = buildEvaluator(startN, baseCondExpr, baseReturnExpr, recursiveExpr);
  } catch (err) {
    setStatus("Rule parse error.", "error");
    setSummary(`<strong>Invalid rule</strong><br>${err.message}`, true);
    addLog(err.message);
    return;
  }

  ui.treeOutput.appendChild(renderTree(evaluation.node));

  if (evaluation.infinite) {
    setStatus("Infinite recursion occurs.", "error");
    setSummary(
      `<strong>Infinite recursion occurs.</strong><br>${evaluation.reason}<br>Nodes explored: ${evaluation.nodeCount}, max depth: ${evaluation.maxDepth}`,
      true
    );
    addLog(`Infinite recursion: ${evaluation.reason}`);
    return;
  }

  if (evaluation.node.kind === "error") {
    setStatus("Rule evaluation error.", "error");
    setSummary(`<strong>Evaluation error</strong><br>${evaluation.reason}`, true);
    addLog(evaluation.reason || "Evaluation error");
    return;
  }

  setStatus("Valid recursion. Tree built.", "ok");
  setSummary(
    `<strong>Valid recursion.</strong><br>f(${startN}) = ${evaluation.node.value}<br>Nodes: ${evaluation.nodeCount}, max depth: ${evaluation.maxDepth}`,
    false
  );
  addLog("Tree built successfully.");
}

function resetAll() {
  ui.startN.value = "5";
  ui.baseCondition.value = "n <= 1";
  ui.baseReturn.value = "n";
  ui.recursiveExpr.value = "f(n - 1) + f(n - 2)";
  clearOutput();
  setStatus(isUnlocked ? "Ready." : "Complete check-in to begin.");
}

function applyExample(exampleKey) {
  const example = EXAMPLES[exampleKey];
  if (!example) return;

  ui.startN.value = example.startN;
  ui.baseCondition.value = example.baseCondition;
  ui.baseReturn.value = example.baseReturn;
  ui.recursiveExpr.value = example.recursiveExpr;
  clearOutput();
  setStatus(`${example.label} example loaded.`);
  addLog(`Loaded example: ${example.label}`);
}

async function handleStudentSubmit(event) {
  event.preventDefault();
  const studentName = ui.studentName.value.trim();
  const studentId = ui.studentId.value.trim();

  if (!studentName || !studentId) {
    setGateMessage("Please enter both name and student ID to start.", true);
    return;
  }

  ui.startActivityBtn.disabled = true;
  setGateMessage("Saving your check-in...");

  const result = await saveStudentToGoogleSheet(studentName, studentId);
  localStorage.setItem(STUDENT_NAME_STORAGE_KEY, studentName);
  localStorage.setItem(STUDENT_ID_STORAGE_KEY, studentId);
  unlockActivity();
  resetAll();

  if (result.ok) {
    setGateMessage("Check-in saved.");
  } else if (result.reason === "missing_url") {
    setGateMessage("Started, but Google Sheet URL is not configured.", true);
  } else {
    setGateMessage("Started, but Google Sheet could not be reached.", true);
  }

  addLog(`Check-in: ${studentName} (${studentId})`);
}

function init() {
  ui.studentForm.addEventListener("submit", handleStudentSubmit);
  ui.runBtn.addEventListener("click", runAnalysis);
  ui.resetBtn.addEventListener("click", resetAll);
  ui.exampleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyExample(button.dataset.example || "");
    });
  });

  const savedStudentName = localStorage.getItem(STUDENT_NAME_STORAGE_KEY);
  const savedStudentId = localStorage.getItem(STUDENT_ID_STORAGE_KEY);
  if (savedStudentName && savedStudentId) {
    unlockActivity();
    saveStudentToGoogleSheet(savedStudentName, savedStudentId).then((result) => {
      if (result.ok) {
        addLog(`Check-in restored: ${savedStudentName} (${savedStudentId})`);
      }
    });
  }

  resetAll();
}

init();
