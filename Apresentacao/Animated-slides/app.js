/**
 * Teoria dos Grafos - SAMU 192 Iporá (GO)
 * Apresentação Animada e Interativa com Cores do SAMU
 * (Helicóptero de Resgate, Viatura com Sirene Clicável, Despacho e Dijkstra)
 */

const state = {
  currentSlide: 0,
  totalSlides: 6,
  previousSlide: 0,
  selectedCity: 'Amorinópolis',
  animStep: 0,
  animationFrameId: null,
  heliAudioCtx: null,
  sirenActive: false,
  canvasAmbulance: {
    active: false,
    path: [],
    segmentIdx: 0,
    t: 0,
    speed: 0.007,
    x: 0,
    y: 0,
    angle: 0
  }
};

// Dados Topológicos da Malha Viária
const graphData = {
  nodes: {
    'Iporá': { x: 170, y: 220, type: 'base_central', label: 'Iporá (Base USA-01)', status: 'Base Central (USA + USB)' },
    'Entr_Sul': { x: 190, y: 300, type: 'junction', label: 'Entr. GO-060 x GO-174' },
    'Amorinópolis': { x: 210, y: 390, type: 'city', label: 'Amorinópolis', status: 'Sem Base Física' },
    'Entr_320': { x: 290, y: 220, type: 'junction', label: 'Entr. GO-060 x GO-320' },
    'Israelândia': { x: 410, y: 220, type: 'city', label: 'Israelândia', status: 'Sem Base Física' },
    'Trevo_173': { x: 480, y: 180, type: 'junction', label: 'Trevo GO-173' },
    'Jaupaci': { x: 550, y: 150, type: 'city', label: 'Jaupaci', status: 'Sem Base Física' },
    'Fazenda_Nova': { x: 660, y: 120, type: 'city', label: 'Fazenda Nova', status: 'Base Descentralizada (USB)' },
    'Novo_Brasil': { x: 760, y: 90, type: 'city', label: 'Novo Brasil', status: 'Sem Base Física' },
    'Ivolândia': { x: 350, y: 320, type: 'city', label: 'Ivolândia', status: 'Base Descentralizada (USB)' },
    'Moiporá': { x: 460, y: 350, type: 'city', label: 'Moiporá', status: 'Sem Base Física' },
    'Corrego_Ouro': { x: 570, y: 250, type: 'city', label: 'Córrego do Ouro', status: 'Sem Base Física' },
    'Cachoeira_GO': { x: 590, y: 390, type: 'city', label: 'Cachoeira de Goiás', status: 'Base com USB Contemplada' }
  },
  edges: [
    { from: 'Iporá', to: 'Entr_Sul', weight: '1 km' },
    { from: 'Entr_Sul', to: 'Amorinópolis', weight: '27 km' },
    { from: 'Iporá', to: 'Entr_320', weight: '16 km' },
    { from: 'Entr_320', to: 'Israelândia', weight: '12 km' },
    { from: 'Entr_320', to: 'Ivolândia', weight: '26 km' },
    { from: 'Israelândia', to: 'Trevo_173', weight: '—' },
    { from: 'Trevo_173', to: 'Jaupaci', weight: '16 km' },
    { from: 'Jaupaci', to: 'Fazenda_Nova', weight: '28 km' },
    { from: 'Fazenda_Nova', to: 'Novo_Brasil', weight: '24 km' },
    { from: 'Israelândia', to: 'Corrego_Ouro', weight: '64 km' },
    { from: 'Ivolândia', to: 'Moiporá', weight: '19 km' },
    { from: 'Moiporá', to: 'Cachoeira_GO', weight: '36 km' }
  ],
  routes: {
    'Amorinópolis': {
      dist: 28.0,
      path: ['Iporá', 'Entr_Sul', 'Amorinópolis'],
      status: 'Sem Base Física',
      risk: 'baixo',
      tempo: '21 min',
      transito: 'GO-174 com tráfego livre',
      clima: 'Pista seca, visibilidade total'
    },
    'Israelândia': {
      dist: 28.0,
      path: ['Iporá', 'Entr_320', 'Israelândia'],
      status: 'Sem Base Física',
      risk: 'baixo',
      tempo: '21 min',
      transito: 'GO-060 com tráfego leve',
      clima: 'Ensolarado, tempo firme'
    },
    'Jaupaci': {
      dist: 44.0,
      path: ['Iporá', 'Entr_320', 'Israelândia', 'Trevo_173', 'Jaupaci'],
      status: 'Sem Base Física',
      risk: 'medio',
      tempo: '33 min',
      transito: 'Trecho sinuoso na GO-173',
      clima: 'Asfalto regular'
    },
    'Ivolândia': {
      dist: 54.0,
      path: ['Iporá', 'Entr_320', 'Ivolândia'],
      status: 'Base Descentralizada (USB)',
      risk: 'medio',
      tempo: '41 min',
      transito: 'Entroncamento GO-320 com maquinários',
      clima: 'Pista seca, boa aderência'
    },
    'Fazenda Nova': {
      dist: 72.0,
      path: ['Iporá', 'Entr_320', 'Israelândia', 'Trevo_173', 'Jaupaci', 'Fazenda_Nova'],
      status: 'Base Descentralizada (USB)',
      risk: 'medio',
      tempo: '54 min',
      transito: 'Eixo GO-173 com atenção a curvas',
      clima: 'Céu claro, fluxo moderado'
    },
    'Moiporá': {
      dist: 73.0,
      path: ['Iporá', 'Entr_320', 'Ivolândia', 'Moiporá'],
      status: 'Sem Base Física',
      risk: 'medio',
      tempo: '55 min',
      transito: 'Fluxo moderado de carretas',
      clima: 'Pista seca'
    },
    'Novo Brasil': {
      dist: 96.0,
      path: ['Iporá', 'Entr_320', 'Israelândia', 'Trevo_173', 'Jaupaci', 'Fazenda_Nova', 'Novo_Brasil'],
      status: 'Sem Base Física',
      risk: 'alto',
      tempo: '1h 12 min',
      transito: 'Pico de transporte na GO-164',
      clima: 'Tempo seco, distância crítica (> 90 km)'
    },
    'Córrego do Ouro': {
      dist: 104.0,
      path: ['Iporá', 'Entr_320', 'Israelândia', 'Corrego_Ouro'],
      status: 'Sem Base Física',
      risk: 'alto',
      tempo: '1h 18 min',
      transito: 'GO-326 extensão longa e isolada',
      clima: 'Visibilidade boa, tempo crítico'
    },
    'Cachoeira de Goiás': {
      dist: 109.0,
      path: ['Iporá', 'Entr_320', 'Ivolândia', 'Moiporá', 'Cachoeira_GO'],
      status: 'Base com USB Contemplada',
      risk: 'alto',
      tempo: '1h 22 min',
      transito: 'Pontes estreitas na GO-444',
      clima: 'Tempo estável, tempo de resposta crítico'
    }
  }
};

