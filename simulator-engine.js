/**
 * SPIKE Prime 2D Simulation Engine & Block Interpreter
 * Open Roberta inspired canvas simulator for LEGO SPIKE Prime robotics exams
 */

(function(window) {
    'use strict';

    // Scale: 1 cm = 20 pixels (1 grid square = 1 cm)
    const SCALE = 20;

    const TRACKS = {
        'q5': {
            id: 'q5',
            name: '1. Simülatör Parkuru: Rota Takibi & Engeli Aşma (Baypas)',
            width: 480,
            height: 380,
            robotStart: { x: 80, y: 300, angleDeg: 0 }, // 0 deg = North
            goal: { x: 380, y: 80, radius: 30, desc: 'Bitiş Noktası' },
            obstacle: { x: 55, y: 90, w: 50, h: 32 },
            drawBackground: function(ctx, sim) {
                drawGrid(ctx, 480, 380);

                // 1. Asfalt / Yol Koridoru
                ctx.save();
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 44;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Doğrudan engele giden kapalı yol koridoru
                ctx.beginPath();
                ctx.moveTo(80, 300);
                ctx.lineTo(80, 115);
                ctx.stroke();

                // Baypas (Açık Detour) yol koridoru
                ctx.beginPath();
                ctx.moveTo(80, 160);
                ctx.lineTo(240, 160);
                ctx.lineTo(240, 80);
                ctx.lineTo(380, 80);
                ctx.stroke();

                // Kılavuz Çizgileri
                // Açık baypas çizgisi (Koyu lacivert-gri)
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(80, 300);
                ctx.lineTo(80, 160);
                ctx.lineTo(240, 160);
                ctx.lineTo(240, 80);
                ctx.lineTo(380, 80);
                ctx.stroke();

                // Kapalı engele giden kesikli çizgi
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 3;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(80, 160);
                ctx.lineTo(80, 125);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();

                // Detour mesafe etiketleri (Öğrencilerin kare saymasını kolaylaştıran rehber)
                ctx.save();
                ctx.fillStyle = '#475569';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⬆ 7 cm', 52, 220);
                ctx.fillText('8 cm ➔', 160, 150);
                ctx.fillText('⬆ 4 cm', 216, 120);
                ctx.fillText('7 cm ➔', 310, 70);
                ctx.restore();

                // Başlangıç Alanı
                ctx.save();
                ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.roundRect(55, 275, 50, 50, 8);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#15803d';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('BAŞLANGIÇ', 80, 304);
                ctx.restore();

                // ⛔ ENGEL Alanı
                ctx.save();
                // Kırmızı Sensör Uyarı Çizgisi
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(55, 124, 50, 12);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 8px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('UYARI / DUR', 80, 133);

                // Engel Barikatı
                ctx.fillStyle = '#dc2626';
                ctx.strokeStyle = '#991b1b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(55, 90, 50, 32, 6);
                ctx.fill();
                ctx.stroke();

                // Barikat Çizgileri
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                for (let sx = 58; sx < 105; sx += 12) {
                    ctx.beginPath();
                    ctx.moveTo(sx, 120);
                    ctx.lineTo(sx + 10, 92);
                    ctx.stroke();
                }

                // Engel Metni
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⛔ ENGEL', 80, 107);
                ctx.fillStyle = '#fecaca';
                ctx.font = '8px sans-serif';
                ctx.fillText('KAPALI YOL', 80, 117);
                ctx.restore();

                // Hedef Pad (Bitiş Alanı)
                ctx.save();
                ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(380, 80, 30, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#854d0e';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('BİTİŞ 🏁', 380, 84);
                ctx.restore();
            },
            getSurfaceColor: function(x, y) {
                // Engel önündeki kırmızı uyarı alanı (x: 55-105, y: 115-138)
                if (x >= 55 && x <= 105 && y >= 115 && y <= 138) return 'kırmızı';
                // Hedef sarı alanı
                if (Math.hypot(x - 380, y - 80) <= 30) return 'sarı';
                // Başlangıç yeşil alanı
                if (x >= 55 && x <= 105 && y >= 275 && y <= 325) return 'yeşil';

                // Kılavuz çizgileri üzerindeyse siyah (±8px)
                if (Math.abs(x - 80) <= 8 && y >= 160 && y <= 300) return 'siyah';
                if (Math.abs(y - 160) <= 8 && x >= 80 && x <= 240) return 'siyah';
                if (Math.abs(x - 240) <= 8 && y >= 80 && y <= 160) return 'siyah';
                if (Math.abs(y - 80) <= 8 && x >= 240 && x <= 380) return 'siyah';

                return 'beyaz';
            },
            checkCollision: function(robot) {
                const rLeft = robot.x - robot.width / 2;
                const rRight = robot.x + robot.width / 2;
                const rTop = robot.y - robot.height / 2;
                const rBottom = robot.y + robot.height / 2;

                const obsLeft = 55, obsRight = 105, obsTop = 90, obsBottom = 125;
                return (rLeft < obsRight && rRight > obsLeft && rTop < obsBottom && rBottom > obsTop);
            },
            validateMission: function(robot, state) {
                if (state && state.hasCollided) return false;
                if (this.checkCollision(robot)) return false;

                const dist = Math.hypot(robot.x - 380, robot.y - 80);
                return dist < 36;
            }
        },
        'q6': {
            id: 'q6',
            name: '2. Simülatör Parkuru: 5 Renkli Şerit',
            width: 480,
            height: 380,
            robotStart: { x: 50, y: 190, angleDeg: 90 }, // 90 deg = East / Right
            goal: { x: 330, y: 190, radius: 30, desc: 'Kırmızı Alan' },
            drawBackground: function(ctx, sim) {
                drawGrid(ctx, 480, 380);

                // Düz Yol Koridoru
                ctx.save();
                ctx.fillStyle = '#f1f5f9';
                ctx.fillRect(30, 140, 420, 100);
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 2;
                ctx.strokeRect(30, 140, 420, 100);
                ctx.restore();

                // Başlangıç Çizgisi
                ctx.save();
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(80, 140);
                ctx.lineTo(80, 240);
                ctx.stroke();
                ctx.fillStyle = '#15803d';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('BAŞLA ▶', 55, 132);
                ctx.restore();

                // 5 Farklı Renkte Dikdörtgen Şerit
                const strips = [
                    { name: '1. MAVİ', hex: '#3b82f6', border: '#1d4ed8', x: 130, y: 150, w: 38, h: 80, text: '#fff' },
                    { name: '2. SARI', hex: '#eab308', border: '#ca8a04', x: 190, y: 150, w: 38, h: 80, text: '#000' },
                    { name: '3. YEŞİL', hex: '#22c55e', border: '#15803d', x: 250, y: 150, w: 38, h: 80, text: '#fff' },
                    { name: '4. KIRMIZI (DUR)', hex: '#ef4444', border: '#b91c1c', x: 310, y: 145, w: 46, h: 90, text: '#fff', target: true },
                    { name: '5. SİYAH', hex: '#0f172a', border: '#334155', x: 380, y: 150, w: 38, h: 80, text: '#fff' }
                ];

                strips.forEach(s => {
                    ctx.save();
                    ctx.fillStyle = s.hex;
                    ctx.fillRect(s.x, s.y, s.w, s.h);
                    ctx.strokeStyle = s.border;
                    ctx.lineWidth = s.target ? 3 : 1.5;
                    ctx.strokeRect(s.x, s.y, s.w, s.h);

                    if (s.target) {
                        ctx.fillStyle = '#dc2626';
                        ctx.font = 'bold 11px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText('🛑 BURADA DUR!', s.x + s.w / 2, 136);
                    }

                    ctx.restore();
                });
            },
            getSurfaceColor: function(x, y) {
                if (x >= 130 && x <= 168 && y >= 150 && y <= 230) return 'mavi';
                if (x >= 190 && x <= 228 && y >= 150 && y <= 230) return 'sarı';
                if (x >= 250 && x <= 288 && y >= 150 && y <= 230) return 'yeşil';
                if (x >= 310 && x <= 356 && y >= 145 && y <= 235) return 'kırmızı';
                if (x >= 380 && x <= 418 && y >= 150 && y <= 230) return 'siyah';
                return 'beyaz';
            },
            validateMission: function(robot) {
                // Stopped on RED strip
                const onRed = (robot.detectedColor === 'kırmızı' || (robot.x >= 300 && robot.x <= 365));
                const movedFromStart = robot.x > 100;
                return onRed && movedFromStart;
            }
        },
        'free': {
            id: 'free',
            name: 'Açık Parkur (Serbest Sürüş & Çizgi)',
            width: 480,
            height: 380,
            robotStart: { x: 100, y: 190, angleDeg: 90 },
            goal: null,
            drawBackground: function(ctx) {
                drawGrid(ctx, 480, 380);

                ctx.save();
                ctx.strokeStyle = '#0f172a';
                ctx.lineWidth = 14;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.ellipse(240, 190, 180, 120, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                const colors = [
                    { name: 'Mavi', hex: '#3b82f6', x: 180, y: 160 },
                    { name: 'Sarı', hex: '#eab308', x: 220, y: 160 },
                    { name: 'Yeşil', hex: '#22c55e', x: 260, y: 160 },
                    { name: 'Kırmızı', hex: '#ef4444', x: 300, y: 160 }
                ];
                colors.forEach(c => {
                    ctx.save();
                    ctx.fillStyle = c.hex;
                    ctx.fillRect(c.x, c.y, 28, 48);
                    ctx.restore();
                });

                ctx.save();
                ctx.fillStyle = '#06b6d4';
                ctx.strokeStyle = '#0891b2';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(320, 240, 45, 45, 6);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('ENGEL', 342, 266);
                ctx.restore();
            },
            getSurfaceColor: function(x, y) {
                if (x >= 180 && x <= 208 && y >= 160 && y <= 208) return 'mavi';
                if (x >= 220 && x <= 248 && y >= 160 && y <= 208) return 'sarı';
                if (x >= 260 && x <= 288 && y >= 160 && y <= 208) return 'yeşil';
                if (x >= 300 && x <= 328 && y >= 160 && y <= 208) return 'kırmızı';

                const dx = (x - 240) / 180;
                const dy = (y - 190) / 120;
                const distFromLine = Math.abs(Math.sqrt(dx * dx + dy * dy) - 1.0);
                if (distFromLine < 0.08) return 'siyah';
                return 'beyaz';
            },
            validateMission: function() { return false; }
        }
    };

    // Alias tracks for backward compatibility and questions 7 & 8
    TRACKS['q1'] = TRACKS['q5'];
    TRACKS['q2'] = TRACKS['q6'];
    TRACKS['q7'] = TRACKS['q5'];
    TRACKS['q8'] = TRACKS['q6'];

    function drawGrid(ctx, w, h) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        const step = 20;

        // İnce ızgara çizgileri (Her kare 1 cm = 20px)
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for (let x = 0; x <= w; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y <= h; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // 5 cm Belirgin Çizgileri (Her 100px)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        for (let x = 0; x <= w; x += 100) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y <= h; y += 100) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Sol üst köşe ölçek rozeti
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(8, 8, 148, 22, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('📏 1 Kare = 1 cm (20 px)', 14, 23);

        ctx.restore();
    }

    class SpikeSimulator {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.currentTrackId = 'q5';
            this.robot = {
                x: 80,
                y: 300,
                angleDeg: 0,
                width: 38,
                height: 48,
                colorSensorDist: 26,
                ultrasonicDist: 50,
                detectedColor: 'beyaz'
            };

            this.state = {
                isRunning: false,
                isCancelled: false,
                hasCollided: false,
                isMovingContinuous: false,
                speedMultiplier: 1.0,
                movementMotors: null,
                activatedMotors: { 'A': false, 'B': false, 'C': false, 'D': false }
            };

            this.uiElements = {};
        }

        init(canvasId, uiIds) {
            uiIds = uiIds || {};
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');

            this.uiElements.btnPlay = document.getElementById(uiIds.btnPlay || 'btnSimPlay');
            this.uiElements.btnReset = document.getElementById(uiIds.btnReset || 'btnSimReset');
            this.uiElements.btnToggle = document.getElementById(uiIds.btnToggle || 'btnToggleSimulator');
            this.uiElements.btnClose = document.getElementById(uiIds.btnClose || 'btnCloseSimulator');
            this.uiElements.drawer = document.getElementById(uiIds.drawer || 'simDrawer');
            this.uiElements.badgeMission = document.getElementById(uiIds.badgeMission || 'simMissionBadge');
            this.uiElements.pillColor = document.getElementById(uiIds.pillColor || 'simPillColor');
            this.uiElements.txtDistance = document.getElementById(uiIds.txtDistance || 'simTxtDistance');
            this.uiElements.txtHeading = document.getElementById(uiIds.txtHeading || 'simTxtHeading');
            this.uiElements.txtMotors = document.getElementById(uiIds.txtMotors || 'simTxtMotors');
            this.uiElements.btnSubmitCode = document.getElementById(uiIds.btnSubmitCode || 'btnSimSubmitCode');
            this.uiElements.trackSelector = document.getElementById(uiIds.trackSelector || 'simTrackSelect');

            if (this.uiElements.btnPlay) {
                this.uiElements.btnPlay.addEventListener('click', () => {
                    if (this.state.isRunning) {
                        this.stop();
                    } else {
                        if (typeof window.onSimulatorRequestRun === 'function') {
                            window.onSimulatorRequestRun();
                        }
                    }
                });
            }

            if (this.uiElements.btnReset) {
                this.uiElements.btnReset.addEventListener('click', () => this.reset());
            }

            if (this.uiElements.trackSelector) {
                this.uiElements.trackSelector.addEventListener('change', (e) => {
                    this.loadTrack(e.target.value);
                });
            }

            if (this.uiElements.btnToggle) {
                this.uiElements.btnToggle.addEventListener('click', () => {
                    this.toggleDrawer();
                });
            }

            if (this.uiElements.btnClose) {
                this.uiElements.btnClose.addEventListener('click', () => {
                    this.toggleDrawer(false);
                });
            }

            this.loadTrack('q5');
        }

        toggleDrawer(forceState) {
            if (!this.uiElements.drawer) return;
            if (forceState === undefined && typeof window.onSimulatorCanToggle === 'function') {
                if (!window.onSimulatorCanToggle()) return;
            }
            const isOpen = forceState !== undefined ? forceState : !this.uiElements.drawer.classList.contains('open');
            if (isOpen) {
                this.uiElements.drawer.classList.add('open');
                if (this.uiElements.btnToggle) {
                    this.uiElements.btnToggle.classList.add('active');
                }
                this.render();
            } else {
                this.uiElements.drawer.classList.remove('open');
                if (this.uiElements.btnToggle) {
                    this.uiElements.btnToggle.classList.remove('active');
                }
            }
        }

        loadTrack(trackId) {
            this.currentTrackId = TRACKS[trackId] ? trackId : 'q5';
            if (this.uiElements.trackSelector) {
                this.uiElements.trackSelector.value = this.currentTrackId;
            }
            this.reset();
        }

        reset() {
            this.stop();
            const track = TRACKS[this.currentTrackId];
            if (!track) return;
            this.robot.x = track.robotStart.x;
            this.robot.y = track.robotStart.y;
            this.robot.angleDeg = track.robotStart.angleDeg;
            this.robot.detectedColor = 'beyaz';
            this.robot.ultrasonicDist = 50;

            this.state.isCancelled = false;
            this.state.isRunning = false;
            this.state.hasCollided = false;
            this.state.isMovingContinuous = false;
            this.state.movementMotors = null;
            this.state.activatedMotors = { 'A': false, 'B': false, 'C': false, 'D': false };
            this.setMissionStatus('Hazır', 'default');
            this.updateTelemetry();
            this.render();
        }

        stop() {
            this.state.isRunning = false;
            this.state.isCancelled = true;
            this.state.isMovingContinuous = false;
            if (this.uiElements.btnPlay) {
                this.uiElements.btnPlay.innerHTML = '▶ Kodu Simüle Et';
                this.uiElements.btnPlay.classList.remove('btn-running');
            }
        }

        setMissionStatus(text, type) {
            type = type || 'default';
            if (!this.uiElements.badgeMission) return;
            this.uiElements.badgeMission.textContent = text;
            this.uiElements.badgeMission.className = 'sim-canvas-overlay-badge badge-' + type;
        }

        updateTelemetry() {
            const track = TRACKS[this.currentTrackId];
            
            const rad = (this.robot.angleDeg - 90) * (Math.PI / 180);
            const sensorX = this.robot.x + Math.cos(rad) * this.robot.colorSensorDist;
            const sensorY = this.robot.y + Math.sin(rad) * this.robot.colorSensorDist;

            let color = 'beyaz';
            if (track && track.getSurfaceColor) {
                color = track.getSurfaceColor(sensorX, sensorY);
            }
            this.robot.detectedColor = color;

            if (this.uiElements.pillColor) {
                const colorMap = {
                    'kırmızı': { bg: '#ef4444', text: '#ffffff', label: 'Kırmızı' },
                    'siyah': { bg: '#0f172a', text: '#ffffff', label: 'Siyah' },
                    'mavi': { bg: '#3b82f6', text: '#ffffff', label: 'Mavi' },
                    'yeşil': { bg: '#22c55e', text: '#ffffff', label: 'Yeşil' },
                    'sarı': { bg: '#eab308', text: '#000000', label: 'Sarı' },
                    'beyaz': { bg: '#f1f5f9', text: '#334155', label: 'Beyaz' }
                };
                const cInfo = colorMap[color] || colorMap['beyaz'];
                this.uiElements.pillColor.textContent = cInfo.label;
                this.uiElements.pillColor.style.backgroundColor = cInfo.bg;
                this.uiElements.pillColor.style.color = cInfo.text;
            }

            // Ultrasonik Mesafe Hesaplama (cm)
            let uDist = 50;
            const normAngle = ((Math.round(this.robot.angleDeg) % 360) + 360) % 360;
            if (this.currentTrackId === 'q5' || this.currentTrackId === 'q7') {
                if ((normAngle >= 340 || normAngle <= 20) && this.robot.x >= 45 && this.robot.x <= 115 && this.robot.y > 125) {
                    uDist = Math.max(0, Math.round((this.robot.y - 24 - 125) / SCALE));
                } else if (normAngle >= 70 && normAngle <= 110) {
                    uDist = Math.max(0, Math.round((this.canvas.width - this.robot.x - 20) / SCALE));
                } else if (normAngle >= 250 && normAngle <= 290) {
                    uDist = Math.max(0, Math.round((this.robot.x - 20) / SCALE));
                } else {
                    uDist = Math.max(0, Math.round((this.robot.y - 20) / SCALE));
                }
            } else {
                if (normAngle >= 70 && normAngle <= 110) {
                    uDist = Math.max(0, Math.round((this.canvas.width - this.robot.x - 20) / SCALE));
                } else {
                    uDist = Math.max(0, Math.round((this.robot.x - 20) / SCALE));
                }
            }
            this.robot.ultrasonicDist = uDist;

            if (this.uiElements.txtDistance) {
                this.uiElements.txtDistance.textContent = uDist + ' cm';
            }

            if (this.uiElements.txtHeading) {
                this.uiElements.txtHeading.textContent = normAngle + '°';
            }

            if (this.uiElements.txtMotors) {
                if (this.state.isRunning) {
                    this.uiElements.txtMotors.textContent = 'Dönüyor 🔄';
                    this.uiElements.txtMotors.style.color = '#0284c7';
                } else {
                    this.uiElements.txtMotors.textContent = 'Duruyor ⏹';
                    this.uiElements.txtMotors.style.color = '#64748b';
                }
            }
        }

        render() {
            if (!this.ctx || !this.canvas) return;
            const track = TRACKS[this.currentTrackId];
            if (!track) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (typeof track.drawBackground === 'function') {
                track.drawBackground(this.ctx, this);
            }

            this.drawRobot(this.ctx, this.robot);
            this.updateTelemetry();
        }

        drawRobot(ctx, r) {
            ctx.save();
            ctx.translate(r.x, r.y);
            ctx.rotate(r.angleDeg * Math.PI / 180);

            // Radar Rays
            ctx.save();
            ctx.strokeStyle = '#94a3b8';
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1.2;
            [-0.35, -0.15, 0, 0.15, 0.35].forEach(rayAngle => {
                ctx.beginPath();
                ctx.moveTo(0, -r.height / 2);
                const rayLen = 50;
                ctx.lineTo(Math.sin(rayAngle) * rayLen, -r.height / 2 - Math.cos(rayAngle) * rayLen);
                ctx.stroke();
            });
            ctx.restore();

            // Tires
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-r.width / 2 - 6, -14, 6, 28);
            ctx.fillRect(r.width / 2, -14, 6, 28);

            ctx.fillStyle = '#00a4a6';
            ctx.fillRect(-r.width / 2 - 5, -8, 4, 16);
            ctx.fillRect(r.width / 2 + 1, -8, 4, 16);

            // Chassis
            ctx.fillStyle = '#ffcc00';
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-r.width / 2, -r.height / 2, r.width, r.height, 6);
            ctx.fill();
            ctx.stroke();

            // Faceplate
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(-r.width / 2 + 4, -r.height / 2 + 5, r.width - 8, r.height - 10, 4);
            ctx.fill();

            // LED Matrix
            ctx.fillStyle = '#0284c7';
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    ctx.beginPath();
                    ctx.arc(-6 + col * 6, -6 + row * 6, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Color Sensor Eye
            ctx.save();
            ctx.translate(0, -r.colorSensorDist);
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();

            const colorDotMap = {
                'kırmızı': '#ef4444',
                'siyah': '#0f172a',
                'mavi': '#3b82f6',
                'yeşil': '#22c55e',
                'sarı': '#eab308',
                'beyaz': '#cbd5e1'
            };
            ctx.fillStyle = colorDotMap[r.detectedColor] || '#00a4a6';
            ctx.beginPath();
            ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.restore();
        }

        animateMove(distCm, isForward) {
            isForward = isForward !== undefined ? isForward : true;
            return new Promise((resolve) => {
                if (this.state.isCancelled || this.state.hasCollided) return resolve();

                const pixels = distCm * SCALE;
                const rad = (this.robot.angleDeg - 90) * (Math.PI / 180);
                
                const startX = this.robot.x;
                const startY = this.robot.y;
                const dx = Math.cos(rad) * pixels * (isForward ? 1 : -1);
                const dy = Math.sin(rad) * pixels * (isForward ? 1 : -1);

                const targetX = Math.max(20, Math.min(this.canvas.width - 20, startX + dx));
                const targetY = Math.max(20, Math.min(this.canvas.height - 20, startY + dy));

                const mult = this.state.speedMultiplier || 1.0;

                // Instant execution for automated headless testing
                if (mult >= 10) {
                    const track = TRACKS[this.currentTrackId];
                    if (track && typeof track.checkCollision === 'function') {
                        const steps = 25;
                        for (let s = 1; s <= steps; s++) {
                            const ix = startX + (targetX - startX) * (s / steps);
                            const iy = startY + (targetY - startY) * (s / steps);
                            if (track.checkCollision({ x: ix, y: iy, width: this.robot.width, height: this.robot.height })) {
                                this.robot.x = ix;
                                this.robot.y = iy;
                                this.state.hasCollided = true;
                                this.state.isCancelled = true;
                                this.setMissionStatus('💥 Engelle Çarpışma Gerçekleşti!', 'error');
                                this.render();
                                return resolve();
                            }
                        }
                    }
                    this.robot.x = targetX;
                    this.robot.y = targetY;
                    this.render();
                    return resolve();
                }

                const duration = Math.max(20, Math.min(2200, (Math.abs(distCm) * 85) / mult));
                const startTime = performance.now();

                const step = (now) => {
                    if (this.state.isCancelled || this.state.hasCollided) return resolve();

                    const elapsed = now - startTime;
                    const progress = Math.min(1.0, elapsed / duration);
                    const ease = 1 - Math.pow(1 - progress, 3);

                    this.robot.x = startX + (targetX - startX) * ease;
                    this.robot.y = startY + (targetY - startY) * ease;

                    // Obstacle Collision Check
                    const track = TRACKS[this.currentTrackId];
                    if (track && typeof track.checkCollision === 'function' && track.checkCollision(this.robot)) {
                        this.state.hasCollided = true;
                        this.state.isCancelled = true;
                        this.render();
                        this.setMissionStatus('💥 Engelle Çarpışma Gerçekleşti!', 'error');
                        return resolve();
                    }

                    this.render();

                    if (progress < 1.0) {
                        requestAnimationFrame(step);
                    } else {
                        resolve();
                    }
                };

                requestAnimationFrame(step);
            });
        }

        animateRotate(degrees, isRight) {
            isRight = isRight !== undefined ? isRight : true;
            return new Promise((resolve) => {
                if (this.state.isCancelled || this.state.hasCollided) return resolve();

                const startAngle = this.robot.angleDeg;
                const deltaAngle = (isRight ? 1 : -1) * degrees;
                const targetAngle = startAngle + deltaAngle;

                const mult = this.state.speedMultiplier || 1.0;

                // Instant execution for automated headless testing
                if (mult >= 10) {
                    this.robot.angleDeg = targetAngle;
                    this.render();
                    return resolve();
                }

                const duration = Math.max(15, Math.min(1400, (Math.abs(degrees) * 6) / mult));
                const startTime = performance.now();

                const step = (now) => {
                    if (this.state.isCancelled || this.state.hasCollided) return resolve();

                    const elapsed = now - startTime;
                    const progress = Math.min(1.0, elapsed / duration);
                    const ease = 1 - Math.pow(1 - progress, 3);

                    this.robot.angleDeg = startAngle + (targetAngle - startAngle) * ease;
                    this.render();

                    if (progress < 1.0) {
                        requestAnimationFrame(step);
                    } else {
                        resolve();
                    }
                };

                requestAnimationFrame(step);
            });
        }

        async executeBlocks(blockList) {
            if (!blockList || blockList.length === 0) {
                this.setMissionStatus('Kod Yok (Lütfen Blok Ekleyin)', 'warning');
                return;
            }

            this.state.isRunning = true;
            this.state.isCancelled = false;
            this.state.hasCollided = false;
            this.state.isMovingContinuous = false;
            this.state.movementMotors = null;
            this.state.activatedMotors = { 'A': false, 'B': false, 'C': false, 'D': false };
            this.updateTelemetry();

            if (this.uiElements.btnPlay) {
                this.uiElements.btnPlay.innerHTML = '⏹ Durdur';
                this.uiElements.btnPlay.classList.add('btn-running');
            }
            this.setMissionStatus('Çalışıyor...', 'running');

            try {
                for (const b of blockList) {
                    if (this.state.isCancelled || this.state.hasCollided) break;
                    await this.executeSingleBlock(b);
                }

                if (!this.state.isCancelled) {
                    const track = TRACKS[this.currentTrackId];
                    if (this.state.hasCollided) {
                        this.setMissionStatus('💥 Engelle Çarpışma Gerçekleşti! Alternatif rotayı kullanmalısınız.', 'error');
                    } else {
                        const isSuccess = track && track.validateMission ? track.validateMission(this.robot, this.state) : false;

                        if (isSuccess) {
                            this.setMissionStatus('🎉 Tebrikler! Görev Başarılı!', 'success');
                            if (this.uiElements.btnSubmitCode) {
                                this.uiElements.btnSubmitCode.classList.add('pulse-highlight');
                            }
                        } else {
                            this.setMissionStatus('Tamamlandı (Hedefe Ulaşılamadı)', 'info');
                        }
                    }
                }
            } catch (err) {
                console.error('Simülasyon yürütme hatası:', err);
                this.setMissionStatus('Hata Oluştu', 'error');
            } finally {
                this.state.isRunning = false;
                this.state.isMovingContinuous = false;
                if (typeof window.onSimulatorFinishState === 'function') {
                    window.onSimulatorFinishState();
                } else if (this.uiElements.btnPlay) {
                    this.uiElements.btnPlay.innerHTML = '▶ Kodu Simüle Et';
                    this.uiElements.btnPlay.classList.remove('btn-running');
                }
            }
        }

        async executeSingleBlock(b) {
            if (this.state.isCancelled || this.state.hasCollided) return;

            const inputs = b.inputs || {};
            const id = b.id;

            // 0. HAREKET MOTORLARINI AYARLAMA (mov_set_motors)
            if (id === 'mov_set_motors') {
                const pair = inputs.pair || 'A+B';
                this.state.movementMotors = pair;
                if (pair === 'A+B' || pair === 'B+A') {
                    this.state.activatedMotors['A'] = true;
                    this.state.activatedMotors['B'] = true;
                }
                this.updateTelemetry();
                await new Promise(r => setTimeout(r, 150));
                return;
            }

            // 1. HAREKET (Movement) BLOKLARI
            const isMovementBlock = (
                id === 'mov_move_dir' || 
                id === 'mov_start_moving_dir' || 
                id === 'mov_start_dual_speed' || 
                id === 'mov_move_steer_dist' || 
                id === 'mov_start_steer_only' ||
                id === 'mot_move_steer_right' ||
                id === 'mot_move_steer_left'
            );

            if (isMovementBlock) {
                // DONANIM KONTROLÜ: Hareket motorları (A+B) girilmese de simüle edebilsin (Öğretmen puan kırar).
                if (!this.state.movementMotors) {
                    this.state.movementMotors = 'A+B';
                    this.state.activatedMotors['A'] = true;
                    this.state.activatedMotors['B'] = true;
                }

                if (id === 'mov_move_dir') {
                    const dir = inputs.dir || '↑';
                    const val = parseFloat(inputs.val) || 10;
                    const unit = inputs.unit || 'cm';
                    const distCm = unit === 'tur' ? val * 17.5 : (unit === 'derece' ? (val / 360) * 17.5 : val);
                    const isForward = !String(dir).includes('↓') && !String(dir).includes('geri');
                    await this.animateMove(distCm, isForward);
                }
                else if (id === 'mot_move_steer_right' || id === 'mot_move_steer_left') {
                    const isRight = (id === 'mot_move_steer_right');
                    let deg = 90;
                    const steerStr = String(inputs.steer || '');
                    const numMatch = steerStr.match(/\d+/);
                    if (numMatch) {
                        deg = parseInt(numMatch[0], 10);
                    } else if (inputs.unit === 'derece' && inputs.val) {
                        deg = parseFloat(inputs.val) || 90;
                    }
                    await this.animateRotate(deg, isRight);
                }
                else if (id === 'mov_start_moving_dir') {
                    const dir = inputs.dir || '↑';
                    const isForward = !String(dir).includes('↓') && !String(dir).includes('geri');
                    this.state.isMovingContinuous = isForward;
                    await this.animateMove(3, isForward);
                }
                else if (id === 'mov_start_dual_speed') {
                    const speedL = parseFloat(inputs.speedL !== undefined ? inputs.speedL : 50);
                    const speedR = parseFloat(inputs.speedR !== undefined ? inputs.speedR : 50);

                    if (speedL === speedR) {
                        await this.animateMove(5, speedL >= 0);
                    } else if (speedL === -speedR) {
                        const isRight = speedL > speedR;
                        await this.animateRotate(90, isRight);
                    } else {
                        const isRight = speedL > speedR;
                        const deg = Math.abs(speedL - speedR) >= 40 ? 90 : 45;
                        await this.animateRotate(deg, isRight);
                    }
                }
                else if (id === 'mov_move_steer_dist' || id === 'mov_start_steer_only') {
                    const steer = inputs.steer || 'sağ: 30';
                    const isRight = steer.includes('sağ');
                    let deg = steer.includes('30') ? 30 : (steer.includes('50') ? 50 : 90);
                    await this.animateRotate(deg, isRight);
                }
            }
            else if (id === 'mov_stop') {
                this.state.isMovingContinuous = false;
                await new Promise(r => setTimeout(r, 200));
            }

            // 2. MOTORLAR (Motors) BLOKLARI
            else if (id === 'mot_run_dist' || id === 'mot_pos_go' || id === 'mot_start') {
                const port = inputs.port || 'A';
                this.state.activatedMotors[port] = true;
                this.updateTelemetry();
                await new Promise(r => setTimeout(r, 400));
            }
            else if (id === 'mot_stop') {
                const port = inputs.port || 'A';
                this.state.activatedMotors[port] = false;
                this.updateTelemetry();
            }

            // 3. KONTROL (Control) BLOKLARI
            else if (id === 'ctrl_wait') {
                const sec = parseFloat(inputs.val) || 1;
                await new Promise(r => setTimeout(r, sec * 1000));
            }
            else if (id === 'ctrl_repeat') {
                const count = parseInt(inputs.count) || 1;
                for (let i = 0; i < count; i++) {
                    if (this.state.isCancelled || this.state.hasCollided) break;
                    if (b.nestedThen) {
                        for (const child of b.nestedThen) {
                            await this.executeSingleBlock(child);
                        }
                    }
                }
            }
            else if (id === 'ctrl_if') {
                const condType = (inputs.cond_type || '').toLowerCase();
                const reqColor = (inputs.color || '').toLowerCase();
                const curColor = (this.robot.detectedColor || '').toLowerCase();
                let isMatch = false;
                
                if (condType.includes('renk') && curColor === reqColor) isMatch = true;
                else if (condType.includes('mesafe')) {
                    const targetDist = parseFloat(inputs.dist || inputs.val || 15);
                    if (this.robot.ultrasonicDist <= targetDist) isMatch = true;
                }
                else if (condType.includes('sapma')) isMatch = false;

                if (isMatch) {
                    if (b.nestedThen) {
                        for (const child of b.nestedThen) {
                            await this.executeSingleBlock(child);
                        }
                    }
                }
            }
            else if (id === 'ctrl_if_else') {
                const condType = (inputs.cond_type || '').toLowerCase();
                const reqColor = (inputs.color || '').toLowerCase();
                const curColor = (this.robot.detectedColor || '').toLowerCase();
                let isMatch = false;
                
                if (condType.includes('renk') && curColor === reqColor) isMatch = true;
                else if (condType.includes('mesafe')) {
                    const targetDist = parseFloat(inputs.dist || inputs.val || 15);
                    if (this.robot.ultrasonicDist <= targetDist) isMatch = true;
                }
                else if (condType.includes('sapma')) isMatch = false;

                if (isMatch) {
                    if (b.nestedThen) {
                        for (const child of b.nestedThen) {
                            await this.executeSingleBlock(child);
                        }
                    }
                } else {
                    if (b.nestedElse) {
                        for (const child of b.nestedElse) {
                            await this.executeSingleBlock(child);
                        }
                    }
                }
            }
            else if (id === 'ctrl_wait_until' || id === 'ctrl_repeat_until') {
                const condType = (inputs.cond_type || '').toLowerCase();
                const reqColor = (inputs.color || '').toLowerCase();
                
                let loops = 0;
                while (!this.state.isCancelled && !this.state.hasCollided && loops < 50) {
                    loops++;
                    const curColor = (this.robot.detectedColor || '').toLowerCase();
                    const curDist = this.robot.ultrasonicDist;
                    let isMatch = false;
                    
                    if (condType.includes('renk') && curColor === reqColor) {
                        isMatch = true;
                    } else if (condType.includes('mesafe')) {
                        const targetDist = parseFloat(inputs.dist || inputs.val || 15);
                        if (curDist <= targetDist) isMatch = true;
                    } else if (condType.includes('sapma')) {
                        isMatch = false;
                    }

                    if (isMatch) break;

                    if (b.nestedThen && b.nestedThen.length > 0) {
                        for (const child of b.nestedThen) {
                            if (this.state.isCancelled || this.state.hasCollided) break;
                            await this.executeSingleBlock(child);
                        }
                    } else {
                        if (this.state.isMovingContinuous) {
                            await this.animateMove(1, true); // advance 1 cm (20px) per check
                        } else {
                            await new Promise(r => setTimeout(r, 150));
                        }
                    }
                }
            }

            const mult = this.state.speedMultiplier || 1.0;
            await new Promise(r => setTimeout(r, Math.max(5, 100 / mult)));
        }

        takeSnapshot() {
            if (!this.canvas) return null;
            return this.canvas.toDataURL('image/png');
        }
    }

    window.SpikeSimulator = new SpikeSimulator();

})(window);
