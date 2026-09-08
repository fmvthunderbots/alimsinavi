/**
 * SPIKE Prime 2D Simulation Engine & Block Interpreter
 * Open Roberta inspired canvas simulator for LEGO SPIKE Prime robotics exams
 */

(function(window) {
    'use strict';

    // Scale: 1 cm = 4 pixels
    const SCALE = 4;

    const TRACKS = {
        'q5': {
            id: 'q5',
            name: '1. Simülatör Parkuru: Rota ve Bitiş',
            width: 480,
            height: 380,
            robotStart: { x: 80, y: 310, angleDeg: 0 }, // 0 deg = North
            goal: { x: 390, y: 270, radius: 34, desc: 'Bitiş Noktası' },
            drawBackground: function(ctx, sim) {
                drawGrid(ctx, 480, 380);

                // Asfalt / Yol Koridoru
                ctx.save();
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 44;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(80, 310);
                ctx.lineTo(80, 150);
                ctx.lineTo(270, 150);
                ctx.lineTo(270, 270);
                ctx.lineTo(390, 270);
                ctx.stroke();

                // Orta Kılavuz Çizgisi
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 4;
                ctx.stroke();
                ctx.restore();

                // Start area
                ctx.save();
                ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.roundRect(55, 285, 50, 50, 8);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#15803d';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('BAŞLANGIÇ', 80, 314);
                ctx.restore();

                // Target Pad (Bitiş Alanı)
                ctx.save();
                ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(390, 270, 30, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#854d0e';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('BİTİŞ 🏁', 390, 274);
                ctx.restore();
            },
            getSurfaceColor: function(x, y) {
                return 'beyaz';
            },
            validateMission: function(robot) {
                const dist = Math.hypot(robot.x - 390, robot.y - 270);
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
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        const step = 20;
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
        ctx.restore();
    }

    class SpikeSimulator {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.currentTrackId = 'q5';
            this.robot = {
                x: 80,
                y: 310,
                angleDeg: 0,
                width: 38,
                height: 48,
                colorSensorDist: 26,
                ultrasonicDist: 0,
                detectedColor: 'beyaz'
            };

            this.state = {
                isRunning: false,
                isCancelled: false,
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

            this.state.movementMotors = null;
            this.state.activatedMotors = { 'A': false, 'B': false, 'C': false, 'D': false };
            this.setMissionStatus('Hazır', 'default');
            this.updateTelemetry();
            this.render();
        }

        stop() {
            this.state.isRunning = false;
            this.state.isCancelled = true;
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

            if (this.uiElements.txtHeading) {
                const normAngle = ((Math.round(this.robot.angleDeg) % 360) + 360) % 360;
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
                if (this.state.isCancelled) return resolve();

                const pixels = distCm * SCALE;
                const rad = (this.robot.angleDeg - 90) * (Math.PI / 180);
                
                const startX = this.robot.x;
                const startY = this.robot.y;
                const dx = Math.cos(rad) * pixels * (isForward ? 1 : -1);
                const dy = Math.sin(rad) * pixels * (isForward ? 1 : -1);

                const targetX = Math.max(20, Math.min(this.canvas.width - 20, startX + dx));
                const targetY = Math.max(20, Math.min(this.canvas.height - 20, startY + dy));

                const duration = Math.max(400, Math.min(2200, Math.abs(distCm) * 35));
                const startTime = performance.now();

                const step = (now) => {
                    if (this.state.isCancelled) return resolve();

                    const elapsed = now - startTime;
                    const progress = Math.min(1.0, elapsed / duration);
                    const ease = 1 - Math.pow(1 - progress, 3);

                    this.robot.x = startX + (targetX - startX) * ease;
                    this.robot.y = startY + (targetY - startY) * ease;

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
                if (this.state.isCancelled) return resolve();

                const startAngle = this.robot.angleDeg;
                const deltaAngle = (isRight ? 1 : -1) * degrees;
                const targetAngle = startAngle + deltaAngle;

                const duration = Math.max(350, Math.min(1600, Math.abs(degrees) * 8));
                const startTime = performance.now();

                const step = (now) => {
                    if (this.state.isCancelled) return resolve();

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
                    if (this.state.isCancelled) break;
                    await this.executeSingleBlock(b);
                }

                if (!this.state.isCancelled) {
                    const track = TRACKS[this.currentTrackId];
                    const isSuccess = track && track.validateMission ? track.validateMission(this.robot, this.state) : false;

                    if (isSuccess) {
                        this.setMissionStatus('🎉 Tebrikler! Görev Başarılı!', 'success');
                        if (this.uiElements.btnSubmitCode) {
                            this.uiElements.btnSubmitCode.classList.add('pulse-highlight');
                        }
                    } else {
                        this.setMissionStatus('Tamamlandı', 'info');
                    }
                }
            } catch (err) {
                console.error('Simülasyon yürütme hatası:', err);
                this.setMissionStatus('Hata Oluştu', 'error');
            } finally {
                this.state.isRunning = false;
                if (typeof window.onSimulatorFinishState === 'function') {
                    window.onSimulatorFinishState();
                } else if (this.uiElements.btnPlay) {
                    this.uiElements.btnPlay.innerHTML = '▶ Kodu Simüle Et';
                    this.uiElements.btnPlay.classList.remove('btn-running');
                }
            }
        }

        async executeSingleBlock(b) {
            if (this.state.isCancelled) return;

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
            const isMovementBlock = (id === 'mov_move_dir' || id === 'mov_move_steer_dist' || id === 'mov_start_moving_dir' || id === 'mov_start_steer_only');
            if (isMovementBlock) {
                // DONANIM KONTROLÜ: Hareket motorları (A+B) ayarlanmamışsa robot fiziksel olarak hareket etmez.
                // Kopya / ipucu olmaması için öğrenciye motor uyarısı verilmez, robot hareket etmeden blok tamamlanır.
                const isPairValid = (this.state.movementMotors === 'A+B' || this.state.movementMotors === 'B+A');
                if (!isPairValid) {
                    await new Promise(r => setTimeout(r, 200));
                    return;
                }

                if (id === 'mov_move_dir') {
                    const dir = inputs.dir || '↑';
                    const val = parseFloat(inputs.val) || 10;
                    const unit = inputs.unit || 'cm';
                    const distCm = unit === 'tur' ? val * 17.5 : (unit === 'derece' ? (val / 360) * 17.5 : val);
                    await this.animateMove(distCm, dir === '↑');
                }
                else if (id === 'mov_move_steer_dist') {
                    const steer = inputs.steer || 'sağ: 30';
                    const val = parseFloat(inputs.val) || 10;
                    const isRight = steer.includes('sağ');
                    let deg = 90;
                    if (steer.includes('30')) deg = 30;
                    else if (steer.includes('50')) deg = 50;
                    else if (steer.includes('90')) deg = 90;
                    else if (steer.includes('100')) deg = 180;
                    await this.animateRotate(deg, isRight);
                }
                else if (id === 'mov_start_moving_dir') {
                    const dir = inputs.dir || '↑';
                    await this.animateMove(15, dir === '↑');
                }
                else if (id === 'mov_start_steer_only') {
                    const steer = inputs.steer || 'sağ: 30';
                    const isRight = steer.includes('sağ');
                    let deg = steer.includes('30') ? 30 : (steer.includes('50') ? 50 : 90);
                    await this.animateRotate(deg, isRight);
                }
            }
            else if (id === 'mov_stop') {
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
                    if (this.state.isCancelled) break;
                    if (b.nestedThen) {
                        for (const child of b.nestedThen) {
                            await this.executeSingleBlock(child);
                        }
                    }
                }
            }
            else if (id === 'ctrl_if') {
                const reqColor = (inputs.color || 'kırmızı').toLowerCase();
                const curColor = this.robot.detectedColor.toLowerCase();
                if (curColor === reqColor) {
                    if (b.nestedThen) {
                        for (const child of b.nestedThen) {
                            await this.executeSingleBlock(child);
                        }
                    }
                }
            }
            else if (id === 'ctrl_if_else') {
                const reqColor = (inputs.color || 'kırmızı').toLowerCase();
                const curColor = this.robot.detectedColor.toLowerCase();
                if (curColor === reqColor) {
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

            await new Promise(r => setTimeout(r, 120));
        }

        takeSnapshot() {
            if (!this.canvas) return null;
            return this.canvas.toDataURL('image/png');
        }
    }

    window.SpikeSimulator = new SpikeSimulator();

})(window);