// ==============================================================================
// EFEITOS SONOROS SUAVES
// ==============================================================================
function playSirenSound(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.018, ctx.currentTime);

    if (type === 'vermelho') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(780, ctx.currentTime + 0.35);
      osc.frequency.linearRampToValueAtTime(580, ctx.currentTime + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
      osc.start();
      osc.stop(ctx.currentTime + 1.1);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(620, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch (e) {}
}

function playHelicopterAudio() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    state.heliAudioCtx = new AudioCtx();
    const ctx = state.heliAudioCtx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, ctx.currentTime);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(12, ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.018, ctx.currentTime);

    lfo.connect(gain.gain);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.018, ctx.currentTime);
    osc.start();
    lfo.start();
  } catch (e) {}
}

function stopHelicopterAudio() {
  try {
    if (state.heliAudioCtx && state.heliAudioCtx.state !== 'closed') {
      state.heliAudioCtx.close();
      state.heliAudioCtx = null;
    }
  } catch (e) {}
}

// ==============================================================================
// HELICÓPTERO (SLIDE 5)
// ==============================================================================
function triggerHelicopterLanding() {
  const overlay = document.getElementById('helicopter-overlay');
  if (!overlay) return;
  overlay.classList.add('active');
  playHelicopterAudio();
}

function closeHelicopter() {
  const overlay = document.getElementById('helicopter-overlay');
  if (overlay) overlay.classList.remove('active');
  stopHelicopterAudio();
}

// ==============================================================================
// VIATURA LATERAL: SIRENE & ESTROBOSCÓPIO
// ==============================================================================
function toggleSideAmbulanceSiren() {
  const ambEl = document.getElementById('page-switch-ambulance');
  if (!ambEl) return;

  state.sirenActive = !state.sirenActive;

  if (state.sirenActive) {
    ambEl.classList.add('siren-on');
    playSirenSound('vermelho');

    setTimeout(() => {
      ambEl.classList.remove('siren-on');
      state.sirenActive = false;
    }, 4000);
  } else {
    ambEl.classList.remove('siren-on');
  }
}

