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
        text: '< [ {val1} ] < [ {val2} ] >',
        inputs: [
            { id: 'val1', type: 'number', default: '' },
            { id: 'val2', type: 'number', default: 100 }
        ]
    },
    {
        id: 'op_eq',
        category: 'operatorler',
        type: 'boolean',
        text: '< [ {val1} ] = [ {val2} ] >',
        inputs: [
            { id: 'val1', type: 'number', default: '' },
            { id: 'val2', type: 'number', default: 100 }
        ]
    },
    {
        id: 'op_gt',
        category: 'operatorler',
        type: 'boolean',
        text: '< [ {val1} ] > [ {val2} ] >',
        inputs: [
            { id: 'val1', type: 'number', default: '' },
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

// SINAV SORULARI (2 KODLAMA + 4 MANTIK/MUHAKEME + 2 SİMÜLATÖR GÖREVİ = 8 SORU)
const DEFAULT_QUESTIONS = [
    {
        id: 'q1',
        type: 'blocks',
        title: '1. Soru: Robotun Hareket Rotası',
        description: 'Aşağıda verilen komutların kodlamasını yapınız:\n• Robot 10 santimetre ileriye gitsin.\n• 90 derece sağa dönsün.\n• 20 santimetre geriye gitsin.\n• Kodlamayı bitir.'
    },
    {
        id: 'q2',
        type: 'blocks',
        title: '2. Soru: Renk Sensörü ve Motor Kontrolü',
        description: 'Aşağıda verilen komutların kodlamasını yapınız:\n• Robot 30 cm ileri gitsin.\n• 90 derece sola dönsün.\n• 20 cm ileri gitsin.\n• Cisim okumak için renk sensörü ile okuma yapsın.\n• Eğer renk kırmızı ise C motorunu 1 tur çalıştırsın.\n• Eğer renk siyah ise D motorunu 1 tur çalıştırsın.\n• Kodlamayı bitir.'
    },
    {
        id: 'q3',
        type: 'paper_input',
        title: '3. Soru: Robotik Şifre Algoritması',
        description: 'Bir robot, girilen 4 basamaklı ABCD sayısından şu kurala göre bir güvenlik kodu üretmektedir:\n• İlk iki basamağın çarpımını hesaplar: (A × B)\n• Son iki basamağın çarpımını hesaplar: (C × D)\n• Elde ettiği sonuçları yan yana birleştirir.\n\nÖrnekler:\nGirdi: 4325 ➔ (4×3=12) ve (2×5=10) ➔ Çıktı: 1210\nGirdi: 7253 ➔ (7×2=14) ve (5×3=15) ➔ Çıktı: 1415\n\nSORU: Robotun ürettiği güvenlik kodu 1832 olduğuna ve girilen 4 basamaklı sayının tüm rakamları birbirinden farklı olduğuna göre; girilebilecek EN BÜYÜK 4 basamaklı sayı kaçtır?'
    },
    {
        id: 'q4',
        type: 'paper_input',
        title: '4. Soru: Akıllı Sepet Dağıtım Algoritması (Durum Mantığı)',
        description: 'Bir fabrika robotu konveyör banttan geçen renkli paketleri 3 farklı sepete (A, B ve C) şu kurallara göre dağıtmaktadır:\n• 1. Kural: Eğer paket KIRMIZI ise doğrudan A sepetine atılır.\n• 2. Kural: Eğer paket MAVİ ise; A sepetindeki paket sayısı B sepetinden FAZLA ise B sepetine, değilse C sepetine atılır.\n• 3. Kural: Eğer paket YEŞİL ise en az paketin olduğu sepete atılır. (Eşitlik durumunda öncelik sırası A > B > C şeklindedir).\n\nBanttan sırasıyla şu 8 paket geçmektedir:\n1.Kırmızı ➔ 2.Mavi ➔ 3.Yeşil ➔ 4.Mavi ➔ 5.Kırmızı ➔ 6.Yeşil ➔ 7.Mavi ➔ 8.Yeşil\n\nSORU: Tüm paketler dağıtıldıktan sonra A, B ve C sepetlerinde sırasıyla kaçar paket birikir? (Yazım Formatı Örneği: A:5, B:1, C:2)'
    },
    {
        id: 'q5',
        type: 'paper_input',
        title: '5. Soru: Dişli Çarklar ve Tur Sayısı Algoritması',
        description: 'Bir robotik mekanizmada yan yana birbirine bağlı A, B ve C dişli çarkları bulunmaktadır:\n• A çarkının 24 dişi,\n• B çarkının 16 dişi,\n• C çarkının 36 dişi vardır.\n\nA çarkı saat yönünde dönmeye başladığında birbirine temas eden tüm dişliler dönmektedir.\n\nSORU: A çarkı saat yönünde 15 tam tur döndüğünde C çarkı kaç tam tur dönmüş olur?'
    },
    {
        id: 'q6',
        type: 'paper_input',
        title: '6. Soru: Akıllı Şifre Çözme Algoritması',
        description: 'Bir güvenlik robotu kapıyı açmak için 1, 2, 3, 4 ve 5 rakamlarından oluşan 5 basamaklı bir şifreyi çözmelidir.\n\nRobotun sisteminde tanımlı olan kısıtlamalar şöyledir:\n\n• 1, 2, 3, 4 ve 5 rakamlarının her biri bir kez kullanılmaktadır.\n• Oluşan 5 basamaklı şifre çift bir sayıdır.\n• İlk iki basamağın toplamı, son iki basamağın toplamına eşittir.\n• 3 ve 5 rakamları yan yanadır ve 3 rakamı 5\'in hemen solundadır.\n\nSORU: Bu şartları sağlayan 5 basamaklı şifre kaçtır?'
    },
    {
        id: 'q7',
        type: 'simulator',
        trackId: 'q7',
        title: '7. Soru: 1. Simülatör Görevi - Rota Takibi ve Bitiş Alanı',
        description: '👉 <b>ÖNEMLİ:</b> Sağ üstteki <b>"🤖 Simülatör"</b> butonuna (veya aşağıdaki butona) basarak robot test pistinizi açınız!<br><br><b>GÖREV TANIMI:</b><br>Robotunuz yeşil <b>BAŞLANGIÇ</b> noktasından yola çıkıp beyaz zemin üzerindeki siyah yolu takip ederek sarı damalı <b>HEDEF 🏁</b> alanına başarıyla ulaşmalıdır.<br>• İlgili hareket bloklarını diziniz.<br>• Simülatördeki <b>"▶ Kodu Simüle Et"</b> butonuna basarak görevi tamamlayınız.'
    },
    {
        id: 'q8',
        type: 'simulator',
        trackId: 'q8',
        title: '8. Soru: 2. Simülatör Görevi - 5 Renkli Şerit ve Kırmızıda Durma',
        description: '👉 <b>ÖNEMLİ:</b> Sağ üstteki <b>"🤖 Simülatör"</b> butonuna (veya aşağıdaki butona) basarak robot test pistinizi açınız!<br><br><b>GÖREV TANIMI:</b><br>Robotunuz düz bir yol üzerinde ilerlerken altındaki 5 farklı renkteki dikdörtgen şeritlerin üzerinden geçecektir.<br>• Robot renk sensörü ile zemini okumalıdır.<br>• <b>KIRMIZI</b> rengin üzerine geldiği anda hareketi durdurmalıdır!<br>• Bloklarınızı dizip simülatörde test ediniz.'
    }
];
