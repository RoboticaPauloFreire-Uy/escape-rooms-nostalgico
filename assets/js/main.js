// ── Game state ──────────────────────────────────────────────
const CODES = {
  nokia:      '472',
  tv:         '815',
  antena:     '293',
  safe:       '601',
  disco:      '354',
  radio:      '749',
  vinilo:     '528',
  emoticones: '184'
};

const FINAL_CODE = '472-815-293-601-354-749-528-184';
const BIRTHDAY_ANSWERS = ['12 1996', '12/1996', '12-1996', '121996', 'DICIEMBRE 1996', 'DIC 1996', '12 96', '12/96'];
const TOTAL_MODULES = 8;

const MODULES_DATA = [
  { key: 'nokia',      short: 'NOKIA',      icon: '📱', name: 'NOKIA 1100 SMS',        file: 'puzzles/nokia.html',          hint: 'Escribí "COLEGIO PAULO FREIRE" con el teclado T9 para obtener el código.' },
  { key: 'tv',         short: 'TV',         icon: '📺', name: 'TV PERILLA (CANAL 10)', file: 'puzzles/tv-canal.html',       hint: 'Girá la perilla selectora al Canal 10 (Decalegrón) para ver la clave.' },
  { key: 'antena',     short: 'ANTENA',     icon: '📡', name: 'ANTENAS TELEVISIÓN',   file: 'puzzles/antena.html',          hint: 'Orientá las dos antenas para captar la transmisión de La Tómbola (+90% señal).' },
  { key: 'safe',       short: 'CAJA',       icon: '🔐', name: 'CAJA FUERTE DIAL',     file: 'puzzles/caja-fuerte.html',      hint: 'Girá el dial con la combinación secreta (→ 15, ← 30, → 20) para abrirla.' },
  { key: 'disco',      short: 'TELÉFONO',   icon: '☎️', name: 'TELÉFONO A DISCO',     file: 'puzzles/telefono-disco.html',   hint: 'Levantá el tubo y discá el número del colegio (480-0899) en el disco giratorio.' },
  { key: 'radio',      short: 'RADIO',      icon: '📻', name: 'RADIO A PERILLA',      file: 'puzzles/radio.html',            hint: 'Cambiá la palanca a AM y sintonizá la frecuencia 810 kHz (El Espectador).' },
  { key: 'vinilo',     short: 'VINILO',     icon: '🎵', name: 'TOCADISCOS (VINILO)',  file: 'puzzles/tocadiscos.html',       hint: 'Encendé el plato a 33 RPM y colocá la púa sobre la Pista 2 del vinilo.' },
  { key: 'emoticones', short: 'EMOTICONES', icon: '💬', name: 'EMOTICONES ASCII (MSN)', file: 'puzzles/emoticones.html',    hint: 'Uní los 8 emoticones de texto retro de los 90 con sus emojis modernos equivalentes.' }
];

let currentMissionIdx = 0;

// ── Load state from localStorage ────────────────────────────
function loadState() {
  return {
    nokia:      localStorage.getItem('er_nokia')      || null,
    tv:         localStorage.getItem('er_tv')         || null,
    antena:     localStorage.getItem('er_antena')     || null,
    safe:       localStorage.getItem('er_safe')       || null,
    disco:      localStorage.getItem('er_disco')      || null,
    radio:      localStorage.getItem('er_radio')      || null,
    vinilo:     localStorage.getItem('er_vinilo')     || null,
    emoticones: localStorage.getItem('er_emoticones') || null
  };
}

