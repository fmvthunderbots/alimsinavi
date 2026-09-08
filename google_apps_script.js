/**
 * THUNDER âš¡ BOTS - TEKNÄ°K VE PROJE KULÃœBÃœ DEÄERLENDÄ°RME SINAVI
 * Google Apps Script Webhook (Code.gs)
 * 
 * 100 PUANLIK YENÄ° SINAV NOTU SÄ°STEMÄ°:
 * 1. DonanÄ±m BaÄŸlama (Kablo/Port): 10 Puan (YavaÅŸ/Atlama: 5 Puan)
 * 2. 1. Soru (Kodlama 1): 10 Puan
 * 3. 2. Soru (Kodlama 2): 10 Puan
 * 4. 3. Soru (MantÄ±k 1 - Robotik Åifre): 10 Puan
 * 5. 4. Soru (MantÄ±k 2 - Periyodik DÃ¶ngÃ¼): 10 Puan
 * 6. 5. Soru (MantÄ±k 3 - DiÅŸli Ã‡arklar): 10 Puan
 * 7. 6. Soru (MantÄ±k 4 - Depo Robotu SÄ±ralama): 10 Puan
 * 8. 7. Soru (SimÃ¼latÃ¶r 1 - Rota Takibi): 15 Puan
 * 9. 8. Soru (SimÃ¼latÃ¶r 2 - Renk Åeritleri): 15 Puan
 * ----------------------------------------------------
 * TOPLAM: 100 TAM PUAN
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    var startRow = sheet.getLastRow() + 1;
    if (startRow === 1) startRow = 2; // BaÅŸlÄ±k satÄ±rÄ±nÄ± koru
    
    // DonanÄ±m puanÄ± (VarsayÄ±lan 10, yavaÅŸ/atlama 5)
    var hwPoints = (data.secretHardwarePoints !== undefined) ? Number(data.secretHardwarePoints) : 10;
    if (hwPoints > 10) hwPoints = 10; // 10 puandan fazla olamaz
    
    // Otomatik MantÄ±k Kontrolleri (Ã–ÄŸretmen isterse elle deÄŸiÅŸtirebilir)
    // Soru 3 DoÄŸru Cevap: 9284
    var q3AnswerClean = (data.q3Answer || "").replace(/\s+/g, "");
    var q3AutoScore = (q3AnswerClean.indexOf("9284") !== -1) ? 10 : 0;
    
    // Soru 4 DoÄŸru Cevap: 46 (veya 46 saniye)
    var q4AnswerClean = (data.q4Answer || "").toLowerCase();
    var q4AutoScore = (q4AnswerClean.indexOf("46") !== -1) ? 10 : 0;

    // Soru 5 DoÄŸru Cevap: 10 (10 tur, saat yÃ¶nÃ¼nde)
    var q5AnswerClean = (data.q5Answer || "").toLowerCase();
    var q5AutoScore = (q5AnswerClean.indexOf("10") !== -1 && (q5AnswerClean.indexOf("saat") !== -1 || q5AnswerClean.indexOf("yÃ¶n") !== -1 || q5AnswerClean === "10")) ? 10 : (q5AnswerClean.indexOf("10") !== -1 ? 5 : 0);

    // Soru 6 DoÄŸru Cevap: 5-1-2-4-3 veya Ortanca 2
    var q6AnswerClean = (data.q6Answer || "").replace(/\s+/g, "");
    var q6AutoScore = (q6AnswerClean.indexOf("5-1-2-4-3") !== -1 || q6AnswerClean.indexOf("5,1,2,4,3") !== -1 || q6AnswerClean.indexOf("ortanca:2") !== -1 || q6AnswerClean.indexOf("ortanca2") !== -1) ? 10 : 0;

    // SatÄ±r iÃ§erik dizisi (Label, DeÄŸer)
    var rows = [
      ["ğŸ“… Tarih / Saat:", data.timestamp || new Date().toLocaleString("tr-TR")],
      ["ğŸ‘¤ Ã–ÄŸrenci AdÄ± SoyadÄ±:", data.studentName || "Bilinmiyor"],
      ["ğŸ« SÄ±nÄ±f / Åube:", data.studentClass || "Bilinmiyor"],
      ["âš¡ DonanÄ±m BaÄŸlantÄ± PuanÄ± (Gizli):", hwPoints],
      
      ["ğŸ“Œ 1. SORU Ã–ÄRENCÄ° KODU:", data.q1Answer || "(YanÄ±t verilmedi)"],
      ["ğŸ“ 1. Soru PuanÄ± (Max 10):", (data.q1Answer && data.q1Answer !== "(YanÄ±t verilmedi)") ? 10 : 0],
      
      ["ğŸ“Œ 2. SORU Ã–ÄRENCÄ° KODU:", data.q2Answer || "(YanÄ±t verilmedi)"],
      ["ğŸ“ 2. Soru PuanÄ± (Max 10):", (data.q2Answer && data.q2Answer !== "(YanÄ±t verilmedi)") ? 10 : 0],
      
      ["ğŸ“ 3. SORU MANTIK YANITI:", data.q3Answer || "(YanÄ±t verilmedi)"],
      ["ğŸ“ 3. Soru PuanÄ± (Max 10):", q3AutoScore],
      
      ["ğŸ“ 4. SORU MANTIK YANITI:", data.q4Answer || "(YanÄ±t verilmedi)"],
      ["ğŸ“ 4. Soru PuanÄ± (Max 10):", q4AutoScore],
      
      ["ğŸ“ 5. SORU MANTIK YANITI:", data.q5Answer || "(YanÄ±t verilmedi)"],
      ["ğŸ“ 5. Soru PuanÄ± (Max 10):", q5AutoScore],
      
      ["ğŸ“ 6. SORU MANTIK YANITI:", data.q6Answer || "(YanÄ±t verilmedi)"],
      ["ğŸ“ 6. Soru PuanÄ± (Max 10):", q6AutoScore],
      
      ["ğŸ¤– 7. SORU SÄ°MÃœLATÃ–R (KullanÄ±lan Hak: " + (data.q7SimAttemptsUsed || 0) + "/3):", data.q7Answer || "(YanÄ±t verilmedi)"],
      ["ğŸ“ 7. Soru PuanÄ± (Max 15):", (data.q7Answer && data.q7Answer !== "(YanÄ±t verilmedi)") ? 15 : 0],
      
      ["ğŸ¤– 8. SORU SÄ°MÃœLATÃ–R (KullanÄ±lan Hak: " + (data.q8SimAttemptsUsed || 0) + "/3):", data.q8Answer || "(YanÄ±t verilmedi)"],
      ["ğŸ“ 8. Soru PuanÄ± (Max 15):", (data.q8Answer && data.q8Answer !== "(YanÄ±t verilmedi)") ? 15 : 0],
      
      ["ğŸ§® HAM TOPLAM PUAN (Max 100):", "=SUM(B" + (startRow + 3) + ", B" + (startRow + 5) + ", B" + (startRow + 7) + ", B" + (startRow + 9) + ", B" + (startRow + 11) + ", B" + (startRow + 13) + ", B" + (startRow + 15) + ", B" + (startRow + 17) + ", B" + (startRow + 19) + ")"],
      ["ğŸ’¯ 100'LÃœK SINAV NOTU:", "=B" + (startRow + 20)],
      ["------------------------------------------------------", "------------------------------------------------------"]
    ];

    // Verileri sayfaya yaz
    var range = sheet.getRange(startRow, 1, rows.length, 2);
    range.setValues(rows);

    // GÃ¶rsel BiÃ§imlendirme (Renklendirme & Vurgulama)
    var hamRow = startRow + 20;
    var notRow = startRow + 21;
    
    sheet.getRange(hamRow, 1, 1, 2).setBackground("#fef9c3").setFontWeight("bold");
    sheet.getRange(notRow, 1, 1, 2).setBackground("#dcfce7").setFontWeight("bold").setFontSize(11);
    sheet.getRange(startRow + 3, 1, 1, 2).setFontColor("#4b5563");

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", row: startRow }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}