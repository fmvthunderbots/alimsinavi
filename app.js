/**
 * SPIKE Prime Exam Application JavaScript Core Engine
 * Multi-Stack Canvas Support: Event Hat Blocks and Custom Blocks spawn as independent parallel stacks!
 */

// ⚠️ E-TABLO BAĞLANTI AYARLARI VE ÖĞRETMEN YÖNETİMİ
const DEFAULT_GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwwYemot6z9x-89yF04jo5PiecuYKVfLwdymTTUzXviyg0Ol7gFJqUptfo3wOsar_PF/exec';
const TEACHER_MASTER_PASSWORD = '26575982824.bati';
const STORAGE_TEACHER_LOGGED = 'spike_teacher_authenticated';

function getGoogleSheetWebhookUrl() {
    const customUrl = localStorage.getItem('spike_webhook_url');
    if (customUrl && customUrl.includes('AKfycbwwYemot6z9x')) {
        return customUrl;
    }
    return DEFAULT_GOOGLE_SHEET_WEBHOOK_URL;
}

document.addEventListener('DOMContentLoaded', () => {
    // App State
    let studentInfo = { name: '', class: '' };
    let questions = [...DEFAULT_QUESTIONS];
    let currentQuestionIndex = 0;
    let studentAnswers = {}; // { questionId: [ stack1, stack2... ] }
    let activeCategory = 'motorlar';
    let isDrawerOpen = false;
    let createdVariables = []; // Dynamic variable list
    let createdCustomBlocks = []; // Dynamic custom blocks
    let createdMessages = ['haber1']; // Dynamic broadcast messages list
    let currentDraggedBlock = null;

    // Simulation Attempts Limitation (3 Hak)
    const MAX_SIM_ATTEMPTS = 3;
    let simAttemptsLeft = { 'q7': 3, 'q8': 3 };
    let simAttemptsUsed = { 'q7': 0, 'q8': 0 };

    // Secret Wiring Performance Tracking (10 Puan)
    let wiringStartTime = 0;
    let studentWiringScore = { durationSeconds: 0, points: 10 };

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
    const hardwarePortMap = document.querySelector('.hardware-port-map');
    const questionBanner = document.getElementById('questionBanner');
    const btnToggleBanner = document.getElementById('btnToggleBanner');
    const btnToggleBannerIcon = document.getElementById('btnToggleBannerIcon');
    const btnToggleBannerText = document.getElementById('btnToggleBannerText');
    const btnStartCodingNow = document.getElementById('btnStartCodingNow');
    const btnToggleSimulator = document.getElementById('btnToggleSimulator');
    const btnOpenSimFromBanner = document.getElementById('btnOpenSimFromBanner');

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
                studentName: 'TEST SİNYALİ (Öğretmen Paneli)',
                studentClass: 'TEST',
                secretDurationSec: 10,
                secretHardwarePoints: 10,
                q1Answer: 'Test Bağlantısı Başarılı ✓',
                q2Answer: 'Test',
                q3Answer: '9284',
                q4Answer: '46 saniye',
                q5Answer: '10 tur, saat yönünde',
                q6Answer: '5-1-2-4-3 (Ortanca: 2)',
                q7Answer: 'Test Rota Simülatörü',
                q8Answer: 'Test Renk Simülatörü',
                q7SimAttemptsUsed: 1,
                q8SimAttemptsUsed: 1
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
        isTeacherDemoMode = false;

        if (!studentInfo.name || !studentInfo.class) return;

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

    function initExam() {
        isDrawerOpen = false;
        if (blocksDrawer) blocksDrawer.classList.remove('open');
        renderCategories();
        loadQuestion(0);
        setupDragAndDropEvents();
        setupCustomBlockModalEvents();
        setupBlocksDrawerEvents();
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
                inputHtml = `<select class="block-input-pill ${extraClass}" data-input-id="${valKey}" ${msgAttr}>${options}</select>`;
            } else if (input.type === 'number') {
                inputHtml = `<input type="number" class="block-input-pill" data-input-id="${valKey}" value="${currentVal}" placeholder="">`;
            } else if (input.type === 'text') {
                inputHtml = `<input type="text" class="block-input-pill" data-input-id="${valKey}" value="${currentVal}" placeholder="">`;
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
            const isLoop = bDef.id === 'ctrl_repeat' || bDef.id === 'ctrl_forever' || bDef.id === 'ctrl_repeat_until';

            if (isIfElse) {
                cWrapper.innerHTML = `
                    <div class="c-block-header" style="background-color: ${catObj.color};">
                        <span>eğer</span> ${renderedText.replace('eğer', '').replace('ise değilse', '')} <span>ise</span>
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
                        <span>${renderedText}</span>
                    </div>
                    <div class="c-block-inner-zone nested-drop-zone" data-slot="then"></div>
                    <div class="c-block-footer" style="background-color: ${catObj.color};">
                        ${isLoop ? '<span class="c-loop-arrow">⤴</span>' : ''}
                    </div>
                `;
            }

            cWrapper.querySelectorAll('.nested-drop-zone').forEach(zone => {
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

                    const afterElement = getDragAfterElement(zone, e.clientY);
                    let newEl = null;

                    if (currentDraggedBlock.isTemplate) {
                        newEl = createBlockElement(currentDraggedBlock.bDef, false);
                    } else {
                        newEl = currentDraggedBlock.element;
                    }

                    if (newEl) {
                        if (afterElement) {
                            zone.insertBefore(newEl, afterElement);
                        } else {
                            zone.appendChild(newEl);
                        }
                    }

                    updatePlaceholderVisibility();
                    saveCurrentQuestionState();
                });
            });

            setupBlockInputEvents(cWrapper, isTemplate);

            cWrapper.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                currentDraggedBlock = { element: cWrapper, isTemplate: isTemplate, bDef: bDef };
                e.dataTransfer.setData('text/plain', bDef.id);
                cWrapper.style.opacity = '0.5';
            });

            cWrapper.addEventListener('dragend', (e) => {
                e.stopPropagation();
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

        setupBlockInputEvents(blockEl, isTemplate);

        blockEl.addEventListener('dragstart', (e) => {
            e.stopPropagation();
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

                if (!isTemplate) saveCurrentQuestionState();
            });
        });
    }

    function updateAllMessageDropdowns(selectedMsg) {
        document.querySelectorAll('select[data-is-msg="true"]').forEach(selectEl => {
            const currentVal = selectedMsg || selectEl.value;
            selectEl.innerHTML = ['Yeni haber...', ...createdMessages].map(opt => `<option value="${opt}" ${opt === currentVal ? 'selected' : ''}>${opt}</option>`).join('');
            selectEl.value = currentVal;
        });
    }

    // 5. CUSTOM BLOCK MODAL LOGIC ("Blok Oluştur")
    function setupCustomBlockModalEvents() {
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
    function setupDragAndDropEvents() {
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

        el.querySelectorAll('.block-input-pill').forEach(inp => {
            const inputId = inp.dataset.inputId;
            inputVals[inputId] = inp.value;
        });

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
            const inputVal = inputPaperAnswer ? inputPaperAnswer.value.trim() : '';
            studentAnswers[q.id] = inputVal;
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
        customDef.inputs.forEach(inp => {
            if (savedB.inputs[inp.id] !== undefined) {
                inp.value = savedB.inputs[inp.id];
            }
        });

        const blockEl = createBlockElement(customDef, false);

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

        // 1. SIMULATOR LOCK & AUTO-OPEN LOGIC
        if (q.type === 'simulator') {
            if (btnToggleSimulator) {
                btnToggleSimulator.classList.remove('locked');
                btnToggleSimulator.innerHTML = '🤖 Simülatör';
                btnToggleSimulator.title = '2D Robot Simülatörünü Aç/Kapat';
            }
            if (btnOpenSimFromBanner) {
                btnOpenSimFromBanner.style.display = 'inline-flex';
            }
            if (window.SpikeSimulator) {
                const targetTrack = q.trackId || (q.id === 'q8' ? 'q8' : 'q7');
                window.SpikeSimulator.loadTrack(targetTrack);
                window.SpikeSimulator.toggleDrawer(true);
            }
            updateSimAttemptsUI(q.id);
        } else {
            if (btnToggleSimulator) {
                btnToggleSimulator.classList.add('locked');
                btnToggleSimulator.innerHTML = '🔒 Simülatör (7. Soruda Açılır)';
                btnToggleSimulator.title = 'Simülatör sadece 7. ve 8. sorularda aktifleşir';
            }
            if (btnOpenSimFromBanner) {
                btnOpenSimFromBanner.style.display = 'none';
            }
            if (window.SpikeSimulator) {
                window.SpikeSimulator.toggleDrawer(false);
            }
        }

        // Toggle buttons for coding & sending
        if (btnToggleBanner) {
            btnToggleBanner.style.display = 'inline-flex';
        }
        if (btnStartCodingNow) {
            btnStartCodingNow.style.display = q.type === 'paper_input' ? 'none' : 'inline-flex';
        }

        // 2. VIEW MODE TOGGLING (PAPER INPUT vs BLOCKS)
        if (q.type === 'paper_input') {
            if (categorySidebar) categorySidebar.style.display = 'none';
            if (blocksDrawer) {
                blocksDrawer.style.display = 'none';
                blocksDrawer.classList.remove('open');
            }
            isDrawerOpen = false;
            if (blockDropList) blockDropList.style.display = 'none';
            if (paperAnswerContainer) paperAnswerContainer.style.display = 'flex';
            if (hardwarePortMap) hardwarePortMap.style.display = 'none';
            if (btnClearCanvas) btnClearCanvas.style.display = 'none';
            if (trashZone) trashZone.style.display = 'none';

            if (inputPaperAnswer) {
                inputPaperAnswer.value = studentAnswers[q.id] || '';
                setTimeout(() => inputPaperAnswer.focus(), 150);
            }
        } else {
            if (categorySidebar) categorySidebar.style.display = 'flex';
            if (blocksDrawer) {
                blocksDrawer.style.display = 'flex';
                blocksDrawer.classList.remove('open');
            }
            isDrawerOpen = false;
            renderCategories();
            if (blockDropList) blockDropList.style.display = 'flex';
            if (paperAnswerContainer) paperAnswerContainer.style.display = 'none';
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

    function updateSimAttemptsUI(qId) {
        const badge = document.getElementById('simAttemptsBadge');
        const btnPlay = document.getElementById('btnSimPlay');
        if (!qId) return;
        const targetQ = questions.find(item => item.id === qId);
        if (!targetQ || targetQ.type !== 'simulator') return;

        const left = simAttemptsLeft[qId] !== undefined ? simAttemptsLeft[qId] : 3;

        if (badge) {
            badge.textContent = `${left} / 3 Hak`;
            badge.className = 'attempt-pill';
            if (left === 3) badge.classList.add('pill-green');
            else if (left === 2) badge.classList.add('pill-yellow');
            else if (left === 1) badge.classList.add('pill-orange');
            else badge.classList.add('pill-red');
        }

        if (btnPlay) {
            if (left > 0) {
                btnPlay.disabled = false;
                btnPlay.classList.remove('btn-disabled');
                btnPlay.innerHTML = `▶ Kodu Simüle Et <span class="sim-attempts-tag" id="btnSimAttemptsTag">(${left}/3 Hak)</span>`;
            } else {
                btnPlay.disabled = true;
                btnPlay.classList.add('btn-disabled');
                btnPlay.innerHTML = `🚫 Simülasyon Hakkı Bitti (0/3)`;
            }
        }
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
            loadQuestion(currentQuestionIndex - 1);
        }
    });

    btnNextQuestion.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            saveCurrentQuestionState();
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
            sendExamDataToGoogleSheet();
            showExamSuccessModal();
            showStudentToast('✓ Sınavınız Gönderildi! 🎉', 'Tüm yanıtlarınız başarıyla öğretmeninize ulaştırıldı.');
        }
    });

    // Kağıt üzerinde çözülecek sorular (3 ve 4) için klavye ve buton desteği
    if (btnPaperNextQuestion) {
        btnPaperNextQuestion.addEventListener('click', () => {
            btnNextQuestion.click();
        });
    }

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
            Object.keys(bData.inputs || {}).forEach(key => {
                text = text.replace(`{${key}}`, `[${bData.inputs[key]}]`);
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

    // AUTOMATED GOOGLE SHEETS WEBHOOK SUBMISSION
    function sendExamDataToGoogleSheet() {
        const webhookUrl = getGoogleSheetWebhookUrl();
        if (!webhookUrl || webhookUrl.trim() === '') {
            console.log('Google Sheets Webhook URL yapılandırılmadı. Gönderim atlandı.');
            return;
        }

        const q1CodeText = formatBlocksToCleanText(studentAnswers['q1'] || []);
        const q2CodeText = formatBlocksToCleanText(studentAnswers['q2'] || []);
        const q3Text = studentAnswers['q3'] || '(Yanıt verilmedi)';
        const q4Text = studentAnswers['q4'] || '(Yanıt verilmedi)';
        const q5Text = studentAnswers['q5'] || '(Yanıt verilmedi)';
        const q6Text = studentAnswers['q6'] || '(Yanıt verilmedi)';
        const q7CodeText = formatBlocksToCleanText(studentAnswers['q7'] || []);
        const q8CodeText = formatBlocksToCleanText(studentAnswers['q8'] || []);

        const payload = {
            timestamp: new Date().toLocaleString('tr-TR'),
            studentName: studentInfo.name,
            studentClass: studentInfo.class,
            secretDurationSec: studentWiringScore.durationSeconds,
            secretHardwarePoints: studentWiringScore.points, // 10 Puan veya yavaşsa 5 Puan
            q1Answer: q1CodeText,
            q2Answer: q2CodeText,
            q3Answer: q3Text,
            q4Answer: q4Text,
            q5Answer: q5Text,
            q6Answer: q6Text,
            q7Answer: q7CodeText,
            q8Answer: q8CodeText,
            q7SimAttemptsUsed: simAttemptsUsed['q7'] || 0,
            q8SimAttemptsUsed: simAttemptsUsed['q8'] || 0,
            q1Json: JSON.stringify(studentAnswers['q1'] || []),
            q2Json: JSON.stringify(studentAnswers['q2'] || []),
            q7Json: JSON.stringify(studentAnswers['q7'] || []),
            q8Json: JSON.stringify(studentAnswers['q8'] || [])
        };

        fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then(() => {
            console.log('Sınav verileri Google E-Tabloya başarıyla gönderildi.');
        }).catch(err => {
            console.error('E-Tabloya gönderim hatası:', err);
        });
    }

    // 9. CLEAN STUDENT COMPLETION MODAL & RESET FOR NEXT STUDENT
    function showExamSuccessModal() {
        modalExamResults.style.display = 'flex';
        studentSuccessMsg.innerHTML = `Tebrikler <b>${studentInfo.name}</b>! Sınav yanıtlarınız öğretmeninize başarıyla ulaştırılmıştır.`;
    }

    btnReturnToStart.addEventListener('click', () => {
        modalExamResults.style.display = 'none';
        studentAnswers = {};
        currentQuestionIndex = 0;
        studentInfo = { name: '', class: '' };
        isTeacherDemoMode = false;
        simAttemptsLeft = { 'q7': 3, 'q8': 3 };
        simAttemptsUsed = { 'q7': 0, 'q8': 0 };
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
    // 10. 2D SİMÜLATÖR VE ÖĞRETMEN İNCELEME PANELİ BAĞLANTISI
    // ==========================================================
    if (window.SpikeSimulator) {
        window.SpikeSimulator.init('simCanvas', {
            btnPlay: 'btnSimPlay',
            btnReset: 'btnSimReset',
            btnToggle: 'btnToggleSimulator',
            btnClose: 'btnCloseSimulator',
            drawer: 'simDrawer',
            badgeMission: 'simMissionBadge',
            pillColor: 'simPillColor',
            txtHeading: 'simTxtHeading',
            txtMotors: 'simTxtMotors',
            btnSubmitCode: 'btnSimSubmitCode',
            trackSelector: 'simTrackSelect'
        });

        // Guard: simulator can only be opened on Question 5 and 6 (simulator questions)
        window.onSimulatorCanToggle = () => {
            const q = questions[currentQuestionIndex];
            if (q && q.type !== 'simulator') {
                alert('Robotik Simülatör pisti sadece 5. ve 6. sorularda (Simülasyon etabı) açılacaktır! Lütfen önce bu soruyu tamamlayınız.');
                return false;
            }
            return true;
        };

        if (btnOpenSimFromBanner) {
            btnOpenSimFromBanner.addEventListener('click', () => {
                if (window.SpikeSimulator) {
                    window.SpikeSimulator.toggleDrawer(true);
                }
            });
        }

        // Run hook called when student or teacher clicks "▶ Kodu Simüle Et"
        window.onSimulatorRequestRun = () => {
            saveCurrentQuestionState();
            const q = questions[currentQuestionIndex];
            if (!q || q.type !== 'simulator') return;

            const savedStackList = studentAnswers[q.id] || [];
            
            if (savedStackList.length === 0 || !savedStackList[0].blocks || savedStackList[0].blocks.length === 0) {
                window.SpikeSimulator.setMissionStatus('Çalışma alanında kod bloku yok!', 'warning');
                return;
            }

            // HAK KONTROLÜ (Her simülasyon sorusu için 3 deneme hakkı)
            if (simAttemptsLeft[q.id] === undefined) simAttemptsLeft[q.id] = 3;
            if (simAttemptsUsed[q.id] === undefined) simAttemptsUsed[q.id] = 0;
            if (!isTeacherDemoMode) {
                if (simAttemptsLeft[q.id] <= 0) {
                    showStudentToast(
                        '⚠️ Simülasyon Hakkınız Doldu!',
                        'Bu soru için belirlenen 3 deneme hakkınızı tamamladınız. Kodunuz kaydedildi, sınavınıza sıradaki soruya geçerek devam edebilirsiniz.'
                    );
                    updateSimAttemptsUI(q.id);
                    return;
                }

                simAttemptsLeft[q.id]--;
                simAttemptsUsed[q.id]++;
                updateSimAttemptsUI(q.id);
                showStudentToast('Simülasyon Başlatıldı', `Bu soru için kalan deneme hakkınız: ${simAttemptsLeft[q.id]} / 3`);
            }

            // Make sure drawer is open
            window.SpikeSimulator.toggleDrawer(true);
            // Execute main stack blocks in simulator
            window.SpikeSimulator.executeBlocks(savedStackList[0].blocks);
        };

        window.onSimulatorFinishState = () => {
            const q = questions[currentQuestionIndex];
            if (q && q.type === 'simulator') {
                updateSimAttemptsUI(q.id);
            }
        };
    }



    // Simulator Canvas Snapshot (PNG Download)
    const btnSimSnapshot = document.getElementById('btnSimSnapshot');
    if (btnSimSnapshot) {
        btnSimSnapshot.addEventListener('click', () => {
            if (!window.SpikeSimulator) return;
            const dataUrl = window.SpikeSimulator.takeSnapshot();
            if (!dataUrl) return;
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `spike-simulasyon-${studentInfo.name ? studentInfo.name.replace(/\s+/g, '_') : 'robot'}-${Date.now()}.png`;
            a.click();
        });
    }

    // TEACHER REVIEW MODAL CONTROLS
    const modalTeacherReview = document.getElementById('modalTeacherReview');
    const btnOpenTeacherReview = document.getElementById('btnOpenTeacherReview');
    const btnCloseTeacherModal = document.getElementById('btnCloseTeacherModal');
    const btnTeacherLoadCurrent = document.getElementById('btnTeacherLoadCurrent');
    const btnTeacherCaptureWorkspace = document.getElementById('btnTeacherCaptureWorkspace');
    const teacherCodeInput = document.getElementById('teacherCodeInput');
    const teacherFeedback = document.getElementById('teacherFeedback');
    const btnTeacherApplyAndSim = document.getElementById('btnTeacherApplyAndSim');

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

    if (btnTeacherCaptureWorkspace) {
        btnTeacherCaptureWorkspace.addEventListener('click', () => {
            if (btnSimSnapshot) btnSimSnapshot.click();
        });
    }

    if (btnTeacherApplyAndSim) {
        btnTeacherApplyAndSim.addEventListener('click', () => {
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

                // Close teacher modal, open simulator, and auto-run
                modalTeacherReview.style.display = 'none';
                if (window.SpikeSimulator) {
                    window.SpikeSimulator.toggleDrawer(true);
                    window.SpikeSimulator.reset();
                    setTimeout(() => {
                        if (parsed[0] && parsed[0].blocks) {
                            window.SpikeSimulator.executeBlocks(parsed[0].blocks);
                        }
                    }, 400);
                }
            } catch (e) {
                alert('Yapıştırılan kod verisi geçerli bir JSON yapısında değil!\n' + e.message);
            }
        });
    }
});
