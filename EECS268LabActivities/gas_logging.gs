const SPREADSHEET_ID = "10BPM_YR1vlPKDtnivkNRbUJmJ5nvGTJTOZaGcw_7MsM";
const SHEET_NAME = "app_logs";

function doGet() {
  return ContentService
    .createTextOutput("Web app is live")
    .setMimeType(ContentService.MimeType.TEXT);
}

function readPayload(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  let jsonBody = {};

  if (e && e.postData && e.postData.contents) {
    try {
      jsonBody = JSON.parse(e.postData.contents);
    } catch (err) {
      jsonBody = {};
    }
  }

  const merged = Object.assign({}, jsonBody, params);
  return {
    name: String(merged.name || "").trim(),
    studentId: String(merged.studentId || merged.id || "").trim(),
    activity: String(merged.activity || "").trim(),
    timestamp: String(merged.timestamp || new Date().toISOString()).trim()
  };
}

function doPost(e) {
  try {
    const payload = readPayload(e);

    if (!payload.name) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Missing name" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!payload.studentId) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Missing studentId" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!payload.activity) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Missing activity" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SPREADSHEET_ID
      ? SpreadsheetApp.openById(SPREADSHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();

    if (!ss) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Spreadsheet not found. Check SPREADSHEET_ID." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["name", "studentId", "activity", "timestamp"]);
    }

    sheet.appendRow([
      payload.name,
      payload.studentId,
      payload.activity,
      payload.timestamp
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