// ── Render console & Single Mission View ─────────────────────
function renderConsole() {
  const state = loadState();
  let solved = 0;

  MODULES_DATA.forEach((m, idx) => {
    const tabBtn = document.getElementById(`tab-m-${idx}`);
    const label = m.short || m.key.toUpperCase();
    if (state[m.key]) {
      solved++;
      if (tabBtn) {
        tabBtn.classList.add('solved');
        tabBtn.innerHTML = `✓ ${idx + 1}:${label}`;
      }
    } else {
      if (tabBtn) {
        tabBtn.classList.remove('solved');
        tabBtn.innerHTML = `${idx + 1}:${label}`;
      }
    }
  });

  // Desafío 9: Colegio Paulo Freire (Bloqueado hasta tener los 8 módulos resueltos)
  const finalTab = document.getElementById('tab-m-8');
  if (finalTab) {
    if (solved === TOTAL_MODULES) {
      finalTab.disabled = false;
      finalTab.classList.remove('locked');
      finalTab.classList.add('ready');
      finalTab.title = '¡Listo! Respondé el desafío sobre el Colegio Paulo Freire';
      finalTab.innerHTML = `✓ 9:COLEGIO [LISTO]`;
    } else {
      finalTab.disabled = true;
      finalTab.classList.remove('ready');
      finalTab.classList.add('locked');
      finalTab.title = `Bloqueado: debés completar los 8 módulos primero (${solved}/${TOTAL_MODULES})`;
      finalTab.innerHTML = `🔒 9:COLEGIO (${solved}/${TOTAL_MODULES})`;
    }
  }

  // Update remaining count
  const rem = document.getElementById('remaining-count');
  if (rem) rem.textContent = (TOTAL_MODULES - solved);

  // Update system status
  const sysStatus = document.getElementById('sys-status');
  if (sysStatus) {
    sysStatus.textContent = solved === TOTAL_MODULES ? 'LISTO PARA ESCAPE' : 'EN PROCESO';
  }

  renderActiveMission(solved, state);
}

function setMission(idx) {
  const state = loadState();
  let solved = 0;
  MODULES_DATA.forEach(m => { if (state[m.key]) solved++; });

  // Bloquear acceso a la pestaña final si no se cumplieron todas las misiones
  if (idx === TOTAL_MODULES && solved < TOTAL_MODULES) {
    const msg = document.getElementById('escape-message');
    if (msg) {
      msg.textContent = `> 🔒 ACCESO DENEGADO: Faltan resolver ${TOTAL_MODULES - solved} módulos para desbloquear la Fase Final.`;
      msg.className = 'escape-message error';
      setTimeout(() => { msg.textContent = ''; }, 3000);
    }
    return;
  }

  currentMissionIdx = idx;
  
  // Highlight active tab
  document.querySelectorAll('.mission-tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === currentMissionIdx);
  });

  renderActiveMission(solved, state);
}

function prevMission() {
  if (currentMissionIdx > 0) setMission(currentMissionIdx - 1);
}

function nextMission() {
  const state = loadState();
  let solved = 0;
  MODULES_DATA.forEach(m => { if (state[m.key]) solved++; });

  if (currentMissionIdx === (TOTAL_MODULES - 1) && solved < TOTAL_MODULES) {
    // Si faltan misiones saltar directamente a la pestaña de Familias (idx 9)
    setMission(9);
    return;
  }
  if (currentMissionIdx < 9) setMission(currentMissionIdx + 1);
}

function renderActiveMission(solved, state) {
  const missionContainer  = document.getElementById('active-mission-container');
  const escapeContainer   = document.getElementById('final-escape-container');
  const familiesContainer = document.getElementById('families-board-container');
  if (!missionContainer || !escapeContainer || !familiesContainer) return;

  if (currentMissionIdx === 9) {
    // Show Families Hall of Fame Board
    missionContainer.style.display  = 'none';
    escapeContainer.style.display   = 'none';
    familiesContainer.style.display = 'block';
    renderFamiliesGrid();
  } else if (currentMissionIdx === TOTAL_MODULES) {
    // Show Final Birthday Question
    missionContainer.style.display  = 'none';
    escapeContainer.style.display   = 'block';
    familiesContainer.style.display = 'none';

    const input = document.getElementById('escape-input');
    const btn   = document.getElementById('btn-execute');
    if (input && btn) {
      input.disabled = solved < TOTAL_MODULES;
      btn.disabled   = solved < TOTAL_MODULES;
      if (solved === TOTAL_MODULES) input.focus();
    }
  } else {
    // Show Single Selected Mission
    missionContainer.style.display  = 'flex';
    escapeContainer.style.display   = 'none';
    familiesContainer.style.display = 'none';

    const m = MODULES_DATA[currentMissionIdx];
    const isSolved = Boolean(state[m.key]);

    document.getElementById('m-idx-label').textContent = `MISIÓN ${currentMissionIdx + 1} DE ${TOTAL_MODULES}`;
    document.getElementById('m-icon').textContent = m.icon;
    document.getElementById('m-title').textContent = m.name;
    document.getElementById('m-hint').textContent = m.hint;

    const statusEl = document.getElementById('m-status');
    const codeEl   = document.getElementById('m-code');
    const btnEnter = document.getElementById('m-btn-enter');

    if (isSolved) {
      statusEl.textContent = '[ ✓ DESBLOQUEADO ]';
      statusEl.style.color = 'var(--green)';
      codeEl.textContent   = `CÓDIGO OBTENIDO: ${state[m.key]}`;
      codeEl.style.color   = 'var(--amber)';
      btnEnter.textContent = '[ REVISAR MISIÓN ]';
    } else {
      statusEl.textContent = '[ ⏳ PENDIENTE DE RESOLUCIÓN ]';
      statusEl.style.color = 'var(--green-dim)';
      codeEl.textContent   = 'CÓDIGO: ???';
      codeEl.style.color   = 'var(--green-dim)';
      btnEnter.textContent = '[ 🚀 ACCEDER A LA MISIÓN ]';
    }
    btnEnter.href = m.file;
  }
}

