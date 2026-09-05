const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const game = document.getElementById("game");

const playBtn = document.getElementById("playBtn");
const backBtn = document.getElementById("back");

const homeScore = document.getElementById("homeScore");
const awayScore = document.getElementById("awayScore");
const timerText = document.getElementById("timer");

let W, H;
let running = false;
let home = 0;
let away = 0;
let timeLeft = 180;

const player = {
  x: 0,
  y: 0,
  r: 18,
  speed: 3.8
};

const ball = {
  x: 0,
  y: 0,
  r: 8,
  vx: 0,
  vy: 0
};

const enemies = [
  { x: 0, y: 0, r: 17, speed: 1.5 },
  { x: 0, y: 0, r: 17, speed: 1.7 },
  { x: 0, y: 0, r: 17, speed: 1.4 }
];

let joyX = 0;
let joyY = 0;
let sprinting = false;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;

  resetPositions();
}

function resetPositions() {
  player.x = W * 0.25;
  player.y = H * 0.5;

  ball.x = player.x + 25;
  ball.y = player.y;

  enemies[0].x = W * 0.65;
  enemies[0].y = H * 0.35;

  enemies[1].x = W * 0.72;
  enemies[1].y = H * 0.65;

  enemies[2].x = W * 0.55;
  enemies[2].y = H * 0.5;
}

window.addEventListener("resize", resize);

playBtn.addEventListener("click", () => {
  menu.classList.add("hidden");
  game.classList.remove("hidden");

  home = 0;
  away = 0;
  timeLeft = 180;

  homeScore.textContent = "0";
  awayScore.textContent = "0";

  resize();

  running = true;
  requestAnimationFrame(loop);
});

backBtn.addEventListener("click", () => {
  running = false;
  game.classList.add("hidden");
  menu.classList.remove("hidden");
});

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function updatePlayer() {

  const speed = sprinting ? 6 : player.speed;

  player.x += joyX * speed;
  player.y += joyY * speed;

  player.x = Math.max(35, Math.min(W - 35, player.x));
  player.y = Math.max(90, Math.min(H - 35, player.y));

  if (distance(player, ball) < player.r + ball.r + 10) {

    ball.x += (player.x - ball.x) * 0.25;
    ball.y += (player.y - ball.y) * 0.25;
  }
}

function updateBall() {

  ball.x += ball.vx;
  ball.y += ball.vy;

  ball.vx *= 0.96;
  ball.vy *= 0.96;

  if (ball.y < 90 || ball.y > H - 20) {
    ball.vy *= -0.8;
  }

  checkGoal();
}

function updateEnemies() {

  enemies.forEach(enemy => {

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const d = Math.hypot(dx, dy);

    if (d > 1) {
      enemy.x += dx / d * enemy.speed;
      enemy.y += dy / d * enemy.speed;
    }

    if (distance(enemy, player) < enemy.r + player.r) {

      ball.vx = -3;
      ball.vy = (Math.random() - .5) * 4;
    }
  });
}

function checkGoal() {

  const goalTop = H * .42;
  const goalBottom = H * .58;

  if (ball.x < 15 && ball.y > goalTop && ball.y < goalBottom) {
    away++;
    awayScore.textContent = away;
    resetPositions();
  }

  if (ball.x > W - 15 && ball.y > goalTop && ball.y < goalBottom) {
    home++;
    homeScore.textContent = home;
    resetPositions();
  }

  if (ball.x < 20) {
    ball.x = 20;
    ball.vx *= -1;
  }

  if (ball.x > W - 20) {
    ball.x = W - 20;
    ball.vx *= -1;
  }
}