// ==============================================================================
// AMBULÂNCIA LENTA CRUZANDO A TELA (SLIDE 2)
// ==============================================================================
function triggerFlybyAmbulance(codeColor) {
  const container = document.getElementById('ambulance-flyby-container');
  const beacon = document.getElementById('flyby-beacon');
  const callout = document.getElementById('flyby-callout');
  const ambulanceEl = document.getElementById('flying-ambulance');

  if (!container || !ambulanceEl) return;

  let beaconColor = '#10b981';
  let badgeText = 'CÓDIGO 1: VERDE (LEVE)';

  if (codeColor === 'amarelo') {
    beaconColor = '#f59e0b';
    badgeText = 'CÓDIGO 2: AMARELO (URGÊNCIA)';
  } else if (codeColor === 'vermelho') {
    beaconColor = '#ef4444';
    badgeText = 'CÓDIGO 3: VERMELHO (USA-01 UTI MÓVEL)';
  }

  beacon.style.backgroundColor = beaconColor;
  beacon.style.color = beaconColor;
  callout.textContent = badgeText;
  callout.style.borderColor = beaconColor;
  callout.style.color = beaconColor;

  playSirenSound(codeColor);

  container.classList.remove('animate');
  ambulanceEl.style.animation = 'none';
  void ambulanceEl.offsetWidth;
  ambulanceEl.style.animation = '';
  container.classList.add('animate');

  setTimeout(() => {
    container.classList.remove('animate');
  }, 5600);
}

// ==============================================================================
// CONTROLE DE SLIDES & POSIÇÃO DA VIATURA LATERAL
// ==============================================================================
function updateSwitchAmbulancePosition(targetSlide, previousSlide) {
  const ambEl = document.getElementById('page-switch-ambulance');
  if (!ambEl) return;

  const percent = 16 + (targetSlide / (state.totalSlides - 1)) * 68;
  ambEl.style.top = `${percent}%`;

  if (targetSlide > previousSlide) {
    ambEl.style.transform = 'rotate(180deg) scale(1.1)';
  } else if (targetSlide < previousSlide) {
    ambEl.style.transform = 'rotate(0deg) scale(1.1)';
  }

  setTimeout(() => {
    ambEl.style.transform = 'scale(1)';
  }, 600);
}