// ── Execute escape ───────────────────────────────────────────
function executeEscape() {
  const input = document.getElementById('escape-input');
  const msg   = document.getElementById('escape-message');
  if (!input || !msg) return;

  const rawVal = input.value.trim().toUpperCase();
  const cleanVal = rawVal.replace(/[^A-Z0-9]/g, '');

  const cleanFinalCode = FINAL_CODE.replace(/[^0-9]/g, '');

  // Check if matches birthday answer (e.g. "12 1996", "12/1996", "121996", "DICIEMBRE 1996") or master code
  const isBirthdayMatch = BIRTHDAY_ANSWERS.some(ans => {
    const cleanAns = ans.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return rawVal === ans || cleanVal === cleanAns;
  });

  const isMasterCodeMatch = (cleanVal === cleanFinalCode || rawVal === FINAL_CODE);

  if (isBirthdayMatch || isMasterCodeMatch) {
    triggerEscape();
  } else {
    msg.textContent = '> ERROR: RESPUESTA O CÓDIGO INCORRECTO. ACCESO DENEGADO.';
    msg.className   = 'escape-message error';
    input.style.borderBottomColor = 'var(--red)';
    setTimeout(() => {
      msg.textContent = '';
      input.style.borderBottomColor = '';
    }, 3500);
  }
}

// ── Enter key & Mission Launcher ────────────────────────────
function enterActiveMissionOrEscape() {
  if (!floppyInserted) {
    toggleFloppy();
    return;
  }
  if (currentMissionIdx < TOTAL_MODULES) {
    const m = MODULES_DATA[currentMissionIdx];
    if (m && m.file) {
      window.location.href = m.file;
    }
  } else {
    executeEscape();
  }
}

// ── Virtual Retro Keyboard Input & Real Key Events ──────────
function typeVirtualKey(char) {
  if (isResetPromptOpen) {
    if (char === 'S' || char === 'Y' || char === 'ENTER') {
      confirmResetGame();
      return;
    }
    if (char === 'N' || char === 'BKSP') {
      cancelResetGame();
      return;
    }
    return;
  }

  const famModal = document.getElementById('family-modal-overlay');
  const isFamModalOpen = famModal && famModal.style.display === 'flex';
  const famInput = document.getElementById('input-fam-name');

  if (isFamModalOpen && famInput) {
    if (char === 'ENTER') {
      saveFamilyToBoard();
      return;
    }
    if (char === 'BKSP') {
      famInput.value = famInput.value.slice(0, -1);
      famInput.focus();
      return;
    }
    if (char === 'SPACE') {
      famInput.value += ' ';
      famInput.focus();
      return;
    }
    famInput.value += char;
    famInput.focus();
    return;
  }

  if (char === 'ENTER') {
    enterActiveMissionOrEscape();
    return;
  }

  const input = document.getElementById('escape-input');
  if (!input || input.disabled || currentMissionIdx !== TOTAL_MODULES) {
    return;
  }

  if (char === 'BKSP') {
    input.value = input.value.slice(0, -1);
    input.focus();
    return;
  }
  if (char === 'SPACE') {
    input.value += ' ';
    input.focus();
    return;
  }

  input.value += char;
  input.focus();
}

