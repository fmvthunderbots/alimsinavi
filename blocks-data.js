/**
 * SPIKE Prime Visual Block Exam Data Structure
 * Contains Categories and Block Definitions for SPIKE Prime 3.6.0
 */

const SPIKE_CATEGORIES = [
    { id: 'motorlar', name: 'Motorlar', color: '#0084ff', icon: '⚙️' },
    { id: 'hareket', name: 'Hareket', color: '#e6007e', icon: '🚗' },
    { id: 'olaylar', name: 'Olaylar', color: '#ffc700', icon: '⚡' },
    { id: 'kontrol', name: 'Kontrol', color: '#ff8c00', icon: '🔄' },
    { id: 'sensorler', name: 'Sensörler', color: '#00a4a6', icon: '👁️' },
    { id: 'operatorler', name: 'Operatörler', color: '#40be47', icon: '➕' },
    { id: 'degiskenler', name: 'Değişkenler', color: '#ff6600', icon: '📦' },
    { id: 'bloklarim', name: 'Bloklarım', color: '#dc2626', icon: '🧩' }
];

const INITIAL_BLOCKS = [
    // --- MOTORLAR (Mavi #0084ff) ---
    {
        id: 'mot_pos_go',
        category: 'motorlar',
        type: 'statement',
        text: '[ {port} ] [ {dir} ▼ ] [ {pos} ] konumuna git',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'dir', type: 'select', options: ['en kısa yoldan', 'saat yönünde', 'saat yönünün tersine'], default: 'en kısa yoldan' },
            { id: 'pos', type: 'number', default: 0 }
        ]
    },
    {
        id: 'mot_start',
        category: 'motorlar',
        type: 'statement',
        text: '[ {port} ] motorunu [ {dir} ▼ ] başlat',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'dir', type: 'select', options: ['saat yönünde', 'saat yönünün tersine'], default: 'saat yönünde' }
        ]
    },
    {
        id: 'mot_move_steer_right',
        category: 'hareket',
        type: 'statement',
        text: '[ {steer} ] , [ {val} ] [ {unit} ▼ ] hareket ettir',
        inputs: [
            { id: 'steer', type: 'text', default: 'sağ: 90' },
            { id: 'val', type: 'number', default: 10 },
            { id: 'unit', type: 'select', options: ['tur', 'derece', 'saniye', 'cm', 'inç'], default: 'tur' }
        ]
    },
    {
        id: 'mot_move_steer_left',
        category: 'hareket',
        type: 'statement',
        text: '[ {steer} ] , [ {val} ] [ {unit} ▼ ] hareket ettir',
        inputs: [
            { id: 'steer', type: 'text', default: 'sol: 90' },
            { id: 'val', type: 'number', default: 10 },
            { id: 'unit', type: 'select', options: ['tur', 'derece', 'saniye', 'cm', 'inç'], default: 'tur' }
        ]
    },
    {
        id: 'mot_stop',
        category: 'motorlar',
        type: 'statement',
        text: '[ {port} ] motorunu durdur',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' }
        ]
    },
    {
        id: 'mot_set_speed',
        category: 'motorlar',
        type: 'statement',
        text: '[ {port} ] hızı % [ {speed} ] olarak ayarla',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'speed', type: 'number', default: 75 }
        ]
    },
    {
        id: 'mot_get_pos',
        category: 'motorlar',
        type: 'reporter',
        text: '( [ {port} ] konumu )',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' }
        ]
    },
    {
        id: 'mot_get_speed',
        category: 'motorlar',
        type: 'reporter',
        text: '( [ {port} ] hızı )',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' }
        ]
    },
    {
        id: 'mot_run_dist',
        category: 'motorlar',
        type: 'statement',
        text: '[ {port} ] , [ {val} ] [ {unit} ▼ ]',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'val', type: 'number', default: 1 },
            { id: 'unit', type: 'select', options: ['tur', 'derece', 'saniye'], default: 'tur' }
        ]
    },
    {
        id: 'mot_set_rel_pos',
        category: 'motorlar',
        type: 'statement',
        text: '[ {port} ] göreli konumu şuna ayarla: [ {pos} ]',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'pos', type: 'number', default: 0 }
        ]
    },
    {
        id: 'mot_get_rel_pos',
        category: 'motorlar',
        type: 'reporter',
        text: '( [ {port} ] göreli konum )',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' }
        ]
    },
    {
        id: 'mot_set_power',
        category: 'motorlar',
        type: 'statement',
        text: '[ {port} ] motorunu % [ {pwr} ] güçle',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'pwr', type: 'number', default: 100 }
        ]
    },
    {
        id: 'mot_get_power',
        category: 'motorlar',
        type: 'reporter',
        text: '( [ {port} ] gücü )',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' }
        ]
    },
    {
        id: 'mot_set_stop_mode',
        category: 'motorlar',
        type: 'statement',
        text: '[ {port} ] motorları durduğunda [ {mode} ▼ ] olarak ayarla',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'mode', type: 'select', options: ['fren', 'serbest', 'tut'], default: 'fren' }
        ]
    },
    {
        id: 'mot_set_accel',
        category: 'motorlar',
        type: 'statement',
        text: '[ {port} ] ivme kazanımını [ {acc} ▼ ] olarak ayarla',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'acc', type: 'select', options: ['yavaş', 'orta', 'hızlı'], default: 'orta' }
        ]
    },

    // --- HAREKET (Pembe #e6007e) ---
    {
        id: 'mov_move_dir',
        category: 'hareket',
        type: 'statement',
        text: '[ {dir} ▼ ] , [ {val} ] [ {unit} ▼ ] hareket ettir',
        inputs: [
            { id: 'dir', type: 'select', options: ['↑', '↓'], default: '↑' },
            { id: 'val', type: 'number', default: 10 },
            { id: 'unit', type: 'select', options: ['tur', 'derece', 'saniye', 'cm', 'inç'], default: 'tur' }
        ]
    },
    {
        id: 'mov_start_moving_dir',
        category: 'hareket',
        type: 'statement',
        text: 'harekete başlat [ {dir} ▼ ]',
        inputs: [
            { id: 'dir', type: 'select', options: ['↑', '↓'], default: '↑' }
        ]
    },
    {
        id: 'mov_start_dual_speed',
        category: 'hareket',
        type: 'statement',
        text: '% [ {speedL} ] [ {speedR} ] hız ile harekete başlat',
        inputs: [
            { id: 'speedL', type: 'number', default: 50 },
            { id: 'speedR', type: 'number', default: 50 }
        ]
    },
    {
        id: 'mov_stop',
        category: 'hareket',
        type: 'statement',
        text: 'hareketi durdur',
        inputs: []
    },
    {
        id: 'mov_set_speed',
        category: 'hareket',
        type: 'statement',
        text: 'hareket hızını % [ {speed} ] olarak ayarla',
        inputs: [
            { id: 'speed', type: 'number', default: 50 }
        ]
    },
    {
        id: 'mov_set_motors',
        category: 'hareket',
        type: 'statement',
        text: 'hareket motorlarını [ {pair} ▼ ] olarak ayarla',
        inputs: [
            { id: 'pair', type: 'select', options: ['A+B', 'C+D', 'E+F', 'B+A', 'D+C', 'F+E'], default: 'A+B' }
        ]
    },
    {
        id: 'mov_set_one_turn',
        category: 'hareket',
        type: 'statement',
        text: '1 motor dönüşünü [ {val} ] [ {unit} ▼ ] harekete ayarla',
        inputs: [
            { id: 'val', type: 'number', default: 17.5 },
            { id: 'unit', type: 'select', options: ['cm', 'inç'], default: 'cm' }
        ]
    },

    // --- OLAYLAR (Sarı #ffc700) ---
    {
        id: 'evt_start',
        category: 'olaylar',
        type: 'hat',
        text: 'program başladığında',
        inputs: []
    },
    {
        id: 'evt_color_when',
        category: 'olaylar',
        type: 'hat',
        text: '[ {port} ] renk [ {color} ▼ ] olduğunda',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'color', type: 'select', options: ['kırmızı', 'siyah', 'yeşil', 'mavi', 'sarı', 'beyaz', 'renk yok'], default: 'kırmızı' }
        ]
    },
    {
        id: 'evt_force_when',
        category: 'olaylar',
        type: 'hat',
        text: '[ {port} ] [ {state} ▼ ] olduğunda',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'state', type: 'select', options: ['basılı', 'bırakılmış', 'tıklanmış'], default: 'basılı' }
        ]
    },
    {
        id: 'evt_dist_when',
        category: 'olaylar',
        type: 'hat',
        text: '[ {port} ] şu durumda: [ {comp} ▼ ]',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'comp', type: 'select', options: ['daha yakın', 'daha uzak'], default: 'daha yakın' }
        ]
    },
    {
        id: 'evt_tilted_when',
        category: 'olaylar',
        type: 'hat',
        text: '[ {dir} ▼ ] eğildiğinde',
        inputs: [
            { id: 'dir', type: 'select', options: ['↑', '↓', '←', '→'], default: '↑' }
        ]
    },
    {
        id: 'evt_orientation_up_when',
        category: 'olaylar',
        type: 'hat',
        text: '[ {dir} ▼ ] yukarıda olduğunda',
        inputs: [
            { id: 'dir', type: 'select', options: ['ön', 'arka', 'sol', 'sağ', 'üst', 'alt'], default: 'ön' }
        ]
    },
    {
        id: 'evt_gesture_when',
        category: 'olaylar',
        type: 'hat',
        text: 'şu durumda: [ {action} ▼ ]',
        inputs: [
            { id: 'action', type: 'select', options: ['sallandığında', 'düştüğünde', 'dokunulduğunda'], default: 'sallandığında' }
        ]
    },
    {
        id: 'evt_button_when',
        category: 'olaylar',
        type: 'hat',
        text: '[ {btn} ▼ ] düğme [ {state} ▼ ] olduğunda',
        inputs: [
            { id: 'btn', type: 'select', options: ['sol', 'sağ', 'orta'], default: 'sol' },
            { id: 'state', type: 'select', options: ['basılı', 'bırakılmış'], default: 'basılı' }
        ]
    },
    {
        id: 'evt_timer_greater',
        category: 'olaylar',
        type: 'hat',
        text: 'kronometre > [ {val} ] olduğunda',
        inputs: [
            { id: 'val', type: 'number', default: 10 }
        ]
    },
    {
        id: 'evt_when_cond',
        category: 'olaylar',
        type: 'hat',
        text: 'şu durumda: <div class="hex-empty-slot boolean-drop-zone"></div>',
        inputs: []
    },
    {
        id: 'evt_receive_msg',
        category: 'olaylar',
        type: 'hat',
        text: '[ {msg} ▼ ] haberini aldığımda',
        inputs: [
            { id: 'msg', type: 'select', isMsgSelect: true, options: ['haber1', 'Yeni haber...'], default: 'haber1' }
        ]
    },
    {
        id: 'evt_send_msg',
        category: 'olaylar',
        type: 'statement',
        text: '[ {msg} ▼ ] haberini sal',
        inputs: [
            { id: 'msg', type: 'select', isMsgSelect: true, options: ['haber1', 'Yeni haber...'], default: 'haber1' }
        ]
    },
    {
        id: 'evt_send_msg_wait',
        category: 'olaylar',
        type: 'statement',
        text: '[ {msg} ▼ ] haberini sal ve bekle',
        inputs: [
            { id: 'msg', type: 'select', isMsgSelect: true, options: ['haber1', 'Yeni haber...'], default: 'haber1' }
        ]
    },

    // --- KONTROL (Turuncu #ff8c00) ---
    {
        id: 'ctrl_wait',
        category: 'kontrol',
        type: 'statement',
        text: '[ {val} ] saniye bekle',
        inputs: [
            { id: 'val', type: 'number', default: 1 }
        ]
    },
    {
        id: 'ctrl_repeat',
        category: 'kontrol',
        type: 'c_block',
        text: '[ {count} ] kez tekrarla',
        inputs: [
            { id: 'count', type: 'number', default: 10 }
        ]
    },
    {
        id: 'ctrl_forever',
        category: 'kontrol',
        type: 'c_block',
        text: 'Sonsuza kadar tekrarla',
        inputs: []
    },
    {
        id: 'ctrl_if',
        category: 'kontrol',
        type: 'c_block',
        text: 'eğer <div class="hex-empty-slot boolean-drop-zone"></div> ise',
        inputs: []
    },
    {
        id: 'ctrl_if_else',
        category: 'kontrol',
        type: 'c_block',
        text: 'eğer <div class="hex-empty-slot boolean-drop-zone"></div> ise değilse',
        inputs: []
    },
    {
        id: 'ctrl_wait_until',
        category: 'kontrol',
        type: 'c_block',
        text: '<div class="hex-empty-slot boolean-drop-zone"></div> olana kadar bekle',
        inputs: []
    },
    {
        id: 'ctrl_repeat_until',
        category: 'kontrol',
        type: 'c_block',
        text: '<div class="hex-empty-slot boolean-drop-zone"></div> olana kadar tekrarla',
        inputs: []
    },
    {
        id: 'ctrl_stop_other_stacks',
        category: 'kontrol',
        type: 'statement',
        text: 'diğer yığınları durdur',
        inputs: []
    },
    {
        id: 'ctrl_stop_all',
        category: 'kontrol',
        type: 'statement',
        text: 'durdur [ {mode} ▼ ]',
        inputs: [
            { id: 'mode', type: 'select', options: ['tümünü', 'bu yığını', 've programdan çık'], default: 'tümünü' }
        ]
    },

    // --- SENSÖRLER (Turkuaz #00a4a6) ---
    {
        id: 'sen_is_color',
        category: 'sensorler',
        type: 'boolean',
        text: '< [ {port} ] [ {color} ▼ ] renkte mi? >',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'color', type: 'select', isHex: true, options: ['renk seçiniz...', 'kırmızı', 'siyah', 'yeşil', 'mavi', 'sarı', 'beyaz', 'renk yok'], default: 'renk seçiniz...' }
        ]
    },
    {
        id: 'sen_get_color',
        category: 'sensorler',
        type: 'reporter',
        text: '( [ {port} ] renk )',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' }
        ]
    },
    {
        id: 'sen_reflection_compare',
        category: 'sensorler',
        type: 'boolean',
        text: '< [ {port} ] yansıma [ {op} ▼ ] % [ {val} ] mi? >',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'op', type: 'select', options: ['<', '>', '='], default: '<' },
            { id: 'val', type: 'number', default: 50 }
        ]
    },
    {
        id: 'sen_reflected_light',
        category: 'sensorler',
        type: 'reporter',
        text: '( [ {port} ] yansıyan ışık )',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' }
        ]
    },
    {
        id: 'sen_force_is_pressed',
        category: 'sensorler',
        type: 'boolean',
        text: '< [ {port} ] [ {state} ▼ ] durumda mı? >',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'state', type: 'select', options: ['basılı', 'bırakılmış', 'tıklanmış'], default: 'basılı' }
        ]
    },
    {
        id: 'sen_force_val',
        category: 'sensorler',
        type: 'reporter',
        text: '( [ {port} ] basınç % [ {unit} ▼ ] olarak )',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'unit', type: 'select', options: ['%', 'Newton'], default: '%' }
        ]
    },
    {
        id: 'sen_dist_compare',
        category: 'sensorler',
        type: 'boolean',
        text: '< [ {port} ] mesafe: [ {comp} ▼ ] [ {val} ] [ {unit} ▼ ] mi? >',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'comp', type: 'select', options: ['daha yakın', 'daha uzak'], default: 'daha yakın' },
            { id: 'val', type: 'number', default: 15 },
            { id: 'unit', type: 'select', options: ['cm', 'inç', '%'], default: 'cm' }
        ]
    },
    {
        id: 'sen_dist_val',
        category: 'sensorler',
        type: 'reporter',
        text: '( [ {port} ] mesafe % [ {unit} ▼ ] olarak )',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'unit', type: 'select', options: ['%', 'cm', 'inç'], default: '%' }
        ]
    },
    {
        id: 'sen_tilted',
        category: 'sensorler',
        type: 'boolean',
        text: '< [ {dir} ▼ ] mı eğildi? >',
        inputs: [
            { id: 'dir', type: 'select', options: ['↑', '↓', '←', '→'], default: '↑' }
        ]
    },
    {
        id: 'sen_orientation_up',
        category: 'sensorler',
        type: 'boolean',
        text: '< [ {dir} ▼ ] yukarıda mı? >',
        inputs: [
            { id: 'dir', type: 'select', options: ['ön', 'arka', 'sol', 'sağ', 'üst', 'alt'], default: 'ön' }
        ]
    },
    {
        id: 'sen_gesture',
        category: 'sensorler',
        type: 'boolean',
        text: '< [ {action} ▼ ] mi? >',
        inputs: [
            { id: 'action', type: 'select', options: ['sallandığında', 'düştüğünde', 'dokunulduğunda'], default: 'sallandığında' }
        ]
    },
    {
        id: 'sen_angle',
        category: 'sensorler',
        type: 'reporter',
        text: '( [ {axis} ▼ ] açısı )',
        inputs: [
            { id: 'axis', type: 'select', options: ['sapma'], default: 'sapma' }
        ]
    },
    {
        id: 'sen_reset_yaw',
        category: 'sensorler',
        type: 'statement',
        text: 'sapma açısını 0\'a ayarla',
        inputs: []
    },
    {
        id: 'sen_button_pressed',
        category: 'sensorler',
        type: 'boolean',
        text: '< [ {btn} ▼ ] düğmesi [ {state} ▼ ] durumda mı? >',
        inputs: [
            { id: 'btn', type: 'select', options: ['sol', 'sağ', 'orta'], default: 'sol' },
            { id: 'state', type: 'select', options: ['basılı', 'bırakılmış'], default: 'basılı' }
        ]
    },
    {
        id: 'sen_timer',
        category: 'sensorler',
        type: 'reporter',
        text: '( kronometre )',
        inputs: []
    },
    {
        id: 'sen_timer_reset',
        category: 'sensorler',
        type: 'statement',
        text: 'kronometreyi sıfırla',
        inputs: []
    },

    // --- OPERATÖRLER (Yeşil #40be47 - SADE VE OKUNABİLİR KISA FORM) ---
    {
        id: 'op_random',
        category: 'operatorler',
        type: 'reporter',
        text: '( [ {from} ] ile [ {to} ] arasında rastgele sayı seç )',
        inputs: [
            { id: 'from', type: 'number', default: 1 },
            { id: 'to', type: 'number', default: 10 }
        ]
    },
    {
        id: 'op_add',
        category: 'operatorler',
        type: 'reporter',
        text: '( [ {num1} ] + [ {num2} ] )',
        inputs: [
            { id: 'num1', type: 'number', default: '' },
            { id: 'num2', type: 'number', default: '' }
        ]
    },
    {
        id: 'op_sub',
        category: 'operatorler',
        type: 'reporter',
        text: '( [ {num1} ] - [ {num2} ] )',
        inputs: [
            { id: 'num1', type: 'number', default: '' },
            { id: 'num2', type: 'number', default: '' }
        ]
    },
    {
        id: 'op_mul',
        category: 'operatorler',
        type: 'reporter',
        text: '( [ {num1} ] * [ {num2} ] )',
        inputs: [
            { id: 'num1', type: 'number', default: '' },
            { id: 'num2', type: 'number', default: '' }
        ]
    },
    {
        id: 'op_div',
        category: 'operatorler',
        type: 'reporter',
        text: '( [ {num1} ] / [ {num2} ] )',
        inputs: [
            { id: 'num1', type: 'number', default: '' },
            { id: 'num2', type: 'number', default: '' }
        ]
    },
    {
        id: 'op_lt',
        category: 'operatorler',
        type: 'boolean',
        text: '< [ {val1} ▼ ] < [ {val2} ] >',
        inputs: [
            { id: 'val1', type: 'select', options: ['...', 'sapma açısı', 'yansıyan ışık', 'mesafe (cm)', 'mesafe (%)', 'kronometre', 'değişken', 'değer'], default: '...' },
            { id: 'val2', type: 'number', default: 100 }
        ]
    },
    {
        id: 'op_eq',
        category: 'operatorler',
        type: 'boolean',
        text: '< [ {val1} ▼ ] = [ {val2} ] >',
        inputs: [
            { id: 'val1', type: 'select', options: ['...', 'sapma açısı', 'yansıyan ışık', 'mesafe (cm)', 'mesafe (%)', 'kronometre', 'değişken', 'değer'], default: '...' },
            { id: 'val2', type: 'number', default: 100 }
        ]
    },
    {
        id: 'op_gt',
        category: 'operatorler',
        type: 'boolean',
        text: '< [ {val1} ▼ ] > [ {val2} ] >',
        inputs: [
            { id: 'val1', type: 'select', options: ['...', 'sapma açısı', 'yansıyan ışık', 'mesafe (cm)', 'mesafe (%)', 'kronometre', 'değişken', 'değer'], default: '...' },
            { id: 'val2', type: 'number', default: 100 }
        ]
    },
    {
        id: 'op_and',
        category: 'operatorler',
        type: 'boolean',
        text: '< [ {port1} ] [ {color1} ▼ ] VE [ {port2} ] [ {color2} ▼ ] >',
        inputs: [
            { id: 'port1', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'color1', type: 'select', options: ['kırmızı', 'siyah', 'yeşil', 'mavi', 'sarı', 'beyaz', 'renk yok'], default: 'kırmızı' },
            { id: 'port2', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'color2', type: 'select', options: ['kırmızı', 'siyah', 'yeşil', 'mavi', 'sarı', 'beyaz', 'renk yok'], default: 'siyah' }
        ]
    },
    {
        id: 'op_or',
        category: 'operatorler',
        type: 'boolean',
        text: '< [ {port1} ] [ {color1} ▼ ] VEYA [ {port2} ] [ {color2} ▼ ] >',
        inputs: [
            { id: 'port1', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'color1', type: 'select', options: ['kırmızı', 'siyah', 'yeşil', 'mavi', 'sarı', 'beyaz', 'renk yok'], default: 'kırmızı' },
            { id: 'port2', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'color2', type: 'select', options: ['kırmızı', 'siyah', 'yeşil', 'mavi', 'sarı', 'beyaz', 'renk yok'], default: 'siyah' }
        ]
    },
    {
        id: 'op_not',
        category: 'operatorler',
        type: 'boolean',
        text: '< değil [ {port} ] [ {color} ▼ ] >',
        inputs: [
            { id: 'port', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'], default: 'A' },
            { id: 'color', type: 'select', options: ['kırmızı', 'siyah', 'yeşil', 'mavi', 'sarı', 'beyaz', 'renk yok'], default: 'kırmızı' }
        ]
    },
    {
        id: 'op_in_range',
        category: 'operatorler',
        type: 'boolean',
        text: '< [ {val} ] , [ {min} ] ile [ {max} ] arasında mı? >',
        inputs: [
            { id: 'val', type: 'number', default: 0 },
            { id: 'min', type: 'number', default: -10 },
            { id: 'max', type: 'number', default: 10 }
        ]
    }
];

