/* ===== script.js ===== */

// ---------------- Data ----------------
const PLAN = [
  { id:"mon", name:"Monday", focus:"Core & Stability",
    why:"Improves balance, hitting power, and serve-receive posture.",
    level1:["3×20s plank","3×15 sit-ups","3×10 bird dogs (each side)","2×20s side plank (each side)"],
    level2:["3×40s plank","3×20 V-ups","3×10 slow mountain climbers (each side)","3×20s side plank with hip dips (each side)"] },

  { id:"tue", name:"Tuesday", focus:"Practice + Plyos",
    why:"Builds jump explosiveness and reaction speed.",
    level1:["2×10 squat jumps","2×10 lateral hops (each side)","2×10 line jumps (forward/back)","2×15s wall sit"],
    level2:["3×10 tuck jumps","3×10 skater hops (each side)","3×10 broad jumps","3×20s wall sit"] },

  { id:"wed", name:"Wednesday", focus:"Upper Body & Shoulder Health",
    why:"Strengthens hitting/serving muscles and reduces shoulder injury risk.",
    level1:["3×10 push-ups (knees or ledge if needed)","3×10 triceps dips (bench/chair)","3×10 T-Y-I raises (facedown)","2×20s arm circles each direction"],
    level2:["3×15 full push-ups","3×12 triceps dips","3×12 T-Y-I raises","3×30s arm circles"] },

  { id:"thu", name:"Thursday", focus:"Practice + Plyos",
    why:"Builds jump explosiveness and reaction speed.",
    level1:["2×10 jump lunges (total)","2×20s side-to-side box taps (imaginary box)","5 rounds: 5–10m sprint → backpedal"],
    level2:["3×12 jump lunges (total)","3×30s box taps","6 rounds: 5–10m sprint → backpedal"] },

  { id:"fri", name:"Friday", focus:"Flexibility & Yoga",
    why:"Aids recovery, balance, and injury prevention.",
    single:["Flow ×3: Forward fold → flat back → plank → cobra → downward dog → child’s pose","Pigeon pose – 30s each side","Seated hamstring – 30s each","Butterfly – 30s","Cat–cow – 30s","1–2 minutes deep breathing"] },

  { id:"sat", name:"Saturday", focus:"Legs & Lower Body Power",
    why:"Builds the base for jumping, movement, and balance.",
    level1:["3×10 squats","3×10 lunges (each leg)","3×15 calf raises","2×20s wall sit"],
    level2:["3×15 jump squats","3×12 split squats (each leg)","3×20 calf raises","3×30s wall sit"],
    note:"Skip on a tournament day." },

  { id:"sun", name:"Sunday", focus:"Rest / Recovery / Light Movement",
    why:"Recharge physically and mentally.",
    single:["10-minute walk","Light stretching routine","Foam roll (if available)","Or simply rest"] }
];

// ---------------- State ----------------
const els = {
  days: null,
  progressBar: null,
  progressText: null,
  resetWeek: null,
  printBtn: null,
};

let state = {
  week: 1,
  completed: loadCompleted(),        // {1:Set([...]),2:Set([...]),3:Set([...]),4:Set([...])}
  localLevel2: loadLocalLevels(),    // { mon:true/false, tue:true/false, ... }
};