// ── Floppy Drive Interaction ─────────────────────────────────
let floppyInserted = false;

function playFloppySound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Ruido mecánico de cabezal de disquetera 3.5"
    [120, 180, 150, 220, 300].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.07);
    });
  } catch(e) {}
}

function toggleFloppy() {
  const disk = document.getElementById('floppy-disk');
  const led  = document.getElementById('floppy-led');
  const noDiskUi = document.getElementById('screen-no-disk-ui');
  const systemUi = document.getElementById('screen-system-ui');

  floppyInserted = !floppyInserted;

  if (floppyInserted) {
    // 💾 INSERTANDO DISQUETE
    sessionStorage.setItem('er_floppy_inserted', '1');
    if (disk) disk.classList.add('inserted');
    if (led)  led.classList.add('reading');
    playFloppySound();

    if (noDiskUi) {
      noDiskUi.innerHTML = `
        <div class="no-disk-glitch-title" style="color:var(--green-bright)">► [DRIVE A:]: DISQUETE DETECTADO</div>
        <p style="font-size:1.1rem;color:var(--green);margin:10px 0">Leyendo FREIRE_SYS.DSK ... [ OK ]</p>
        <p style="font-size:1rem;color:var(--amber);margin:10px 0" class="blink">Iniciando PAULOFREIRE-OS v30 ...</p>
      `;
    }

    setTimeout(() => {
      if (led) led.classList.remove('reading');
      if (noDiskUi) noDiskUi.style.display = 'none';
      if (systemUi) systemUi.style.display = 'block';
      renderConsole();
    }, 700);

  } else {
    // ⏏️ EXPULSANDO DISQUETE
    sessionStorage.setItem('er_floppy_inserted', '0');
    if (disk) disk.classList.remove('inserted');
    if (led)  led.classList.remove('reading');

    if (systemUi) systemUi.style.display = 'none';
    if (noDiskUi) {
      noDiskUi.style.display = 'flex';
      noDiskUi.innerHTML = `
        <div class="no-disk-glitch-title">► DISQUETE NO DETECTADO EN DRIVE A:</div>
        <p style="font-size:1rem;color:#77dd88;margin-bottom:6px">Non-System disk or disk error.</p>
        <p style="font-size:.9rem;color:var(--green-dim);margin-bottom:12px">Replace disk and click when ready.</p>
        
        <div class="insert-disk-badge blink">
          💾 [ INSERTE EL DISQUETE "FREIRE_SYS.DSK" PARA INICIAR EL SISTEMA ]
        </div>

        <p style="font-size:.8rem;color:#55aa66;margin-top:10px">
          👉 Haga click aquí o en la <b>Unidad de Disquete A:</b> abajo para insertar el disco.
        </p>
      `;
    }
  }
}

