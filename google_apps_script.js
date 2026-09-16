/**
 * THUNDER ⚡ BOTS - TEKNİK VE PROJE KULÜBÜ DEĞERLENDİRME SINAVI (6 SORULUK TAM SİSTEM)
 * Google Apps Script Webhook (Code.gs)
 * 
 * 100 PUANLIK SINAV NOTU DAĞILIMI:
 * 1. Donanım Bağlama (Kablo/Port): 10 Puan
 * 2. 1. Soru (Kodlama 1 - Eşkenar Üçgen Rotası): 15 Puan
 * 3. 2. Soru (Kodlama 2 - Akıllı Otopark Asistanı): 15 Puan
 * 4. 3. Soru (Mantık 1 - Sihirli Piramit): 15 Puan
 * 5. 4. Soru (Mantık 2 - Atletler Yarış Mantığı): 15 Puan
 * 6. 5. Soru (Mantık 3 - Hedef Tahtası): 15 Puan
 * 7. 6. Soru (Mantık 4 - Kutu Silme): 15 Puan
 * ----------------------------------------------------
 * TOPLAM: 10 + (6 × 15) = 100 TAM PUAN
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Eşzamanlı isteklerde çakışmayı önlemek için 25 saniye kilit bekle
    lock.waitLock(25000);

    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    var timestamp = data.timestamp || new Date().toLocaleString("tr-TR");
    var studentName = data.studentName || "Bilinmeyen Öğrenci";
    var studentClass = data.studentClass || "Sınıf Belirtilmedi";
    var sessionId = data.sessionId || (studentName + "_" + studentClass);
    var isFinal = (data.isFinal === true);
    var currentQNum = data.currentQuestionNum || 1;
    var statusText = isFinal ? "✅ SINAV TAMAMLANDI" : ("⏳ SINAV DEVAM EDİYOR (Soru " + currentQNum + " / 6 Kaydedildi)");

    // Donanım bağlantı puanı (Gizli)
    var hwPoints = (data.secretHardwarePoints !== undefined) ? Number(data.secretHardwarePoints) : 10;
    if (hwPoints > 10) hwPoints = 10;

    // --- ÖĞRENCİ PUANLARININ HESAPLANMASI (JAVASCRIPT TARAFI) ---
    var q1Score = (data.q1Answer && data.q1Answer !== "(Yanıt verilmedi)") ? 15 : 0;
    var q2Score = (data.q2Answer && data.q2Answer !== "(Yanıt verilmedi)") ? 15 : 0;

    var q3Ans = data.q3Answer || "(Yanıt verilmedi)";
    var q3Clean = q3Ans.replace(/\s+/g, "").replace(/➔/g, "->");
    var q3Expected = "6 -> 7 -> 1 -> 4 -> 2 -> 5 -> 3 -> 10 -> 8 -> 9";
    var q3Score = (data.q3Correct === true || q3Clean.indexOf("6->7->1->4->2->5->3->10->8->9") !== -1 || q3Clean.indexOf("6,7,1,4,2,5,3,10,8,9") !== -1) ? 15 : 0;

    var q4Ans = data.q4Answer || "(Yanıt verilmedi)";
    var q4Clean = q4Ans.toUpperCase().replace(/\s+/g, "");
    var q4Score = ((q4Clean.indexOf("A:5") !== -1 && q4Clean.indexOf("B:1") !== -1) || q4Clean.indexOf("5-1-4-3-2") !== -1 || q4Clean.indexOf("5,1,4,3,2") !== -1 || q4Clean.indexOf("51432") !== -1) ? 15 : 0;

    var q5Ans = data.q5Answer || "(Yanıt verilmedi)";
    var q5Clean = q5Ans.toLowerCase().replace(/\s+/g, "");
    var q5Score = ((q5Clean.indexOf("13x2") !== -1 && q5Clean.indexOf("21x2") !== -1) || (q5Clean.indexOf("13*2") !== -1 && q5Clean.indexOf("21*2") !== -1) || (q5Clean.indexOf("13") !== -1 && q5Clean.indexOf("21") !== -1 && q5Clean.indexOf("32") !== -1)) ? 15 : 0;

    var q6Ans = data.q6Answer || "(Yanıt verilmedi)";
    var q6Clean = q6Ans.toLowerCase().replace(/\s+/g, "");
    var q6Score = (((q6Clean.indexOf("-") !== -1 || q6Clean.indexOf("eksi") !== -1) && q6Clean.indexOf("7") !== -1) || q6Clean.indexOf("5x5+8") !== -1 || q6Clean.indexOf("5*5+8") !== -1 || q6Clean.indexOf("9+24") !== -1 || q6Clean.indexOf("33") !== -1) ? 15 : 0;

    var totalScore = hwPoints + q1Score + q2Score + q3Score + q4Score + q5Score + q6Score;

    // --- MÜKERRER KAYIT ÖNLEME / MEVCUT OTURUMU BULUP YENİLEME ---
    var lastRow = sheet.getLastRow();
    var existingStartRow = -1;
    var existingEndRow = -1;

    if (lastRow > 1) {
      var dataCol = sheet.getRange(1, 1, lastRow, 2).getValues();
      for (var r = 0; r < dataCol.length; r++) {
        var colA = dataCol[r][0] ? dataCol[r][0].toString() : "";
        var colB = dataCol[r][1] ? dataCol[r][1].toString() : "";
        if (colA.indexOf("🆔 Sınav Oturum Kodu (ID):") !== -1 && colB === sessionId) {
          // Bu oturuma ait eski bloğun başlangıç ayracını bul (yukarı doğru tara)
          var sIdx = r;
          while (sIdx > 0 && (!dataCol[sIdx][0] || dataCol[sIdx][0].toString().indexOf("====") === -1)) {
            sIdx--;
          }
          existingStartRow = sIdx + 1; // 1-indexed

          // Bloğun bitiş ayracını bul (aşağı doğru tara)
          var eIdx = r + 1;
          while (eIdx < dataCol.length && (!dataCol[eIdx][0] || dataCol[eIdx][0].toString().indexOf("====") === -1)) {
            eIdx++;
          }
          existingEndRow = (eIdx < dataCol.length) ? eIdx : lastRow;
          break;
        }
      }
    }

    // Eğer öğrencinin daha önce kaydedilmiş bir ara kaydı varsa, o satırları temizle
    if (existingStartRow !== -1 && existingEndRow >= existingStartRow) {
      sheet.deleteRows(existingStartRow, (existingEndRow - existingStartRow + 1));
    }

    // --- YENİ / GÜNCELLENMİŞ ÖĞRENCİ KARTINI TABLOYA YAZ ---
    // 1. Ayraç Çizgisi
    sheet.appendRow(["'======================================================", "'======================================================"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 2).setFontWeight("bold").setBackground("#cbd5e1");

    // 2. Öğrenci Künyesi ve Başlık Toplam Puanı (Öğretmenin ilk gördüğü alan)
    sheet.appendRow(["🆔 Sınav Oturum Kodu (ID):", sessionId]);
    sheet.appendRow(["📅 Son Güncelleme / Saat:", timestamp]);
    sheet.appendRow(["👤 Öğrenci Adı Soyadı:", studentName]);
    sheet.appendRow(["🏫 Sınıf / Şube:", studentClass]);
    
    sheet.appendRow(["📊 Sınav Durumu:", statusText]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 2).setFontWeight("bold").setBackground(isFinal ? "#dcfce7" : "#fef9c3");

    sheet.appendRow(["🏆 TOPLAM SINAV NOTU:", totalScore + " / 100"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 2).setFontWeight("bold").setBackground("#fde047").setFontSize(11);

    sheet.appendRow(["⚡ Donanım Bağlantı Puanı (Gizli):", hwPoints]);
    var hwScoreRow = sheet.getLastRow();

    // --- 1. SORU (KODLAMA 1) ---
    sheet.appendRow(["🚀 1. SORU ÖĞRENCİ KODU:", "", "BEKLENEN ÇÖZÜM: Örnek: 3 defa tekrarla [ 40 cm ileri git, sağa 120 derece dön ]"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 3).setFontWeight("bold").setBackground("#e2e8f0");
    var q1Lines = (data.q1Answer || "(Yanıt verilmedi)").split("\n");
    for (var i = 0; i < q1Lines.length; i++) {
      if (q1Lines[i].trim() !== "") sheet.appendRow(["", q1Lines[i], ""]);
    }
    sheet.appendRow(["🎯 1. Soru Puanı (Max 15):", q1Score, ""]);
    var q1ScoreRow = sheet.getLastRow();

    // --- 2. SORU (KODLAMA 2) ---
    sheet.appendRow(["🚀 2. SORU ÖĞRENCİ KODU:", "", "BEKLENEN ÇÖZÜM: Olay [mesafe > 15 olana kadar bekle] -> [durdur] -> [90 sağa dön] -> [15 cm geri git] -> [sapma açısını sıfırla]"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 3).setFontWeight("bold").setBackground("#e2e8f0");
    var q2Lines = (data.q2Answer || "(Yanıt verilmedi)").split("\n");
    for (var j = 0; j < q2Lines.length; j++) {
      if (q2Lines[j].trim() !== "") sheet.appendRow(["", q2Lines[j], ""]);
    }
    sheet.appendRow(["🎯 2. Soru Puanı (Max 15):", q2Score, ""]);
    var q2ScoreRow = sheet.getLastRow();

    // --- 3. SORU (MANTIK 1 - Sihirli Piramit) ---
    sheet.appendRow(["💡 3. SORU MANTIK YANITI (Sihirli Piramit):", q3Ans]);
    sheet.appendRow(["🎯 BEKLENEN YANIT:", q3Expected + " (1'den 10'a her sayı birer kez)"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 2).setFontColor("#15803d").setBackground("#f0fdf4");
    sheet.appendRow(["📝 3. Soru Puanı (Max 15):", q3Score]);
    var q3ScoreRow = sheet.getLastRow();

    // --- 4. SORU (MANTIK 2 - Atletler Yarış Mantığı) ---
    sheet.appendRow(["💡 4. SORU MANTIK YANITI (Atletler Yarış Mantığı):", q4Ans]);
    sheet.appendRow(["🎯 BEKLENEN YANIT:", "A:5, B:1, C:4, D:3, E:2"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 2).setFontColor("#15803d").setBackground("#f0fdf4");
    sheet.appendRow(["📝 4. Soru Puanı (Max 15):", q4Score]);
    var q4ScoreRow = sheet.getLastRow();

    // --- 5. SORU (MANTIK 3 - Hedef Tahtası Mantık Algoritması) ---
    sheet.appendRow(["💡 5. SORU MANTIK YANITI (Hedef Tahtası):", q5Ans]);
    sheet.appendRow(["🎯 BEKLENEN YANIT:", "13x2 + 21x2 + 32x1 = 100 (Toplam 5 ok)"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 2).setFontColor("#15803d").setBackground("#f0fdf4");
    sheet.appendRow(["📝 5. Soru Puanı (Max 15):", q5Score]);
    var q5ScoreRow = sheet.getLastRow();

    // --- 6. SORU (MANTIK 4 - Kutu Silme Mantık Algoritması) ---
    sheet.appendRow(["🧠 6. SORU MANTIK YANITI (Kutu Silme):", q6Ans]);
    sheet.appendRow(["✅ BEKLENEN YANIT:", "'-' (Eksi) ve '7' silinmeli ➔ (5x5 + 8 = 9 + 24 = 33)"]);
    sheet.getRange(sheet.getLastRow(), 1, 1, 2).setFontColor("#15803d").setBackground("#f0fdf4");
    sheet.appendRow(["📝 6. Soru Puanı (Max 15):", q6Score]);
    var q6ScoreRow = sheet.getLastRow();

    // --- TABLO ALTI TOPLAM PUAN SATIRI (HEM SAYISAL DEĞER HEM DİNAMİK FORMÜL) ---
    var formulaStr = "=B" + hwScoreRow + "+B" + q1ScoreRow + "+B" + q2ScoreRow + "+B" + q3ScoreRow + "+B" + q4ScoreRow + "+B" + q5ScoreRow + "+B" + q6ScoreRow;
    
    sheet.appendRow(["🧮 TOPLAM SINAV NOTU (Max 100):", totalScore]);
    var totalRow = sheet.getLastRow();
    sheet.getRange(totalRow, 1, 1, 2).setFontWeight("bold").setBackground("#dcfce7").setFontSize(12);
    
    try {
      sheet.getRange(totalRow, 2).setFormula(formulaStr);
    } catch (fErr) {
      sheet.getRange(totalRow, 2).setValue(totalScore);
    }

    sheet.appendRow(["", ""]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      sessionId: sessionId,
      totalScore: totalScore,
      isFinal: isFinal
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}