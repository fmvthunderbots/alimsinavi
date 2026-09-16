/**
 * SPIKE Prime Exam Application JavaScript Core Engine
 * Multi-Stack Canvas Support: Event Hat Blocks and Custom Blocks spawn as independent parallel stacks!
 */

/// ⚙️ E-TABLO BAĞLANTI AYARLARI VE ÖĞRETMEN YÖNETİMİ
const DEFAULT_GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwDcC9nCG0kAGBo-jZ1rt64d6Bmf58FXTSCFDVdVeRccTegwJyUNHymr5T_puYVxXYM/exec';
const TEACHER_MASTER_PASSWORD = '26575982824.bati';
const STORAGE_TEACHER_LOGGED = 'spike_teacher_authenticated';

function getGoogleSheetWebhookUrl() {
    const customUrl = localStorage.getItem('spike_webhook_url');
    if (customUrl && customUrl.includes('script.google.com/macros')) {
        return customUrl;
    }
    return DEFAULT_GOOGLE_SHEET_WEBHOOK_URL;
}

document.addEventListener('DOMContentLoaded', () => {
    // App State & Local Persistence Key
    const EXAM_SESSION_STORAGE_KEY = 'spike_active_exam_session';

    function generateSessionId() {
        return 'SPK-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    let studentInfo = { name: '', class: '', sessionId: '' };
    let questions = [...DEFAULT_QUESTIONS];
    let currentQuestionIndex = 0;
    let studentAnswers = {}; // { questionId: [ stack1, stack2... ] }
    let activeCategory = 'motorlar';
    let isDrawerOpen = false;
    let createdVariables = []; // Dynamic variable list
    let createdCustomBlocks = []; // Dynamic custom blocks
    let createdMessages = ['haber1']; // Dynamic broadcast messages list
    let currentDraggedBlock = null;

    // Secret Wiring Performance Tracking (10 Puan)
    let wiringStartTime = 0;
    let studentWiringScore = { durationSeconds: 0, points: 10 };

    // Sınav Durumunu Yerel Depolamada (LocalStorage) Kesintisiz Koruma
    function saveExamProgressLocally() {
        if (!studentInfo || !studentInfo.name || !studentInfo.name.trim()) return;
        try {
            const stateToSave = {
                studentInfo: studentInfo,
                studentWiringScore: studentWiringScore,
                currentQuestionIndex: currentQuestionIndex,
                studentAnswers: studentAnswers,
                examTimeRemaining: typeof examTimeRemaining === 'number' ? examTimeRemaining : TOTAL_EXAM_SECONDS,
                isExtensionActive: !!isExtensionActive,
                savedAt: Date.now()
            };
            localStorage.setItem(EXAM_SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (e) {
            console.warn('Yerel sınav durumu kaydedilemedi:', e);
        }
    }

    function clearLocalExamSession() {
        try {
            localStorage.removeItem(EXAM_SESSION_STORAGE_KEY);
        } catch (e) {
            console.warn('Oturum silinemedi:', e);
        }
    }

    // DOM Elements
    const modalStudentEntry = document.getElementById('modalStudentEntry');
    const formStudentEntry = document.getElementById('formStudentEntry');
    const studentPill = document.getElementById('studentPill');
    const studentInfoText = document.getElementById('studentInfoText');

    // Hardware Interactive Wiring Simulator Elements
    const modalHardwareSetup = document.getElementById('modalHardwareSetup');
    const heroStepBadge = document.getElementById('heroStepBadge');
    const wiringStepInstruction = document.getElementById('wiringStepInstruction');
    const simFeedback = document.getElementById('simFeedback');
    const btnStartExamFromSim = document.getElementById('btnStartExamFromSim');
    const btnSkipWiringSim = document.getElementById('btnSkipWiringSim');

    const categorySidebar = document.getElementById('categorySidebar');
    const blocksDrawer = document.getElementById('blocksDrawer');
    const drawerTitle = document.getElementById('drawerTitle');
    const drawerContent = document.getElementById('drawerContent');
    const btnCloseBlocksDrawer = document.getElementById('btnCloseBlocksDrawer');

    const workspaceArea = document.querySelector('.workspace-area');
    const questionBadge = document.getElementById('questionBadge');
    const questionTitle = document.getElementById('questionTitle');
    const questionDesc = document.getElementById('questionDesc');

    const blockDropList = document.getElementById('blockDropList');
    const mainBlockStack = document.getElementById('mainBlockStack');
    const emptyPlaceholder = document.getElementById('emptyPlaceholder');
    const trashZone = document.getElementById('trashZone');

    const paperAnswerContainer = document.getElementById('paperAnswerContainer');
    const inputPaperAnswer = document.getElementById('inputPaperAnswer');
    const paperSaveStatus = document.getElementById('paperSaveStatus');
    const pyramidAnswerContainer = document.getElementById('pyramidAnswerContainer');
    const pyramidRowsContainer = document.getElementById('pyramidRowsContainer');
    const pyramidSvgLines = document.getElementById('pyramidSvgLines');
    const pyramidPathText = document.getElementById('pyramidPathText');
    const pyramidNumberBadges = document.getElementById('pyramidNumberBadges');
    const btnClearPyramid = document.getElementById('btnClearPyramid');
    const pyramidSaveStatus = document.getElementById('pyramidSaveStatus');
    let pyramidSaveTimer = null;
    const hardwarePortMap = document.querySelector('.hardware-port-map');
    const questionBanner = document.getElementById('questionBanner');
    const btnToggleBanner = document.getElementById('btnToggleBanner');
    const btnToggleBannerIcon = document.getElementById('btnToggleBannerIcon');
    const btnToggleBannerText = document.getElementById('btnToggleBannerText');
    const btnStartCodingNow = document.getElementById('btnStartCodingNow');

    const btnClearCanvas = document.getElementById('btnClearCanvas');
    const btnPaperNextQuestion = document.getElementById('btnPaperNextQuestion');
    const btnPrevQuestion = document.getElementById('btnPrevQuestion');
    const btnNextQuestion = document.getElementById('btnNextQuestion');
    const btnFinishExam = document.getElementById('btnFinishExam');

    const studentToast = document.getElementById('studentToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    const btnCloseToast = document.getElementById('btnCloseToast');

    const modalExamResults = document.getElementById('modalExamResults');
    const studentSuccessMsg = document.getElementById('studentSuccessMsg');
    const btnReturnToStart = document.getElementById('btnReturnToStart');

    // Custom Block Modal Elements
    const modalCustomBlock = document.getElementById('modalCustomBlock');
    const inputCustomBlockName = document.getElementById('inputCustomBlockName');
    const btnCloseCustomBlockModal = document.getElementById('btnCloseCustomBlockModal');
    const btnCancelCustomBlock = document.getElementById('btnCancelCustomBlock');
    const btnSaveCustomBlock = document.getElementById('btnSaveCustomBlock');
    const btnAddNumInput = document.getElementById('btnAddNumInput');
    const btnAddBoolInput = document.getElementById('btnAddBoolInput');
    const btnAddTextLabel = document.getElementById('btnAddTextLabel');

    let currentBuildingBlockParams = [];

    // --- STEP-BY-STEP INTERACTIVE WIRING STATE ---
    let currentWiringStep = 0;
    let selectedPortId = null;
    let selectedToolType = null;

    const WIRING_STEPS = [
        { port: 'A', reqType: 'big_motor', name: 'Büyük Motor', text: '👉 Lütfen <b>Büyük Motor</b> parçasını seçip Hub üzerindeki <b>A</b> portuna bağlayınız.' },
        { port: 'B', reqType: 'big_motor', name: 'Büyük Motor', text: '👉 Lütfen ikinci <b>Büyük Motor</b> parçasını seçip <b>B</b> portuna bağlayınız.' },
        { port: 'C', reqType: 'small_motor', name: 'Küçük Motor', text: '👉 Lütfen <b>Küçük Motor</b> parçasını seçip <b>C</b> portuna bağlayınız.' },
        { port: 'D', reqType: 'small_motor', name: 'Küçük Motor', text: '👉 Lütfen ikinci <b>Küçük Motor</b> parçasını seçip <b>D</b> portuna bağlayınız.' },
        { port: 'E', reqType: 'color_sensor', name: 'Renk Sensörü', text: '👉 Lütfen <b>Renk Sensörü</b> parçasını seçip <b>E</b> portuna bağlayınız.' },
        { port: 'F', reqType: 'color_sensor', name: 'Renk Sensörü', text: '👉 Lütfen ikinci <b>Renk Sensörü</b> parçasını seçip <b>F</b> portuna bağlayınız.' }
    ];

    // --- ROLE-BASED AUTHENTICATION & TEACHER DASHBOARD ---
    const tabStudentRole = document.getElementById('tabStudentRole');
    const tabTeacherRole = document.getElementById('tabTeacherRole');
    const panelStudentAuth = document.getElementById('panelStudentAuth');
    const panelTeacherAuth = document.getElementById('panelTeacherAuth');
    const modalAuthCard = document.querySelector('.modal-auth-card');

    const teacherPasswordSection = document.getElementById('teacherPasswordSection');
    const teacherDashboardSection = document.getElementById('teacherDashboardSection');
    const formTeacherPassword = document.getElementById('formTeacherPassword');
    const inputTeacherPassword = document.getElementById('inputTeacherPassword');
    const teacherPasswordError = document.getElementById('teacherPasswordError');
    const btnTeacherLogout = document.getElementById('btnTeacherLogout');

    const btnLaunchTeacherDemo = document.getElementById('btnLaunchTeacherDemo');
    const chkSkipWiringInDemo = document.getElementById('chkSkipWiringInDemo');
    const inputTeacherWebhookUrl = document.getElementById('inputTeacherWebhookUrl');
    const btnSaveWebhookUrl = document.getElementById('btnSaveWebhookUrl');
    const btnTestWebhookUrl = document.getElementById('btnTestWebhookUrl');
    const webhookStatusMsg = document.getElementById('webhookStatusMsg');
    const btnOpenCodeInspectorModal = document.getElementById('btnOpenCodeInspectorModal');

    const teacherTestBanner = document.getElementById('teacherTestBanner');
    const btnReturnToTeacherDashboard = document.getElementById('btnReturnToTeacherDashboard');

    let isTeacherDemoMode = false;

    function isTeacherAuthenticated() {
        return localStorage.getItem(STORAGE_TEACHER_LOGGED) === 'true';
    }

    function refreshTeacherAuthUI() {
        if (!panelTeacherAuth) return;
        if (isTeacherAuthenticated()) {
            if (teacherPasswordSection) teacherPasswordSection.style.display = 'none';
            if (teacherDashboardSection) teacherDashboardSection.style.display = 'block';
            if (modalAuthCard) modalAuthCard.classList.add('expanded');
            if (inputTeacherWebhookUrl) {
                inputTeacherWebhookUrl.value = getGoogleSheetWebhookUrl();
            }
        } else {
            if (teacherPasswordSection) teacherPasswordSection.style.display = 'block';
            if (teacherDashboardSection) teacherDashboardSection.style.display = 'none';
            if (modalAuthCard) modalAuthCard.classList.remove('expanded');
            if (inputTeacherPassword) {
                inputTeacherPassword.value = '';
                setTimeout(() => inputTeacherPassword.focus(), 150);
            }
            if (teacherPasswordError) teacherPasswordError.style.display = 'none';
        }
    }

    if (tabStudentRole && tabTeacherRole) {
        tabStudentRole.addEventListener('click', () => {
            tabStudentRole.classList.add('active');
            tabTeacherRole.classList.remove('active');
            if (panelStudentAuth) panelStudentAuth.style.display = 'block';
            if (panelTeacherAuth) panelTeacherAuth.style.display = 'none';
            if (modalAuthCard) modalAuthCard.classList.remove('expanded');
        });

        tabTeacherRole.addEventListener('click', () => {
            tabTeacherRole.classList.add('active');
            tabStudentRole.classList.remove('active');
            if (panelStudentAuth) panelStudentAuth.style.display = 'none';
            if (panelTeacherAuth) panelTeacherAuth.style.display = 'block';
            refreshTeacherAuthUI();
        });
    }

    if (formTeacherPassword) {
        formTeacherPassword.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredPass = inputTeacherPassword ? inputTeacherPassword.value.trim() : '';
            if (enteredPass === TEACHER_MASTER_PASSWORD) {
                localStorage.setItem(STORAGE_TEACHER_LOGGED, 'true');
                if (teacherPasswordError) teacherPasswordError.style.display = 'none';
                refreshTeacherAuthUI();
                showStudentToast('✓ Giriş Başarılı', 'Öğretmen yetkisi doğrulandı. Bu tarayıcıda şifre hatırlandı.');
            } else {
                if (teacherPasswordError) {
                    teacherPasswordError.style.display = 'block';
                    teacherPasswordError.textContent = '⚠️ Hatalı şifre! Lütfen tekrar deneyiniz.';
                }
                if (inputTeacherPassword) {
                    inputTeacherPassword.focus();
                    inputTeacherPassword.select();
                }
            }
        });
    }

    if (btnTeacherLogout) {
        btnTeacherLogout.addEventListener('click', () => {
            if (confirm('Bu tarayıcıdaki kayıtlı öğretmen şifresini silip çıkış yapmak istediğinize emin misiniz?')) {
                localStorage.removeItem(STORAGE_TEACHER_LOGGED);
                refreshTeacherAuthUI();
                showStudentToast('Çıkış Yapıldı', 'Öğretmen oturumu kapatıldı.');
            }
        });
    }

    // 🧪 ÖĞRENCİ GİBİ SİSTEMİ DENE (ÖĞRETMEN TEST MODU)
    const DEMO_STUDENT_NAMES = [
        'Zeynep Çelik (Demo)',
        'Kerem Demir (Demo)',
        'Defne Kaya (Demo)',
        'Demir Yıldız (Demo)',
        'Elif Arslan (Demo)',
        'Kaan Şahin (Demo)',
        'Bora Koç (Demo)'
    ];
    const DEMO_CLASSES = ['Demo-6A', 'Robotik-6B', 'Proje-6C', 'Test-Lab'];

    if (btnLaunchTeacherDemo) {
        btnLaunchTeacherDemo.addEventListener('click', () => {
            const randomName = DEMO_STUDENT_NAMES[Math.floor(Math.random() * DEMO_STUDENT_NAMES.length)];
            const randomClass = DEMO_CLASSES[Math.floor(Math.random() * DEMO_CLASSES.length)];
            const skipWiring = chkSkipWiringInDemo ? chkSkipWiringInDemo.checked : true;

            studentInfo.name = randomName;
            studentInfo.class = randomClass;
            studentInfo.sessionId = generateSessionId();
            isTeacherDemoMode = true;

            modalStudentEntry.style.display = 'none';
            studentInfoText.textContent = `${studentInfo.name} - ${studentInfo.class}`;
            studentPill.style.display = 'flex';

            if (teacherTestBanner) {
                teacherTestBanner.style.display = 'flex';
            }

            if (skipWiring) {
                studentWiringScore = { durationSeconds: 15, points: 10 };
                initExam();
                loadQuestion(0);
                showStudentToast(
                    '🧪 Öğretmen Test Modu Başlatıldı',
                    `Otomatik profil: ${randomName} (${randomClass}). Sınavı öğrenci gibi deneyebilirsiniz.`
                );
            } else {
                modalHardwareSetup.style.display = 'flex';
                wiringStartTime = Date.now();
                initWiringSimulator();
            }
        });
    }

    if (btnReturnToTeacherDashboard) {
        btnReturnToTeacherDashboard.addEventListener('click', () => {
            modalStudentEntry.style.display = 'flex';
            if (tabTeacherRole) tabTeacherRole.click();
        });
    }

    // ⚙️ GOOGLE E-TABLO WEBHOOK KAYDI & TESTİ
    if (btnSaveWebhookUrl) {
        btnSaveWebhookUrl.addEventListener('click', () => {
            const newUrl = inputTeacherWebhookUrl ? inputTeacherWebhookUrl.value.trim() : '';
            if (!newUrl) {
                alert('Lütfen geçerli bir Webhook URL adresi giriniz.');
                return;
            }
            localStorage.setItem('spike_webhook_url', newUrl);
            if (webhookStatusMsg) {
                webhookStatusMsg.style.display = 'block';
                webhookStatusMsg.style.color = '#10b981';
                webhookStatusMsg.textContent = '✓ Webhook URL adresi başarıyla kaydedildi!';
                setTimeout(() => {
                    if (webhookStatusMsg) webhookStatusMsg.style.display = 'none';
                }, 3000);
            }
            showStudentToast('✓ Ayar Kaydedildi', 'Google E-Tablo Webhook URL güncellendi.');
        });
    }

    if (btnTestWebhookUrl) {
        btnTestWebhookUrl.addEventListener('click', () => {
            const url = inputTeacherWebhookUrl ? inputTeacherWebhookUrl.value.trim() : getGoogleSheetWebhookUrl();
            if (!url) {
                alert('Webhook URL boş olamaz.');
                return;
            }

            if (webhookStatusMsg) {
                webhookStatusMsg.style.display = 'block';
                webhookStatusMsg.style.color = '#3b82f6';
                webhookStatusMsg.textContent = '⏳ Google Tablosuna test sinyali gönderiliyor...';
            }

            const testPayload = {
                timestamp: new Date().toLocaleString('tr-TR'),
                studentName: 'CEVAP ANAHTARI (Örnek Çözümler)',
                studentClass: 'ÖĞRETMEN',
                secretDurationSec: 0,
                secretHardwarePoints: 10,
                q1Answer: 'Örnek: 3 defa tekrarla [ 40 cm ileri git, sağa 120 derece dön ]',
                q2Answer: 'Örnek: Olay [olana kadar bekle: (mesafe > 15)] -> [durdur] -> [90 sağa dön] -> [15 cm geri git] -> [sapma sıfırla]',
                q3Answer: '6 -> 7 -> 1 -> 4 -> 2 -> 5 -> 3 -> 10 -> 8 -> 9',
                q4Answer: 'Örnek Mantık: C:1, D:2, E:3, A:4, B:5 (İfadelerin tutarlılık testi)',
                q5Answer: 'Örnek Çözüm: 2 adet 13, 2 adet 21, 1 adet 32 (Toplam 100)',
                q6Answer: 'Örnek: Eşitliği sağlayan iki hatalı kutunun (sayı veya operatör) silinmesi'
            };

            fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testPayload)
            }).then(() => {
                if (webhookStatusMsg) {
                    webhookStatusMsg.style.display = 'block';
                    webhookStatusMsg.style.color = '#10b981';
                    webhookStatusMsg.textContent = '✓ Test sinyali Google E-Tabloya iletildi!';
                }
            }).catch(err => {
                if (webhookStatusMsg) {
                    webhookStatusMsg.style.display = 'block';
                    webhookStatusMsg.style.color = '#ef4444';
                    webhookStatusMsg.textContent = '⚠️ Gönderim hatası: ' + err.message;
                }
            });
        });
    }

    if (btnOpenCodeInspectorModal) {
        btnOpenCodeInspectorModal.addEventListener('click', () => {
            if (modalTeacherReview) {
                modalTeacherReview.style.display = 'flex';
            }
        });
    }

    // 1. INITIALIZE STUDENT ENTRY
    formStudentEntry.addEventListener('submit', (e) => {
        e.preventDefault();
        studentInfo.name = document.getElementById('inputStudentName').value.trim();
        studentInfo.class = document.getElementById('inputStudentClass').value.trim();
        studentInfo.sessionId = generateSessionId();
        isTeacherDemoMode = false;

        if (!studentInfo.name || !studentInfo.class) return;

        saveExamProgressLocally();

        modalStudentEntry.style.display = 'none';
        studentInfoText.textContent = `${studentInfo.name} - ${studentInfo.class}`;
        studentPill.style.display = 'flex';
        if (teacherTestBanner) teacherTestBanner.style.display = 'none';

        modalHardwareSetup.style.display = 'flex';
        wiringStartTime = Date.now();
        initWiringSimulator();
    });

    // 2. FAIL-SAFE INTERACTIVE WIRING SIMULATOR
    function initWiringSimulator() {
        currentWiringStep = 0;
        selectedPortId = null;
        selectedToolType = null;
        simFeedback.style.display = 'none';
        btnStartExamFromSim.style.display = 'none';

        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(p => {
            const btn = document.getElementById(`btnPort${p}`);
            if (btn) {
                btn.classList.remove('connected');
                btn.style.border = '2px solid #ffffff';
                btn.style.backgroundColor = '#0f172a';
                btn.style.boxShadow = 'none';
                btn.innerHTML = (p === 'A' || p === 'C' || p === 'E') ? `${p} ⚡` : `⚡ ${p}`;
            }

            const badge = document.getElementById(`st${p}`);
            if (badge) {
                badge.classList.remove('ok');
                badge.textContent = `${p}: ❌`;
            }
        });

        document.querySelectorAll('.tool-card').forEach(tc => {
            tc.classList.remove('selected');
            tc.style.boxShadow = 'none';
        });

        updateWiringStepUI();
        bindWiringEventsOnce();
    }

    function updateWiringStepUI() {
        if (currentWiringStep < WIRING_STEPS.length) {
            const step = WIRING_STEPS[currentWiringStep];
            heroStepBadge.textContent = `ADIM ${currentWiringStep + 1} / 6`;
            wiringStepInstruction.innerHTML = step.text;
        } else {
            const durationSec = Math.round((Date.now() - wiringStartTime) / 1000);
            // Donanım bağlantısı: Normalde 10 puan, çok yavaş yaparsa 5 puan
            let secretPoints = (durationSec > 45) ? 5 : 10;

            studentWiringScore = {
                durationSeconds: durationSec,
                points: secretPoints
            };

            heroStepBadge.textContent = 'TAMAMLANDI';
            heroStepBadge.style.backgroundColor = '#10b981';
            wiringStepInstruction.innerHTML = '🎉 Tebrikler! Tüm Donanım ve Kablo Bağlantıları Başarıyla Kuruldu.';
            simFeedback.style.display = 'block';
            simFeedback.className = 'sim-feedback-box success';
            simFeedback.textContent = 'Robot port ve kablo kurulumunuz hazır. Aşağıdaki yeşil butona basarak sınava başlayabilirsiniz.';
            btnStartExamFromSim.style.display = 'block';
        }
    }

    function bindWiringEventsOnce() {
        document.querySelectorAll('.tool-card').forEach(card => {
            card.onclick = (e) => {
                e.stopPropagation();
                if (currentWiringStep >= WIRING_STEPS.length) return;

                const tType = card.getAttribute('data-type');
                selectedToolType = tType;

                document.querySelectorAll('.tool-card').forEach(c => {
                    c.classList.remove('selected');
                    c.style.boxShadow = 'none';
                });
                card.classList.add('selected');
                card.style.boxShadow = '0 0 0 4px #f59e0b';

                checkMatchAndConnect();
            };
        });

        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(portId => {
            const btn = document.getElementById(`btnPort${portId}`);
            if (!btn) return;

            btn.onclick = (e) => {
                e.stopPropagation();
                if (currentWiringStep >= WIRING_STEPS.length) return;
                if (btn.classList.contains('connected')) return;

                selectedPortId = portId;

                ['A', 'B', 'C', 'D', 'E', 'F'].forEach(p => {
                    const pBtn = document.getElementById(`btnPort${p}`);
                    if (pBtn && !pBtn.classList.contains('connected')) {
                        pBtn.style.border = '2px solid #ffffff';
                        pBtn.style.backgroundColor = '#0f172a';
                        pBtn.style.boxShadow = 'none';
                    }
                });

                btn.style.border = '3px solid #f59e0b';
                btn.style.backgroundColor = '#0284c7';
                btn.style.boxShadow = '0 0 10px #f59e0b';

                checkMatchAndConnect();
            };
        });
    }

    function checkMatchAndConnect() {
        if (selectedPortId && selectedToolType) {
            const step = WIRING_STEPS[currentWiringStep];

            if (selectedPortId === step.port && selectedToolType === step.reqType) {
                const btn = document.getElementById(`btnPort${selectedPortId}`);
                if (btn) {
                    btn.classList.add('connected');
                    btn.style.border = '3px solid #059669';
                    btn.style.backgroundColor = '#10b981';
                    btn.style.boxShadow = 'none';
                    btn.innerHTML = (selectedPortId === 'A' || selectedPortId === 'C' || selectedPortId === 'E') ? `${selectedPortId} ✅` : `✅ ${selectedPortId}`;
                }

                const badge = document.getElementById(`st${selectedPortId}`);
                if (badge) {
                    badge.classList.add('ok');
                    badge.textContent = `${selectedPortId}: ✅ ${step.name}`;
                }

                simFeedback.style.display = 'none';
                resetWiringHighlights();
                currentWiringStep++;
                updateWiringStepUI();
            } else {
                simFeedback.style.display = 'block';
                simFeedback.className = 'sim-feedback-box error';
                simFeedback.textContent = `⚠️ Hatalı eşleşme! Lütfen yönergedeki ${step.port} portuna "${step.name}" parçasını bağlayınız!`;

                resetWiringHighlights();
            }
        }
    }

    function resetWiringHighlights() {
        selectedPortId = null;
        selectedToolType = null;

        document.querySelectorAll('.tool-card').forEach(c => {
            c.classList.remove('selected');
            c.style.boxShadow = 'none';
        });

        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(p => {
            const pBtn = document.getElementById(`btnPort${p}`);
            if (pBtn && !pBtn.classList.contains('connected')) {
                pBtn.style.border = '2px solid #ffffff';
                pBtn.style.backgroundColor = '#0f172a';
                pBtn.style.boxShadow = 'none';
            }
        });
    }

    btnStartExamFromSim.addEventListener('click', () => {
        modalHardwareSetup.style.display = 'none';
        initExam();
    });

    if (btnSkipWiringSim) {
        btnSkipWiringSim.addEventListener('click', () => {
            if (confirm('Port bağlama adımını atlayıp doğrudan sınav sorularına geçmek istediğinize emin misiniz?')) {
                studentWiringScore = {
                    durationSeconds: Math.round((Date.now() - wiringStartTime) / 1000),
                    points: 5 // Atlarsa veya yapamazsa 5 puan ver geç
                };
                modalHardwareSetup.style.display = 'none';
                initExam();
            }
        });
    }

    // ⏰ SINAV GERİ SAYIM SAYACI (32 DK NORMAL + 2 DK UZATMA)
    const TOTAL_EXAM_SECONDS = 32 * 60; // 32 dakika (1920 saniye)
    const EXTENSION_SECONDS = 2 * 60;   // 2 dakika (120 saniye)
    let examTimeRemaining = TOTAL_EXAM_SECONDS;
    let isExtensionActive = false;
    let examTimerInterval = null;
    let warned15Min = false;
    let warned5Min = false;

    const examTimerBadge = document.getElementById('examTimerBadge');
    const examTimerText = document.getElementById('examTimerText');
    const modalTimeExpired = document.getElementById('modalTimeExpired');
    const btnSubmitNowOnExpiry = document.getElementById('btnSubmitNowOnExpiry');
    const btnUseExtensionTime = document.getElementById('btnUseExtensionTime');

    function startExamTimer(preserveTime = false) {
        if (examTimerInterval) clearInterval(examTimerInterval);
        if (!preserveTime || typeof examTimeRemaining !== 'number') {
            examTimeRemaining = TOTAL_EXAM_SECONDS;
            isExtensionActive = false;
            warned15Min = false;
            warned5Min = false;
        }

        if (examTimerBadge) {
            examTimerBadge.style.display = 'inline-flex';
            examTimerBadge.classList.remove('warning-orange', 'warning-red');
            const mins = Math.floor(examTimeRemaining / 60);
            if (isExtensionActive || mins < 5) {
                examTimerBadge.classList.add('warning-red');
            } else if (mins < 15) {
                examTimerBadge.classList.add('warning-orange');
            }
        }

        updateExamTimerUI();
        examTimerInterval = setInterval(tickExamTimer, 1000);
    }

    function tickExamTimer() {
        examTimeRemaining--;
        updateExamTimerUI();

        // 5 saniyede bir yerel tarayıcı hafızasını güncelle (F5 veya elektrik kesintisi koruması)
        if (examTimeRemaining % 5 === 0) {
            saveExamProgressLocally();
        }

        const mins = Math.floor(examTimeRemaining / 60);
        const secs = examTimeRemaining % 60;

        if (!isExtensionActive) {
            // Son 15 dk uyarısı (Sağ tarafta toast bildirim)
            if (mins === 15 && secs === 0 && !warned15Min) {
                warned15Min = true;
                if (examTimerBadge) examTimerBadge.classList.add('warning-orange');
                showStudentToast(
                    '⚠️ Son 15 Dakika!',
                    'Sınav sürenizin bitmesine 15 dakika kaldı. Lütfen yanıtlarınızı kontrol etmeyi unutmayın.'
                );
            }

            // Son 5 dk uyarısı (Sağ tarafta toast bildirim)
            if (mins === 5 && secs === 0 && !warned5Min) {
                warned5Min = true;
                if (examTimerBadge) {
                    examTimerBadge.classList.remove('warning-orange');
                    examTimerBadge.classList.add('warning-red');
                }
                showStudentToast(
                    '⚠️ Son 5 Dakika!',
                    'Sınavın bitmesine son 5 dakika kaldı! Lütfen cevaplarınızı kaydetmeyi unutmayın.'
                );
            }

            // Süre bitti (35 dk doldu)
            if (examTimeRemaining <= 0) {
                clearInterval(examTimerInterval);
                if (modalTimeExpired) modalTimeExpired.style.display = 'flex';
            }
        } else {
            // Uzatma süresi içi (2 dk)
            if (examTimeRemaining <= 0) {
                clearInterval(examTimerInterval);
                if (modalTimeExpired) modalTimeExpired.style.display = 'none';
                showStudentToast('⌛ Süre Doldu!', 'Uzatma süreniz bitti. Cevaplarınız otomatik gönderiliyor...');
                finishAndSubmitExam(true);
            }
        }
    }

    function updateExamTimerUI() {
        if (!examTimerText) return;
        const displaySecs = Math.max(0, examTimeRemaining);
        const mins = Math.floor(displaySecs / 60);
        const secs = displaySecs % 60;
        const formatted = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        examTimerText.textContent = isExtensionActive ? `(Uzatma) ${formatted}` : formatted;
    }

    if (btnSubmitNowOnExpiry) {
        btnSubmitNowOnExpiry.addEventListener('click', () => {
            if (modalTimeExpired) modalTimeExpired.style.display = 'none';
            finishAndSubmitExam(false);
        });
    }

    if (btnUseExtensionTime) {
        btnUseExtensionTime.addEventListener('click', () => {
            if (modalTimeExpired) modalTimeExpired.style.display = 'none';
            isExtensionActive = true;
            examTimeRemaining = EXTENSION_SECONDS; // 2 dk
            if (examTimerBadge) {
                examTimerBadge.classList.remove('warning-orange');
                examTimerBadge.classList.add('warning-red');
            }
            updateExamTimerUI();
            showStudentToast(
                '⏱️ 2 Dakika Uzatma Başladı!',
                'Son 2 dakikalık uzatma süreniz başladı. Lütfen eksik kalan yanıtlarınızı doldurup sınavı gönderiniz.'
            );
            examTimerInterval = setInterval(tickExamTimer, 1000);
        });
    }

    // 🧪 ÖĞRETMEN HIZLI ZAMAN İLERİ SARMA KONTROLLERİ (TEST MODU)
    const btnFastForward15Min = document.getElementById('btnFastForward15Min');
    const btnFastForward5Min = document.getElementById('btnFastForward5Min');
    const btnFastForwardExpire = document.getElementById('btnFastForwardExpire');

    if (btnFastForward15Min) {
        btnFastForward15Min.addEventListener('click', () => {
            if (!isExtensionActive) {
                examTimeRemaining = 15 * 60 + 1; // 15:01 -> 15:00
                updateExamTimerUI();
                showStudentToast('⏩ Zaman İleri Sarıldı', 'Süre son 15 dakikaya (15:00) sarıldı. 15 dk uyarısı tetikleniyor.');
            }
        });
    }

    if (btnFastForward5Min) {
        btnFastForward5Min.addEventListener('click', () => {
            if (!isExtensionActive) {
                examTimeRemaining = 5 * 60 + 1; // 05:01 -> 05:00
                updateExamTimerUI();
                showStudentToast('⏩ Zaman İleri Sarıldı', 'Süre son 5 dakikaya (05:00) sarıldı. 5 dk uyarısı ve kırmızı sayaç tetikleniyor.');
            }
        });
    }

    if (btnFastForwardExpire) {
        btnFastForwardExpire.addEventListener('click', () => {
            examTimeRemaining = 1; // 00:01 -> 00:00
            updateExamTimerUI();
            showStudentToast('⏩ Süre Sıfırlandı', 'Süre sıfırlandı. Süre doldu modalı / otomatik gönderme testi başlatılıyor.');
        });
    }

    function finishAndSubmitExam(isAutoSubmit = false) {
        if (examTimerInterval) clearInterval(examTimerInterval);
        saveCurrentQuestionState();
        sendExamDataToGoogleSheet(true);
        clearLocalExamSession();
        showExamSuccessModal(isAutoSubmit);
        showStudentToast('✓ Sınav Gönderildi!', 'Tüm yanıtlarınız başarıyla öğretmeninize ulaştırıldı.');
    }

    function showExamSuccessModal(isAutoSubmit = false) {
        if (modalExamResults) {
            modalExamResults.style.display = 'flex';
            if (studentSuccessMsg) {
                studentSuccessMsg.innerHTML = isAutoSubmit
                    ? `⌛ Sınav süreniz doldu! <b>${studentInfo.name}</b>, cevaplarınız otomatik olarak öğretmeninize başarıyla ulaştırılmıştır.`
                    : `Tebrikler <b>${studentInfo.name}</b>! Sınav yanıtlarınız öğretmeninize başarıyla ulaştırılmıştır.`;
            }
        } else {
            alert(isAutoSubmit ? '⌛ Sınav süreniz doldu ve cevaplarınız öğretmeninize gönderildi!' : '🎉 Tebrikler! Sınavınız başarıyla tamamlandı ve öğretmeninize gönderildi.');
        }
    }

    function initExam(startIdx = 0, preserveTimer = false) {
        isDrawerOpen = false;
        if (blocksDrawer) blocksDrawer.classList.remove('open');
        renderCategories();
        loadQuestion(startIdx);
        setupDragAndDropEvents();
        setupCustomBlockModalEvents();
        setupBlocksDrawerEvents();
        startExamTimer(preserveTimer);
        saveExamProgressLocally();
    }

    // Oturum Geri Yükleme Kontrolü
    function restoreExamSessionIfExists() {
        try {
            const raw = localStorage.getItem(EXAM_SESSION_STORAGE_KEY);
            if (!raw) return false;
            const saved = JSON.parse(raw);
            if (!saved || !saved.studentInfo || !saved.studentInfo.name || !saved.studentInfo.name.trim()) return false;

            studentInfo = saved.studentInfo;
            if (saved.studentWiringScore) studentWiringScore = saved.studentWiringScore;
            if (saved.studentAnswers) studentAnswers = saved.studentAnswers;

            const restoredIndex = (typeof saved.currentQuestionIndex === 'number' && saved.currentQuestionIndex >= 0 && saved.currentQuestionIndex < questions.length)
                ? saved.currentQuestionIndex : 0;

            if (typeof saved.examTimeRemaining === 'number' && saved.examTimeRemaining > 0) {
                examTimeRemaining = saved.examTimeRemaining;
                isExtensionActive = !!saved.isExtensionActive;
            }

            if (modalStudentEntry) modalStudentEntry.style.display = 'none';
            if (modalHardwareSetup) modalHardwareSetup.style.display = 'none';
            if (studentPill) studentPill.style.display = 'flex';
            if (studentInfoText) studentInfoText.textContent = `${studentInfo.name} - ${studentInfo.class}`;

            initExam(restoredIndex, true);
            showStudentToast('🔄 Oturum Geri Yüklendi', `${studentInfo.name}, sınavına kaldığın yerden (${restoredIndex + 1}. Soru) devam ediyorsun.`);
            return true;
        } catch (e) {
            console.error('Oturum geri yükleme hatası:', e);
            return false;
        }
    }

    // 3. CATEGORY & DRAWER RENDERING
    function renderCategories() {
        categorySidebar.innerHTML = '';
        SPIKE_CATEGORIES.forEach(cat => {
            const item = document.createElement('div');
            const isActive = isDrawerOpen && (cat.id === activeCategory);
            item.className = `category-item ${isActive ? 'active' : ''}`;
            item.style.color = cat.color;
            item.setAttribute('data-category', cat.id);
            item.title = `${cat.name} bloklarını aç/kapat`;

            item.innerHTML = `
                <div class="category-dot" style="background-color: ${cat.color};">
                    ${cat.icon}
                </div>
                <span class="category-name">${cat.name}</span>
            `;

            item.addEventListener('click', () => toggleBlocksDrawer(undefined, cat.id));
            categorySidebar.appendChild(item);
        });
    }

    function toggleBlocksDrawer(forceState, catId) {
        if (forceState !== undefined) {
            isDrawerOpen = forceState;
        } else {
            if (!isDrawerOpen) {
                isDrawerOpen = true;
            } else if (catId === activeCategory) {
                // Clicked the same active category button -> toggle close
                isDrawerOpen = false;
            } else {
                // Clicked a different category button -> stay open and switch category
                isDrawerOpen = true;
            }
        }

        if (catId) {
            activeCategory = catId;
        }

        if (isDrawerOpen) {
            if (blocksDrawer) blocksDrawer.classList.add('open');
            const catObj = SPIKE_CATEGORIES.find(c => c.id === activeCategory);
            if (drawerTitle) {
                drawerTitle.textContent = catObj ? catObj.name : 'Bloklar';
                drawerTitle.style.color = catObj ? catObj.color : '#000';
            }
            renderDrawerBlocks(activeCategory);
        } else {
            if (blocksDrawer) blocksDrawer.classList.remove('open');
        }

        renderCategories();
    }

    function selectCategory(catId) {
        toggleBlocksDrawer(true, catId);
    }

    function setupBlocksDrawerEvents() {
        if (btnCloseBlocksDrawer) {
            btnCloseBlocksDrawer.onclick = () => {
                toggleBlocksDrawer(false);
            };
        }
    }

    function renderDrawerBlocks(catId) {
        drawerContent.innerHTML = '';

        if (catId === 'degiskenler') {
            const btnCreateVar = document.createElement('button');
            btnCreateVar.className = 'btn-create-variable';
            btnCreateVar.innerHTML = `➕ Bir Değişken Oluştur`;
            btnCreateVar.addEventListener('click', () => {
                const varName = prompt('Yeni Değişken Adını Giriniz:');
                if (varName && varName.trim() !== '') {
                    const cleanName = varName.trim();
                    if (!createdVariables.includes(cleanName)) {
                        createdVariables.push(cleanName);
                    }
                    renderDrawerBlocks('degiskenler');
                }
            });
            drawerContent.appendChild(btnCreateVar);

            if (createdVariables.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.style.fontSize = '0.8rem';
                emptyMsg.style.color = '#94a3b8';
                emptyMsg.style.textAlign = 'center';
                emptyMsg.style.padding = '14px';
                emptyMsg.textContent = "Henüz değişken yok. 'Bir Değişken Oluştur' butonuna basarak yeni bir değişken ekleyebilirsiniz.";
                drawerContent.appendChild(emptyMsg);
                return;
            }

            createdVariables.forEach(vName => {
                const varRepDef = {
                    id: `var_rep_${vName}`,
                    category: 'degiskenler',
                    type: 'reporter',
                    text: vName,
                    inputs: []
                };
                drawerContent.appendChild(createBlockElement(varRepDef, true));
            });

            const varSetDef = {
                id: 'var_set_val',
                category: 'degiskenler',
                type: 'statement',
                text: '{var} i {val} yap',
                inputs: [
                    { id: 'var', type: 'select', options: createdVariables, default: createdVariables[0] },
                    { id: 'val', type: 'number', default: 0 }
                ]
            };
            drawerContent.appendChild(createBlockElement(varSetDef, true));

            const varChangeDef = {
                id: 'var_change_val',
                category: 'degiskenler',
                type: 'statement',
                text: '{var} i {val} kadar değiştir',
                inputs: [
                    { id: 'var', type: 'select', options: createdVariables, default: createdVariables[0] },
                    { id: 'val', type: 'number', default: 1 }
                ]
            };
            drawerContent.appendChild(createBlockElement(varChangeDef, true));

            return;
        }

        if (catId === 'bloklarim') {
            const btnCreateMyBlock = document.createElement('button');
            btnCreateMyBlock.className = 'btn-create-myblock';
            btnCreateMyBlock.innerHTML = `🧩 Bir Blok Oluştur`;
            btnCreateMyBlock.addEventListener('click', () => {
                openCustomBlockModal();
            });
            drawerContent.appendChild(btnCreateMyBlock);

            if (createdCustomBlocks.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.style.fontSize = '0.8rem';
                emptyMsg.style.color = '#94a3b8';
                emptyMsg.style.textAlign = 'center';
                emptyMsg.style.padding = '14px';
                emptyMsg.textContent = "Henüz özel blok yok. 'Bir Blok Oluştur' butonuna basarak yeni bir değişken ekleyebilirsiniz.";
                drawerContent.appendChild(emptyMsg);
                return;
            }

            createdCustomBlocks.forEach(customB => {
                let text = customB.name;
                const inputs = [];

                if (customB.params && customB.params.length > 0) {
                    customB.params.forEach((p, pIdx) => {
                        if (p.type === 'num') {
                            text += ` {p_${pIdx}}`;
                            inputs.push({ id: `p_${pIdx}`, type: 'number', default: 1 });
                        } else if (p.type === 'bool') {
                            text += ` {p_${pIdx}}`;
                            inputs.push({ id: `p_${pIdx}`, type: 'select', options: ['doğru', 'yanlış'], default: 'doğru' });
                        } else if (p.type === 'label') {
                            text += ` ${p.label}`;
                        }
                    });
                }

                const customBDef = {
                    id: customB.id,
                    category: 'bloklarim',
                    type: 'statement',
                    text: text,
                    inputs: inputs
                };

                const blockEl = createBlockElement(customBDef, true);

                blockEl.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (confirm(`'${customB.name}' bloğunu silmek istiyor musunuz?`)) {
                        deleteCustomBlockDefinition(customB.id);
                    }
                });

                drawerContent.appendChild(blockEl);
            });

            return;
        }

        const catBlocks = INITIAL_BLOCKS.filter(b => b.category === catId);

        if (catBlocks.length === 0) {
            drawerContent.innerHTML = `<div style="font-size: 0.8rem; color: #94a3b8; text-align: center; padding: 20px;">Bu kategoride henüz blok yok.</div>`;
            return;
        }

        catBlocks.forEach(bDef => {
            const blockEl = createBlockElement(bDef, true);
            drawerContent.appendChild(blockEl);
        });
    }

    function deleteCustomBlockDefinition(blockId) {
        createdCustomBlocks = createdCustomBlocks.filter(cb => cb.id !== blockId);

        // Remove definition stack
        const stackEl = blockDropList.querySelector(`[data-stack-id="${blockId}"]`);
        if (stackEl) stackEl.remove();

        document.querySelectorAll(`[data-block-id="${blockId}"]`).forEach(el => el.remove());

        if (activeCategory === 'bloklarim') {
            renderDrawerBlocks('bloklarim');
        }

        updatePlaceholderVisibility();
        saveCurrentQuestionState();
    }

    // 4. CREATE BLOCK DOM ELEMENT
    function createBlockElement(bDef, isTemplate = false) {
        const catObj = SPIKE_CATEGORIES.find(c => c.id === bDef.category) || { color: '#dc2626' };
        const isHat = bDef.type === 'hat';
        const isReporter = bDef.type === 'reporter';
        const isBoolean = bDef.type === 'boolean';
        const isCBlock = bDef.type === 'c_block';

        let renderedText = bDef.text;
        bDef.inputs.forEach(input => {
            let inputHtml = '';
            const valKey = input.id;
            const currentVal = input.value !== undefined ? input.value : input.default;

            if (input.type === 'select') {
                let optionsList = input.options;
                if (input.isMsgSelect) {
                    optionsList = ['Yeni haber...', ...createdMessages];
                }
                const options = optionsList.map(opt => `<option value="${opt}" ${opt === currentVal ? 'selected' : ''}>${opt}</option>`).join('');
                const extraClass = input.isHex ? 'hex-pill' : '';
                const msgAttr = input.isMsgSelect ? 'data-is-msg="true"' : '';
                const hiddenStyle = input.hidden ? 'style="display: none;"' : '';
                inputHtml = `<select class="block-input-pill ${extraClass}" data-input-id="${valKey}" ${msgAttr} ${hiddenStyle}>${options}</select>`;
            } else if (input.type === 'number') {
                const hiddenStyle = input.hidden ? 'style="display: none;"' : '';
                inputHtml = `<div class="inline-drop-zone reporter-drop-zone" data-input-wrapper-id="${valKey}" style="display:inline-block; position:relative;"><input type="number" class="block-input-pill" data-input-id="${valKey}" value="${currentVal}" placeholder="" ${hiddenStyle}></div>`;
            } else if (input.type === 'text') {
                const hiddenStyle = input.hidden ? 'style="display: none;"' : '';
                inputHtml = `<div class="inline-drop-zone reporter-drop-zone" data-input-wrapper-id="${valKey}" style="display:inline-block; position:relative;"><input type="text" class="block-input-pill" data-input-id="${valKey}" value="${currentVal}" placeholder="" ${hiddenStyle}></div>`;
            }

            renderedText = renderedText.replace(`{${valKey}}`, inputHtml);
        });

        // --- C-BLOCK CONTAINER RENDER ---
        if (isCBlock) {
            const cWrapper = document.createElement('div');
            cWrapper.className = `spike-block c-block-wrapper ${isTemplate ? 'template-block' : 'instance-block'}`;
            cWrapper.dataset.blockId = bDef.id;
            cWrapper.dataset.category = bDef.category;
            cWrapper.draggable = true;

            if (!isTemplate) {
                cWrapper.dataset.instanceId = 'inst_' + Math.random().toString(36).substr(2, 9);
            }

            const isIfElse = bDef.id === 'ctrl_if_else';
            const isLoop = bDef.id === 'ctrl_repeat' || bDef.id === 'ctrl_forever' || bDef.id === 'ctrl_repeat_until' || bDef.id === 'ctrl_wait_until';

            if (isIfElse) {
                cWrapper.innerHTML = `
                    <div class="c-block-header" style="background-color: ${catObj.color};">
                        <div style="display:flex; align-items:center; gap:6px;"><span>eğer</span> ${renderedText.replace('eğer', '').replace('ise değilse', '')} <span>ise</span></div>
                    </div>
                    <div class="c-block-inner-zone nested-drop-zone" data-slot="then"></div>
                    <div class="c-block-middle" style="background-color: ${catObj.color};">
                        <span>değilse</span>
                    </div>
                    <div class="c-block-inner-zone nested-drop-zone" data-slot="else"></div>
                    <div class="c-block-footer" style="background-color: ${catObj.color};"></div>
                `;
            } else {
                cWrapper.innerHTML = `
                    <div class="c-block-header" style="background-color: ${catObj.color};">
                        <div style="display:flex; align-items:center; gap:6px;"><span>${renderedText}</span></div>
                    </div>
                    <div class="c-block-inner-zone nested-drop-zone" data-slot="then"></div>
                    <div class="c-block-footer" style="background-color: ${catObj.color};">
                        ${isLoop ? '<span class="c-loop-arrow">⤴</span>' : ''}
                    </div>
                `;
            }

            cWrapper.querySelectorAll('.nested-drop-zone, .boolean-drop-zone, .reporter-drop-zone').forEach(zone => {
                zone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    zone.classList.add('zone-drag-over');
                });

                zone.addEventListener('dragleave', (e) => {
                    e.stopPropagation();
                    zone.classList.remove('zone-drag-over');
                });

                zone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    zone.classList.remove('zone-drag-over');

                    if (!currentDraggedBlock) return;

                    let newEl = null;
                    if (currentDraggedBlock.isTemplate) {
                        newEl = createBlockElement(currentDraggedBlock.bDef, false);
                    } else {
                        newEl = currentDraggedBlock.element;
                    }

                    if (newEl) {
                        if (zone.classList.contains('nested-drop-zone')) {
                            // statements go here
                            const afterElement = getDragAfterElement(zone, e.clientY);
                            if (afterElement) {
                                zone.insertBefore(newEl, afterElement);
                            } else {
                                zone.appendChild(newEl);
                            }
                        } else if (zone.classList.contains('reporter-drop-zone') || zone.classList.contains('boolean-drop-zone')) {
                            // Only allow reporter/boolean blocks
                            const draggedType = currentDraggedBlock.bDef.type;
                            if (draggedType === 'statement' || draggedType === 'hat' || draggedType === 'c_block') {
                                return; // Reject drop
                            }

                            if (zone.classList.contains('reporter-drop-zone')) {
                                zone.querySelectorAll(':scope > .instance-block').forEach(el => el.remove());
                                zone.appendChild(newEl);
                            } else {
                                zone.innerHTML = '';
                                zone.appendChild(newEl);
                            }
                        }
                    }

                    updatePlaceholderVisibility();
                    saveCurrentQuestionState();
                });
            });

            setupBlockInputEvents(cWrapper, isTemplate);

            cWrapper.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                document.body.classList.add('is-dragging-block');
                currentDraggedBlock = { element: cWrapper, isTemplate: isTemplate, bDef: bDef };
                e.dataTransfer.setData('text/plain', bDef.id);
                cWrapper.style.opacity = '0.5';
            });

            cWrapper.addEventListener('dragend', (e) => {
                e.stopPropagation();
                document.body.classList.remove('is-dragging-block');
                cWrapper.style.opacity = '1';
                currentDraggedBlock = null;
            });

            return cWrapper;
        }

        // --- STANDARD STATEMENT / HAT / REPORTER RENDER ---
        const blockEl = document.createElement('div');
        blockEl.className = `spike-block ${isHat ? 'hat-block' : isReporter ? 'reporter-block' : isBoolean ? 'boolean-block' : 'statement-block'} ${isTemplate ? 'template-block' : 'instance-block'}`;
        blockEl.style.backgroundColor = catObj.color;
        blockEl.draggable = true;
        blockEl.dataset.blockId = bDef.id;
        blockEl.dataset.category = bDef.category;

        if (!isTemplate) {
            blockEl.dataset.instanceId = 'inst_' + Math.random().toString(36).substr(2, 9);
        }

        if (isHat) {
            blockEl.innerHTML = `
                <span class="play-icon">⚡</span>
                <span>${renderedText}</span>
                <div class="block-notch-bottom"></div>
            `;
        } else if (isReporter || isBoolean) {
            blockEl.innerHTML = `
                <span>${renderedText}</span>
            `;
        } else {
            blockEl.innerHTML = `
                <span>${renderedText}</span>
                <div class="block-notch-bottom"></div>
            `;
        }

        blockEl.querySelectorAll('.boolean-drop-zone, .reporter-drop-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                zone.classList.add('zone-drag-over');
            });
            zone.addEventListener('dragleave', (e) => {
                e.stopPropagation();
                zone.classList.remove('zone-drag-over');
            });
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                zone.classList.remove('zone-drag-over');
                if (!currentDraggedBlock) return;
                
                let newEl = null;
                if (currentDraggedBlock.isTemplate) {
                    newEl = createBlockElement(currentDraggedBlock.bDef, false);
                } else {
                    newEl = currentDraggedBlock.element;
                }

                if (newEl) {
                    if (zone.classList.contains('reporter-drop-zone') || zone.classList.contains('boolean-drop-zone')) {
                        const draggedType = currentDraggedBlock.bDef.type;
                        if (draggedType === 'statement' || draggedType === 'hat' || draggedType === 'c_block') {
                            return; // Reject drop
                        }

                        if (zone.classList.contains('reporter-drop-zone')) {
                            zone.querySelectorAll(':scope > .instance-block').forEach(el => el.remove());
                            zone.appendChild(newEl);
                        } else {
                            zone.innerHTML = '';
                            zone.appendChild(newEl);
                        }
                    }
                }
                updatePlaceholderVisibility();
                saveCurrentQuestionState();
            });
        });

        setupBlockInputEvents(blockEl, isTemplate);

        blockEl.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            document.body.classList.add('is-dragging-block');
            currentDraggedBlock = {
                element: blockEl,
                isTemplate: isTemplate,
                bDef: bDef
            };
            e.dataTransfer.setData('text/plain', bDef.id);
            blockEl.style.opacity = '0.5';
        });

        blockEl.addEventListener('dragend', (e) => {
            e.stopPropagation();
            document.body.classList.remove('is-dragging-block');
            blockEl.style.opacity = '1';
            currentDraggedBlock = null;
        });

        return blockEl;
    }

    function setupBlockInputEvents(el, isTemplate) {
        el.querySelectorAll('.block-input-pill').forEach(inp => {
            inp.addEventListener('mousedown', (e) => e.stopPropagation());
            inp.addEventListener('change', (e) => {
                if (inp.dataset.isMsg === 'true' && inp.value === 'Yeni haber...') {
                    const newName = prompt('Yeni Haber Adını Giriniz:');
                    if (newName && newName.trim() !== '') {
                        const cleanMsg = newName.trim();
                        if (!createdMessages.includes(cleanMsg)) {
                            createdMessages.push(cleanMsg);
                        }
                        updateAllMessageDropdowns(cleanMsg);
                    } else {
                        inp.value = createdMessages[0] || 'haber1';
                    }
                }

                if (inp.dataset.inputId === 'cond_type') {
                    const val = inp.value;
                    const port = el.querySelector('[data-input-id="port"]');
                    const color = el.querySelector('[data-input-id="color"]');
                    const op = el.querySelector('[data-input-id="op"]');
                    const num = el.querySelector('[data-input-id="val"]');
                    
                    if (port) port.style.display = 'none';
                    if (color) color.style.display = 'none';
                    if (op) op.style.display = 'none';
                    if (num) num.style.display = 'none';

                    if (val === 'Renk') {
                        if (port) port.style.display = 'inline-flex';
                        if (color) color.style.display = 'inline-flex';
                    } else if (val === 'Mesafe') {
                        if (port) port.style.display = 'inline-flex';
                        if (op) op.style.display = 'inline-flex';
                        if (num) num.style.display = 'inline-flex';
                    } else if (val === 'Sapma Açısı') {
                        if (op) op.style.display = 'inline-flex';
                        if (num) num.style.display = 'inline-flex';
                    }
                }

                if (!isTemplate) saveCurrentQuestionState();
            });
        });

        const condTypeInp = el.querySelector('[data-input-id="cond_type"]');
        if (condTypeInp) {
            condTypeInp.dispatchEvent(new Event('change'));
        }
    }

    function updateAllMessageDropdowns(selectedMsg) {
        document.querySelectorAll('select[data-is-msg="true"]').forEach(selectEl => {
            const currentVal = selectedMsg || selectEl.value;
            selectEl.innerHTML = ['Yeni haber...', ...createdMessages].map(opt => `<option value="${opt}" ${opt === currentVal ? 'selected' : ''}>${opt}</option>`).join('');
            selectEl.value = currentVal;
        });
    }

    // 5. CUSTOM BLOCK MODAL LOGIC ("Blok Oluştur")
    let isCustomBlockModalEventsSetup = false;
    function setupCustomBlockModalEvents() {
        if (isCustomBlockModalEventsSetup) return;
        isCustomBlockModalEventsSetup = true;
        
        btnCloseCustomBlockModal.addEventListener('click', closeCustomBlockModal);
        btnCancelCustomBlock.addEventListener('click', closeCustomBlockModal);

        btnAddNumInput.addEventListener('click', () => {
            currentBuildingBlockParams.push({ type: 'num' });
            renderCustomBlockPreview();
        });

        btnAddBoolInput.addEventListener('click', () => {
            currentBuildingBlockParams.push({ type: 'bool' });
            renderCustomBlockPreview();
        });

        btnAddTextLabel.addEventListener('click', () => {
            const label = prompt('Etiket metnini giriniz:');
            if (label && label.trim() !== '') {
                currentBuildingBlockParams.push({ type: 'label', label: label.trim() });
                renderCustomBlockPreview();
            }
        });

        btnSaveCustomBlock.addEventListener('click', () => {
            const blockName = inputCustomBlockName.value.trim() || 'özel blok';
            const customBlockId = `myblock_${Date.now()}`;

            const newCustomBlock = {
                id: customBlockId,
                name: blockName,
                params: [...currentBuildingBlockParams]
            };

            createdCustomBlocks.push(newCustomBlock);
            closeCustomBlockModal();

            renderDrawerBlocks('bloklarim');
            spawnCustomBlockDefinitionStack(newCustomBlock);
        });
    }

    function openCustomBlockModal() {
        modalCustomBlock.style.display = 'flex';
        inputCustomBlockName.value = 'blok adı';
        currentBuildingBlockParams = [];
        renderCustomBlockPreview();
    }

    function closeCustomBlockModal() {
        modalCustomBlock.style.display = 'none';
    }

    function renderCustomBlockPreview() {
        const nameVal = inputCustomBlockName.value || 'blok adı';
        let html = `<input type="text" id="inputCustomBlockName" value="${nameVal}" placeholder="blok adı">`;

        currentBuildingBlockParams.forEach(p => {
            if (p.type === 'num') {
                html += ` <span class="block-input-pill" style="margin-left: 6px;">1</span>`;
            } else if (p.type === 'bool') {
                html += ` <span class="block-input-pill" style="margin-left: 6px; clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);">doğru</span>`;
            } else if (p.type === 'label') {
                html += ` <span style="margin-left: 6px;">${p.label}</span>`;
            }
        });

        const previewEl = document.getElementById('previewCustomBlock');
        previewEl.innerHTML = html;

        const newInp = document.getElementById('inputCustomBlockName');
        newInp.addEventListener('input', (e) => {
            inputCustomBlockName.value = e.target.value;
        });
    }

    // CREATE INDEPENDENT CUSTOM BLOCK DEFINITION STACK ON CANVAS
    function spawnCustomBlockDefinitionStack(customBlock) {
        const newStack = createNewStackContainer(customBlock.id, `🧩 Özel Blok: ${customBlock.name}`);

        const defHatEl = document.createElement('div');
        defHatEl.className = 'spike-block hat-block instance-block';
        defHatEl.style.backgroundColor = '#dc2626';
        defHatEl.draggable = true;
        defHatEl.dataset.blockId = customBlock.id;
        defHatEl.dataset.instanceId = 'inst_' + Math.random().toString(36).substr(2, 9);

        defHatEl.innerHTML = `
            <div class="block-content">
                <span class="spike-block statement-block" style="background-color: #ef4444; margin-right: 6px; pointer-events: none; height: 28px !important; padding: 0 8px !important;">${customBlock.name}</span>
                <span>tanımla</span>
            </div>
            <div class="block-notch-bottom"></div>
        `;

        defHatEl.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            currentDraggedBlock = { element: defHatEl, isTemplate: false, bDef: { id: customBlock.id } };
            e.dataTransfer.setData('text/plain', customBlock.id);
            defHatEl.style.opacity = '0.5';
        });

        defHatEl.addEventListener('dragend', (e) => {
            e.stopPropagation();
            defHatEl.style.opacity = '1';
            currentDraggedBlock = null;
        });

        newStack.appendChild(defHatEl);
        blockDropList.appendChild(newStack);
        updatePlaceholderVisibility();
        saveCurrentQuestionState();
    }

    // HELPER: CALCULATE INSERTION INDEX FOR DRAG REORDERING IN STACKS
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll(':scope > .instance-block:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // HELPER: CREATE A NEW INDEPENDENT STACK CONTAINER ON CANVAS
    function createNewStackContainer(stackId, titleText) {
        const stackBox = document.createElement('div');
        stackBox.className = 'block-stack custom-event-stack';
        stackBox.dataset.stackId = stackId || 'stack_' + Math.random().toString(36).substr(2, 9);

        if (titleText) {
            const titleEl = document.createElement('div');
            titleEl.className = 'stack-header-label';
            titleEl.textContent = titleText;
            stackBox.appendChild(titleEl);
        }

        // Setup drop events on the stack container
        stackBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            stackBox.classList.add('stack-drag-over');
        });

        stackBox.addEventListener('dragleave', (e) => {
            e.stopPropagation();
            stackBox.classList.remove('stack-drag-over');
        });

        stackBox.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            stackBox.classList.remove('stack-drag-over');

            if (!currentDraggedBlock) return;

            const afterElement = getDragAfterElement(stackBox, e.clientY);
            let targetEl = null;

            if (currentDraggedBlock.isTemplate) {
                const bDef = currentDraggedBlock.bDef;
                // If dropping an Event Hat Block, spawn a new stack for it!
                if (bDef.type === 'hat') {
                    spawnNewEventHatStack(bDef);
                    return;
                } else {
                    targetEl = createBlockElement(bDef, false);
                }
            } else {
                targetEl = currentDraggedBlock.element;
            }

            if (targetEl) {
                if (afterElement) {
                    stackBox.insertBefore(targetEl, afterElement);
                } else {
                    stackBox.appendChild(targetEl);
                }
            }

            updatePlaceholderVisibility();
            saveCurrentQuestionState();
        });

        return stackBox;
    }

    function spawnNewEventHatStack(hatBDef) {
        const hatName = hatBDef.text.split('[')[0].trim() || 'Olay Yığını';
        const newStack = createNewStackContainer(null, `⚡ ${hatName}`);
        const hatBlockEl = createBlockElement(hatBDef, false);

        newStack.appendChild(hatBlockEl);
        blockDropList.appendChild(newStack);
    }

    // 6. DRAG & DROP LOGIC FOR WORKSPACE CANVAS & DELETION ZONES
    let isDragAndDropSetup = false;
    function setupDragAndDropEvents() {
        if (isDragAndDropSetup) return;
        isDragAndDropSetup = true;

        // Main stack drop handling
        if (mainBlockStack) {
            mainBlockStack.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            mainBlockStack.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!currentDraggedBlock) return;

                const afterElement = getDragAfterElement(mainBlockStack, e.clientY);
                let targetEl = null;

                if (currentDraggedBlock.isTemplate) {
                    const bDef = currentDraggedBlock.bDef;
                    if (bDef.type === 'hat') {
                        spawnNewEventHatStack(bDef);
                        return;
                    } else {
                        targetEl = createBlockElement(bDef, false);
                    }
                } else {
                    targetEl = currentDraggedBlock.element;
                }

                if (targetEl) {
                    if (afterElement) {
                        mainBlockStack.insertBefore(targetEl, afterElement);
                    } else {
                        mainBlockStack.appendChild(targetEl);
                    }
                }

                updatePlaceholderVisibility();
                saveCurrentQuestionState();
            });
        }

        // CANVAS AREA DROP (Creates new event stack if an Event Hat is dropped directly on canvas)
        blockDropList.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        blockDropList.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!currentDraggedBlock) return;

            if (currentDraggedBlock.isTemplate) {
                const bDef = currentDraggedBlock.bDef;
                if (bDef.type === 'hat') {
                    spawnNewEventHatStack(bDef);
                } else {
                    const newBlock = createBlockElement(bDef, false);
                    mainBlockStack.appendChild(newBlock);
                }
            } else {
                // If dropped directly on empty canvas space, put in main stack unless it's a hat stack
                if (currentDraggedBlock.element.classList.contains('custom-event-stack')) {
                    blockDropList.appendChild(currentDraggedBlock.element);
                } else {
                    mainBlockStack.appendChild(currentDraggedBlock.element);
                }
            }

            updatePlaceholderVisibility();
            saveCurrentQuestionState();
        });

        // TRASH ZONE DROP
        trashZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            trashZone.classList.add('drag-over');
        });

        trashZone.addEventListener('dragleave', () => {
            trashZone.classList.remove('drag-over');
        });

        trashZone.addEventListener('drop', (e) => {
            e.preventDefault();
            trashZone.classList.remove('drag-over');

            if (currentDraggedBlock) {
                const blockId = currentDraggedBlock.bDef?.id || currentDraggedBlock.element?.dataset?.blockId;

                if (blockId && blockId.startsWith('myblock_')) {
                    deleteCustomBlockDefinition(blockId);
                } else if (!currentDraggedBlock.isTemplate) {
                    const parentStack = currentDraggedBlock.element.closest('.custom-event-stack');
                    currentDraggedBlock.element.remove();

                    // If parent stack became empty after removing hat, remove stack box
                    if (parentStack && parentStack.querySelectorAll('.instance-block').length === 0) {
                        parentStack.remove();
                    }

                    updatePlaceholderVisibility();
                    saveCurrentQuestionState();
                }
            }
        });

        // DRAWER / PALETTE AREA ALSO ACTS AS A DELETION ZONE
        blocksDrawer.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        blocksDrawer.addEventListener('drop', (e) => {
            e.preventDefault();
            if (currentDraggedBlock) {
                const blockId = currentDraggedBlock.bDef?.id || currentDraggedBlock.element?.dataset?.blockId;

                if (blockId && blockId.startsWith('myblock_')) {
                    deleteCustomBlockDefinition(blockId);
                } else if (!currentDraggedBlock.isTemplate) {
                    const parentStack = currentDraggedBlock.element.closest('.custom-event-stack');
                    currentDraggedBlock.element.remove();

                    if (parentStack && parentStack.querySelectorAll('.instance-block').length === 0) {
                        parentStack.remove();
                    }

                    updatePlaceholderVisibility();
                    saveCurrentQuestionState();
                }
            }
        });
    }

    function updatePlaceholderVisibility() {
        const instanceBlocks = blockDropList.querySelectorAll('.instance-block');
        if (instanceBlocks.length > 0) {
            emptyPlaceholder.style.display = 'none';
        } else {
            emptyPlaceholder.style.display = 'flex';
        }
    }

    // 7. QUESTION MANAGEMENT & RECURSIVE MULTI-STACK STATE SAVING
    function serializeBlockElement(el) {
        const blockId = el.dataset.blockId;
        const inputVals = {};

        // Handle selects and un-wrapped inputs
        el.querySelectorAll('.block-input-pill:not(div)').forEach(inp => {
            const inputId = inp.dataset.inputId;
            if (inputId) inputVals[inputId] = inp.value;
        });

        // Handle reporter drop zones
        el.querySelectorAll('.reporter-drop-zone').forEach(zone => {
            const wrapperId = zone.dataset.inputWrapperId;
            const childEl = zone.querySelector(':scope > .instance-block');
            const inp = zone.querySelector('input');
            if (wrapperId) {
                if (childEl) {
                    inputVals[wrapperId] = { isBlock: true, data: serializeBlockElement(childEl) };
                } else if (inp) {
                    inputVals[wrapperId] = inp.value;
                }
            }
        });

        const nestedBoolean = null;
        const booleanZone = el.querySelector('.boolean-drop-zone');
        if (booleanZone) {
            const childEl = booleanZone.querySelector(':scope > .instance-block');
            if (childEl) {
                inputVals['_booleanSlot'] = { isBlock: true, data: serializeBlockElement(childEl) };
            }
        }

        const nestedThen = [];
        const thenZone = el.querySelector('.nested-drop-zone[data-slot="then"]');
        if (thenZone) {
            thenZone.querySelectorAll(':scope > .instance-block').forEach(childEl => {
                nestedThen.push(serializeBlockElement(childEl));
            });
        }

        const nestedElse = [];
        const elseZone = el.querySelector('.nested-drop-zone[data-slot="else"]');
        if (elseZone) {
            elseZone.querySelectorAll(':scope > .instance-block').forEach(childEl => {
                nestedElse.push(serializeBlockElement(childEl));
            });
        }

        return {
            id: blockId,
            inputs: inputVals,
            nestedThen: nestedThen,
            nestedElse: nestedElse
        };
    }

    function saveCurrentQuestionState() {
        const q = questions[currentQuestionIndex];
        if (!q) return;

        if (q.type === 'paper_input') {
            if (q.id === 'q5') {
                saveTargetBoardAnswer();
            } else {
                const inputVal = inputPaperAnswer ? inputPaperAnswer.value.trim() : '';
                studentAnswers[q.id] = inputVal;
            }
            saveExamProgressLocally();
            return;
        }

        if (q.type === 'pyramid') {
            // Pyramid answers are already live-synced in studentAnswers[q.id]
            saveExamProgressLocally();
            return;
        }

        const allStacks = blockDropList.querySelectorAll('.block-stack');
        const stacksDataList = [];
        allStacks.forEach(stackEl => {
            const stackBlocks = [];
            stackEl.querySelectorAll(':scope > .instance-block').forEach(el => {
                stackBlocks.push(serializeBlockElement(el));
            });

            if (stackBlocks.length > 0) {
                stacksDataList.push({
                    stackId: stackEl.dataset.stackId || 'main',
                    blocks: stackBlocks
                });
            }
        });

        studentAnswers[q.id] = stacksDataList;
        saveExamProgressLocally();
    }

    function renderSavedBlockData(savedB) {
        let bDef = INITIAL_BLOCKS.find(b => b.id === savedB.id);

        if (!bDef && savedB.id.startsWith('var_rep_')) {
            const varName = savedB.id.replace('var_rep_', '');
            bDef = { id: savedB.id, category: 'degiskenler', type: 'reporter', text: varName, inputs: [] };
        } else if (!bDef && (savedB.id === 'var_set_val' || savedB.id === 'var_change_val')) {
            bDef = {
                id: savedB.id,
                category: 'degiskenler',
                type: 'statement',
                text: savedB.id === 'var_set_val' ? '{var} i {val} yap' : '{var} i {val} kadar değiştir',
                inputs: [
                    { id: 'var', type: 'select', options: createdVariables },
                    { id: 'val', type: 'number', default: 0 }
                ]
            };
        } else if (!bDef && savedB.id.startsWith('myblock_')) {
            const customB = createdCustomBlocks.find(cb => cb.id === savedB.id);
            if (customB) {
                bDef = {
                    id: customB.id,
                    category: 'bloklarim',
                    type: 'statement',
                    text: customB.name,
                    inputs: []
                };
            }
        }

        if (!bDef) return null;

        const customDef = JSON.parse(JSON.stringify(bDef));
        Object.keys(savedB.inputs || {}).forEach(key => {
            const val = savedB.inputs[key];
            if (val && val.isBlock) {
                // do nothing for inputs here, we'll append the block element next
            } else if (key !== '_booleanSlot') {
                const inp = customDef.inputs.find(i => i.id === key);
                if (inp) inp.value = val;
            }
        });

        const blockEl = createBlockElement(customDef, false);

        // Render inline reporter drops
        Object.keys(savedB.inputs || {}).forEach(key => {
            const val = savedB.inputs[key];
            if (val && val.isBlock) {
                const childEl = renderSavedBlockData(val.data);
                if (childEl) {
                    if (key === '_booleanSlot') {
                        const bZone = blockEl.querySelector('.boolean-drop-zone');
                        if (bZone) { bZone.innerHTML = ''; bZone.appendChild(childEl); }
                    } else {
                        const rZone = blockEl.querySelector(`.reporter-drop-zone[data-input-wrapper-id="${key}"]`);
                        if (rZone) {
                            rZone.appendChild(childEl);
                        }
                    }
                }
            }
        });

        if (savedB.nestedThen && savedB.nestedThen.length > 0) {
            const thenZone = blockEl.querySelector('.nested-drop-zone[data-slot="then"]');
            if (thenZone) {
                savedB.nestedThen.forEach(childData => {
                    const childEl = renderSavedBlockData(childData);
                    if (childEl) thenZone.appendChild(childEl);
                });
            }
        }

        if (savedB.nestedElse && savedB.nestedElse.length > 0) {
            const elseZone = blockEl.querySelector('.nested-drop-zone[data-slot="else"]');
            if (elseZone) {
                savedB.nestedElse.forEach(childData => {
                    const childEl = renderSavedBlockData(childData);
                    if (childEl) elseZone.appendChild(childEl);
                });
            }
        }

        return blockEl;
    }

    function loadQuestion(index) {
        currentQuestionIndex = index;
        const q = questions[index];

        questionBadge.textContent = `Soru ${index + 1} / ${questions.length}`;
        questionTitle.textContent = q.title;
        questionDesc.innerHTML = q.description.replace(/\n/g, '<br>');

        // Reset banner to open state so student reads instructions
        setBannerCollapsed(false);

        // Toggle buttons for coding & sending
        if (btnToggleBanner) {
            btnToggleBanner.style.display = 'inline-flex';
        }
        if (btnStartCodingNow) {
            btnStartCodingNow.style.display = (q.type === 'paper_input' || q.type === 'pyramid') ? 'none' : 'inline-flex';
        }

        // 2. VIEW MODE TOGGLING (PAPER INPUT vs PYRAMID vs BLOCKS)
        if (q.type === 'paper_input') {
            if (workspaceArea) workspaceArea.classList.add('layout-side-by-side');
            if (categorySidebar) categorySidebar.style.display = 'none';
            if (blocksDrawer) {
                blocksDrawer.style.display = 'none';
                blocksDrawer.classList.remove('open');
            }
            isDrawerOpen = false;
            if (blockDropList) blockDropList.style.display = 'none';
            if (paperAnswerContainer) paperAnswerContainer.style.display = 'flex';
            if (pyramidAnswerContainer) pyramidAnswerContainer.style.display = 'none';
            if (hardwarePortMap) hardwarePortMap.style.display = 'none';
            if (btnClearCanvas) btnClearCanvas.style.display = 'none';
            if (trashZone) trashZone.style.display = 'none';

            const defaultGroup = document.getElementById('defaultPaperInputGroup');
            const targetGroup = document.getElementById('targetBoardInputsGroup');

            if (q.id === 'q5') {
                if (defaultGroup) defaultGroup.style.display = 'none';
                if (targetGroup) targetGroup.style.display = 'block';
                loadTargetBoardInputs(q.id);
            } else {
                if (defaultGroup) defaultGroup.style.display = 'block';
                if (targetGroup) targetGroup.style.display = 'none';
                if (inputPaperAnswer) {
                    inputPaperAnswer.value = studentAnswers[q.id] || '';
                    setTimeout(() => inputPaperAnswer.focus(), 150);
                }
            }
        } else if (q.type === 'pyramid') {
            if (workspaceArea) workspaceArea.classList.add('layout-side-by-side');
            if (categorySidebar) categorySidebar.style.display = 'none';
            if (blocksDrawer) {
                blocksDrawer.style.display = 'none';
                blocksDrawer.classList.remove('open');
            }
            isDrawerOpen = false;
            if (blockDropList) blockDropList.style.display = 'none';
            if (paperAnswerContainer) paperAnswerContainer.style.display = 'none';
            if (pyramidAnswerContainer) pyramidAnswerContainer.style.display = 'flex';
            if (hardwarePortMap) hardwarePortMap.style.display = 'none';
            if (btnClearCanvas) btnClearCanvas.style.display = 'none';
            if (trashZone) trashZone.style.display = 'none';

            renderPyramidBoard(q.id);
        } else {
            if (workspaceArea) workspaceArea.classList.remove('layout-side-by-side');
            if (categorySidebar) categorySidebar.style.display = 'flex';
            if (blocksDrawer) {
                blocksDrawer.style.display = 'flex';
                blocksDrawer.classList.remove('open');
            }
            isDrawerOpen = false;
            renderCategories();
            if (blockDropList) blockDropList.style.display = 'flex';
            if (paperAnswerContainer) paperAnswerContainer.style.display = 'none';
            if (pyramidAnswerContainer) pyramidAnswerContainer.style.display = 'none';
            if (hardwarePortMap) hardwarePortMap.style.display = 'flex';
            if (btnClearCanvas) btnClearCanvas.style.display = 'inline-flex';
            if (trashZone) trashZone.style.display = 'block';

            clearCanvasUI();
            const savedAnswer = studentAnswers[q.id];

            if (savedAnswer && savedAnswer.length > 0 && Array.isArray(savedAnswer)) {
                savedAnswer.forEach(savedStack => {
                    let targetStackEl = mainBlockStack;

                    if (savedStack.stackId !== 'mainBlockStack' && savedStack.stackId !== 'main') {
                        targetStackEl = createNewStackContainer(savedStack.stackId, '⚡ Olay Yığını');
                        blockDropList.appendChild(targetStackEl);
                    }

                    (savedStack.blocks || []).forEach(savedB => {
                        const blockEl = renderSavedBlockData(savedB);
                        if (blockEl) targetStackEl.appendChild(blockEl);
                    });
                });
            }

            updatePlaceholderVisibility();
        }

        btnPrevQuestion.disabled = index === 0;
        if (index === questions.length - 1) {
            btnNextQuestion.style.display = 'none';
            btnFinishExam.style.display = 'inline-flex';
            btnFinishExam.innerHTML = '🚀 Sınavı Tamamla ve Gönder';
        } else {
            btnNextQuestion.style.display = 'inline-flex';
            btnNextQuestion.innerHTML = '💾 Kaydet & Sonraki ➡';
            btnFinishExam.style.display = 'none';
        }
    }

    function loadTargetBoardInputs(qId) {
        const inp13 = document.getElementById('targetInput13');
        const inp21 = document.getElementById('targetInput21');
        const inp28 = document.getElementById('targetInput28');
        const inp32 = document.getElementById('targetInput32');
        const saved = studentAnswers[qId] || '';

        let n13 = '', n21 = '', n28 = '', n32 = '';
        if (saved) {
            const m13 = saved.match(/13x(\d+)/i); if (m13) n13 = m13[1];
            const m21 = saved.match(/21x(\d+)/i); if (m21) n21 = m21[1];
            const m28 = saved.match(/28x(\d+)/i); if (m28) n28 = m28[1];
            const m32 = saved.match(/32x(\d+)/i); if (m32) n32 = m32[1];
        }

        if (inp13) inp13.value = n13;
        if (inp21) inp21.value = n21;
        if (inp28) inp28.value = n28;
        if (inp32) inp32.value = n32;
    }

    function saveTargetBoardAnswer() {
        const q = questions[currentQuestionIndex];
        if (!q || q.id !== 'q5') return;
        const inp13 = document.getElementById('targetInput13');
        const inp21 = document.getElementById('targetInput21');
        const inp28 = document.getElementById('targetInput28');
        const inp32 = document.getElementById('targetInput32');

        const v13 = parseInt(inp13?.value) || 0;
        const v21 = parseInt(inp21?.value) || 0;
        const v28 = parseInt(inp28?.value) || 0;
        const v32 = parseInt(inp32?.value) || 0;

        studentAnswers['q5'] = `13x${v13} + 21x${v21} + 28x${v28} + 32x${v32} = 100`;
        saveExamProgressLocally();
    }

    ['targetInput13', 'targetInput21', 'targetInput28', 'targetInput32'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', saveTargetBoardAnswer);
        }
    });

    function clearCanvasUI() {
        // Remove secondary stacks
        blockDropList.querySelectorAll('.custom-event-stack').forEach(el => el.remove());
        // Remove instance blocks from main stack
        if (mainBlockStack) {
            mainBlockStack.querySelectorAll(':scope > .instance-block').forEach(el => el.remove());
        }
        updatePlaceholderVisibility();
    }

    function setBannerCollapsed(isCollapsed) {
        if (!questionBanner) return;
        if (isCollapsed) {
            questionBanner.classList.add('collapsed');
            if (btnToggleBannerIcon) btnToggleBannerIcon.textContent = '📖';
            if (btnToggleBannerText) btnToggleBannerText.textContent = 'Yönergeyi Göster';
        } else {
            questionBanner.classList.remove('collapsed');
            if (btnToggleBannerIcon) btnToggleBannerIcon.textContent = '🔼';
            if (btnToggleBannerText) btnToggleBannerText.textContent = 'Yönergeyi Gizle';
        }
    }

    if (btnToggleBanner) {
        btnToggleBanner.addEventListener('click', () => {
            const isCurrentlyCollapsed = questionBanner && questionBanner.classList.contains('collapsed');
            setBannerCollapsed(!isCurrentlyCollapsed);
        });
    }

    if (btnStartCodingNow) {
        btnStartCodingNow.addEventListener('click', () => {
            setBannerCollapsed(true);
            showStudentToast('Tuval Açıldı! ✍️', 'Yönerge daraltıldı. Blokları sol panelden tuvale dizebilirsiniz.');
            const canvasContainer = document.getElementById('canvasContainer');
            if (canvasContainer) {
                canvasContainer.scrollTop = 0;
            }
        });
    }

    function showStudentToast(title, message) {
        if (!studentToast) return;
        if (toastTitle) toastTitle.textContent = title;
        if (toastMessage) toastMessage.textContent = message;
        studentToast.style.display = 'flex';
        if (window._toastTimeout) clearTimeout(window._toastTimeout);
        window._toastTimeout = setTimeout(() => {
            if (studentToast) studentToast.style.display = 'none';
        }, 4500);
    }

    if (btnCloseToast) {
        btnCloseToast.addEventListener('click', () => {
            if (studentToast) studentToast.style.display = 'none';
        });
    }

    window.loadQuestion = loadQuestion;
    window.initExam = initExam;
    window.createBlockElement = createBlockElement;
    window.renderSavedBlockData = renderSavedBlockData;

    btnClearCanvas.addEventListener('click', () => {
        if (confirm('Bu sorudaki eklediğiniz blokları temizlemek istediğinize emin misiniz?')) {
            clearCanvasUI();
            saveCurrentQuestionState();
        }
    });

    btnPrevQuestion.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            saveCurrentQuestionState();
            sendExamDataToGoogleSheet(false);
            loadQuestion(currentQuestionIndex - 1);
        }
    });

    btnNextQuestion.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            saveCurrentQuestionState();
            sendExamDataToGoogleSheet(false);
            showStudentToast(
                '✓ Yanıtınız Kaydedildi',
                `${currentQuestionIndex + 1}. Soru yanıtınız başarıyla kaydedildi. Sıradaki soruya geçiliyor.`
            );
            loadQuestion(currentQuestionIndex + 1);
        }
    });

    btnFinishExam.addEventListener('click', () => {
        saveCurrentQuestionState();
        if (confirm('Sınavınızı tamamlayıp tüm cevaplarınızı öğretmeninize göndermek istediğinize emin misiniz?')) {
            finishAndSubmitExam(false);
        }
    });

    // Kağıt üzerinde çözülecek sorular için klavye desteği

    if (inputPaperAnswer) {
        inputPaperAnswer.addEventListener('input', () => {
            saveCurrentQuestionState();
            if (paperSaveStatus) {
                paperSaveStatus.textContent = '✓ Otomatik Kaydedildi';
                paperSaveStatus.style.color = '#10b981';
            }
        });
        inputPaperAnswer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btnNextQuestion.click();
            }
        });
    }

    // 8. FORMAT MULTI-STACK ANSWERS WITH CATEGORY BADGES FOR GOOGLE SHEETS
    const CATEGORY_BADGES = {
        'motorlar': '🔵 [Motor]',   // Koyu Mavi Daire
        'hareket': '💗 [Hareket]',  // Pembe Kalp
        'olaylar': '🟡 [Olay]',    // Sarı Daire
        'kontrol': '🟠 [Kontrol]',  // Turuncu Daire
        'sensorler': '👁️ [Sensör]', // Sensör Gözü
        'operatorler': '🟢 [Operatör]', // Yeşil Daire
        'degiskenler': '🟧 [Değişken]', // Turuncu Kare
        'bloklarim': '🔴 [Özel Blok]'  // Kırmızı Daire
    };

    function formatBlocksToCleanText(savedStackList) {
        if (!savedStackList || savedStackList.length === 0) return '(Yanıt verilmedi)';

        const lines = [];

        savedStackList.forEach((stackData, sIdx) => {
            if (savedStackList.length > 1) {
                lines.push(`--- YIĞIN ${sIdx + 1} ---`);
            }
            lines.push(formatBlockGroup(stackData.blocks, 0));
        });

        return lines.join('\n');
    }

    function formatBlockGroup(savedBList, indentLevel = 0) {
        if (!savedBList || savedBList.length === 0) return '';

        const indent = '  '.repeat(indentLevel);
        const lines = [];

        savedBList.forEach(bData => {
            let bDef = INITIAL_BLOCKS.find(b => b.id === bData.id);
            if (!bDef && bData.id.startsWith('var_rep_')) {
                bDef = { id: bData.id, category: 'degiskenler', type: 'reporter', text: bData.id.replace('var_rep_', ''), inputs: [] };
            } else if (!bDef && bData.id === 'var_set_val') {
                bDef = { id: bData.id, category: 'degiskenler', type: 'statement', text: '{var} i {val} yap', inputs: [] };
            } else if (!bDef && bData.id === 'var_change_val') {
                bDef = { id: bData.id, category: 'degiskenler', type: 'statement', text: '{var} i {val} kadar değiştir', inputs: [] };
            } else if (!bDef && bData.id.startsWith('myblock_')) {
                const cb = createdCustomBlocks.find(c => c.id === bData.id);
                bDef = { id: bData.id, category: 'bloklarim', type: 'statement', text: cb ? cb.name : bData.id, inputs: [] };
            }

            const catBadge = CATEGORY_BADGES[bDef?.category] || '🔹';

            let text = bDef ? bDef.text : bData.id;
            
            // Format inline booleans
            if (bData.inputs && bData.inputs['_booleanSlot'] && bData.inputs['_booleanSlot'].isBlock) {
                const nestedBText = formatBlockGroup([bData.inputs['_booleanSlot'].data], 0).trim().replace(/^🔹 /, '').replace(/^🟢 /, '').replace(/^🟡 /, '');
                text = text.replace('<div class="hex-empty-slot boolean-drop-zone"></div>', `< ${nestedBText} >`);
            } else {
                text = text.replace('<div class="hex-empty-slot boolean-drop-zone"></div>', '< >');
            }

            Object.keys(bData.inputs || {}).forEach(key => {
                if (key === '_booleanSlot') return;
                const val = bData.inputs[key];
                if (val && val.isBlock) {
                    const nestedRText = formatBlockGroup([val.data], 0).trim().replace(/^🔹 /, '').replace(/^🟢 /, '').replace(/^🟡 /, '');
                    text = text.replace(`{${key}}`, `(${nestedRText})`);
                } else {
                    text = text.replace(`{${key}}`, `[${val}]`);
                }
            });

            const isCBlock = bDef?.type === 'c_block';
            if (isCBlock) {
                const isIfElse = bData.id === 'ctrl_if_else';
                if (isIfElse) {
                    lines.push(`${indent}${catBadge} eğer ${text.replace('eğer', '').replace('ise değilse', '')} ise:`);
                    lines.push(formatBlockGroup(bData.nestedThen, indentLevel + 1));
                    lines.push(`${indent}${catBadge} değilse:`);
                    lines.push(formatBlockGroup(bData.nestedElse, indentLevel + 1));
                } else {
                    lines.push(`${indent}${catBadge} ${text}:`);
                    lines.push(formatBlockGroup(bData.nestedThen, indentLevel + 1));
                }
            } else {
                lines.push(`${indent}${catBadge} • ${text}`);
            }
        });

        return lines.join('\n');
    }

    // ==========================================================
    // SİHİRLİ PİRAMİT (MANTIK 1 - 3. SORU) İNTERAKTİF MOTORU
    // ==========================================================
    function renderPyramidBoard(questionId) {
        if (!pyramidRowsContainer) return;

        pyramidRowsContainer.innerHTML = '';
        if (pyramidSvgLines) pyramidSvgLines.innerHTML = '';

        const storedData = studentAnswers[questionId] || { selections: {}, path: [], text: '', isCorrect: false };
        const selectedCols = storedData.selections || {};

        MAGIC_PYRAMID_GRID.forEach((rowVals, rIdx) => {
            const rowEl = document.createElement('div');
            rowEl.className = 'pyramid-row';
            rowEl.dataset.row = rIdx;

            rowVals.forEach((val, cIdx) => {
                const nodeBtn = document.createElement('button');
                nodeBtn.type = 'button';
                nodeBtn.className = 'pyramid-node';
                nodeBtn.textContent = val;
                nodeBtn.dataset.row = rIdx;
                nodeBtn.dataset.col = cIdx;
                nodeBtn.dataset.val = val;
                nodeBtn.title = `${rIdx + 1}. Satır, ${cIdx + 1}. Daire (Sayı: ${val})`;

                if (selectedCols[rIdx] === cIdx) {
                    nodeBtn.classList.add('selected');
                }

                nodeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handlePyramidNodeClick(questionId, rIdx, cIdx, val);
                });

                rowEl.appendChild(nodeBtn);
            });

            pyramidRowsContainer.appendChild(rowEl);
        });

        if (btnClearPyramid) {
            btnClearPyramid.onclick = () => {
                studentAnswers[questionId] = { selections: {}, path: [], text: '(Henüz bir yol seçilmedi)', isCorrect: false };
                saveExamProgressLocally();
                renderPyramidBoard(questionId);
            };
        }

        // Draw connections, numbers tracker and path text
        setTimeout(() => {
            updatePyramidStatusAndConnections(questionId);
        }, 50);
    }

    function handlePyramidNodeClick(questionId, row, col, val) {
        let stored = studentAnswers[questionId];
        if (!stored || typeof stored !== 'object' || !stored.selections) {
            stored = { selections: {}, path: [], text: '', isCorrect: false };
        }
        const selectedCols = { ...stored.selections };

        // Toggle or change selection in this row
        if (selectedCols[row] === col) {
            delete selectedCols[row];
        } else {
            selectedCols[row] = col;
        }

        // Compute ordered path & used values
        const pathVals = [];
        for (let r = 0; r < MAGIC_PYRAMID_GRID.length; r++) {
            if (selectedCols[r] !== undefined) {
                pathVals.push(MAGIC_PYRAMID_GRID[r][selectedCols[r]]);
            }
        }

        // Expected unique solution:
        // [0, 0, 0, 0, 0, 1, 1, 2, 3, 3] -> 6, 7, 1, 4, 2, 5, 3, 10, 8, 9
        const expectedCols = [0, 0, 0, 0, 0, 1, 1, 2, 3, 3];
        const isComplete = Object.keys(selectedCols).length === 10;
        let isCorrect = isComplete;
        if (isComplete) {
            for (let r = 0; r < 10; r++) {
                if (selectedCols[r] !== expectedCols[r]) {
                    isCorrect = false;
                    break;
                }
            }
        }

        const pathText = pathVals.length > 0 ? pathVals.join(' ➔ ') : '(Henüz bir yol seçilmedi)';

        // Update answer
        studentAnswers[questionId] = {
            selections: selectedCols,
            path: pathVals,
            text: pathText,
            isCorrect: isCorrect
        };
        saveExamProgressLocally();

        // Update active row nodes UI
        const rowEl = pyramidRowsContainer.querySelector(`.pyramid-row[data-row="${row}"]`);
        if (rowEl) {
            rowEl.querySelectorAll('.pyramid-node').forEach(btn => {
                const c = parseInt(btn.dataset.col, 10);
                if (selectedCols[row] === c) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
        }

        // Show auto-save indicator
        if (pyramidSaveStatus) {
            pyramidSaveStatus.style.display = 'inline-block';
            clearTimeout(pyramidSaveTimer);
            pyramidSaveTimer = setTimeout(() => {
                if (pyramidSaveStatus) pyramidSaveStatus.style.display = 'none';
            }, 1800);
        }

        updatePyramidStatusAndConnections(questionId);
    }

    function updatePyramidStatusAndConnections(questionId) {
        const stored = studentAnswers[questionId] || { selections: {}, path: [], text: '' };
        const selectedCols = stored.selections || {};
        const pathVals = stored.path || [];

        // 1. Update Path Text
        if (pyramidPathText) {
            pyramidPathText.textContent = pathVals.length > 0 ? pathVals.join(' ➔ ') : '(Dairelere tıklayarak rotanızı belirleyiniz)';
        }

        // 2. Update Number Badges (1 to 10)
        if (pyramidNumberBadges) {
            pyramidNumberBadges.innerHTML = '';
            const freq = {};
            for (let n = 1; n <= 10; n++) freq[n] = 0;
            pathVals.forEach(v => {
                if (freq[v] !== undefined) freq[v]++;
            });

            for (let n = 1; n <= 10; n++) {
                const badge = document.createElement('span');
                badge.className = 'num-badge';
                badge.textContent = n;
                if (freq[n] === 1) {
                    badge.classList.add('used');
                    badge.title = `${n} sayısı rotada 1 kez kullanıldı.`;
                } else if (freq[n] > 1) {
                    badge.classList.add('duplicate');
                    badge.title = `⚠️ ${n} sayısı ${freq[n]} kez kullanıldı!`;
                } else {
                    badge.title = `${n} henüz rotada yok.`;
                }
                pyramidNumberBadges.appendChild(badge);
            }
        }

        // 3. Draw SVG Connection Lines
        drawPyramidLines(selectedCols);
    }

    function drawPyramidLines(selectedCols) {
        if (!pyramidSvgLines || !pyramidRowsContainer) return;
        const boardEl = document.getElementById('pyramidBoard');
        if (!boardEl) return;

        const boardRect = boardEl.getBoundingClientRect();
        pyramidSvgLines.setAttribute('width', boardRect.width);
        pyramidSvgLines.setAttribute('height', boardRect.height);
        pyramidSvgLines.setAttribute('viewBox', `0 0 ${boardRect.width} ${boardRect.height}`);
        pyramidSvgLines.innerHTML = '';

        for (let r = 0; r < MAGIC_PYRAMID_GRID.length - 1; r++) {
            if (selectedCols[r] !== undefined && selectedCols[r + 1] !== undefined) {
                const node1 = pyramidRowsContainer.querySelector(`.pyramid-node[data-row="${r}"][data-col="${selectedCols[r]}"]`);
                const node2 = pyramidRowsContainer.querySelector(`.pyramid-node[data-row="${r + 1}"][data-col="${selectedCols[r + 1]}"]`);

                if (node1 && node2) {
                    const r1 = node1.getBoundingClientRect();
                    const r2 = node2.getBoundingClientRect();

                    const x1 = (r1.left + r1.right) / 2 - boardRect.left;
                    const y1 = (r1.top + r1.bottom) / 2 - boardRect.top;
                    const x2 = (r2.left + r2.right) / 2 - boardRect.left;
                    const y2 = (r2.top + r2.bottom) / 2 - boardRect.top;

                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', x1);
                    line.setAttribute('y1', y1);
                    line.setAttribute('x2', x2);
                    line.setAttribute('y2', y2);
                    line.setAttribute('stroke', '#ef4444');
                    line.setAttribute('stroke-width', '3.5');
                    line.setAttribute('stroke-linecap', 'round');

                    const colDiff = selectedCols[r + 1] - selectedCols[r];
                    if (colDiff !== 0 && colDiff !== 1) {
                        line.setAttribute('stroke-dasharray', '4,4');
                        line.setAttribute('stroke', '#f87171');
                    }

                    pyramidSvgLines.appendChild(line);
                }
            }
        }
    }

    window.addEventListener('resize', () => {
        const q = questions[currentQuestionIndex];
        if (q && q.type === 'pyramid') {
            updatePyramidStatusAndConnections(q.id);
        }
    });

    // AUTOMATED GOOGLE SHEETS WEBHOOK SUBMISSION (PROGRESSIVE / INCREMENTAL & FINAL)
    function sendExamDataToGoogleSheet(isFinal = false) {
        const webhookUrl = getGoogleSheetWebhookUrl();
        if (!webhookUrl || webhookUrl.trim() === '') {
            console.log('Google Sheets Webhook URL yapılandırılmadı. Gönderim atlandı.');
            return;
        }

        if (!studentInfo || !studentInfo.name || !studentInfo.name.trim()) {
            return;
        }

        if (!studentInfo.sessionId) {
            studentInfo.sessionId = generateSessionId();
        }

        // Aktif sorunun son durumunu belleğe garanti aktar
        saveCurrentQuestionState();

        const q1CodeText = formatBlocksToCleanText(studentAnswers['q1'] || []);
        const q2CodeText = formatBlocksToCleanText(studentAnswers['q2'] || []);
        let q3Text = '(Yanıt verilmedi)';
        let q3Correct = false;
        if (studentAnswers['q3']) {
            if (typeof studentAnswers['q3'] === 'string') {
                q3Text = studentAnswers['q3'];
            } else if (studentAnswers['q3'].text) {
                q3Text = studentAnswers['q3'].text;
                q3Correct = !!studentAnswers['q3'].isCorrect;
            }
        }
        const q4Text = studentAnswers['q4'] || '(Yanıt verilmedi)';
        const q5Text = studentAnswers['q5'] || '(Yanıt verilmedi)';
        const q6Text = studentAnswers['q6'] || '(Yanıt verilmedi)';

        const currentQNum = currentQuestionIndex + 1;
        const examStatus = isFinal ? 'TAMAMLANDI' : `DEVAM EDİYOR (Soru ${currentQNum}/6)`;

        const payload = {
            sessionId: studentInfo.sessionId,
            isFinal: !!isFinal,
            examStatus: examStatus,
            currentQuestionNum: currentQNum,
            timestamp: new Date().toLocaleString('tr-TR'),
            studentName: studentInfo.name,
            studentClass: studentInfo.class,
            secretDurationSec: studentWiringScore.durationSeconds || 0,
            secretHardwarePoints: studentWiringScore.points || 10,
            q1Answer: q1CodeText,
            q2Answer: q2CodeText,
            q3Answer: q3Text,
            q3Correct: q3Correct,
            q4Answer: q4Text,
            q5Answer: q5Text,
            q6Answer: q6Text,
            q1Json: JSON.stringify(studentAnswers['q1'] || []),
            q2Json: JSON.stringify(studentAnswers['q2'] || []),
            q3Json: JSON.stringify(studentAnswers['q3'] || {}),
            q4Json: JSON.stringify(studentAnswers['q4'] || ''),
            q5Json: JSON.stringify(studentAnswers['q5'] || ''),
            q6Json: JSON.stringify(studentAnswers['q6'] || '')
        };

        try {
            fetch(webhookUrl, {
                method: 'POST',
                mode: 'no-cors',
                keepalive: true,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }).then(() => {
                console.log(`[E-Tablo Senkronizasyon] Durum: ${examStatus} (${studentInfo.name})`);
            }).catch(err => {
                console.warn('E-Tabloya arka plan senkronizasyon uyarısı:', err);
            });
        } catch (e) {
            console.warn('Fetch senkronizasyon hatası:', e);
        }
    }

    btnReturnToStart.addEventListener('click', () => {
        clearLocalExamSession();
        modalExamResults.style.display = 'none';
        studentAnswers = {};
        currentQuestionIndex = 0;
        studentInfo = { name: '', class: '', sessionId: '' };
        isTeacherDemoMode = false;
        studentWiringScore = { durationSeconds: 0, points: 10 };
        document.getElementById('inputStudentName').value = '';
        document.getElementById('inputStudentClass').value = '';
        studentPill.style.display = 'none';
        if (teacherTestBanner) teacherTestBanner.style.display = 'none';

        clearCanvasUI();
        modalStudentEntry.style.display = 'flex';
        if (tabStudentRole) tabStudentRole.click();
    });

    // ==========================================================
    // 10. ÖĞRETMEN İNCELEME PANELİ KONTROLLERİ
    // ==========================================================
    const modalTeacherReview = document.getElementById('modalTeacherReview');
    const btnOpenTeacherReview = document.getElementById('btnOpenTeacherReview');
    const btnCloseTeacherModal = document.getElementById('btnCloseTeacherModal');
    const btnTeacherLoadCurrent = document.getElementById('btnTeacherLoadCurrent');
    const teacherCodeInput = document.getElementById('teacherCodeInput');
    const teacherFeedback = document.getElementById('teacherFeedback');
    const btnTeacherApply = document.getElementById('btnTeacherApply');

    if (btnOpenTeacherReview && modalTeacherReview) {
        btnOpenTeacherReview.addEventListener('click', () => {
            modalTeacherReview.style.display = 'flex';
            if (teacherFeedback) teacherFeedback.style.display = 'none';
        });
    }

    if (btnCloseTeacherModal && modalTeacherReview) {
        btnCloseTeacherModal.addEventListener('click', () => {
            modalTeacherReview.style.display = 'none';
        });
    }

    if (btnTeacherLoadCurrent) {
        btnTeacherLoadCurrent.addEventListener('click', () => {
            saveCurrentQuestionState();
            const q = questions[currentQuestionIndex];
            const currentData = studentAnswers[q.id] || [];
            teacherCodeInput.value = JSON.stringify(currentData, null, 2);
            if (teacherFeedback) {
                teacherFeedback.style.display = 'block';
                teacherFeedback.style.color = '#10b981';
                teacherFeedback.textContent = `✓ ${q.title} yanıtı metin kutusuna aktarıldı.`;
            }
        });
    }

    if (btnTeacherApply) {
        btnTeacherApply.addEventListener('click', () => {
            const rawVal = teacherCodeInput.value.trim();
            if (!rawVal) {
                alert('Lütfen öğrenciye ait geçerli bir kod verisi (JSON) yapıştırınız.');
                return;
            }

            try {
                const parsed = JSON.parse(rawVal);
                if (!Array.isArray(parsed)) throw new Error('Format dizi olmalı.');

                // Apply to active canvas
                clearCanvasUI();
                parsed.forEach(savedStack => {
                    let targetStackEl = mainBlockStack;
                    if (savedStack.stackId !== 'mainBlockStack' && savedStack.stackId !== 'main') {
                        targetStackEl = createNewStackContainer(savedStack.stackId, '⚡ Olay Yığını');
                        blockDropList.appendChild(targetStackEl);
                    }

                    (savedStack.blocks || []).forEach(savedB => {
                        const blockEl = renderSavedBlockData(savedB);
                        if (blockEl) targetStackEl.appendChild(blockEl);
                    });
                });

                updatePlaceholderVisibility();
                saveCurrentQuestionState();

                // Close teacher modal and notify
                modalTeacherReview.style.display = 'none';
                showStudentToast('✓ Kod Tuvale Yüklendi', 'Öğrencinin kod blokları çalışma alanına aktarıldı.');
            } catch (e) {
                alert('Yapıştırılan kod verisi geçerli bir JSON yapısında değil!\n' + e.message);
            }
        });
    }

    // BEFOREUNLOAD PERSISTENCE (Ani sekme kapatma / internet kopması / F5 durumunda anında yedekle ve gönder)
    window.addEventListener('beforeunload', () => {
        if (studentInfo && studentInfo.name && studentInfo.name.trim()) {
            saveCurrentQuestionState();
            saveExamProgressLocally();
            sendExamDataToGoogleSheet(false);
        }
    });

    // AUTOMATED TESTING / VERIFICATION HOOK (Runs only when ?test_q= is present in URL)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('test_q')) {
        const qIdx = parseInt(urlParams.get('test_q'), 10);
        studentInfo = { name: 'Ahmet Yılmaz (Test)', class: '6-A', sessionId: generateSessionId() };
        if (modalStudentEntry) modalStudentEntry.style.display = 'none';
        if (modalHardwareSetup) modalHardwareSetup.style.display = 'none';
        if (studentPill) studentPill.style.display = 'flex';
        if (studentInfoText) studentInfoText.textContent = `${studentInfo.name} - ${studentInfo.class}`;
        initExam();
        if (!isNaN(qIdx) && qIdx >= 0 && qIdx < questions.length) {
            loadQuestion(qIdx);
        }
    } else {
        // Normal başlatma: Eğer daha önce yarım kalmış bir sınav oturumu varsa geri yükle
        restoreExamSessionIfExists();
    }
});