function loadLocalLevels() {
  try {
    const raw = localStorage.getItem('seaside14_levels');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveLocalLevels() {
  localStorage.setItem('seaside14_levels', JSON.stringify(state.localLevel2));
}

function loadCompleted(){
  try{
    const raw = localStorage.getItem('seaside14_completed');
    if(!raw) return {1:new Set(),2:new Set(),3:new Set(),4:new Set()};
    const obj = JSON.parse(raw);
    const out = {1:new Set(),2:new Set(),3:new Set(),4:new Set()};
    for(const k of ['1','2','3','4']) out[+k] = new Set(obj[k]||[]);
    return out;
  }catch(e){
    return {1:new Set(),2:new Set(),3:new Set(),4:new Set()};
  }
}
function saveCompleted(){
  const serial = {1:[...state.completed[1]],2:[...state.completed[2]],3:[...state.completed[3]],4:[...state.completed[4]]};
  localStorage.setItem('seaside14_completed', JSON.stringify(serial));
}

// ---------------- Render ----------------
function render(){
  // cache DOM once JS loads
  if(!els.days){
    els.days = document.getElementById('days');
    els.progressBar = document.getElementById('progressBar');
    els.progressText = document.getElementById('progressText');
    els.resetWeek = document.getElementById('resetWeek');
    els.printBtn = document.getElementById('printBtn');
  }

  // week buttons
  document.querySelectorAll('[data-week]').forEach(btn=>{
    btn.setAttribute('aria-pressed', String(+btn.dataset.week===state.week));
  });

  // days
  els.days.innerHTML = '';
  PLAN.forEach(day => {
    const done = state.completed[state.week].has(day.id);
    const isLevel2 = !!state.localLevel2[day.id]; // compute ONCE per day

    const card = document.createElement('section');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'row';
    header.innerHTML = `
      <div style="flex:1 1 auto">
        <div style="font-weight:800;font-size:1.05rem">${day.name} <span class="badge">${day.focus}</span></div>
        <div class="why">${day.why}${day.note?` <span class='badge' style='margin-left:8px;color:#fbbf24;border-color:#4b3d12'>Note: ${day.note}</span>`:''}</div>
      </div>
      <label class="checkbox" title="Mark complete for this day">
        <input type="checkbox" ${done?'checked':''} data-complete="${day.id}" />
        <span>Done</span>
      </label>
    `;
    card.appendChild(header);

    const levelRow = document.createElement('div');
    levelRow.className = 'row';
    levelRow.style.marginTop = '10px';

    if (!day.single){
      levelRow.innerHTML = `
        <span class="badge">Level</span>
        <label class="switch">
          <input type="checkbox" ${isLevel2 ? 'checked' : ''} data-locallevel="${day.id}" />
          <span class="slider"></span>
        </label>
        <span class="badge" id="lbl-${day.id}">${isLevel2 ? '2' : '1'}</span>
      `;
    } else {
      levelRow.innerHTML = `<span class="badge">All levels</span>`;
    }
    card.appendChild(levelRow);

    const details = document.createElement('details');
    details.innerHTML = `<summary>View exercises</summary>`;
    const box = document.createElement('div');

    const items = day.single ? day.single : (isLevel2 ? day.level2 : day.level1);
    const ul = document.createElement('ul');
    ul.className = 'list';
    (items || []).forEach(txt=>{
      const li = document.createElement('li');
      li.textContent = txt;
      ul.appendChild(li);
    });
    box.appendChild(ul);

    if(!day.single){
      const tip = document.createElement('div');
      tip.className = 'muted';
      tip.style.marginTop = '8px';
      tip.textContent = isLevel2
        ? 'Level 2 emphasizes challenge—reduce reps if form breaks.'
        : 'Level 1 prioritizes good form—pause as needed.';
      box.appendChild(tip);
    }

    details.appendChild(box);
    card.appendChild(details);
    els.days.appendChild(card);
  });

  updateProgress();
}

function updateProgress(){
  const count = state.completed[state.week].size;
  els.progressText.textContent = `${count}/7`;
  const pct = Math.round(count/7*100);
  els.progressBar.style.width = pct + '%';
  els.progressBar.setAttribute('aria-valuenow', String(pct));
}

// ---------------- Events ----------------
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('[data-week]');
  if(btn){ state.week = +btn.dataset.week; render(); }

  if(e.target === els.resetWeek){
    if(confirm("Clear this week's completion checkmarks?")){
      state.completed[state.week].clear();
      saveCompleted();
      render();
    }
  }
  if(e.target === els.printBtn){
    window.print();
  }
});

document.addEventListener('change', (e)=>{
  const t = e.target;

  if (t.matches('[data-locallevel]')) {
    const id = t.getAttribute('data-locallevel');
    const val = !!t.checked;
    state.localLevel2[id] = val;
    saveLocalLevels();
    const lbl = document.getElementById('lbl-' + id);
    if (lbl) lbl.textContent = val ? '2' : '1';
    render(); // re-render to show updated exercises
  }

  if (t.matches('[data-complete]')){
    const id = t.getAttribute('data-complete');
    if(t.checked) state.completed[state.week].add(id);
    else state.completed[state.week].delete(id);
    saveCompleted();
    updateProgress();
  }
});

// Init
(function init(){
  render();
})();
