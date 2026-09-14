/**
 * THUNDER ⚡ BOTS - TEKNİK VE PROJE KULÜBÜ DEĞERLENDİRME SINAVI (8 SORULUK TAM SİSTEM)
 * Google Apps Script Webhook (Code.gs)
 * 
 * 100 PUANLIK SINAV NOTU DAĞILIMI:
 * 1. Donanım Bağlama (Kablo/Port): 10 Puan
 * 2. 1. Soru (Kodlama 1): 10 Puan
 * 3. 2. Soru (Kodlama 2): 10 Puan
 * 4. 3. Soru (Mantık 1 - Robotik Şifre): 10 Puan
 * 5. 4. Soru (Mantık 2 - Periyodik Döngü): 10 Puan
 * 6. 5. Soru (Mantık 3 - Dişli Çarklar): 10 Puan
 * 7. 6. Soru (Mantık 4 - Depo Robotu Sıralama): 10 Puan
 * 8. 7. Soru (Simülatör 1 - Rota Takibi): 15 Puan
 * 9. 8. Soru (Simülatör 2 - Renk Şeritleri): 15 Puan
 * ----------------------------------------------------
 * TOPLAM: 100 TAM PUAN
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    var timestamp = data.timestamp || new Date().toLocaleString("tr-TR");
    var studentName = data.studentName || "Bilinmeyen Öğrenci";
    var studentClass = data.studentClass || "Sınıf Belirtilmedi";
    
    // Donanım bağlantı puanı (Gizli)
    var hwPoints = (data.secretHardwarePoints !== undefined) ? Number(data.secretHardwarePoints) : 10;
    if (hwPoints > 10) hwPoints = 10;
    
    // Ayraç Çizgisi
    sheet.appendRow(["'======================================================", "'======================================================"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 2).setFontWeight("bold").setBackground("#cbd5e1");
    
    sheet.appendRow(["📅 Tarih / Saat:", timestamp]);
    sheet.appendRow(["👤 Öğrenci Adı Soyadı:", studentName]);
    sheet.appendRow(["🏫 Sınıf / Şube:", studentClass]);
    sheet.appendRow(["⚡ Donanım Bağlantı Puanı (Gizli):", hwPoints]);
    var hwScoreRow = sheet.getLastRow();
    
    // --- 1. SORU (KODLAMA 1) ---
    sheet.appendRow(["🚀 1. SORU ÖĞRENCİ KODU:", "", "BEKLENEN ÇÖZÜM: Örnek: 3 defa tekrarla [ 40 cm ileri git, sağa 120 derece dön ]"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 3).setFontWeight("bold").setBackground("#e2e8f0");
    var q1Lines = (data.q1Answer || "(Yanıt verilmedi)").split("\n");
    for (var i = 0; i < q1Lines.length; i++) {
      if (q1Lines[i].trim() !== "") sheet.appendRow(["", q1Lines[i], ""]);
    }
    sheet.appendRow(["🎯 1. Soru Puanı (Max 10):", (data.q1Answer && data.q1Answer !== "(Yanıt verilmedi)") ? 10 : 0, ""]);
    var q1ScoreRow = sheet.getLastRow();
    
    // --- 2. SORU (KODLAMA 2) ---
    sheet.appendRow(["🚀 2. SORU ÖĞRENCİ KODU:", "", "BEKLENEN ÇÖZÜM: Olay [mesafe > 15 olana kadar bekle] -> [durdur] -> [90 sağa dön] -> [15 cm geri git]"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 3).setFontWeight("bold").setBackground("#e2e8f0");
    var q2Lines = (data.q2Answer || "(Yanıt verilmedi)").split("\n");
    for (var j = 0; j < q2Lines.length; j++) {
      if (q2Lines[j].trim() !== "") sheet.appendRow(["", q2Lines[j], ""]);
    }
    sheet.appendRow(["🎯 2. Soru Puanı (Max 10):", (data.q2Answer && data.q2Answer !== "(Yanıt verilmedi)") ? 10 : 0, ""]);
    var q2ScoreRow = sheet.getLastRow();
    
    // --- 3. SORU (MANTIK 1 - Sihirli Piramit) ---
    var q3Ans = data.q3Answer || "(Yanıt verilmedi)";
    var q3Clean = q3Ans.replace(/\s+/g, "").replace(/➔/g, "->");
    var q3Expected = "6 -> 7 -> 1 -> 4 -> 2 -> 5 -> 3 -> 10 -> 8 -> 9";
    var q3Score = (data.q3Correct === true || q3Clean.indexOf("6->7->1->4->2->5->3->10->8->9") !== -1 || q3Clean.indexOf("6,7,1,4,2,5,3,10,8,9") !== -1) ? 10 : 0;
    sheet.appendRow(["💡 3. SORU MANTIK YANITI (Sihirli Piramit):", q3Ans]);
    sheet.appendRow(["🎯 BEKLENEN YANIT:", q3Expected + " (1'den 10'a her sayı birer kez)"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 2).setFontColor("#15803d").setBackground("#f0fdf4");
    sheet.appendRow(["📝 3. Soru Puanı (Max 10):", q3Score]);
    var q3ScoreRow = sheet.getLastRow();
    
    // --- 4. SORU (MANTIK 2 - Atletler Yarış Mantığı) ---
    var q4Ans = data.q4Answer || "(Yanıt verilmedi)";
    var q4Clean = q4Ans.toUpperCase().replace(/\s+/g, "");
    var q4Score = ((q4Clean.indexOf("A:5") !== -1 && q4Clean.indexOf("B:1") !== -1) || q4Clean.indexOf("5-1-4-3-2") !== -1 || q4Clean.indexOf("5,1,4,3,2") !== -1 || q4Clean.indexOf("51432") !== -1) ? 10 : 0;
    sheet.appendRow(["💡 4. SORU MANTIK YANITI (Atletler Yarış Mantığı):", q4Ans]);
    sheet.appendRow(["🎯 BEKLENEN YANIT:", "A:5, B:1, C:4, D:3, E:2"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 2).setFontColor("#15803d").setBackground("#f0fdf4");
    sheet.appendRow(["📝 4. Soru Puanı (Max 10):", q4Score]);
    var q4ScoreRow = sheet.getLastRow();
    
    // --- 5. SORU (MANTIK 3 - Hedef Tahtası Mantık Algoritması) ---
    var q5Ans = data.q5Answer || "(Yanıt verilmedi)";
    var q5Clean = q5Ans.toLowerCase().replace(/\s+/g, "");
    var q5Score = ((q5Clean.indexOf("13x2") !== -1 && q5Clean.indexOf("21x2") !== -1) || (q5Clean.indexOf("13*2") !== -1 && q5Clean.indexOf("21*2") !== -1) || (q5Clean.indexOf("13") !== -1 && q5Clean.indexOf("21") !== -1 && q5Clean.indexOf("32") !== -1)) ? 10 : 0;
    sheet.appendRow(["💡 5. SORU MANTIK YANITI (Hedef Tahtası):", q5Ans]);
    sheet.appendRow(["🎯 BEKLENEN YANIT:", "13x2 + 21x2 + 32x1 = 100 (Toplam 5 ok)"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 2).setFontColor("#15803d").setBackground("#f0fdf4");
    sheet.appendRow(["📝 5. Soru Puanı (Max 10):", q5Score]);
    var q5ScoreRow = sheet.getLastRow();
    
    // --- 6. SORU (MANTIK 4 - Kutu Silme Mantık Algoritması) ---
    var q6Ans = data.q6Answer || "(Yanıt verilmedi)";
    var q6Clean = q6Ans.toLowerCase().replace(/\s+/g, "");
    var q6Score = ((q6Clean.indexOf("4") !== -1 && q6Clean.indexOf("3") !== -1) || q6Clean.indexOf("3-7x1") !== -1 || q6Clean.indexOf("3-7*1") !== -1 || q6Clean.indexOf("5x2-14") !== -1 || q6Clean.indexOf("5*2-14") !== -1) ? 10 : 0;
    sheet.appendRow(["💡 6. SORU MANTIK YANITI (Kutu Silme):", q6Ans]);
    sheet.appendRow(["🎯 BEKLENEN YANIT:", "Silinmesi gereken iki kutudaki ifadeler (Görsele göre değerlendiriniz)"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 2).setFontColor("#15803d").setBackground("#f0fdf4");
    sheet.appendRow(["📝 6. Soru Puanı (Max 10):", q6Score]);
    var q6ScoreRow = sheet.getLastRow();
    
    // --- 7. SORU (SİMÜLATÖR 1 - Rota Takibi) ---
    var q7HakText = " (Kullanılan Hak: " + (data.q7SimAttemptsUsed || 0) + "/3)";
    sheet.appendRow(["🎮 7. SORU SİMÜLATÖR KODU" + q7HakText + ":", "", "BEKLENEN ÇÖZÜM: 7cm ileri -> 90 sağa -> 15cm ileri -> 90 sola -> 15cm ileri -> 90 sola -> 15cm ileri -> 90 sağa -> hedef"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 3).setFontWeight("bold").setBackground("#e0f2fe");
    var q7Lines = (data.q7Answer || "(Yanıt verilmedi)").split("\n");
    for (var k = 0; k < q7Lines.length; k++) {
      if (q7Lines[k].trim() !== "") sheet.appendRow(["", q7Lines[k], ""]);
    }
    sheet.appendRow(["🎯 7. Soru Puanı (Max 15):", (data.q7Answer && data.q7Answer !== "(Yanıt verilmedi)") ? 15 : 0, ""]);
    var q7ScoreRow = sheet.getLastRow();
    
    // --- 8. SORU (SİMÜLATÖR 2 - Renk Şeritleri) ---
    var q8HakText = " (Kullanılan Hak: " + (data.q8SimAttemptsUsed || 0) + "/3)";
    sheet.appendRow(["🎮 8. SORU SİMÜLATÖR KODU" + q8HakText + ":", "", "BEKLENEN ÇÖZÜM: Sürekli tekrarla [ EĞER (renk = Kırmızı) İSE (durdur ve çık) DEĞİLSE (ileri sür) ]"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 3).setFontWeight("bold").setBackground("#e0f2fe");
    var q8Lines = (data.q8Answer || "(Yanıt verilmedi)").split("\n");
    for (var m = 0; m < q8Lines.length; m++) {
      if (q8Lines[m].trim() !== "") sheet.appendRow(["", q8Lines[m], ""]);
    }
    sheet.appendRow(["🎯 8. Soru Puanı (Max 15):", (data.q8Answer && data.q8Answer !== "(Yanıt verilmedi)") ? 15 : 0, ""]);
    var q8ScoreRow = sheet.getLastRow();
    
    // --- HESAPLAMA (Tüm dillerde hatasız çalışan doğrudan + ile toplama) ---
    var rawTotalRow = sheet.getLastRow() + 1;
    var formulaStr = "=B" + hwScoreRow + "+B" + q1ScoreRow + "+B" + q2ScoreRow + "+B" + q3ScoreRow + "+B" + q4ScoreRow + "+B" + q5ScoreRow + "+B" + q6ScoreRow + "+B" + q7ScoreRow + "+B" + q8ScoreRow;
    
    sheet.appendRow(["🧮 TOPLAM SINAV NOTU (Max 100):", formulaStr]);
    sheet.getRange(rawTotalRow, 1, 1, 2).setFontWeight("bold").setBackground("#dcfce7").setFontSize(11);
    sheet.appendRow(["", ""]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}