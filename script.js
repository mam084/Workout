// -------- Data --------
const PLAN = [
  { id:"mon", name:"Monday", focus:"Core & Stability",
    why:"Improves balance, hitting control, and serve-receive posture.",
    level1:["3×20s plank","3×15 sit-ups","2×20s side plank (each side)"],
    level2:["3×40s plank","3×20 V-ups","3×10 slow mountain climbers (each side)","3×20s side plank with hip dips (each side)"] },

  { id:"tue", name:"Tuesday", focus:"Practice Day",
    why:"Handled in team practice — protect legs/joints outside the gym.",
    single:["No extra workout assigned.","Optional: 5–10 min light mobility (hips/ankles)."] },

  { id:"wed", name:"Wednesday", focus:"Upper Body & Shoulder Health",
    why:"Strengthens hitting/serving muscles and reduces shoulder injury risk.",
    level1:["3×10 push-ups (knees or ledge if needed)","3×10 triceps dips (chair)","2×20s arm circles each direction"],
    level2:["4×10 full push-ups","4×10 triceps dips","3×12 T-Y-I raises","3×30s arm circles"] },

  { id:"thu", name:"Thursday", focus:"Practice Day",
    why:"Handled in team practice — protect legs/joints outside the gym.",
    single:["No extra workout assigned.","Optional: 5–10 min light mobility (hips/ankles)."] },

  { id:"fri", name:"Friday", focus:"Flexibility & Yoga",
    why:"Aids recovery, balance, and injury prevention.",
    link:{ href:"https://www.youtube.com/watch?v=vWdItGSerXM", text:"15-Minute Volleyball Yoga Recovery" } },

  { id:"sat", name:"Saturday", focus:"Legs & Lower Body Power",
    why:"Builds the base for jumping, movement, and balance.",
    level1:["2×10 squats","3×15 calf raises","2×20s wall sit"],
    level2:["3×15 jump squats","3×12 split squats (each leg)","3×20 calf raises","3×30s wall sit"],
    note:"Skip on a tournament day." },

  { id:"sun", name:"Sunday", focus:"Rest / Recovery / Light Movement",
    why:"Recharge physically and mentally.",
    single:["10-minute walk","Light stretching routine","Foam roll (if available)","Or simply rest"] }
];

// -------- State --------
const els = { days:null, progressBar:null, progressText:null, resetWeek:null, printBtn:null, themeBtn:null };
let state = {
  level: loadLevel(),                 // 1 or 2; chosen via tabs
  completed: loadCompleted()          // Set of day ids: {"mon","tue",...}
};

function loadLevel(){
  const raw = localStorage.getItem('seaside_travel_level');
  return raw ? +raw : 1;
}
function saveLevel(){ localStorage.setItem('seaside_travel_level', String(state.level)); }

function loadCompleted(){
  try{
    const raw = localStorage.getItem('seaside_travel_completed');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  }catch{ return new Set(); }
}
function saveCompleted(){
  localStorage.setItem('seaside_travel_completed', JSON.stringify([...state.completed]));
}

// -------- Render --------
function render(){
  if(!els.days){
    els.days = document.getElementById('days');
    els.progressBar = document.getElementById('progressBar');
    els.progressText = document.getElementById('progressText');
    els.resetWeek = document.getElementById('resetWeek');
    els.printBtn = document.getElementById('printBtn');
    els.themeBtn = document.getElementById('themeBtn');
  }

  // level tabs
  document.querySelectorAll('[data-level]').forEach(btn=>{
    btn.setAttribute('aria-pressed', String(+btn.dataset.level===state.level));
  });

  els.days.innerHTML = '';
  PLAN.forEach(day=>{
    const done = state.completed.has(day.id);

    const card = document.createElement('section');
    card.className = 'card';

    // header
    const header = document.createElement('div');
    header.className = 'row';
    header.innerHTML = `
      <div style="flex:1 1 auto">
        <div style="font-weight:800;font-size:1.05rem">
          ${day.name} <span class="badge">${day.focus}</span>
          ${(!day.single && !day.link) ? `<span class="badge">Level ${state.level}</span>` : ''}
        </div>
        <div class="why">${day.why}${day.note?` <span class='badge' style='margin-left:8px;background:var(--warn)'>Note: ${day.note}</span>`:''}</div>
      </div>
      <label class="checkbox" title="Mark complete for this day">
        <input type="checkbox" ${done?'checked':''} data-complete="${day.id}" />
        <span>Done</span>
      </label>
    `;
    card.appendChild(header);

    // details
    const details = document.createElement('details');
    details.innerHTML = `<summary>View details</summary>`;
    const box = document.createElement('div');

    // Friday: resource link only (no levels shown anywhere)
    if (day.link) {
      const a = document.createElement('a');
      a.href = day.link.href; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = day.link.text; a.className = 'btn primary';
      box.appendChild(a);
    }

    // choose items by current level, unless single/link day
    const items = day.single ? day.single
               : day.link  ? null
               : (state.level === 2 ? day.level2 : day.level1);

    if (items && items.length) {
      const ul = document.createElement('ul');
      ul.className = 'list';
      items.forEach(txt=>{
        const li = document.createElement('li');
        li.textContent = txt;
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }

    details.appendChild(box);
    card.appendChild(details);
    els.days.appendChild(card);
  });

  updateProgress();
}

function updateProgress(){
  const count = state.completed.size;
  document.getElementById('progressText').textContent = `${count}/7`;
  const pct = Math.round(count/7*100);
  document.getElementById('progressBar').style.width = pct + '%';
}

// -------- Events --------
document.addEventListener('click', (e)=>{
  const levelBtn = e.target.closest('[data-level]');
  if(levelBtn){
    state.level = +levelBtn.dataset.level;
    saveLevel();
    render();
  }

  if(e.target === els.themeBtn){
    const dark = document.body.classList.toggle('theme-dark');
    localStorage.setItem('seaside14_theme', dark ? 'dark' : 'light');
    els.themeBtn.textContent = `Theme: ${dark ? 'Dark' : 'Light'}`;
  }

  if(e.target === els.resetWeek){
    if(confirm("Clear this week's checkmarks?")){
      state.completed.clear();
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
  if (t.matches('[data-complete]')){
    const id = t.getAttribute('data-complete');
    if(t.checked) state.completed.add(id);
    else state.completed.delete(id);
    saveCompleted();
    updateProgress();
  }
});

// -------- Init --------
(function init(){
  // theme
  const saved = localStorage.getItem('seaside14_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const useDark = saved ? (saved === 'dark') : prefersDark;
  if(useDark) document.body.classList.add('theme-dark');
  const btn = document.getElementById('themeBtn');
  if(btn) btn.textContent = `Theme: ${useDark ? 'Dark' : 'Light'}`;

  render();
})();