// ── Initialization ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const disk = document.getElementById('floppy-disk');
  const noDiskUi = document.getElementById('screen-no-disk-ui');
  const systemUi = document.getElementById('screen-system-ui');

  // Si el usuario ya insertó el disquete en esta sesión, mantenerlo activo
  const isAlreadyInserted = (sessionStorage.getItem('er_floppy_inserted') === '1');

  if (isAlreadyInserted) {
    floppyInserted = true;
    if (disk) disk.classList.add('inserted');
    if (noDiskUi) noDiskUi.style.display = 'none';
    if (systemUi) systemUi.style.display = 'block';
    renderConsole();
  } else {
    floppyInserted = false;
    if (disk) disk.classList.remove('inserted');
    if (noDiskUi) noDiskUi.style.display = 'flex';
    if (systemUi) systemUi.style.display = 'none';
  }

  // Bind physical keyboard to visual retro keys and mission actions
  window.addEventListener('keydown', e => {
    const keyStr = (e.key || '').toUpperCase();
    const codeStr = e.code || '';

    const keyEl = document.querySelector(`.v-key[data-key="${keyStr}"]`);
    if (keyEl) {
      keyEl.classList.add('pressed');
      setTimeout(() => keyEl.classList.remove('pressed'), 150);
    }

    // Si el diálogo de reseteo está abierto en pantalla
    if (isResetPromptOpen) {
      if (keyStr === 'S' || keyStr === 'Y' || codeStr === 'KeyS' || codeStr === 'KeyY' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        confirmResetGame();
        return;
      }
      if (keyStr === 'N' || codeStr === 'KeyN' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cancelResetGame();
        return;
      }
      return;
    }

    const famModal = document.getElementById('family-modal-overlay');
    const isFamModalOpen = famModal && famModal.style.display === 'flex';
    const famInput = document.getElementById('input-fam-name');

    if (isFamModalOpen) {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveFamilyToBoard();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAddFamilyModal();
        return;
      }
      if (document.activeElement === famInput) {
        return; // Normal typing inside input
      }
    }

    if (e.key === 'Enter') {
      const input = document.getElementById('escape-input');
      if (currentMissionIdx === TOTAL_MODULES && document.activeElement === input) {
        executeEscape();
      } else {
        enterActiveMissionOrEscape();
      }
    } else if (e.key === 'ArrowLeft' && document.activeElement !== document.getElementById('escape-input') && document.activeElement !== famInput) {
      prevMission();
    } else if (e.key === 'ArrowRight' && document.activeElement !== document.getElementById('escape-input') && document.activeElement !== famInput) {
      nextMission();
    }
  }, true);

  // Start live elapsed timer
  updateLiveTimer();
  setInterval(updateLiveTimer, 1000);
});

// ── In-Screen CRT Hardware Reset Manager ─────────────────────
let isResetPromptOpen = false;

function playPromptTone() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [440, 330].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.16);
    });
  } catch(e) {}
}

function requestResetGame() {
  isResetPromptOpen = true;
  if (document.activeElement && document.activeElement.blur) {
    document.activeElement.blur();
  }
  playPromptTone();
  const overlay = document.getElementById('crt-reset-overlay');
  if (overlay) overlay.style.display = 'flex';
}

function cancelResetGame() {
  isResetPromptOpen = false;
  const overlay = document.getElementById('crt-reset-overlay');
  if (overlay) overlay.style.display = 'none';
}

function confirmResetGame() {
  isResetPromptOpen = false;
  ['er_nokia','er_tv','er_antena','er_safe','er_disco','er_radio','er_vinilo','er_emoticones','er_start_time','er_finish_time','er_nokia_hint_used','er_antena_hint_used','er_disco_hint_used','er_radio_hint_used','er_vinilo_hint_used','er_emoticones_hint_used'].forEach(k => localStorage.removeItem(k));
  sessionStorage.removeItem('er_floppy_inserted');
  location.reload();
}

// ── Hardware Monitor Power Button ────────────────────────────
let isMonitorPowered = true;

function playSwitchClick(isOn) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isOn ? 180 : 120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.09);
  } catch(e) {}
}

function toggleMonitorPower() {
  isMonitorPowered = !isMonitorPowered;
  playSwitchClick(isMonitorPowered);

  const screen = document.getElementById('screen-surface');
  const powerLed = document.getElementById('monitor-power-led');
  const powerBtn = document.getElementById('btn-pc-power');
  const label = document.getElementById('power-btn-label');

  if (isMonitorPowered) {
    if (screen) screen.classList.remove('powered-off');
    if (powerLed) powerLed.classList.remove('off');
    if (powerBtn) powerBtn.classList.remove('off');
    if (label) label.textContent = 'POWER';
  } else {
    if (screen) screen.classList.add('powered-off');
    if (powerLed) powerLed.classList.add('off');
    if (powerBtn) powerBtn.classList.add('off');
    if (label) label.textContent = 'OFF';
  }
}

// ── Game Timer Tracking ─────────────────────────────────────
function getOrInitStartTime() {
  let st = localStorage.getItem('er_start_time');
  if (!st) {
    st = Date.now().toString();
    localStorage.setItem('er_start_time', st);
  }
  return parseInt(st, 10);
}

