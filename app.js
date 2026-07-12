/* ── State ── */
const state = {
  dateType: null,
  selectedDay: null,
  selectedTime: null,
  noClickCount: 0
};

/* ════════════════════════════════════════
   FLOATING HEARTS BACKGROUND
════════════════════════════════════════ */
const heartEmojis = ['💕', '💖', '💗', '💓', '🌹', '✨', '💫', '🌸'];

function spawnHeart() {
  const container = document.getElementById('hearts-bg');
  const el = document.createElement('span');
  el.className = 'heart-particle';
  el.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
  el.style.left = Math.random() * 100 + 'vw';
  const duration = 6 + Math.random() * 8;
  el.style.animationDuration = duration + 's';
  el.style.animationDelay = Math.random() * 4 + 's';
  el.style.fontSize = (0.8 + Math.random() * 1.4) + 'rem';
  container.appendChild(el);
  setTimeout(() => el.remove(), (duration + 4) * 1000);
}

setInterval(spawnHeart, 600);
for (let i = 0; i < 10; i++) spawnHeart(); // initial burst

/* ════════════════════════════════════════
   PAGE NAVIGATION
════════════════════════════════════════ */
function goToPage(n) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + n);
  page.classList.add('active');
  // Scroll to top on mobile
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ════════════════════════════════════════
   PAGE 1 — "NO" BUTTON RUNS AWAY
════════════════════════════════════════ */
const messages = [
  "Are you sure? 🥺",
  "Please reconsider... 💔",
  "Come on, it'll be fun! 😊",
  "Your heart says yes! 💕",
  "Don't break my heart! 🌹",
  "I promise I'll behave! 😇",
  "Last chance! ✨",
  "Okay fine… just kidding, you can't say no! 😂"
];

function runAway(btn) {
  const wrapper = document.getElementById('page1-buttons');
  const wrapperRect = wrapper.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();

  // Calculate random position inside wrapper
  const maxX = wrapperRect.width - btnRect.width;
  const maxY = wrapperRect.height - btnRect.height;
  const randX = Math.max(0, Math.random() * maxX);
  const randY = Math.max(0, Math.random() * maxY);

  btn.style.position = 'absolute';
  btn.style.left = randX + 'px';
  btn.style.top = randY + 'px';
  btn.style.transition = 'left 0.3s ease, top 0.3s ease';

  state.noClickCount++;

  // Update hint message
  const hint = document.getElementById('no-hint');
  const msgIndex = Math.min(state.noClickCount - 1, messages.length - 1);
  hint.textContent = messages[msgIndex];

  // Shrink NO button over time
  const scale = Math.max(0.4, 1 - state.noClickCount * 0.1);
  btn.style.transform = `scale(${scale})`;

  // Grow YES button
  const yesBtn = document.getElementById('yes-btn');
  const yesScale = Math.min(1.4, 1 + state.noClickCount * 0.06);
  yesBtn.style.transform = `scale(${yesScale})`;
}

function goToPage2() {
  goToPage(2);
}

/* ════════════════════════════════════════
   PAGE 2 — DATE TYPE SELECTION
════════════════════════════════════════ */
function selectType(type) {
  state.dateType = type;

  // Highlight selected
  document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('choice-' + type).classList.add('selected');

  // Show Next button
  document.getElementById('next-to-3').style.display = 'inline-block';
}

function goToPage3() {
  if (!state.dateType) return;
  buildDaysGrid();
  goToPage(3);
}

/* ════════════════════════════════════════
   PAGE 3 — DAY & TIME SELECTION
════════════════════════════════════════ */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildDaysGrid() {
  const grid = document.getElementById('days-grid');
  grid.innerHTML = '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Show next 8 days (today + 7)
  for (let i = 0; i < 8; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const btn = document.createElement('button');
    btn.className = 'day-btn' + (i === 0 ? ' today' : '');
    btn.setAttribute('data-date', d.toISOString().split('T')[0]);
    btn.onclick = function() { selectDay(this); };

    btn.innerHTML = `
      <span class="day-name">${i === 0 ? 'Today' : DAY_NAMES[d.getDay()]}</span>
      <span class="day-date">${d.getDate()} ${MONTH_NAMES[d.getMonth()]}</span>
    `;

    grid.appendChild(btn);
  }
}

function selectDay(btn) {
  document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.selectedDay = btn.getAttribute('data-date');
  checkPage3Complete();
}

function selectTime(btn) {
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.selectedTime = btn.getAttribute('data-time');
  checkPage3Complete();
}

function checkPage3Complete() {
  const confirmBtn = document.getElementById('confirm-btn');
  if (state.selectedDay && state.selectedTime) {
    confirmBtn.style.display = 'inline-block';
  }
}

/* ════════════════════════════════════════
   PAGE 4 — CONFIRMATION
════════════════════════════════════════ */
const typeLabels = {
  restaurant: '🍽️ Fancy Restaurant',
  movie:      '🎬 Movie Night',
  bar:        '🍸 Cozy Bar'
};

function confirm() {
  // Build human-readable date
  const d = new Date(state.selectedDay + 'T12:00:00');
  const dayLabel = d.getDate() + ' ' + MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
  const weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];

  // Format time
  const [h, m] = state.selectedTime.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const timeLabel = `${hour12}:${m} ${ampm}`;

  // Build summary
  const box = document.getElementById('summary-box');
  box.innerHTML = `
    <div class="summary-row">
      <span class="label">Type</span>
      <span class="value">${typeLabels[state.dateType]}</span>
    </div>
    <div class="summary-row">
      <span class="label">Day</span>
      <span class="value">${weekday}</span>
    </div>
    <div class="summary-row">
      <span class="label">Date</span>
      <span class="value">${dayLabel}</span>
    </div>
    <div class="summary-row">
      <span class="label">Time</span>
      <span class="value">${timeLabel}</span>
    </div>
  `;

  goToPage(4);
  launchConfetti();
}

/* ════════════════════════════════════════
   CONFETTI
════════════════════════════════════════ */
const confettiColors = ['#e91e8c','#f06292','#ab47bc','#ce93d8','#f48fb1','#fff176','#80cbc4'];

function launchConfetti() {
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = '-10px';
      el.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      el.style.width = (6 + Math.random() * 10) + 'px';
      el.style.height = (6 + Math.random() * 10) + 'px';
      el.style.animationDuration = (2 + Math.random() * 2) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }, i * 40);
  }
}
