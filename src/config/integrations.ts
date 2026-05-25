// ============================================================
// Google Sheets RSVP webhook
// ============================================================
//
// Spreadsheet:
// https://docs.google.com/spreadsheets/d/1zJ5fPq1nEc9UPEnp9JXv8KyVFDKHNIbTSVofteuLvWc/edit
//
// SETUP — atlikite šiuos žingsnius vieną kartą:
//
// 1. Atidarykite Sheets dokumentą virš šio teksto.
// 2. Extensions → Apps Script.
// 3. Ištrinkite viską ir įklijuokite ŠĮ kodą (jis atitinka frontend payload'ą):
//
//    const SHEET_NAME = 'RSVP';
//    const HEADERS = [
//      'submitted_at','slug','attending',
//      'first_name','last_name','meal_choice',
//      'partner_first_name','partner_last_name','partner_meal_choice',
//      'dietary_notes','message'
//    ];
//
//    function doPost(e) {
//      const ss = SpreadsheetApp.getActiveSpreadsheet();
//      const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
//      if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
//      // Frontend siunčia text/plain, kad išvengtų CORS preflight'o.
//      const data = JSON.parse(e.postData.contents);
//      sheet.appendRow(HEADERS.map(h => data[h] ?? ''));
//      return ContentService
//        .createTextOutput(JSON.stringify({ ok: true }))
//        .setMimeType(ContentService.MimeType.JSON);
//    }
//
//    function doGet() {
//      return ContentService.createTextOutput('ok');
//    }
//
// 4. Spauskite Deploy → New deployment → Type: Web app.
//    Execute as: Me. Who has access: Anyone.
// 5. Nukopijuokite gautą /exec URL ir įklijuokite žemiau.
//
// SVARBU: kiekvieną kartą, kai keičiate Apps Script kodą,
// reikia "Deploy → Manage deployments → Edit → New version".

export const GOOGLE_SHEETS_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbxXOAAOc4ifp9ba-nzXx4X17t-vVZ5O7Ftl-HFSMB_BojGW3Bfs5Z_7eX92Y9PfZ1s_8Q/exec";
