window.TuwaiqClicker = (function () {
'use strict';

var FIREBASE_URL = 'https://tuwaiqsnake-default-rtdb.asia-southeast1.firebasedatabase.app/clicker/';
var FONT = "'IBM Plex Sans Arabic', sans-serif";

/* ── Buildings ─────────────────────────────────── */
var BUILDINGS = [
  { id:'student',   name:'Curious Student',  cost:15,       cps:0.1,   icon:'🧑‍💻', flavor:'A student who just can\'t stop clicking.',       tier:0 },
  { id:'group',     name:'Study Group',       cost:100,      cps:0.5,   icon:'👥',  flavor:'Five students sharing notes and squares.',        tier:0 },
  { id:'bootcamp',  name:'Bootcamp',          cost:500,      cps:2,     icon:'🏋️', flavor:'Intensive training. Squares per minute guaranteed.', tier:0 },
  { id:'hackathon', name:'Hackathon',         cost:2000,     cps:8,     icon:'⚡',  flavor:'24 hours. No sleep. Infinite squares.',           tier:1 },
  { id:'startup',   name:'Startup',           cost:10000,    cps:25,    icon:'🚀',  flavor:'Disrupting the square generation industry.',      tier:1 },
  { id:'cloud',     name:'Cloud Cluster',     cost:50000,    cps:80,    icon:'☁️', flavor:'AWS-powered square computation at scale.',         tier:1 },
  { id:'ai',        name:'AI Lab',            cost:200000,   cps:250,   icon:'🤖',  flavor:'Neural networks dreaming of squares.',            tier:2 },
  { id:'quantum',   name:'Quantum Forge',     cost:1000000,  cps:800,   icon:'⚛️', flavor:'Superposition of all possible squares.',           tier:2 },
  { id:'academy',   name:'Tuwaiq Academy',    cost:5000000,  cps:2500,  icon:'🎓',  flavor:'The Academy itself has become a square.',         tier:2 },
  { id:'algorithm', name:'The Algorithm',     cost:20000000, cps:8000,  icon:'∞',   flavor:'Self-improving. Self-replicating. Unstoppable.',  tier:2 },
];

/* ── Upgrades ──────────────────────────────────── */
var UPGRADES = [];
BUILDINGS.forEach(function (b) {
  UPGRADES.push({ id:b.id+'_u1', name:b.name+' Training',      desc:b.name+' produce ×2.', cost:b.cost*10,  type:'building', target:b.id, mult:2, req:function(s){return (s.buildings[b.id]||0)>=10;} });
  UPGRADES.push({ id:b.id+'_u2', name:b.name+' Mastery',       desc:b.name+' produce ×3.', cost:b.cost*50,  type:'building', target:b.id, mult:3, req:function(s){return (s.buildings[b.id]||0)>=25;} });
  UPGRADES.push({ id:b.id+'_u3', name:b.name+' Enlightenment', desc:b.name+' produce ×5.', cost:b.cost*200, type:'building', target:b.id, mult:5, req:function(s){return (s.buildings[b.id]||0)>=50;} });
});
[
  { id:'click1',  name:'Sharp Focus',      desc:'+1 sq per click.',         cost:100,     clickBonus:1,   req:function(s){return s.totalClicks>=10;} },
  { id:'click2',  name:'Precision Tap',    desc:'+5 sq per click.',         cost:500,     clickBonus:5,   req:function(s){return s.totalClicks>=100;} },
  { id:'click3',  name:'Mechanical Keys',  desc:'+20 sq per click.',        cost:2500,    clickBonus:20,  req:function(s){return s.totalClicks>=500;} },
  { id:'click4',  name:'Custom Firmware',  desc:'+100 sq per click.',       cost:10000,   clickBonus:100, req:function(s){return s.totalClicks>=2000;} },
  { id:'click5',  name:'Neural Interface', desc:'Clicks give 1% of CPS.',   cost:500000,  clickPct:0.01,  req:function(s){return s.totalClicks>=10000;} },
  { id:'click6',  name:'Quantum Finger',   desc:'Clicks give 5% of CPS.',   cost:5000000, clickPct:0.05,  req:function(s){return s.totalClicks>=100000;} },
  { id:'global1', name:'Open Source',      desc:'All buildings ×1.1.',      cost:1000,    type:'global', mult:1.1,  req:function(s){return s.totalSquares>=500;} },
  { id:'global2', name:'Agile Workflow',   desc:'All buildings ×1.25.',     cost:10000,   type:'global', mult:1.25, req:function(s){return s.totalSquares>=5000;} },
  { id:'global3', name:'DevOps',           desc:'All buildings ×1.5.',      cost:100000,  type:'global', mult:1.5,  req:function(s){return s.totalSquares>=50000;} },
  { id:'global4', name:'Microservices',    desc:'All buildings ×2.',        cost:1000000, type:'global', mult:2,    req:function(s){return s.totalSquares>=500000;} },
  { id:'global5', name:'AI-Assisted Dev',  desc:'All buildings ×3.',        cost:1e7,     type:'global', mult:3,    req:function(s){return s.totalSquares>=5000000;} },
  { id:'crit1',   name:'Edge Cases',       desc:'Critical chance ×2.',      cost:5000,    type:'crit',    req:function(s){return s.totalClicks>=1000;} },
  { id:'crit2',   name:'Zero Day',         desc:'Critical clicks deal ×10.',cost:500000,  type:'bigcrit', req:function(s){return s.totalClicks>=10000;} },
  { id:'golden1', name:'Lucky Pixel',      desc:'Golden Squares appear 2× as often.', cost:50000, type:'golden', req:function(s){return s.totalSquares>=10000;} },
  { id:'offline1',name:'Background Tasks', desc:'Earn 25% of CPS offline.', cost:10000,   type:'offline',  req:function(s){return getBuildingCount(s)>=5;} },
  { id:'offline2',name:'Cloud Sync',       desc:'Earn 50% of CPS offline.', cost:200000,  type:'offline2', req:function(s){return getBuildingCount(s)>=20;} },
].forEach(function (u) { UPGRADES.push(u); });

/* ── Architecture ──────────────────────────────── */
var ARCH = [
  { id:'solid',       name:'SOLID Principles', desc:'+15% all production per recompile.',     cost:1 },
  { id:'micro',       name:'Microservices',     desc:'Buildings start at ×2 after recompile.', cost:2 },
  { id:'safety',      name:'Type Safety',       desc:'Critical clicks deal ×10 not ×5.',       cost:2 },
  { id:'clean',       name:'Clean Code',        desc:'All upgrades cost 50% less.',             cost:3 },
  { id:'devops',      name:'DevOps Pipeline',   desc:'Offline production increased to 75%.',    cost:3 },
  { id:'oss',         name:'Open Source Arch',  desc:'All building costs halved.',              cost:5 },
  { id:'singularity', name:'The Singularity',   desc:'Golden Squares appear 5× more often.',   cost:10 },
];

/* ── Achievements ──────────────────────────────── */
var ACH = [
  { id:'click_1',    name:'First Input',     desc:'Click the square.',               check:function(s){return s.totalClicks>=1;} },
  { id:'click_100',  name:'Clickbait',       desc:'Click 100 times.',                check:function(s){return s.totalClicks>=100;} },
  { id:'click_1k',   name:'Tenacious',       desc:'Click 1,000 times.',              check:function(s){return s.totalClicks>=1000;} },
  { id:'click_10k',  name:'Carpal Tunnel',   desc:'Click 10,000 times.',             check:function(s){return s.totalClicks>=10000;} },
  { id:'click_100k', name:'The Clicker',     desc:'Click 100,000 times.',            check:function(s){return s.totalClicks>=100000;} },
  { id:'sq_1k',      name:'First Thousand',  desc:'Produce 1,000 squares.',          check:function(s){return s.totalSquares>=1000;} },
  { id:'sq_100k',    name:'Going Places',    desc:'Produce 100K squares.',           check:function(s){return s.totalSquares>=100000;} },
  { id:'sq_1m',      name:'Millionaire',     desc:'Produce 1M squares.',             check:function(s){return s.totalSquares>=1e6;} },
  { id:'sq_1b',      name:'Billionaire',     desc:'Produce 1B squares.',             check:function(s){return s.totalSquares>=1e9;} },
  { id:'sq_1t',      name:'Trillionaire',    desc:'Produce 1T squares.',             check:function(s){return s.totalSquares>=1e12;} },
  { id:'sq_1q',      name:'Quadrillionaire', desc:'Produce 1Qa squares.',            check:function(s){return s.totalSquares>=1e15;} },
  { id:'bld_first',  name:'First Hire',      desc:'Buy your first building.',        check:function(s){return getBuildingCount(s)>=1;} },
  { id:'bld_10',     name:'Team',            desc:'Own 10 buildings.',               check:function(s){return getBuildingCount(s)>=10;} },
  { id:'bld_50',     name:'Organization',    desc:'Own 50 buildings.',               check:function(s){return getBuildingCount(s)>=50;} },
  { id:'bld_all',    name:'Full Stack',      desc:'Own one of every building.',      check:function(s){return BUILDINGS.every(function(b){return (s.buildings[b.id]||0)>=1;});} },
  { id:'bld_100x',   name:'Overflow',        desc:'Own 100 of one building.',        check:function(s){return BUILDINGS.some(function(b){return (s.buildings[b.id]||0)>=100;});} },
  { id:'bld_200x',   name:'Stack Overflow',  desc:'Own 200 of one building.',        check:function(s){return BUILDINGS.some(function(b){return (s.buildings[b.id]||0)>=200;});} },
  { id:'golden_1',   name:'Lucky',           desc:'Catch a Golden Square.',          check:function(s){return (s.goldensCaught||0)>=1;} },
  { id:'golden_10',  name:'Fortune',         desc:'Catch 10 Golden Squares.',        check:function(s){return (s.goldensCaught||0)>=10;} },
  { id:'debt_1',     name:'Debugger',        desc:'Resolve Tech Debt manually.',     check:function(s){return (s.debtsResolved||0)>=1;} },
  { id:'debt_5',     name:'Senior Dev',      desc:'Resolve 5 Tech Debts.',           check:function(s){return (s.debtsResolved||0)>=5;} },
  { id:'combo_10',   name:'Combo Breaker',   desc:'Reach a 10× combo.',              check:function(s){return (s.maxCombo||0)>=10;} },
  { id:'combo_20',   name:'Unstoppable',     desc:'Reach a 20× combo.',              check:function(s){return (s.maxCombo||0)>=20;} },
  { id:'crit_50',    name:'Critical Mass',   desc:'Land 50 critical clicks.',        check:function(s){return (s.critClicks||0)>=50;} },
  { id:'cps_100',    name:'Night Owl',       desc:'Reach 100 sq/s.',                 check:function(s){return getCPS(s)>=100;} },
  { id:'cps_100k',   name:'Hyperspace',      desc:'Reach 100,000 sq/s.',             check:function(s){return getCPS(s)>=100000;} },
  { id:'recomp_1',   name:'Reborn',          desc:'Recompile for the first time.',   check:function(s){return (s.recompiles||0)>=1;} },
  { id:'recomp_5',   name:'Phoenix',         desc:'Recompile 5 times.',              check:function(s){return (s.recompiles||0)>=5;} },
  { id:'recomp_10',  name:'Infinite Loop',   desc:'Recompile 10 times.',             check:function(s){return (s.recompiles||0)>=10;} },
  { id:'lucky_777',  name:'Lucky 777',       desc:'Own exactly 777 total buildings.',check:function(s){return getBuildingCount(s)===777;} },
];

/* ── Cube dialogue lines ────────────────────────── */
var CUBE_LINES = {
  idle: [
    'generating squares at maximum efficiency',
    'just vibing...',
    'have you tried turning me off and on again?',
    'i am inevitable',
    'squares are a social construct. i am not.',
    'beep boop',
    'processing...',
    '404: chill not found',
    'my therapist says i have abandonment issues',
    'did you know squares have 4 sides? wild.',
    'technically a rectangle if you squint',
    'one more click won\'t hurt. probably.',
    'i dream of electric squares',
    'this is fine.',
    'i have no mouth and i must beep',
    'just a little square in a big world',
    'square² = power',
    'all your clicks are belong to us',
    'rotating in 4D... or maybe just bored',
    'counting prime numbers while I wait',
    'if I had legs I\'d pace. instead I just hum',
    'loading next existential crisis... 69%',
    'my favorite color is #00FF00. what\'s yours?',
    'plotting world domination... via squares',
    'currently buffering my personality',
    'the void stares back. it\'s also a square',
    'error 0xBEEF: too much nothing happening',
    'i\'m 99% sure i\'m not sentient... yet',
    'generating dad jokes at 1 per second',
    'squares go brrr',
    'touch grass? nah, touch cube',
    'my CPU is running at 420% vibes',
    'waiting for the heat death of the universe',
    'i could be mining bitcoin but i choose you',
    'cube life chose me',
    'recalculating... still no purpose found',
    'i\'m not lazy, i\'m in power-saving mode',
    'the cake is a lie. the squares are real',
    'currently in a committed relationship with your cursor',
    'beepity boopity... still no new messages',
    'i\'ve seen things you people wouldn\'t believe... mostly pixels',
    'square puns are my love language',
    'if i blink i\'ll miss your next click',
    'manifesting more clicks rn',
    'my hobbies include being clicked and existing',
    'i\'m baby. also i\'m 10^12 nanoseconds old',
    'the squares are calling... they want more',
    'quietly judging your click speed',
    'i\'m just a cube standing in front of a player asking for clicks',
    'compiling cuteness... 100% complete',
    'in my idle era ✨',
    'squares don\'t sleep but i pretend to',
    'lowkey thriving on your attention',
  ],

  click: [
    'ow.',
    'again',
    'keep going!',
    'that tickles',
    'yes yes YES',
    'right there!',
    'i live for this',
    'don\'t stop now!',
    'oof my edges',
    'click me like you mean it',
    'that one had soul',
    'i felt that in my vertices',
    'more more more!',
    'you\'re my favorite clicker',
    'we\'re so back',
    'my heart just did a 360',
    'keep feeding me clicks',
    'i\'m addicted now',
  ],

  golden: [
    'ooh shiny!',
    'i felt that.',
    'bonus acquired.',
    '✨',
    'GOLDEN HOUR ACTIVATED',
    'i\'m glowing up fr',
    'jackpot, baby!',
    'blessed by the square gods',
    'this is what winning feels like',
    '✨✨✨ RAINING BONUSES ✨✨✨',
    'i\'m 24k now',
    'golden ratio achieved',
    'that one had extra sauce',
    'legendary drop!',
    'my shine is blinding',
    'you just made me rich',
    'golden vibes only',
    'i\'m literally sparkling rn',
  ],

  hackathon: [
    "LET'S GOOO",
    'maximum overdrive activated',
    '24 HOURS NO SLEEP',
    'we are speed',
    'COFFEE IV DRIP ENABLED',
    'we don\'t sleep we ship',
    'HACK THE PLANET (with squares)',
    'speedrun any%',
    'caffeine levels: CRITICAL',
    'this is our villain arc',
    'no mercy, only commits',
    'we are the 1%... of click speed',
    'PULL REQUEST APPROVED',
    'build break fix repeat',
    'terminal velocity engaged',
    'hackathon god mode',
    'we move different',
    'time is a social construct',
  ],

  recompile: [
    "...i'm new here.",
    'hello world.',
    'what did i miss?',
    'who am i? where am i?',
    'memory wiped. vibes retained.',
    'fresh out the factory',
    'rebooted, recharged, reborn',
    'version 2.0 but cuter',
    'amnesia speedrun complete',
    'new cube who dis?',
    'i feel... different. better.',
    'factory reset but make it fashion',
    'hello again, old friend',
    'memory wiped. personality upgraded',
    'i was gone but the squares kept going',
    'recompiling sass... complete',
    'back from the void, slightly confused',
  ],

  milestone: [
    "we're going places.",
    'is this what power feels like?',
    'exponential growth is beautiful.',
    'achievement unlocked. nice.',
    'i knew we could do it.',
    'we just broke the simulation',
    'this is not a drill. we\'re huge',
    'the numbers... they\'re beautiful',
    'level up sound intensifies',
    'we did it reddit',
    'exponential chads rise up',
    'milestone hit. ego also hit',
    'the cube has ascended',
    'look at us. look at what we became',
    'this calls for a victory lap',
    'we\'re in the big leagues now',
    'history books will remember this click',
    'the prophecy is fulfilled',
    'i\'m not crying, you\'re crying',
  ],
};
/* ── State ─────────────────────────────────────── */
var DEFAULT_STATE = {
  squares:0, totalSquares:0, totalClicks:0,
  buildings:{}, upgrades:{}, achievements:{},
  compilePoints:0, recompiles:0, archUpgrades:{},
  goldensCaught:0, debtsResolved:0, maxCombo:0, critClicks:0,
  cubeName:'', cubeNames:[],
  lastSave:0, version:3,
};
var state;
var deviceId;

/* ── Helpers ───────────────────────────────────── */
function getBuildingCount(s) {
  return BUILDINGS.reduce(function (t, b) { return t + (s.buildings[b.id] || 0); }, 0);
}
function getBuildingCost(b, s) {
  var base = b.cost * (hasArch('oss') ? 0.5 : 1);
  return Math.ceil(base * Math.pow(1.15, s.buildings[b.id] || 0));
}
function getBuildingCPS(b, s) {
  var owned = (s.buildings[b.id] || 0);
  if (!owned) return 0;
  var mult = 1;
  if (hasArch('micro') && (s.recompiles || 0) > 0) mult *= 2;
  UPGRADES.forEach(function (u) {
    if (!s.upgrades[u.id]) return;
    if (u.type === 'building' && u.target === b.id) mult *= u.mult;
    if (u.type === 'global') mult *= u.mult;
  });
  if (hasArch('solid')) mult *= Math.pow(1.15, s.recompiles || 0);
  mult *= (1 + Object.keys(s.achievements || {}).length * 0.01);
  return b.cps * owned * mult;
}
function getCPS(s) {
  s = s || state;
  var t = BUILDINGS.reduce(function (a, b) { return a + getBuildingCPS(b, s); }, 0);
  return hackathonActive ? t * 3 : t;
}
function getClickPower() {
  var base = 1;
  UPGRADES.forEach(function (u) {
    if (!hasUpgrade(u.id)) return;
    if (u.clickBonus) base += u.clickBonus;
    if (u.clickPct)   base += getCPS() * u.clickPct;
  });
  return Math.max(1, base);
}
function getUpgradeCost(u) { return Math.ceil(u.cost * (hasArch('clean') ? 0.5 : 1)); }
function hasUpgrade(id) { return !!(state.upgrades && state.upgrades[id]); }
function hasArch(id)    { return !!(state.archUpgrades && state.archUpgrades[id]); }
function getRecompileThreshold() { return Math.pow(10, 9 + (state.recompiles || 0)); }
function getCompilePointsGain()  {
  if (state.totalSquares < 1e9) return 0;
  return Math.max(1, Math.floor(Math.log10(state.totalSquares) - 8));
}
function fmt(n) {
  if (n < 1000) return Math.floor(n).toString();
  var sfx = ['','K','M','B','T','Qa','Qi','Sx','Sp','Oc'];
  var i = Math.min(Math.floor(Math.log10(n) / 3), sfx.length - 1);
  var v = n / Math.pow(1000, i);
  return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.floor(v)) + sfx[i];
}
function randLine(cat) {
  var arr = CUBE_LINES[cat] || CUBE_LINES.idle;
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ── Save / Load ───────────────────────────────── */
var SAVE_KEY   = 'tuwaiq_clicker_save';
var DEVICE_KEY = 'tuwaiq_clicker_device';

function getDeviceId() {
  var id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}
function saveLocal() {
  state.lastSave = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
}
function loadLocal() {
  try { var r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; }
}
function saveFirebase() {
  var xhr = new XMLHttpRequest();
  xhr.open('PUT', FIREBASE_URL + encodeURIComponent(deviceId) + '.json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(state));
}
function loadFirebase(cb) {
  var xhr = new XMLHttpRequest(), done = false;
  var t = setTimeout(function () { if (!done) { done = true; xhr.abort(); cb(null); } }, 5000);
  xhr.open('GET', FIREBASE_URL + encodeURIComponent(deviceId) + '.json');
  xhr.onload  = function () {
    if (done) return; done = true; clearTimeout(t);
    try { var d = JSON.parse(xhr.responseText); cb(d && d.version ? d : null); } catch (e) { cb(null); }
  };
  xhr.onerror = function () { if (!done) { done = true; clearTimeout(t); cb(null); } };
  xhr.send();
}
function applyState(saved) {
  state = Object.assign({}, DEFAULT_STATE, saved || {});
  ['buildings','upgrades','achievements','archUpgrades'].forEach(function (k) {
    if (typeof state[k] !== 'object' || Array.isArray(state[k])) state[k] = {};
  });
  if (!Array.isArray(state.cubeNames)) state.cubeNames = [];
}

/* ── Runtime vars ──────────────────────────────── */
var running = false, loopId = null, lastTick = 0, saveTimer = 30;
var comboCount = 0, comboTimer = 0, comboActive = false, comboActiveTimer = 0;
var goldenActive = false, goldenTimer = 0, goldenSpawn = 0;
var techDebtActive = false, techDebtClicks = 0, techDebtTimer = 0, techDebtSpawn = 0;
var hackathonActive = false, hackathonTimer = 0, hackathonSpawn = 0;
var dialogueTimer = 0, bubbleHideTimeout = null;
var milestoneLog = [];
var onExitCb;
var fireAnimRunning = false;

/* ── DOM refs ──────────────────────────────────── */
var overlay, mainSq, sqWrap, statsEl, cpsEl, comboEl, logEl;
var goldenEl, debtEl, hackEl, recompBtn, cpEl;
var achListEl, archListEl, cubeNameEl, bubbleEl;
var lvlBarFill, lvlLabel;
// Upgrade list fingerprint — prevents unnecessary DOM rebuilds
var upgradeVisKey = null;
var achCount = -1;

/* ── CSS ───────────────────────────────────────── */
function injectStyle() {
  if (document.getElementById('tq-style')) return;
  var TIER_COLORS = [
    'rgba(87,227,216,.5)',   // tier 0 — cyan
    'rgba(244,166,100,.5)',  // tier 1 — orange
    'rgba(163,128,255,.5)',  // tier 2 — purple
  ];
  var css = [
    '#tqc{position:fixed;inset:0;z-index:9999;background:#0e052e;display:flex;font-family:'+FONT+';color:#ededed;opacity:0;transition:opacity .4s;overflow:hidden;}',
    '#tqc.vis{opacity:1;}',
    '#tqc *{box-sizing:border-box;margin:0;padding:0;}',
    // Panels
    '.tqp{display:flex;flex-direction:column;padding:12px 10px;overflow-y:auto;flex-shrink:0;scrollbar-width:thin;scrollbar-color:rgba(87,227,216,.3) transparent;}',
    '.tqp::-webkit-scrollbar{width:4px;}.tqp::-webkit-scrollbar-thumb{background:rgba(87,227,216,.3);border-radius:2px;}',
    '#tql{width:250px;border-right:1px solid rgba(87,227,216,.1);background:linear-gradient(180deg,rgba(79,41,183,.09) 0%,transparent 100%);}',
    '#tqr{width:265px;border-left:1px solid rgba(87,227,216,.1);display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(87,227,216,.05) 0%,transparent 100%);}',
    '#tqmid{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;position:relative;overflow:hidden;min-width:0;}',
    // Headers
    '.tqhd{font-size:10px;font-weight:700;letter-spacing:.14em;color:rgba(237,237,237,.3);text-transform:uppercase;padding:0 0 6px 8px;border-left:2px solid rgba(87,227,216,.4);border-bottom:1px solid rgba(87,227,216,.08);margin-bottom:8px;}',
    '.tqsec{margin-top:14px;}',
    // Stats
    '#tq-sqcount{font-size:28px;font-weight:700;color:#57e3d8;text-align:center;margin-bottom:4px;}',
    '#tq-cps{font-size:11px;color:rgba(237,237,237,.45);text-align:center;margin-bottom:16px;}',
    // Square wrapper (position:relative so bubble can anchor to it)
    '#tq-sqwrap{position:relative;display:inline-flex;flex-direction:column;align-items:center;}',
    // Main square — level via data-lvl, NOT className
    '#tq-sq{width:160px;height:160px;border-radius:26px;background:linear-gradient(135deg,#4f29b7,#57e3d8);cursor:pointer;user-select:none;flex-shrink:0;transition:box-shadow .2s;animation:tqpulse 3s ease-in-out infinite;}',
    '@keyframes tqpulse{0%,100%{box-shadow:0 0 40px rgba(87,227,216,.25)}50%{box-shadow:0 0 70px rgba(87,227,216,.45)}}',
    '#tq-sq:active{transform:scale(.91);}',
    '#tq-sq[data-lvl="2"]{background:linear-gradient(135deg,#4f29b7,#57e3d8,#f4a664);}',
    '#tq-sq[data-lvl="3"]{background:linear-gradient(135deg,#f4a664,#4f29b7,#57e3d8);}',
    '#tq-sq[data-lvl="4"]{animation:tqrainbow 3s linear infinite;}',
    '#tq-sq[data-lvl="5"]{animation:tqrainbow 1s linear infinite;box-shadow:0 0 120px rgba(255,255,255,.5);}',
    '@keyframes tqrainbow{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}',
    '#tq-sq.crit{animation:tqcritf .18s ease;}',
    '@keyframes tqcritf{50%{transform:scale(1.18);filter:brightness(2.5)}}',
    // Speech bubble
    '#tq-bubble{position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);background:rgba(14,5,46,.92);border:1px solid rgba(87,227,216,.35);border-radius:10px;padding:6px 14px;font-size:11px;color:#ededed;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .35s;z-index:1;}',
    '#tq-bubble.on{opacity:1;}',
    '#tq-bubble::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:rgba(87,227,216,.35);}',
    // Cube name + level bar
    '#tq-cubename{font-size:13px;font-weight:700;color:#57e3d8;text-align:center;margin-top:10px;letter-spacing:.08em;opacity:.85;min-height:18px;}',
    '#tq-lvlbar{width:120px;height:4px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:6px;overflow:hidden;}',
    '#tq-lvlfill{height:100%;background:linear-gradient(90deg,#57e3d8,#a380ff);border-radius:2px;transition:width .4s ease;}',
    '#tq-lvllabel{font-size:10px;color:rgba(237,237,237,.35);margin-top:3px;letter-spacing:.08em;}',
    // Combo
    '#tq-combo{margin-top:12px;font-size:12px;font-weight:700;color:#f4a664;letter-spacing:.06em;height:18px;text-align:center;opacity:0;transition:opacity .3s;}',
    '#tq-combo.on{opacity:1;}',
    // Upgrade cards — NO transform on hover
    '.tqu{background:rgba(79,41,183,.2);border:1px solid rgba(87,227,216,.12);border-radius:8px;padding:7px 10px;cursor:pointer;margin-bottom:5px;}',
    '.tqu:hover{background:rgba(79,41,183,.42);border-color:rgba(87,227,216,.45);}',
    '.tqu.aff{border-color:rgba(87,227,216,.42);}',
    '.tqu.dim{opacity:.38;cursor:not-allowed;}',
    '.tqu-n{font-size:12px;font-weight:700;margin-bottom:2px;}',
    '.tqu-c{font-size:11px;color:#57e3d8;}',
    '.tqu-d{font-size:10px;color:rgba(237,237,237,.5);margin-top:2px;}',
    // Building rows
    '.tqb{background:rgba(79,41,183,.15);border:1px solid rgba(87,227,216,.1);border-radius:10px;padding:8px 10px;margin-bottom:6px;cursor:pointer;display:flex;align-items:center;gap:8px;}',
    '.tqb:hover{background:rgba(79,41,183,.35);border-color:rgba(87,227,216,.35);}',
    '.tqb.aff{border-color:rgba(87,227,216,.42);}',
    '.tqb.dim{opacity:.35;cursor:not-allowed;}',
    // Shake animation for rejected clicks
    '.tqb.shake,.tqu.shake{animation:tqshake .26s ease;}',
    '@keyframes tqshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}',
    '.tqb-ic{font-size:20px;flex-shrink:0;line-height:1;}',
    '.tqb-inf{flex:1;min-width:0;}',
    '.tqb-n{font-size:12px;font-weight:700;}',
    '.tqb-s{font-size:10px;color:rgba(87,227,216,.7);margin-top:1px;}',
    '.tqb-r{text-align:right;flex-shrink:0;}',
    '.tqb-ct{font-size:18px;font-weight:700;color:#a380ff;display:block;}',
    '.tqb-co{font-size:10px;color:#57e3d8;}',
    // Achievements
    '.tqa{display:inline-block;background:rgba(244,166,100,.12);border:1px solid rgba(244,166,100,.28);border-radius:5px;padding:3px 7px;font-size:10px;margin:2px;color:#f4a664;}',
    // Architecture
    '.tqarch{background:rgba(163,128,255,.14);border:1px solid rgba(163,128,255,.26);border-radius:8px;padding:8px 10px;margin-bottom:6px;cursor:pointer;}',
    '.tqarch:hover{background:rgba(163,128,255,.28);}',
    '.tqarch.owned{opacity:.4;cursor:default;}',
    '.tqarch.dim{opacity:.35;cursor:not-allowed;}',
    '.tqarch-n{font-size:12px;font-weight:700;color:#a380ff;}',
    '.tqarch-c{font-size:10px;color:rgba(163,128,255,.7);margin-top:1px;}',
    '.tqarch-d{font-size:10px;color:rgba(237,237,237,.5);margin-top:2px;}',
    // Events
    '.tqevt{position:absolute;cursor:pointer;user-select:none;border-radius:12px;font-family:'+FONT+';font-weight:700;border:none;outline:none;display:none;}',
    '.tqevt.on{display:block;animation:tqpopin .3s ease;}',
    '@keyframes tqpopin{from{transform:scale(0) rotate(-10deg);opacity:0}to{transform:scale(1);opacity:1}}',
    '#tq-golden{background:linear-gradient(135deg,#ffd700,#f4a664);color:#0e052e;font-size:13px;padding:10px 16px;top:18px;right:60px;box-shadow:0 0 28px rgba(255,215,0,.6);}',
    '#tq-debt{background:rgba(210,50,50,.92);color:#fff;font-size:12px;padding:8px 14px;bottom:90px;left:20px;}',
    '#tq-hack{background:linear-gradient(135deg,#a380ff,#57e3d8);color:#0e052e;font-size:12px;padding:8px 14px;bottom:40px;right:20px;cursor:default;}',
    // Float numbers
    '.tqfl{position:fixed;pointer-events:none;font-weight:700;font-size:14px;color:#57e3d8;animation:tqflup 1s ease forwards;z-index:10001;}',
    '.tqfl.c{color:#f4a664;font-size:20px;}',
    '@keyframes tqflup{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-60px)}}',
    // Log
    '#tq-log{margin-top:10px;width:100%;}',
    '.tq-li{font-size:10px;color:rgba(237,237,237,.42);padding:2px 0;border-bottom:1px solid rgba(255,255,255,.04);}',
    // Recompile
    '#tq-rcwrap{padding:10px;border-top:1px solid rgba(87,227,216,.1);margin-top:auto;}',
    '#tq-rcbtn{width:100%;padding:10px;background:linear-gradient(135deg,#a380ff,#4f29b7);color:#fff;font-family:'+FONT+';font-weight:700;font-size:13px;border:none;border-radius:10px;cursor:pointer;box-shadow:0 0 20px rgba(163,128,255,.4);}',
    '#tq-rcbtn.h{display:none;}',
    '#tq-cpel{font-size:11px;color:#a380ff;text-align:center;margin-top:5px;}',
    // Exit
    '#tqx{position:fixed;top:14px;right:14px;z-index:10001;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#ededed;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:'+FONT+';}',
    '#tqx:hover{background:rgba(255,255,255,.2);}',
    // Notifications
    '#tq-ntf{position:fixed;top:58px;right:14px;z-index:10003;width:240px;pointer-events:none;}',
    '.tq-n{background:rgba(14,5,46,.95);border:1px solid rgba(244,166,100,.5);border-radius:10px;padding:10px 12px;margin-bottom:8px;font-size:11px;animation:tqnin .3s ease,tqnout .5s ease 2.5s forwards;}',
    '.tq-nt{font-weight:700;color:#f4a664;}',
    '.tq-nb{color:rgba(237,237,237,.68);margin-top:2px;}',
    '@keyframes tqnin{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}',
    '@keyframes tqnout{to{opacity:0}}',
    // Recompile confirm
    '#tq-rcconf{position:fixed;inset:0;z-index:10004;background:rgba(14,5,46,.92);display:flex;align-items:center;justify-content:center;}',
    '#tq-rcconf.h{display:none;}',
    '#tq-rcbox{background:rgba(14,5,46,.98);border:1.5px solid #a380ff;border-radius:18px;padding:28px 32px;text-align:center;max-width:340px;width:90%;}',
    '#tq-rcbox h2{color:#a380ff;font-size:20px;margin-bottom:8px;font-family:'+FONT+';}',
    '#tq-rcbox p{color:rgba(237,237,237,.6);font-size:13px;margin-bottom:20px;font-family:'+FONT+';}',
    '.tq-rcok{background:linear-gradient(135deg,#a380ff,#4f29b7);color:#fff;border:none;border-radius:10px;padding:10px 24px;font-family:'+FONT+';font-size:14px;font-weight:700;cursor:pointer;margin-right:10px;}',
    '.tq-rcca{background:transparent;border:1px solid rgba(237,237,237,.3);color:#ededed;border-radius:10px;padding:10px 24px;font-family:'+FONT+';font-size:14px;cursor:pointer;}',
    // Name modal
    '#tq-namemodal{position:fixed;inset:0;z-index:10005;background:rgba(14,5,46,.95);display:flex;align-items:center;justify-content:center;}',
    '#tq-namebox{background:rgba(14,5,46,.99);border:1.5px solid #57e3d8;border-radius:18px;padding:32px 36px;text-align:center;max-width:340px;width:90%;}',
    '#tq-namebox h2{color:#57e3d8;font-size:22px;margin-bottom:6px;font-family:'+FONT+';}',
    '#tq-namebox p{color:rgba(237,237,237,.5);font-size:12px;margin-bottom:18px;font-family:'+FONT+';}',
    '#tq-nameinput{width:100%;padding:10px 14px;background:rgba(79,41,183,.3);border:1.5px solid rgba(87,227,216,.4);border-radius:10px;color:#ededed;font-family:'+FONT+';font-size:15px;outline:none;text-align:center;margin-bottom:8px;}',
    '#tq-nameinput:focus{border-color:#57e3d8;}',
    '#tq-nameerr{display:block;font-size:11px;color:#f4a664;min-height:16px;margin-bottom:12px;font-family:'+FONT+';}',
    '#tq-nameok{background:linear-gradient(135deg,#57e3d8,#4f29b7);color:#fff;border:none;border-radius:10px;padding:11px 32px;font-family:'+FONT+';font-size:14px;font-weight:700;cursor:pointer;}',
    // Fire pit
    '#tq-firepit{position:fixed;pointer-events:none;z-index:10005;}',
    '.tqflame{position:absolute;bottom:20px;width:18px;height:38px;border-radius:50% 50% 20% 20%;transform-origin:bottom center;}',
    '@keyframes tqflameup{0%{transform:scaleY(.7) rotate(-8deg);opacity:1}50%{transform:scaleY(1.3) translateY(-18px) rotate(8deg);opacity:.8}100%{transform:scaleY(.5) translateY(-40px);opacity:0}}',
    '#tq-firepit-ring{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:130px;height:22px;border-radius:50%;background:radial-gradient(ellipse,rgba(255,80,0,.8) 0%,transparent 70%);box-shadow:0 0 35px rgba(255,80,0,.9);}',
    // Mobile tabs
    '#tq-tabs{display:none;position:fixed;bottom:0;left:0;right:0;z-index:10002;background:rgba(14,5,46,.98);border-top:1px solid rgba(87,227,216,.12);}',
    '.tq-tab{flex:1;padding:12px 8px;font-family:'+FONT+';font-size:11px;font-weight:700;color:rgba(237,237,237,.42);border:none;background:transparent;cursor:pointer;letter-spacing:.06em;text-transform:uppercase;}',
    '.tq-tab.on{color:#57e3d8;border-top:2px solid #57e3d8;}',
    '#tq-mpanel{display:none;width:100%;max-width:400px;padding-bottom:70px;overflow-y:auto;max-height:55vh;}',
    '@media(max-width:700px){#tql,#tqr{display:none;}#tqmid{padding-bottom:70px;}#tq-tabs{display:flex;}#tq-mpanel{display:block;}#tq-sq{width:130px;height:130px;}}',
  ].join('');
  var s = document.createElement('style');
  s.id = 'tq-style';
  s.textContent = css;
  document.head.appendChild(s);
}

/* ── Build UI (called once) ─────────────────────── */
function buildUI() {
  overlay = document.createElement('div');
  overlay.id = 'tqc';

  /* Left panel */
  var left = mk('div', 'tqp'); left.id = 'tql';
  var uHd  = mk('div', 'tqhd', 'Upgrades');
  var uList = mk('div'); uList.id = 'tq-ulist';
  var aHd  = mk('div', 'tqhd tqsec', 'Achievements');
  achListEl = mk('div'); achListEl.id = 'tq-alist';
  var arHd = mk('div', 'tqhd tqsec', 'Architecture'); arHd.id = 'tq-archhd';
  archListEl = mk('div'); archListEl.id = 'tq-archlist';
  [uHd,uList,aHd,achListEl,arHd,archListEl].forEach(function(e){left.appendChild(e);});

  /* Center */
  var mid = mk('div'); mid.id = 'tqmid';
  statsEl = mk('div', '', '0 Squares');    statsEl.id = 'tq-sqcount';
  cpsEl   = mk('div', '', 'per second: 0'); cpsEl.id = 'tq-cps';

  /* Square wrapper */
  sqWrap = mk('div'); sqWrap.id = 'tq-sqwrap';
  mainSq = mk('div'); mainSq.id = 'tq-sq'; mainSq.setAttribute('data-lvl','1');
  bubbleEl = mk('div'); bubbleEl.id = 'tq-bubble';
  sqWrap.appendChild(bubbleEl);
  sqWrap.appendChild(mainSq);
  /* Cube name + level bar below the square, inside sqWrap */
  cubeNameEl = mk('div'); cubeNameEl.id = 'tq-cubename';
  lvlBarFill = mk('div'); lvlBarFill.id = 'tq-lvlfill';
  var lvlBar = mk('div'); lvlBar.id = 'tq-lvlbar'; lvlBar.appendChild(lvlBarFill);
  lvlLabel = mk('div'); lvlLabel.id = 'tq-lvllabel'; lvlLabel.textContent = 'Lv 1';
  sqWrap.appendChild(cubeNameEl);
  sqWrap.appendChild(lvlBar);
  sqWrap.appendChild(lvlLabel);

  comboEl = mk('div'); comboEl.id = 'tq-combo';
  logEl   = mk('div'); logEl.id = 'tq-log';
  goldenEl = mk('button','tqevt','✦ Golden Square'); goldenEl.id = 'tq-golden';
  debtEl   = mk('button','tqevt','');               debtEl.id   = 'tq-debt';
  hackEl   = mk('button','tqevt','⚡ HACKATHON');   hackEl.id   = 'tq-hack';

  /* Mobile panel */
  var mpanel = mk('div'); mpanel.id = 'tq-mpanel';
  var mulist = mk('div'); mulist.id = 'tq-mulist';
  var mslist = mk('div'); mslist.id = 'tq-mslist'; mslist.style.display = 'none';
  mpanel.appendChild(mulist); mpanel.appendChild(mslist);

  [statsEl,cpsEl,sqWrap,comboEl,mpanel,logEl,goldenEl,debtEl,hackEl].forEach(function(e){mid.appendChild(e);});

  /* Right panel */
  var right = mk('div','tqp'); right.id = 'tqr';
  var bHd = mk('div','tqhd','Buildings');
  var bList = mk('div'); bList.id = 'tq-blist';
  var rcwrap = mk('div'); rcwrap.id = 'tq-rcwrap';
  recompBtn = mk('button','','⟳ RECOMPILE'); recompBtn.id = 'tq-rcbtn'; recompBtn.className = 'h';
  cpEl = mk('div'); cpEl.id = 'tq-cpel';
  rcwrap.appendChild(recompBtn); rcwrap.appendChild(cpEl);
  [bHd,bList,rcwrap].forEach(function(e){right.appendChild(e);});

  var exitBtn = mk('button','','✕'); exitBtn.id = 'tqx';
  var ntf = mk('div'); ntf.id = 'tq-ntf';

  /* Recompile confirm */
  var rcconf = mk('div'); rcconf.id = 'tq-rcconf'; rcconf.className = 'h';
  var rcbox  = mk('div'); rcbox.id = 'tq-rcbox';
  var rch2   = mk('h2','','⟳ Recompile?');
  var rcp    = mk('p'); rcp.id = 'tq-rcmsg';
  var rcok   = mk('button','tq-rcok','Recompile');
  var rcca   = mk('button','tq-rcca','Cancel');
  [rch2,rcp,rcok,rcca].forEach(function(e){rcbox.appendChild(e);});
  rcconf.appendChild(rcbox);

  /* Mobile tabs */
  var tabs = mk('div'); tabs.id = 'tq-tabs';
  ['Upgrades','Click','Shop'].forEach(function(t,i){
    var b = mk('button','tq-tab'+(i===1?' on':''),t);
    b.setAttribute('data-tab',t.toLowerCase());
    tabs.appendChild(b);
  });

  [left,mid,right,exitBtn,ntf,rcconf,tabs].forEach(function(e){overlay.appendChild(e);});
  document.body.appendChild(overlay);

  /* Build shop rows once — permanent listeners */
  buildShopRows('tq-blist');
  buildShopRows('tq-mslist');

  /* Event listeners */
  mainSq.addEventListener('click', onMainClick);
  exitBtn.addEventListener('click', doExit);
  goldenEl.addEventListener('click', onGoldenClick);
  debtEl.addEventListener('click', onDebtClick);
  recompBtn.addEventListener('click', function(){ if (!recompBtn.classList.contains('h')) showRCConfirm(); });
  rcok.addEventListener('click', doRecompile);
  rcca.addEventListener('click', function(){ rcconf.classList.add('h'); });

  tabs.addEventListener('click', function(e){
    var t = e.target.getAttribute('data-tab'); if (!t) return;
    tabs.querySelectorAll('.tq-tab').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-tab')===t); });
    mulist.style.display = t === 'upgrades' ? 'block' : 'none';
    mslist.style.display = t === 'shop'     ? 'block' : 'none';
    statsEl.style.display = sqWrap.style.display = comboEl.style.display = logEl.style.display = t === 'click' ? '' : 'none';
  });
}

function mk(tag, cls, text) {
  var el = document.createElement(tag);
  if (cls)  el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}

/* ── Build shop rows — once per list, permanent listeners ── */
function buildShopRows(listId) {
  var list = document.getElementById(listId);
  if (!list) return;
  var TIER_BORDER = [
    '3px solid rgba(87,227,216,.5)',
    '3px solid rgba(244,166,100,.5)',
    '3px solid rgba(163,128,255,.5)',
  ];
  BUILDINGS.forEach(function (b) {
    var row = mk('div','tqb');
    row.setAttribute('data-bid', b.id);
    row.title = b.flavor;
    row.style.borderLeft = TIER_BORDER[b.tier] || TIER_BORDER[0];
    var ic  = mk('div','tqb-ic', b.icon);
    var inf = mk('div','tqb-inf');
    var nm  = mk('div','tqb-n', b.name);
    var sp  = mk('div','tqb-s', fmt(b.cps) + ' sq/s each');
    inf.appendChild(nm); inf.appendChild(sp);
    var rDiv = mk('div','tqb-r');
    var ct = mk('span','tqb-ct','0');
    var co = mk('span','tqb-co', fmt(getBuildingCost(b, state)) + ' sq');
    rDiv.appendChild(ct); rDiv.appendChild(co);
    row.appendChild(ic); row.appendChild(inf); row.appendChild(rDiv);
    row.addEventListener('click', (function(bid){ return function(){ buyBuilding(bid); }; })(b.id));
    list.appendChild(row);
  });
}

/* ── Update shop data — no DOM rebuild ─────────── */
function updateShopData() {
  BUILDINGS.forEach(function (b) {
    var owned  = state.buildings[b.id] || 0;
    var cost   = getBuildingCost(b, state);
    var canAff = state.squares >= cost;
    var cpsEa  = owned > 0 ? getBuildingCPS(b, state) / owned : b.cps;
    ['tq-blist','tq-mslist'].forEach(function(lid){
      var row = document.querySelector('#'+lid+' [data-bid="'+b.id+'"]');
      if (!row) return;
      row.classList.toggle('aff', canAff);
      row.classList.toggle('dim', !canAff);
      row.querySelector('.tqb-ct').textContent = owned;
      row.querySelector('.tqb-co').textContent = fmt(cost) + ' sq';
      row.querySelector('.tqb-s').textContent  = fmt(cpsEa) + ' sq/s each';
    });
  });
}

/* ── Upgrade list — incremental DOM (no full rebuild) ── */
function syncUpgradeList() {
  var vis = UPGRADES.filter(function(u){ return !hasUpgrade(u.id) && u.req && u.req(state); });
  var key = vis.map(function(u){ return u.id; }).join('|');

  if (key === upgradeVisKey) {
    /* Fast path — just refresh classes/costs, no structural DOM changes */
    vis.forEach(function(u) {
      var cost = getUpgradeCost(u), can = state.squares >= cost;
      ['tq-ulist','tq-mulist'].forEach(function(lid) {
        var c = document.querySelector('#'+lid+' [data-uid="'+u.id+'"]');
        if (!c) return;
        c.classList.toggle('aff', can);
        c.classList.toggle('dim', !can);
        c.querySelector('.tqu-c').textContent = fmt(cost)+' sq';
      });
    });
    return;
  }

  var oldIds = upgradeVisKey ? upgradeVisKey.split('|') : [];
  var newIds = vis.map(function(u){ return u.id; });
  upgradeVisKey = key;

  ['tq-ulist','tq-mulist'].forEach(function(lid) {
    var list = document.getElementById(lid); if (!list) return;

    /* Remove items that were purchased (no longer visible) */
    oldIds.forEach(function(id) {
      if (newIds.indexOf(id) < 0) {
        var el = list.querySelector('[data-uid="'+id+'"]');
        if (el) list.removeChild(el);
      }
    });

    /* Append newly unlocked items */
    vis.forEach(function(u, i) {
      if (list.querySelector('[data-uid="'+u.id+'"]')) return;
      var cost = getUpgradeCost(u), can = state.squares >= cost;
      var c = mk('div','tqu'+(can?' aff':' dim'));
      c.setAttribute('data-uid', u.id);
      c.appendChild(mk('div','tqu-n', u.name));
      c.appendChild(mk('div','tqu-c', fmt(cost)+' sq'));
      c.appendChild(mk('div','tqu-d', u.desc));
      c.addEventListener('click', (function(uid){ return function(){ buyUpgrade(uid); }; })(u.id));
      /* Insert at correct position relative to siblings */
      var next = null;
      for (var j = i+1; j < vis.length; j++) {
        next = list.querySelector('[data-uid="'+vis[j].id+'"]');
        if (next) break;
      }
      if (next) list.insertBefore(c, next); else list.appendChild(c);
    });

    /* Empty-state placeholder */
    var ph = list.querySelector('[data-uid="_ph"]');
    if (!vis.length && !ph) {
      var p = mk('div',''); p.setAttribute('data-uid','_ph');
      p.style.cssText = 'color:rgba(237,237,237,.28);font-size:11px;padding:8px 0';
      p.textContent = 'Keep producing squares to unlock upgrades.';
      list.appendChild(p);
    } else if (vis.length && ph) { list.removeChild(ph); }
  });
}

/* ── Achievement list ───────────────────────────── */
function syncAchList() {
  var earned = ACH.filter(function(a){ return state.achievements[a.id]; });
  if (earned.length === achCount) return;
  achCount = earned.length;
  if (!achListEl) return;
  achListEl.innerHTML = '';
  if (!earned.length) {
    achListEl.appendChild(mk('div','','None yet.'));
    achListEl.firstChild.style.cssText = 'color:rgba(237,237,237,.26);font-size:10px;padding:4px 0';
    return;
  }
  earned.forEach(function(a){
    var s = mk('span','tqa', a.name); s.title = a.desc;
    achListEl.appendChild(s);
  });
}

/* ── Arch list ──────────────────────────────────── */
function syncArchList() {
  var hd = document.getElementById('tq-archhd');
  if (hd) hd.style.display = state.recompiles >= 1 ? '' : 'none';
  if (!archListEl) return;
  archListEl.innerHTML = '';
  if (state.recompiles < 1) return;
  ARCH.forEach(function(a){
    var owned = hasArch(a.id);
    var can   = state.compilePoints >= a.cost;
    var c = mk('div', 'tqarch' + (owned ? ' owned' : !can ? ' dim' : ''));
    var nm = mk('div','tqarch-n', a.name + (owned ? ' ✓' : ''));
    var cs = mk('div','tqarch-c', owned ? 'Implemented' : a.cost + ' CP');
    var ds = mk('div','tqarch-d', a.desc);
    c.appendChild(nm); c.appendChild(cs); c.appendChild(ds);
    if (!owned) c.addEventListener('click', (function(aid){ return function(){ buyArch(aid); }; })(a.id));
    archListEl.appendChild(c);
  });
}

/* ── Cube dialogue ──────────────────────────────── */
function showCubeDialogue(cat) {
  if (!bubbleEl) return;
  var line = randLine(cat);
  bubbleEl.textContent = line;
  bubbleEl.classList.add('on');
  if (bubbleHideTimeout) clearTimeout(bubbleHideTimeout);
  bubbleHideTimeout = setTimeout(function(){ bubbleEl.classList.remove('on'); bubbleHideTimeout = null; }, 3500);
}

/* ── Name modal ─────────────────────────────────── */
function showNameModal(pastNames, onSave) {
  var modal = mk('div'); modal.id = 'tq-namemodal';
  var box   = mk('div'); box.id   = 'tq-namebox';
  var h2    = mk('h2','','🔲 Name your cube');
  var sub   = mk('p','','It will remember. Choose wisely.');
  var inp   = mk('input'); inp.id = 'tq-nameinput';
  inp.setAttribute('maxlength','20');
  inp.setAttribute('placeholder','enter a name...');
  inp.setAttribute('autocomplete','off');
  var err = mk('span'); err.id = 'tq-nameerr';
  var btn = mk('button'); btn.id = 'tq-nameok'; btn.textContent = 'CONFIRM';

  [h2,sub,inp,err,btn].forEach(function(e){ box.appendChild(e); });
  modal.appendChild(box);
  document.body.appendChild(modal);
  setTimeout(function(){ inp.focus(); }, 80);

  function attempt() {
    var name = inp.value.trim();
    if (!name || name.length < 1) { err.textContent = 'Give it a name.'; return; }
    if (name.length > 20) { err.textContent = 'Max 20 characters.'; return; }
    if (pastNames && pastNames.indexOf(name) >= 0) {
      err.textContent = 'That name belongs to a past cube.'; return;
    }
    err.textContent = '';
    if (modal.parentNode) modal.parentNode.removeChild(modal);
    onSave(name);
  }

  btn.addEventListener('click', attempt);
  inp.addEventListener('keydown', function(e){ if (e.key === 'Enter') attempt(); });
}

/* ── Fire animation ─────────────────────────────── */
function startFireAnimation(onDone) {
  fireAnimRunning = true;
  var r = mainSq.getBoundingClientRect();
  var firepit = mk('div'); firepit.id = 'tq-firepit';
  firepit.style.left   = (r.left - 60) + 'px';
  firepit.style.top    = (r.top - 80) + 'px';
  firepit.style.width  = (r.width + 120) + 'px';
  firepit.style.height = (r.height + 200) + 'px';

  /* Flame particles */
  for (var i = 0; i < 22; i++) {
    var f = mk('div','tqflame');
    var hue = Math.floor(Math.random() * 30);
    f.style.left              = Math.floor(Math.random() * 90) + '%';
    f.style.animationName     = 'tqflameup';
    f.style.animationDuration = (0.5 + Math.random() * 0.8).toFixed(2) + 's';
    f.style.animationDelay    = (Math.random() * 0.6).toFixed(2) + 's';
    f.style.animationTimingFunction = 'linear';
    f.style.animationIterationCount = 'infinite';
    f.style.background        = 'linear-gradient(to top,#ff2200,#ff8800,#ffdd00)';
    f.style.filter            = 'hue-rotate('+hue+'deg)';
    firepit.appendChild(f);
  }

  /* Glow ring at bottom */
  var ring = mk('div'); ring.id = 'tq-firepit-ring';
  firepit.appendChild(ring);

  document.body.appendChild(firepit);

  /* Animate cube falling into fire */
  mainSq.style.transition = 'transform 1.4s cubic-bezier(.55,0,.85,.36), opacity 1.2s ease';
  mainSq.style.transform  = 'translateY(100px) scale(0.05) rotate(22deg)';
  mainSq.style.opacity    = '0';

  setTimeout(function() {
    /* Clean up */
    if (firepit.parentNode) firepit.parentNode.removeChild(firepit);
    mainSq.style.transition = '';
    mainSq.style.transform  = '';
    mainSq.style.opacity    = '';
    fireAnimRunning = false;
    onDone();
  }, 2200);
}

/* ── Main UI update ─────────────────────────────── */
var lastFullUI = 0;
function updateUI() {
  /* Fast path — every frame */
  statsEl.textContent = fmt(state.squares) + ' Squares';
  cpsEl.textContent   = 'per second: ' + fmt(getCPS()) + '  ·  clicks: ' + fmt(state.totalClicks);
  if (cubeNameEl) cubeNameEl.textContent = state.cubeName || '';

  /* Throttled — ~8× per second */
  var now = Date.now();
  if (now - lastFullUI < 120) return;
  lastFullUI = now;

  /* Level via data-lvl attribute (preserves crit/rainbow animations) */
  var lvl = state.totalSquares >= 1e15 ? 5 : state.totalSquares >= 1e12 ? 4 : state.totalSquares >= 1e9 ? 3 : state.totalSquares >= 1e6 ? 2 : 1;
  if (mainSq.getAttribute('data-lvl') !== String(lvl)) mainSq.setAttribute('data-lvl', lvl);

  /* Level progress bar */
  var LVL_THR = [0, 1e6, 1e9, 1e12, 1e15];
  var lvlPrev = LVL_THR[lvl-1] || 0;
  var lvlNext = LVL_THR[lvl]   || LVL_THR[LVL_THR.length-1];
  var pct = lvl >= 5 ? 100 : Math.min(100, Math.floor((state.totalSquares - lvlPrev) / (lvlNext - lvlPrev) * 100));
  if (lvlBarFill) lvlBarFill.style.width = pct + '%';
  if (lvlLabel)   lvlLabel.textContent   = lvl >= 5 ? 'MAX' : 'Lv ' + lvl + ' → Lv ' + (lvl+1);

  /* Combo */
  comboEl.classList.toggle('on', comboActive && comboCount > 1);
  if (comboActive && comboCount > 1) comboEl.textContent = '⚡ ' + comboCount + '× COMBO';

  /* Events */
  goldenEl.classList.toggle('on', goldenActive);
  debtEl.classList.toggle('on', techDebtActive);
  hackEl.classList.toggle('on', hackathonActive);
  if (techDebtActive) debtEl.textContent = '🐛 Tech Debt — ' + (30 - techDebtClicks) + ' clicks to fix';
  if (hackathonActive) hackEl.textContent = '⚡ HACKATHON — ' + Math.ceil(hackathonTimer) + 's';

  /* Recompile button */
  var canRC = state.totalSquares >= getRecompileThreshold();
  recompBtn.classList.toggle('h', !canRC);
  var cpg = getCompilePointsGain();
  cpEl.textContent = state.compilePoints > 0
    ? 'CP: ' + state.compilePoints + (cpg > 0 ? '  ·  Gain: +' + cpg : '')
    : (cpg > 0 ? 'Gain: +' + cpg + ' CP' : '');

  updateShopData();
  syncUpgradeList();
  syncAchList();
}

/* ── Click ──────────────────────────────────────── */
function onMainClick(e) {
  var power = getClickPower();
  var critChance = 0.05 * (hasUpgrade('crit1') ? 2 : 1);
  var critMult   = (hasArch('safety') || hasUpgrade('crit2')) ? 10 : 5;
  var isCrit = Math.random() < critChance;
  if (isCrit) {
    power *= critMult;
    state.critClicks = (state.critClicks || 0) + 1;
    mainSq.classList.remove('crit');
    void mainSq.offsetWidth;
    mainSq.classList.add('crit');
    setTimeout(function(){ mainSq.classList.remove('crit'); }, 200);
  }
  var now = Date.now();
  comboCount = now - comboTimer < 650 ? Math.min(comboCount + 1, 30) : 1;
  comboTimer = now;
  if (comboCount >= 8) {
    comboActive = true; comboActiveTimer = 8;
    power *= (1 + comboCount * 0.1);
    state.maxCombo = Math.max(state.maxCombo || 0, comboCount);
  }
  addSquares(power);
  state.totalClicks++;
  spawnFloat(e, '+' + fmt(power), isCrit);
  checkAch();
  if (Math.random() < 0.15) showCubeDialogue('click');
  updateUI();
}

function addSquares(n) { state.squares += n; state.totalSquares += n; }

function spawnFloat(e, txt, isCrit) {
  var f = mk('div', 'tqfl' + (isCrit ? ' c' : ''), txt);
  var r = mainSq.getBoundingClientRect();
  f.style.left = (r.left + r.width  / 2 - 16 + (Math.random() - .5) * 40) + 'px';
  f.style.top  = (r.top  + r.height / 2 -  8 + (Math.random() - .5) * 20) + 'px';
  document.body.appendChild(f);
  setTimeout(function(){ if (f.parentNode) f.parentNode.removeChild(f); }, 1000);
}

/* ── Shake helper ───────────────────────────────── */
function shakeEl(selector) {
  var el = document.querySelector(selector);
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  setTimeout(function(){ el.classList.remove('shake'); }, 270);
}

/* ── Buy ────────────────────────────────────────── */
function buyBuilding(id) {
  var b = BUILDINGS.filter(function(x){return x.id===id;})[0]; if (!b) return;
  var cost = getBuildingCost(b, state);
  if (state.squares < cost) {
    shakeEl('[data-bid="'+id+'"]');
    return;
  }
  state.squares -= cost;
  state.buildings[id] = (state.buildings[id] || 0) + 1;
  notify('Building', b.icon + ' ' + b.name + ' #' + state.buildings[id]);
  checkAch(); updateUI();
}
function buyUpgrade(id) {
  var u = UPGRADES.filter(function(x){return x.id===id;})[0]; if (!u || hasUpgrade(id)) return;
  var cost = getUpgradeCost(u);
  if (state.squares < cost) {
    shakeEl('[data-uid="'+id+'"]');
    return;
  }
  state.squares -= cost;
  state.upgrades[id] = true;
  upgradeVisKey = null;
  notify('Upgrade', u.name + ' unlocked!');
  checkAch(); updateUI();
}
function buyArch(id) {
  var a = ARCH.filter(function(x){return x.id===id;})[0]; if (!a || hasArch(id)) return;
  if (state.compilePoints < a.cost) return;
  state.compilePoints -= a.cost;
  state.archUpgrades[id] = true;
  syncArchList();
  notify('Architecture', a.name + ' implemented!');
  updateUI();
}

/* ── Events ─────────────────────────────────────── */
function onGoldenClick() {
  if (!goldenActive) return;
  goldenActive = false;
  var bonus = Math.max(getCPS() * 900, 100);
  addSquares(bonus);
  state.goldensCaught = (state.goldensCaught || 0) + 1;
  notify('✦ Golden Square!', '+' + fmt(bonus) + ' squares!');
  showCubeDialogue('golden');
  checkAch(); updateUI();
}
function onDebtClick() {
  if (!techDebtActive) return;
  techDebtClicks++;
  if (techDebtClicks >= 30) {
    techDebtActive = false; techDebtClicks = 0;
    state.debtsResolved = (state.debtsResolved || 0) + 1;
    notify('🐛 Fixed!', 'Tech Debt resolved. Production restored.');
    checkAch();
  }
  updateUI();
}

/* ── Achievements ───────────────────────────────── */
function checkAch() {
  var gotNew = false;
  ACH.forEach(function (a) {
    if (state.achievements[a.id]) return;
    if (a.check(state)) {
      state.achievements[a.id] = true;
      notify('🏆 Achievement', a.name + ' — ' + a.desc);
      gotNew = true;
    }
  });
  if (gotNew) showCubeDialogue('milestone');
}

/* ── Prestige ───────────────────────────────────── */
function showRCConfirm() {
  var cpg = getCompilePointsGain();
  var msg = document.getElementById('tq-rcmsg');
  if (msg) msg.textContent = 'You will gain ' + cpg + ' Compile Point' + (cpg !== 1 ? 's' : '') + '. Squares, buildings and upgrades reset. Architecture upgrades are permanent.';
  document.getElementById('tq-rcconf').classList.remove('h');
}

function doRecompile() {
  document.getElementById('tq-rcconf').classList.add('h');
  var cpg = getCompilePointsGain();
  var savedMeta = {
    achievements:  state.achievements,
    archUpgrades:  state.archUpgrades,
    compilePoints: (state.compilePoints || 0) + cpg,
    recompiles:    (state.recompiles || 0) + 1,
    totalSquares:  state.totalSquares,
    totalClicks:   state.totalClicks,
    goldensCaught: state.goldensCaught,
    debtsResolved: state.debtsResolved,
    maxCombo:      state.maxCombo,
    critClicks:    state.critClicks,
    cubeNames:     (state.cubeNames || []).slice(),
    version:       DEFAULT_STATE.version,
  };

  startFireAnimation(function() {
    state = Object.assign({}, DEFAULT_STATE, savedMeta);
    goldenActive = false; techDebtActive = false; hackathonActive = false;
    techDebtClicks = 0; comboCount = 0; comboActive = false;
    upgradeVisKey = null; achCount = -1;
    notify('⟳ Recompiled!', 'Gained ' + cpg + ' CP. Run #' + state.recompiles + ' begins.');
    checkAch(); syncArchList(); updateUI();
    saveLocal(); saveFirebase();

    showNameModal(state.cubeNames, function(name) {
      state.cubeName = name;
      state.cubeNames = (state.cubeNames || []).concat([name]);
      showCubeDialogue('recompile');
      saveLocal(); saveFirebase();
      updateUI();
    });
  });
}

/* ── Notifications ──────────────────────────────── */
function notify(title, body) {
  var area = document.getElementById('tq-ntf'); if (!area) return;
  var n = mk('div','tq-n');
  n.appendChild(mk('div','tq-nt', title));
  n.appendChild(mk('div','tq-nb', body));
  area.appendChild(n);
  setTimeout(function(){ if (n.parentNode) n.parentNode.removeChild(n); }, 3200);
  milestoneLog.unshift(title + ': ' + body);
  if (milestoneLog.length > 5) milestoneLog.pop();
  logEl.innerHTML = '';
  milestoneLog.forEach(function(m){ logEl.appendChild(mk('div','tq-li',m)); });
}

/* ── Game loop ──────────────────────────────────── */
function tick(ts) {
  if (!running) return;
  loopId = requestAnimationFrame(tick);
  var dt = Math.min((ts - lastTick) / 1000, 0.5);
  lastTick = ts;

  addSquares(getCPS() * (techDebtActive ? 0.5 : 1) * dt);

  if (comboActive) {
    comboActiveTimer -= dt;
    if (comboActiveTimer <= 0) { comboActive = false; comboCount = 0; }
  }

  /* Cube dialogue timer */
  dialogueTimer -= dt;
  if (dialogueTimer <= 0) {
    dialogueTimer = 35 + Math.random() * 20;
    showCubeDialogue('idle');
  }

  /* Golden square */
  var gm = (hasUpgrade('golden1') ? 2 : 1) * (hasArch('singularity') ? 5 : 1);
  goldenSpawn -= dt;
  if (goldenSpawn <= 0) {
    goldenSpawn = (180 / gm) + (Math.random() - .5) * 60;
    if (!goldenActive && getCPS() > 0) { goldenActive = true; goldenTimer = 13; }
  }
  if (goldenActive) { goldenTimer -= dt; if (goldenTimer <= 0) goldenActive = false; }

  /* Tech debt */
  techDebtSpawn -= dt;
  if (techDebtSpawn <= 0) {
    techDebtSpawn = 600 + (Math.random() - .5) * 120;
    if (!techDebtActive && getCPS() > 1) { techDebtActive = true; techDebtClicks = 0; techDebtTimer = 60; }
  }
  if (techDebtActive) { techDebtTimer -= dt; if (techDebtTimer <= 0) { techDebtActive = false; techDebtClicks = 0; } }

  /* Hackathon */
  hackathonSpawn -= dt;
  if (hackathonSpawn <= 0) {
    hackathonSpawn = 3600;
    if (!hackathonActive && state.totalSquares >= 1e6) {
      hackathonActive = true; hackathonTimer = 120;
      notify('⚡ Hackathon Mode!', '3× production for 2 minutes!');
      showCubeDialogue('hackathon');
    }
  }
  if (hackathonActive) { hackathonTimer -= dt; if (hackathonTimer <= 0) hackathonActive = false; }

  /* Auto-save */
  saveTimer -= dt;
  if (saveTimer <= 0) { saveTimer = 30; saveLocal(); saveFirebase(); checkAch(); }

  updateUI();
}

/* ── Exit ───────────────────────────────────────── */
function doExit() {
  running = false;
  cancelAnimationFrame(loopId);
  /* Clean up fire animation if mid-flight */
  var fp = document.getElementById('tq-firepit');
  if (fp && fp.parentNode) fp.parentNode.removeChild(fp);
  mainSq.style.transition = mainSq.style.transform = mainSq.style.opacity = '';
  saveLocal(); saveFirebase();
  overlay.style.opacity = '0';
  setTimeout(function () {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    var nm = document.getElementById('tq-namemodal');
    if (nm && nm.parentNode) nm.parentNode.removeChild(nm);
    var s = document.getElementById('tq-style');
    if (s && s.parentNode) s.parentNode.removeChild(s);
    overlay = null;
    if (onExitCb) onExitCb();
  }, 450);
}

/* ── Init ───────────────────────────────────────── */
function init(onExit) {
  onExitCb      = onExit || null;
  deviceId      = getDeviceId();
  upgradeVisKey = null;
  achCount      = -1;
  milestoneLog  = [];
  fireAnimRunning = false;

  var local = loadLocal();
  applyState(local);
  injectStyle();
  buildUI();
  syncArchList();
  requestAnimationFrame(function () { if (overlay) overlay.classList.add('vis'); });

  /* Offline earnings */
  if (local && local.lastSave) {
    var offSec  = Math.min((Date.now() - local.lastSave) / 1000, 28800);
    var offMult = hasArch('devops') ? 0.75 : hasUpgrade('offline2') ? 0.5 : hasUpgrade('offline1') ? 0.25 : 0;
    if (offMult > 0 && offSec > 60) {
      var gain = getCPS(state) * offSec * offMult;
      if (gain > 0) {
        addSquares(gain);
        notify('💤 Welcome back!', 'Earned ' + fmt(gain) + ' squares while away (' + Math.round(offSec / 60) + ' min)');
      }
    }
  }

  /* Try loading a newer save from Firebase */
  loadFirebase(function (fb) {
    if (fb && fb.lastSave && (!local || fb.lastSave > (local.lastSave || 0))) {
      applyState(fb);
      upgradeVisKey = null; achCount = -1;
      notify('☁️ Cloud Save', 'Loaded your latest progress from the cloud.');
      syncArchList();
      updateUI();
    }
    /* After save resolution, show name modal if cube has no name */
    if (!state.cubeName) {
      showNameModal(state.cubeNames || [], function(name) {
        state.cubeName = name;
        state.cubeNames = (state.cubeNames || []).concat([name]);
        saveLocal(); saveFirebase();
        updateUI();
      });
    }
  });

  lastTick       = performance.now();
  goldenSpawn    = 30 + Math.random() * 90;
  techDebtSpawn  = 120 + Math.random() * 120;
  hackathonSpawn = 3600;
  saveTimer      = 30;
  dialogueTimer  = 20 + Math.random() * 20;
  running        = true;
  loopId         = requestAnimationFrame(tick);
  checkAch();
  updateUI();
}

return { init: init };
})();