function initSlideDeck() {
  const slides = document.querySelectorAll('.slide');
  state.totalSlides = slides.length;

  const dotsContainer = document.getElementById('dots-container');
  dotsContainer.innerHTML = '';

  slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `dot ${idx === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(idx));
    dotsContainer.appendChild(dot);
  });

  document.getElementById('btn-prev').addEventListener('click', prevSlide);
  document.getElementById('btn-next').addEventListener('click', nextSlide);
  document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'Home') {
      goToSlide(0);
    } else if (e.key === 'End') {
      goToSlide(state.totalSlides - 1);
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
  });

  // Touch Swipe
  let startX = 0;
  window.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].screenX; }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - startX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });

  updateSlideView();
}

function updateSlideView() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const progressBar = document.getElementById('progress-bar');
  const slideIndicator = document.getElementById('slide-indicator');
  const headerPageNumber = document.getElementById('header-page-number');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === state.currentSlide);
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === state.currentSlide);
  });

  const progressPercent = ((state.currentSlide + 1) / state.totalSlides) * 100;
  progressBar.style.width = `${progressPercent}%`;

  const pageText = `Página ${state.currentSlide + 1} de ${state.totalSlides}`;
  slideIndicator.textContent = pageText;
  if (headerPageNumber) headerPageNumber.textContent = pageText;

  btnPrev.disabled = state.currentSlide === 0;
  btnNext.disabled = state.currentSlide === state.totalSlides - 1;

  updateSwitchAmbulancePosition(state.currentSlide, state.previousSlide);

  if (state.currentSlide === 2) {
    setTimeout(initGraphSimulator, 50);
  }
}

function nextSlide() {
  if (state.currentSlide < state.totalSlides - 1) {
    state.previousSlide = state.currentSlide;
    state.currentSlide++;
    updateSlideView();
  }
}

function prevSlide() {
  if (state.currentSlide > 0) {
    state.previousSlide = state.currentSlide;
    state.currentSlide--;
    updateSlideView();
  }
}

function goToSlide(idx) {
  if (idx >= 0 && idx < state.totalSlides && idx !== state.currentSlide) {
    state.previousSlide = state.currentSlide;
    state.currentSlide = idx;
    updateSlideView();
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

// ==============================================================================
// SIMULADOR DO GRAFO (CANVAS)
// ==============================================================================
function initGraphSimulator() {
  const canvas = document.getElementById('graphCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resizeCanvas();

  function getPos(nodeKey) {
    const node = graphData.nodes[nodeKey];
    if (!node) return { x: 0, y: 0 };
    const sx = canvas.width / 880;
    const sy = canvas.height / 460;
    return { x: node.x * sx, y: node.y * sy };
  }

  function startAmbulanceDispatch() {
    const route = graphData.routes[state.selectedCity];
    if (!route || !route.path.length) return;

    state.canvasAmbulance.active = true;
    state.canvasAmbulance.path = route.path;
    state.canvasAmbulance.segmentIdx = 0;
    state.canvasAmbulance.t = 0;

    const startPos = getPos(route.path[0]);
    state.canvasAmbulance.x = startPos.x;
    state.canvasAmbulance.y = startPos.y;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const activeRoute = graphData.routes[state.selectedCity];
    const pathNodes = activeRoute ? activeRoute.path : [];

    // 1. Arestas
    graphData.edges.forEach(edge => {
      const p1 = getPos(edge.from);
      const p2 = getPos(edge.to);

      const inPath = pathNodes.includes(edge.from) && pathNodes.includes(edge.to) &&
                     Math.abs(pathNodes.indexOf(edge.from) - pathNodes.indexOf(edge.to)) === 1;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (inPath) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (edge.weight && edge.weight !== '—') {
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        ctx.fillStyle = inPath ? '#fca5a5' : '#64748b';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(edge.weight, mx, my - 4);
      }
    });

    // 2. Pulso
    state.animStep += 0.035;
    if (pathNodes.length > 1) {
      const totalEdges = pathNodes.length - 1;
      const progress = (state.animStep % totalEdges);
      const curEdgeIdx = Math.floor(progress);
      const edgeT = progress - curEdgeIdx;

      if (curEdgeIdx < totalEdges) {
        const u = getPos(pathNodes[curEdgeIdx]);
        const v = getPos(pathNodes[curEdgeIdx + 1]);
        const pulseX = u.x + (v.x - u.x) * edgeT;
        const pulseY = u.y + (v.y - u.y) * edgeT;

        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // 3. Ambulância Física
    const amb = state.canvasAmbulance;
    if (amb.active && amb.path.length > 1) {
      const u = getPos(amb.path[amb.segmentIdx]);
      const v = getPos(amb.path[amb.segmentIdx + 1]);

      amb.t += amb.speed;
      if (amb.t >= 1) {
        amb.t = 0;
        amb.segmentIdx++;
        if (amb.segmentIdx >= amb.path.length - 1) {
          amb.segmentIdx = amb.path.length - 2;
          amb.t = 1;
          amb.active = false;
        }
      }

      amb.x = u.x + (v.x - u.x) * amb.t;
      amb.y = u.y + (v.y - u.y) * amb.t;
      amb.angle = Math.atan2(v.y - u.y, v.x - u.x);

      ctx.save();
      ctx.translate(amb.x, amb.y);
      ctx.rotate(amb.angle);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-12, -7, 24, 14);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-12, -2, 24, 5);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(5, -5, 4, 10);

      const beaconColor = Math.floor(Date.now() / 200) % 2 === 0 ? '#ef4444' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = beaconColor;
      ctx.shadowColor = beaconColor;
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.restore();
    }

    // 4. Vértices
    Object.keys(graphData.nodes).forEach(key => {
      const node = graphData.nodes[key];
      const p = getPos(key);
      const isOrigin = key === 'Iporá';
      const isTarget = activeRoute && pathNodes[pathNodes.length - 1] === key;
      const inPath = pathNodes.includes(key);

      ctx.beginPath();
      let radius = node.type === 'junction' ? 5 : 9;
      if (isOrigin || isTarget) radius = 12;

      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

      if (isOrigin) {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
      } else if (isTarget) {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
      } else if (inPath) {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowBlur = 5;
      } else {
        ctx.fillStyle = node.type === 'junction' ? '#475569' : '#0284c7';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = node.type === 'junction' ? 1 : 2;
      ctx.stroke();

      if (node.type !== 'junction' || isOrigin || isTarget) {
        ctx.fillStyle = (isOrigin || isTarget || inPath) ? '#ffffff' : '#94a3b8';
        ctx.font = isOrigin || isTarget ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label || key, p.x, p.y + radius + 13);
      }
    });

    state.animationFrameId = requestAnimationFrame(draw);
  }

  if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
  draw();

  canvas.onclick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    Object.keys(graphData.nodes).forEach(key => {
      const p = getPos(key);
      const dist = Math.hypot(p.x - mx, p.y - my);
      if (dist < 20) {
        const matchingCity = Object.keys(graphData.routes).find(c => {
          const r = graphData.routes[c];
          return r.path[r.path.length - 1] === key;
        });
        if (matchingCity) {
          selectCity(matchingCity);
          startAmbulanceDispatch();
          playSirenSound('vermelho');
        }
      }
    });
  };

  window.triggerAmbulanceRun = () => {
    startAmbulanceDispatch();
    playSirenSound('vermelho');
  };
}

function selectCity(cityName) {
  state.selectedCity = cityName;
  const selectEl = document.getElementById('select-city');
  if (selectEl) selectEl.value = cityName;

  const route = graphData.routes[cityName];
  if (!route) return;

  document.getElementById('res-city-name').textContent = cityName;
  document.getElementById('res-dist').textContent = `${route.dist.toFixed(1)} km`;
  document.getElementById('res-time').textContent = route.tempo;
  document.getElementById('res-status').textContent = route.status;

  const riskBadge = document.getElementById('res-risk');
  riskBadge.className = `badge-risk ${route.risk}`;
  riskBadge.textContent = route.risk === 'baixo' ? 'Baixo Risco' : route.risk === 'medio' ? 'Risco Médio' : 'Alto Risco (Crítico)';

  const pathStr = route.path.map(n => graphData.nodes[n]?.label || n).join(' ➜ ');
  document.getElementById('res-path').textContent = pathStr;

  const hudTransito = document.getElementById('hud-transito');
  const hudClima = document.getElementById('hud-clima');
  const hudRadio = document.getElementById('hud-radio');

  if (hudTransito) hudTransito.textContent = route.transito || 'Tráfego normal';
  if (hudClima) hudClima.textContent = route.clima || 'Pista seca';
  if (hudRadio) hudRadio.textContent = `Despacho USA-01 para ${cityName}`;
}

// ==============================================================================
// INICIALIZAÇÃO E EVENTOS
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initSlideDeck();

  // 1. Clique na Viatura Lateral acende a sirene
  const sideAmbulance = document.getElementById('page-switch-ambulance');
  if (sideAmbulance) {
    sideAmbulance.addEventListener('click', toggleSideAmbulanceSiren);
  }

  // 2. Botões de Códigos de Ocorrência (Slide 2)
  const codeBtns = document.querySelectorAll('.code-btn');
  codeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-code');
      triggerFlybyAmbulance(color);
    });
  });

  // 3. Sistema Geral de Revelação por Clique ("Clique para Apresentar")
  const revealBoxes = document.querySelectorAll('.click-reveal-box');
  revealBoxes.forEach(box => {
    box.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      const isRevealed = box.classList.toggle('revealed');
      const badge = box.querySelector('.reveal-hint-badge');
      if (badge) {
        badge.innerHTML = isRevealed ? '✅ Apresentado' : '👉 Clique para Apresentar';
      }
    });
  });

  // 4. Botão do Helicóptero
  const btnHeli = document.getElementById('btn-launch-helicopter');
  if (btnHeli) {
    btnHeli.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHelicopterLanding();
    });
  }

  const btnHeliClose = document.getElementById('btn-heli-close');
  if (btnHeliClose) {
    btnHeliClose.addEventListener('click', closeHelicopter);
  }

  // 5. Select do Simulador de Cidades
  const selectCityEl = document.getElementById('select-city');
  if (selectCityEl) {
    selectCityEl.addEventListener('change', (e) => {
      selectCity(e.target.value);
      if (window.triggerAmbulanceRun) window.triggerAmbulanceRun();
    });
    selectCity('Amorinópolis');
  }
});
