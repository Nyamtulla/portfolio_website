class Node {
  constructor(url) {
    this.url = url;
    this.prev = null;
    this.next = null;
  }
}

class BrowserHistoryLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.length = 0;
  }

  navigate(url) {
    const node = new Node(url);
    const fromIndex = this.currentIndex();
    let truncatedCount = 0;
    let createdAt = 0;

    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.current = node;
      this.length = 1;
      return { fromIndex, toIndex: 0, createdAt: 0, truncatedCount };
    }

    if (this.current !== this.tail) {
      let walker = this.current.next;
      while (walker) {
        this.length -= 1;
        truncatedCount += 1;
        walker = walker.next;
      }
      this.current.next = null;
      this.tail = this.current;
    }

    node.prev = this.current;
    this.current.next = node;
    this.current = node;
    this.tail = node;
    this.length += 1;
    createdAt = fromIndex + 1;
    return { fromIndex, toIndex: createdAt, createdAt, truncatedCount };
  }

  back() {
    if (this.current && this.current.prev) {
      this.current = this.current.prev;
      return true;
    }
    return false;
  }

  forward() {
    if (this.current && this.current.next) {
      this.current = this.current.next;
      return true;
    }
    return false;
  }

  toArray() {
    const result = [];
    let walker = this.head;
    while (walker) {
      result.push(walker);
      walker = walker.next;
    }
    return result;
  }

  currentIndex() {
    if (!this.current) return -1;
    let idx = 0;
    let walker = this.head;
    while (walker) {
      if (walker === this.current) return idx;
      idx += 1;
      walker = walker.next;
    }
    return -1;
  }
}

const historyLL = new BrowserHistoryLinkedList();

const navForm = document.getElementById("navForm");
const urlInput = document.getElementById("urlInput");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const appShell = document.getElementById("appShell");
const studentGate = document.getElementById("studentGate");
const studentForm = document.getElementById("studentForm");
const studentNameInput = document.getElementById("studentName");
const startLabBtn = document.getElementById("startLabBtn");
const gateStatus = document.getElementById("gateStatus");
const currentPage = document.getElementById("currentPage");
const pageHint = document.getElementById("pageHint");
const historyList = document.getElementById("historyList");
const indexChip = document.getElementById("indexChip");
const commandLog = document.getElementById("commandLog");
const activitySummary = document.getElementById("activitySummary");
const stepChecklist = document.getElementById("stepChecklist");
const nodeTableBody = document.getElementById("nodeTableBody");
// Paste your deployed Google Apps Script Web App URL here.
const GOOGLE_APPS_SCRIPT_URL ="https://script.google.com/macros/s/AKfycbybh0c_ntXgSQP41aCTbtxqna3qIjf7Dt-IIuJuJF5NKkFUDz6fg6GqNdQ7CTiC2bG-Wg/exec"
const STUDENT_NAME_STORAGE_KEY = "eecs268_student_name";

let checkedInStudentName = "";

let lastAction = {
  command: "Start",
  detail: "No commands yet",
  steps: [
    "Head, tail, and current are null.",
    "Current index is -1 until first Navigate command.",
    "Use Go, Back, and Forward to see pointer movement."
  ]
};

function normalizeUrl(input) {
  const trimmed = input.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes(".")) return `https://${trimmed}`;
  return trimmed;
}

function render() {
  const nodes = historyLL.toArray();
  const currentIdx = historyLL.currentIndex();

  historyList.innerHTML = "";
  nodeTableBody.innerHTML = "";

  if (!nodes.length) {
    historyList.innerHTML = "<p>No history yet. Use the URL bar to navigate.</p>";
    currentPage.textContent = "about:blank";
    pageHint.textContent = "Navigate to a URL to start building browser history.";
    indexChip.textContent = "Current Index: -1";
    backBtn.disabled = true;
    forwardBtn.disabled = true;
    activitySummary.textContent = `${lastAction.command}: ${lastAction.detail}`;
    renderChecklist(lastAction.steps);
    nodeTableBody.innerHTML = "<tr><td colspan=\"5\">No nodes created yet.</td></tr>";
    return;
  }

  nodes.forEach((node, index) => {
    const item = document.createElement("div");
    item.className = index === currentIdx ? "node current" : "node";
    item.textContent = `[${index}] ${node.url}`;
    historyList.appendChild(item);

    if (index < nodes.length - 1) {
      const arrow = document.createElement("span");
      arrow.className = "arrow";
      arrow.textContent = "->";
      historyList.appendChild(arrow);
    }
  });

  currentPage.textContent = historyLL.current.url;
  pageHint.textContent = "Linked list updates live as you use Back, Forward, and Go.";
  indexChip.textContent = `Current Index: ${currentIdx}`;
  backBtn.disabled = !historyLL.current.prev;
  forwardBtn.disabled = !historyLL.current.next;
  activitySummary.textContent = `${lastAction.command}: ${lastAction.detail}`;
  renderChecklist(lastAction.steps);
  renderNodeTable(nodes, currentIdx);
}

function logCommand(command, detail) {
  const li = document.createElement("li");
  li.textContent = `${command}: ${detail}`;
  commandLog.prepend(li);

  while (commandLog.children.length > 12) {
    commandLog.removeChild(commandLog.lastChild);
  }
}