function updateLiveTimer() {
  const timerEl = document.getElementById('timer-display');
  if (!timerEl) return;
  const st = getOrInitStartTime();
  const elapsedSec = Math.max(0, Math.floor((Date.now() - st) / 1000));
  const m = Math.floor(elapsedSec / 60);
  const s = elapsedSec % 60;
  timerEl.textContent = `⏱ TIEMPO: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getElapsedTimeFormatted() {
  const st = getOrInitStartTime();
  const elapsedSec = Math.max(0, Math.floor((Date.now() - st) / 1000));
  const m = Math.floor(elapsedSec / 60);
  const s = elapsedSec % 60;
  if (m === 0) {
    return `${s} segundos`;
  } else if (m < 60) {
    return `${m} min ${s.toString().padStart(2, '0')} seg`;
  } else {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h}h ${remM}m ${s.toString().padStart(2, '0')}s`;
  }
}

// ── Retro Sound Effects ──────────────────────────────────────
function playVictorySound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch (e) {}
}

// ── Escape Victory (Renders Directly Inside CRT Screen) ─────
function clearGameProgress() {
  const gameKeys = [
    'er_nokia', 'er_tv', 'er_antena', 'er_safe', 
    'er_disco', 'er_radio', 'er_vinilo', 'er_emoticones', 
    'er_start_time', 'er_finish_time', 
    'er_nokia_hint_used', 'er_antena_hint_used', 'er_disco_hint_used', 
    'er_radio_hint_used', 'er_vinilo_hint_used', 'er_emoticones_hint_used'
  ];
  gameKeys.forEach(k => localStorage.removeItem(k));
  sessionStorage.removeItem('er_floppy_inserted');
}

function restartGame() {
  clearGameProgress();
  window.location.reload();
}

function triggerEscape() {
  const finalTime = getElapsedTimeFormatted();
  playVictorySound();

  // Clear module localStorage for fresh next game (PRESERVING er_escaped_families)
  clearGameProgress();

  const noDiskUi = document.getElementById('screen-no-disk-ui');
  const systemUi = document.getElementById('screen-system-ui');
  const victoryUi = document.getElementById('screen-victory-ui');
  const timeVal = document.getElementById('victory-time-val');

  if (noDiskUi) noDiskUi.style.display = 'none';
  if (systemUi) systemUi.style.display = 'none';
  if (timeVal) timeVal.textContent = `⏱️ ${finalTime}`;
  if (victoryUi) victoryUi.style.display = 'block';
}

// ── Tablero de Familias que Escaparon (Hall of Fame) ─────────
let currentUploadedPhotoData = null;
let webcamStream = null;