// SİHİRLİ PİRAMİT VERİLERİ (10 BASAMAKLI MATRİS)
const MAGIC_PYRAMID_GRID = [
    [6],
    [7, 10],
    [1, 3, 8],
    [4, 7, 5, 9],
    [2, 6, 3, 2, 3],
    [6, 5, 7, 10, 5, 6],
    [3, 3, 9, 3, 6, 1, 2],
    [9, 10, 10, 2, 5, 4, 3, 8],
    [2, 7, 2, 8, 10, 6, 10, 1, 10],
    [1, 8, 10, 9, 7, 2, 9, 8, 9, 6]
];

// SINAV SORULARI (2 KODLAMA + 4 MANTIK/MUHAKEME + 2 SİMÜLATÖR = 8 SORU)
const DEFAULT_QUESTIONS = [
    {
        id: 'q1',
        type: 'blocks',
        title: '1. Soru: Eşkenar Üçgen Rotası (Algoritma & Geometri)',
        description: 'Robotunuzun sahada her bir kenar uzunluğu tam olarak 40 cm olan bir eşkenar üçgen çizerek başlangıç noktasına geri dönmesini sağlayan kodu yazınız.'
    },
    {
        id: 'q2',
        type: 'blocks',
        title: '2. Soru: Akıllı Otopark Asistanı (Sensör & Şartlar)',
        description: 'Robotunuz düz bir yolda ilerlerken mesafe sensörü ile sağ tarafındaki park boşluklarını taramaktadır.\n\nKurallar:\n• Robot, okunan mesafe 15 cm\'den büyük olana kadar ilerlemeye devam etmelidir.\n• Mesafe 15 cm\'den büyük olduğunda:\n  1. Hareketi durdurmalı,\n  2. 90 derece sağa dönmeli,\n  3. 15 cm geriye giderek park etmeli,\n  4. Sapma açısını sıfırlayarak kodu bitirmelidir.'
    },
    {
        id: 'q3',
        type: 'pyramid',
        title: '3. Soru: Sihirli Piramit (Mantık & Muhakeme)',
        description: 'Aşağıdaki çözümlü sihirli piramit örneğini inceleyiniz. Sağdaki alanda dairelerin üzerine tıklayarak tepeden tabana doğru 1\'den 10\'a kadar her sayının tam birer kez kullanıldığı doğru rotayı oluşturunuz.<div class="pyramid-guide-box" style="margin-top: 20px;"><div class="pyramid-guide-img-col"><img src="pyramid_example.png" alt="Sihirli Piramit Çözümlü Örnek" class="pyramid-example-img"><span class="pyramid-guide-caption">📘 Çözümlü Örnek (6 Basamak)</span></div><div class="pyramid-guide-rules-col"><div class="pyramid-guide-heading">Sihirli Piramit Nasıl Çözülür?</div><ul class="pyramid-rules-list"><li><b>Başlangıç ve Bitiş:</b> Piramidin en tepesindeki daireden başlayıp en alt satıra kadar birbirine bağlı komşu daireleri seçiniz.</li><li><b>Satır Kuralı:</b> Her satırdan <b>yalnızca bir daire</b> seçebilirsiniz.</li><li><b>Bağlantı Kuralı:</b> Bir daireden yalnızca hemen altındaki <b>sol veya sağ çapraz komşusuna</b> inilebilir.</li><li><b>Tekil Sayı Kuralı:</b> Rota üzerindeki 10 dairede, <b>1\'den 10\'a kadar her sayı tam olarak bir kez</b> kullanılmalıdır (aynı sayı iki kez seçilemez).</li></ul><div class="pyramid-guide-note">💡 <i>Yukarıdaki örnekte 4 ➔ 3 ➔ 2 ➔ 5 ➔ 1 ➔ 6 rotası oluşturulmuş ve 1\'den 6\'ya her sayı birer kez kullanılmıştır.</i></div></div></div>'
    },
    {
        id: 'q4',
        type: 'paper_input',
        title: '4. Soru: Atletler Yarış Mantığı (Derece & Yalan Algoritması)',
        description: 'A, B, C, D, E adlı beş atlet yarış sonrasında konuşmaktadırlar:\n\n• A: "E, D\'ye göre daha öndedir."\n• B: "B birincidir."\n• C: "Ben sonuncu değilim."\n• D: "A, dördüncüdür."\n• E: "D son iki atletten biridir."\n\nYarışı ikinci (2.) ve üçüncü (3.) bitiren atletler YALAN, diğer atletler DOĞRU söylemektedir.\n\nSORU: Her bir atletin yarışta kaçıncı olduğunu bulunuz? (Yazım Formatı Örneği: A:1, B:2, C:3, D:4, E:5)'
    },
    {
        id: 'q5',
        type: 'paper_input',
        title: '5. Soru: Hedef Tahtası Mantık Algoritması',
        description: 'Üzerinde 13, 21, 28 ve 32 puanlık 4 farklı bölge bulunan bir hedef tahtasına ok atışları yapılacaktır.<br><br><img src="https://i.imgur.com/qqx1avJ.png" alt="Hedef Tahtası Görseli" style="max-width: 180px; display: block; margin: 10px auto; border-radius: 8px;"><br>En az sayıda ok atarak TAM 100 PUAN toplamak için hangi alanlara kaçar ok atmak gerekir?<br><br><b>SORU:</b> Her bir bölgeye atılması gereken ok sayılarını aşağıdaki kutucuklara giriniz.'
    },
    {
        id: 'q6',
        type: 'paper_input',
        title: '6. Soru: Kutu Silme Mantık Algoritması',
        description: 'Aşağıdaki matematiksel eşitlikte kutulardan İKİSİNİ silerek eşitliği doğru hale getiriniz.<br><br><img src="https://i.imgur.com/XA1Sj6T.png" alt="Kutu Silme Soru Görseli" style="max-width: 100%; border-radius: 8px; margin: 10px 0;"><br><br>💡 <b>Not:</b> Silinecek kutular <b>sayı</b> olabileceği gibi <b>işlem sembolleri (+, -, ×)</b> de olabilir. İşlemlerde çarpma ve bölme, toplama ve çıkarmaya göre önceliklidir.<br><br><b>SORU:</b> Silinmesi gereken iki kutudaki değerleri yazınız.'
    },
    {
        id: 'q7',
        type: 'blocks',
        title: '7. Soru: Rota Takibi ve Bitiş Alanı',
        description: '<b>GÖREV TANIMI:</b><br>Robotunuz yeşil <b>BAŞLANGIÇ</b> noktasından yola çıkıp beyaz zemin üzerindeki siyah yolu takip ederek sarı damalı <b>HEDEF 🏁</b> alanına başarıyla ulaşmalıdır.<br>• İlgili hareket bloklarını dizerek kodlamayı yapınız.'
    },
    {
        id: 'q8',
        type: 'blocks',
        title: '8. Soru: 5 Renkli Şerit ve Kırmızıda Durma',
        description: '<b>GÖREV TANIMI:</b><br>Robotunuz düz bir yol üzerinde ilerlerken altındaki 5 farklı renkteki dikdörtgen şeritlerin üzerinden geçecektir.<br>• Robot renk sensörü ile zemini okumalıdır.<br>• <b>KIRMIZI</b> rengin üzerine geldiği anda hareketi durdurmalıdır!<br>• Gerekli kodlamayı yapınız.'
    }
];