function renderChecklist(steps) {
  stepChecklist.innerHTML = "";
  steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    stepChecklist.appendChild(li);
  });
}

function renderNodeTable(nodes, currentIdx) {
  nodes.forEach((node, index) => {
    const tr = document.createElement("tr");
    const prevUrl = node.prev ? node.prev.url : "null";
    const nextUrl = node.next ? node.next.url : "null";
    const currentLabel = index === currentIdx ? "Yes" : "No";
    tr.innerHTML = `<td>${index}</td><td>${node.url}</td><td>${prevUrl}</td><td>${nextUrl}</td><td class="${index === currentIdx ? "yes-current" : ""}">${currentLabel}</td>`;
    nodeTableBody.appendChild(tr);
  });
}

function setAction(command, detail, steps) {
  lastAction = { command, detail, steps };
}

function setGateMessage(message, isError = false) {
  gateStatus.textContent = message;
  gateStatus.style.color = isError ? "#b91c1c" : "#166534";
}

function unlockLab(studentName) {
  checkedInStudentName = studentName;
  appShell.classList.remove("locked");
  studentGate.style.display = "none";
}

async function saveStudentToGoogleSheet(studentName) {
  if (!GOOGLE_APPS_SCRIPT_URL) {
    return { ok: false, reason: "missing_url" };
  }

  const payload = new URLSearchParams({
    name: studentName,
    activity: "EECS 268 Lab Activity",
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

navForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = normalizeUrl(urlInput.value);
  if (!value) return;

  const result = historyLL.navigate(value);
  logCommand("Navigate", value);
  const steps = [
    `Created new node for "${value}" at index ${result.createdAt}.`,
    `Current pointer moved from index ${result.fromIndex} to ${result.toIndex}.`,
    result.truncatedCount > 0
      ? `Removed ${result.truncatedCount} forward node(s) because new navigation replaced forward history.`
      : "No forward nodes were removed."
  ];
  setAction("Navigate", value, steps);
  urlInput.value = "";
  render();
});

backBtn.addEventListener("click", () => {
  const fromIndex = historyLL.currentIndex();
  if (historyLL.back()) {
    logCommand("Back", historyLL.current.url);
    const toIndex = historyLL.currentIndex();
    setAction("Back", historyLL.current.url, [
      `Moved current pointer from index ${fromIndex} to ${toIndex}.`,
      "No nodes were created or deleted.",
      "Linked list structure stayed the same; only current changed."
    ]);
    render();
  } else {
    setAction("Back", "Blocked at head node", [
      "Current node is already the head.",
      "Back command cannot move to a previous node.",
      "Current index and list remain unchanged."
    ]);
    render();
  }
});

forwardBtn.addEventListener("click", () => {
  const fromIndex = historyLL.currentIndex();
  if (historyLL.forward()) {
    logCommand("Forward", historyLL.current.url);
    const toIndex = historyLL.currentIndex();
    setAction("Forward", historyLL.current.url, [
      `Moved current pointer from index ${fromIndex} to ${toIndex}.`,
      "No nodes were created or deleted.",
      "Linked list structure stayed the same; only current changed."
    ]);
    render();
  } else {
    setAction("Forward", "Blocked at tail node", [
      "Current node is already the tail.",
      "Forward command cannot move to a next node.",
      "Current index and list remain unchanged."
    ]);
    render();
  }
});

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const studentName = studentNameInput.value.trim();
  if (!studentName) {
    setGateMessage("Please enter your name to start.", true);
    return;
  }

  startLabBtn.disabled = true;
  setGateMessage("Saving your check-in...");

  const result = await saveStudentToGoogleSheet(studentName);
  localStorage.setItem(STUDENT_NAME_STORAGE_KEY, studentName);
  unlockLab(studentName);

  if (result.ok) {
    logCommand("Check-in", `${studentName} joined the lab.`);
  } else if (result.reason === "missing_url") {
    logCommand("Check-in", `${studentName} joined. Google Sheet URL not configured yet.`);
  } else {
    logCommand("Check-in", `${studentName} joined. Could not reach Google Sheet endpoint.`);
  }

  setAction("Check-in", studentName, [
    `Student name recorded as "${studentName}".`,
    "Activity is now unlocked.",
    result.ok ? "Submission sent to Google Sheet." : "Google Sheet sync not confirmed."
  ]);
  render();
});

const savedStudentName = localStorage.getItem(STUDENT_NAME_STORAGE_KEY);
if (savedStudentName) {
  unlockLab(savedStudentName);
  setAction("Check-in", savedStudentName, [
    `Welcome back, ${savedStudentName}.`,
    "Loaded your previous check-in from this browser.",
    "Recording this page open in Google Sheet."
  ]);
  saveStudentToGoogleSheet(savedStudentName).then((result) => {
    if (result.ok) {
      logCommand("Check-in", `${savedStudentName} opened the lab (recorded).`);
    } else if (result.reason === "missing_url") {
      logCommand("Check-in", `${savedStudentName} opened the lab. Google Sheet URL not configured yet.`);
    } else {
      logCommand("Check-in", `${savedStudentName} opened the lab. Could not reach Google Sheet endpoint.`);
    }
    render();
  });
}

render();