function getStoredFamilies() {
  try {
    const raw = localStorage.getItem('er_escaped_families');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch(e) {
    return [];
  }
}

function renderFamiliesGrid() {
  const grid = document.getElementById('families-grid');
  if (!grid) return;

  const families = getStoredFamilies();

  if (families.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px 10px; color: var(--green-dim);">
        <div style="font-size: 2.2rem; margin-bottom: 6px;">📷</div>
        <div style="font-size: 0.95rem; color: var(--amber); font-weight: bold;">Aún no hay familias en el mural de recuerdos.</div>
        <div style="font-size: 0.8rem; margin-top: 6px; color: #88cc99;">
          ¡Completá los 7 desafíos analógicos y desbloqueá el sistema central para inmortalizar la foto de tu familia en este mural de honor!
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = families.map(f => `
    <div class="family-polaroid" title="${escapeHtml(f.name)}">
      <div class="family-photo-frame">
        <img src="${f.photo}" class="family-photo-img" alt="${escapeHtml(f.name)}">
      </div>
      <div class="family-name-tag">${escapeHtml(f.name)}</div>
      <div class="family-date-tag">📅 ${f.date || '1996'}</div>
    </div>
  `).join('');
}

function downloadFamilyJpg(id, event) {
  if (event) event.stopPropagation();
  const families = getStoredFamilies();
  const fam = families.find(f => f.id === id);
  if (!fam || !fam.photo) return;

  // Render a high quality Polaroid style JPG with canvas
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  // Polaroid white/cream background
  ctx.fillStyle = '#fdfbf7';
  ctx.fillRect(0, 0, 400, 480);

  // Border & shadow simulation
  ctx.strokeStyle = '#d0c5b4';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 396, 476);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    // Draw photo in top frame
    ctx.drawImage(img, 24, 24, 352, 350);

    // Dark vintage border around photo
    ctx.strokeStyle = '#b0a08b';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, 352, 350);

    // Text: Family Name
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 22px "Share Tech Mono", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(fam.name, 200, 410);

    // Text: Date & School Tag
    ctx.fillStyle = '#6a5a4a';
    ctx.font = '14px "Share Tech Mono", monospace, sans-serif';
    ctx.fillText(`Colegio Paulo Freire • ${fam.date || '1996'}`, 200, 442);

    // Generate JPG link and trigger download
    const jpgUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    const safeName = fam.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeName}_EscapeRoom_1996.jpg`;
    link.href = jpgUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  img.src = fam.photo;
}

function playShutterSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Click 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(800, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.06);

    // Click 2 (shutter release)
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1200, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
        gain2.gain.setValueAtTime(0.25, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.09);
      } catch(e) {}
    }, 60);
  } catch(e) {}
}

async function startWebcamCapture() {
  const webcamContainer = document.getElementById('webcam-container');
  const video = document.getElementById('webcam-video');
  const fileLabel = document.getElementById('fam-file-label');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Tu navegador no permite el acceso a la cámara o requiere conexión HTTPS / localhost.');
    return;
  }

  try {
    stopWebcam(); // Close any prior stream
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    if (video) {
      video.srcObject = webcamStream;
      video.play();
    }
    if (webcamContainer) webcamContainer.style.display = 'flex';
    if (fileLabel) fileLabel.textContent = '🔴 Transmitiendo desde cámara web...';
  } catch(err) {
    alert('No se pudo acceder a la cámara. Verificá los permisos de tu navegador.');
  }
}

function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
    webcamStream = null;
  }
  const video = document.getElementById('webcam-video');
  if (video) video.srcObject = null;
  const webcamContainer = document.getElementById('webcam-container');
  if (webcamContainer) webcamContainer.style.display = 'none';
}

function takeWebcamSnapshot() {
  const video = document.getElementById('webcam-video');
  if (!video || !webcamStream) return;

  playShutterSound();

  const canvas = document.createElement('canvas');
  const maxDim = 280;
  const vidWidth = video.videoWidth || 640;
  const vidHeight = video.videoHeight || 480;

  let width = vidWidth;
  let height = vidHeight;

  if (width > height) {
    if (width > maxDim) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    }
  } else {
    if (height > maxDim) {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Mirror effect to match video
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, width, height);

  currentUploadedPhotoData = canvas.toDataURL('image/jpeg', 0.85);

  // Stop stream after capture
  stopWebcam();

  // Show Polaroid Preview
  const fileLabel = document.getElementById('fam-file-label');
  const previewBox = document.getElementById('fam-preview-box');
  const previewImg = document.getElementById('fam-preview-img');
  const previewName = document.getElementById('fam-preview-name');
  const nameInput = document.getElementById('input-fam-name');

  if (fileLabel) fileLabel.textContent = '📸 Foto capturada desde cámara web ✓';
  if (previewImg) previewImg.src = currentUploadedPhotoData;
  if (previewName && nameInput) previewName.textContent = nameInput.value || 'Nuestra Familia';
  if (previewBox) previewBox.style.display = 'flex';
}

function openAddFamilyModal() {
  currentUploadedPhotoData = null;
  stopWebcam();

  const overlay = document.getElementById('family-modal-overlay');
  const nameInput = document.getElementById('input-fam-name');
  const fileLabel = document.getElementById('fam-file-label');
  const previewBox = document.getElementById('fam-preview-box');

  if (nameInput) nameInput.value = '';
  if (fileLabel) fileLabel.textContent = 'Sin foto capturada';
  if (previewBox) previewBox.style.display = 'none';

  if (overlay) overlay.style.display = 'flex';
  if (nameInput) setTimeout(() => nameInput.focus(), 100);
}

function closeAddFamilyModal() {
  stopWebcam();
  const overlay = document.getElementById('family-modal-overlay');
  if (overlay) overlay.style.display = 'none';
}

function handleFamilyFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const fileLabel = document.getElementById('fam-file-label');
  if (fileLabel) fileLabel.textContent = file.name;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Compress and resize to max 260x260 for efficient localStorage storage
      const canvas = document.createElement('canvas');
      const maxDim = 260;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      currentUploadedPhotoData = canvas.toDataURL('image/jpeg', 0.82);

      // Show preview
      const previewBox = document.getElementById('fam-preview-box');
      const previewImg = document.getElementById('fam-preview-img');
      const previewName = document.getElementById('fam-preview-name');
      const nameInput = document.getElementById('input-fam-name');

      if (previewImg) previewImg.src = currentUploadedPhotoData;
      if (previewName && nameInput) previewName.textContent = nameInput.value || 'Nuestra Familia';
      if (previewBox) previewBox.style.display = 'flex';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function generateDefaultFamilyAvatar(name) {
  // Generate a retro stylized canvas Polaroid avatar if no file uploaded
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#2c2219';
  ctx.fillRect(0, 0, 200, 180);

  ctx.font = '50px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('👨‍👩‍👧‍👦', 100, 75);

  ctx.fillStyle = '#d4a359';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('PAULO FREIRE 1996', 100, 140);

  return canvas.toDataURL('image/jpeg', 0.85);
}

function saveFamilyToBoard() {
  const nameInput = document.getElementById('input-fam-name');
  const name = (nameInput ? nameInput.value.trim() : '') || 'Familia Paulo Freire';

  const photo = currentUploadedPhotoData || generateDefaultFamilyAvatar(name);

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-UY', { day: '2-digit', month: 'short', year: 'numeric' });

  const newFamily = {
    id: Date.now(),
    name: name,
    photo: photo,
    date: dateStr
  };

  const list = getStoredFamilies();
  list.unshift(newFamily); // Newest on top
  try {
    localStorage.setItem('er_escaped_families', JSON.stringify(list));
  } catch(e) {
    alert('No se pudo guardar la foto por límite de almacenamiento del navegador.');
  }

  closeAddFamilyModal();
  
  // Transition to Tablero de Familias in System UI
  const victoryUi = document.getElementById('screen-victory-ui');
  const noDiskUi = document.getElementById('screen-no-disk-ui');
  const systemUi = document.getElementById('screen-system-ui');
  if (victoryUi) victoryUi.style.display = 'none';
  if (noDiskUi) noDiskUi.style.display = 'none';
  if (systemUi) systemUi.style.display = 'block';

  setMission(9); // Switch to Tablero de Familias
}

function deleteFamily(id, event) {
  if (event) event.stopPropagation();
  if (!confirm('¿Eliminar esta foto familiar del tablero?')) return;

  let list = getStoredFamilies();
  list = list.filter(f => f.id !== id);
  localStorage.setItem('er_escaped_families', JSON.stringify(list));
  renderFamiliesGrid();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

function viewFamiliesDirectly() {
  const victoryUi = document.getElementById('screen-victory-ui');
  const noDiskUi = document.getElementById('screen-no-disk-ui');
  const systemUi = document.getElementById('screen-system-ui');
  const disk = document.getElementById('floppy-disk');
  const led = document.getElementById('floppy-led');

  if (victoryUi) victoryUi.style.display = 'none';
  if (noDiskUi) noDiskUi.style.display = 'none';
  if (systemUi) systemUi.style.display = 'block';
  if (disk) disk.classList.add('inserted');
  if (led) led.classList.add('reading');
  floppyInserted = true;
  sessionStorage.setItem('er_floppy_inserted', 'true');

  renderConsole();
  setMission(9);
}

function openPC286HistoryModal() {
  const m = document.getElementById('pc286-history-modal');
  if (m) m.style.display = 'flex';
}

function closePC286HistoryModal() {
  const m = document.getElementById('pc286-history-modal');
  if (m) m.style.display = 'none';
}

document.addEventListener('keydown', e => {
  const historyModal = document.getElementById('pc286-history-modal');
  if (historyModal && historyModal.style.display === 'flex') {
    if (e.key === 'Escape' || e.key === 'Enter') {
      e.preventDefault();
      closePC286HistoryModal();
    }
  }
});