function drawField() {

  ctx.clearRect(0, 0, W, H);

  // césped
  ctx.fillStyle = "#08752e";
  ctx.fillRect(0, 0, W, H);

  // franjas
  for (let x = 0; x < W; x += 80) {
    ctx.fillStyle = x % 160 === 0
      ? "rgba(255,255,255,.025)"
      : "rgba(0,0,0,.025)";

    ctx.fillRect(x, 0, 80, H);
  }

  ctx.strokeStyle = "rgba(255,255,255,.85)";
  ctx.lineWidth = 3;

  // borde
  ctx.strokeRect(15, 80, W - 30, H - 100);

  // línea central
  ctx.beginPath();
  ctx.moveTo(W / 2, 80);
  ctx.lineTo(W / 2, H - 20);
  ctx.stroke();

  // círculo central
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 75, 0, Math.PI * 2);
  ctx.stroke();

  // punto central
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // áreas
  ctx.strokeRect(15, H * .32, 130, H * .36);
  ctx.strokeRect(W - 145, H * .32, 130, H * .36);

  // porterías
  ctx.strokeRect(0, H * .42, 18, H * .16);
  ctx.strokeRect(W - 18, H * .42, 18, H * .16);
}

function drawPlayer() {

  // sombra
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + 16, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // cuerpo
  ctx.fillStyle = "#39ff88";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  // camiseta
  ctx.fillStyle = "#10251a";
  ctx.fillRect(player.x - 10, player.y - 5, 20, 15);

  // cabeza
  ctx.fillStyle = "#d99a6c";
  ctx.beginPath();
  ctx.arc(player.x, player.y - 16, 9, 0, Math.PI * 2);
  ctx.fill();
}

function drawEnemies() {

  enemies.forEach(enemy => {

    ctx.fillStyle = "rgba(0,0,0,.25)";
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y + 15, 19, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff4040";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#222";
    ctx.fillRect(enemy.x - 10, enemy.y - 5, 20, 15);

    ctx.fillStyle = "#d99a6c";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - 15, 9, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBall() {

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#222";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function draw() {
  drawField();
  drawEnemies();
  drawPlayer();
  drawBall();
}

function loop() {

  if (!running) return;

  updatePlayer();
  updateEnemies();
  updateBall();
  draw();

  requestAnimationFrame(loop);
}

// --------------------
// JOYSTICK
// --------------------

const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");

function moveJoystick(clientX, clientY) {

  const rect = joystick.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let dx = clientX - centerX;
  let dy = clientY - centerY;

  const max = 45;
  const distance = Math.hypot(dx, dy);

  if (distance > max) {
    dx = dx / distance * max;
    dy = dy / distance * max;
  }

  stick.style.transform =
    `translate(${dx}px, ${dy}px)`;

  joyX = dx / max;
  joyY = dy / max;
}

function resetJoystick() {

  stick.style.transform = "translate(0,0)";
  joyX = 0;
  joyY = 0;
}

joystick.addEventListener("touchmove", e => {
  e.preventDefault();

  const touch = e.touches[0];
  moveJoystick(touch.clientX, touch.clientY);
}, { passive: false });

joystick.addEventListener("touchend", resetJoystick);

joystick.addEventListener("touchcancel", resetJoystick);

// --------------------
// BOTONES
// --------------------

document.getElementById("sprint").addEventListener("touchstart", () => {
  sprinting = true;
});

document.getElementById("sprint").addEventListener("touchend", () => {
  sprinting = false;
});

document.getElementById("shoot").addEventListener("click", shoot);

function shoot() {

  if (distance(player, ball) > 55) return;

  const targetX = joyX !== 0 ? joyX : 1;
  const targetY = joyY;

  ball.vx = targetX * 11;
  ball.vy = targetY * 11;
}

document.getElementById("pass").addEventListener("click", () => {

  if (distance(player, ball) > 55) return;

  ball.vx = joyX * 7;
  ball.vy = joyY * 7;
});

// --------------------
// TEMPORIZADOR
// --------------------

setInterval(() => {

  if (!running) return;

  timeLeft--;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  timerText.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  if (timeLeft <= 0) {

    running = false;

    setTimeout(() => {
      alert(`FINAL\n\n${home} - ${away}`);
      game.classList.add("hidden");
      menu.classList.remove("hidden");
    }, 100);
  }

}, 1000);

resize();
