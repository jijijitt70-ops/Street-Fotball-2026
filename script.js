const $ = id => document.getElementById(id);

/* =========================
   PANTALLAS
========================= */

const updateScreen = $("updateScreen");
const continueUpdate = $("continueUpdate");
const loginScreen = $("loginScreen");
const menu = $("menu");
const game = $("game");
const modal = $("modal");

let playerName = localStorage.getItem("sf26_player");
let tokens = Number(localStorage.getItem("sf26_tokens")) || 1000;
let level = Number(localStorage.getItem("sf26_level")) || 1;


/* =========================
   ACTUALIZACIÓN 2.0V
========================= */

continueUpdate.addEventListener("click", () => {

  updateScreen.classList.add("hidden");

  if (playerName) {
    showMenu();
  } else {
    loginScreen.classList.remove("hidden");
  }

});


/* =========================
   REGISTRO
========================= */

$("loginBtn").addEventListener("click", createPlayer);

$("playerName").addEventListener("keydown", e => {
  if (e.key === "Enter") createPlayer();
});


function createPlayer() {

  const input = $("playerName");
  const name = input.value.trim();

  if (name.length < 3) {

    $("loginError").textContent =
      "⚠️ El nombre debe tener al menos 3 caracteres.";

    return;
  }

  playerName = name;

  localStorage.setItem(
    "sf26_player",
    playerName
  );

  localStorage.setItem(
    "sf26_tokens",
    tokens
  );

  loginScreen.classList.add("hidden");

  showMenu();
}


/* =========================
   MENÚ
========================= */

function showMenu() {

  menu.classList.remove("hidden");

  $("menuPlayerName").textContent =
    playerName;

  $("playerLevel").textContent =
    level;

  $("tokenAmount").textContent =
    tokens.toLocaleString("es-ES");

}


/* =========================
   MODALES
========================= */

function openModal(title, content) {

  $("modalTitle").textContent = title;

  $("modalContent").innerHTML = content;

  modal.classList.remove("hidden");

}


$("closeModal").addEventListener(
  "click",
  () => modal.classList.add("hidden")
);


/* =========================
   BOTONES DEL MENÚ
========================= */

$("oneVsOneBtn").addEventListener(
  "click",
  () => startMatch("1 VS 1")
);


$("fiveVsFiveBtn").addEventListener(
  "click",
  () => startMatch("5 VS 5")
);


$("elevenBtn").addEventListener(
  "click",
  () => startMatch("11 VS 11")
);


$("playBtn").addEventListener(
  "click",
  () => startMatch("PARTIDO")
);


/* =========================
   TORNEOS
========================= */

$("tournamentBtn").addEventListener(
  "click",
  () => {

    openModal(
      "🏆 TORNEOS",
      `
        <p>Compite por grandes premios.</p>

        <div class="tournamentPrize">
          🪙 100.000 TOKENS
        </div>

        <button class="modalAction" onclick="startMatch('TORNEO')">
          🏆 JUGAR TORNEO
        </button>
      `
    );

  }
);


/* =========================
   MI JUGADOR
========================= */

$("playerBtn").addEventListener(
  "click",
  () => {

    openModal(
      "👤 MI JUGADOR",
      `
        <div class="bigAvatar">🧍</div>

        <h3>${playerName}</h3>

        <p>Nivel: ${level}</p>

        <p>🪙 ${tokens.toLocaleString("es-ES")} tokens</p>

        <button class="modalAction" onclick="addTokens(500)">
          💰 RECOMPENSA DIARIA
        </button>
      `
    );

  }
);


/* =========================
   TIENDA
========================= */

$("shopBtn").addEventListener(
  "click",
  () => {

    openModal(
      "🛒 TIENDA",
      `
        <div class="shopItem">
          <h3>⚡ JUGADOR RÁPIDO</h3>
          <p>Velocidad +10</p>
          <b>🪙 5.000</b>
          <button class="modalAction"
            onclick="buyPlayer(5000)">
            COMPRAR
          </button>
        </div>

        <div class="shopItem">
          <h3>🔥 JUGADOR ÉLITE</h3>
          <p>Velocidad +20</p>
          <b>🪙 25.000</b>
          <button class="modalAction"
            onclick="buyPlayer(25000)">
            COMPRAR
          </button>
        </div>

        <div class="shopItem">
          <h3>👑 LEYENDA</h3>
          <p>Jugador legendario</p>
          <b>🪙 100.000</b>
          <button class="modalAction"
            onclick="buyPlayer(100000)">
            COMPRAR
          </button>
        </div>
      `
    );

  }
);


/* =========================
   CLASIFICACIÓN
========================= */

$("rankingBtn").addEventListener(
  "click",
  () => {

    openModal(
      "📊 CLASIFICACIÓN",
      `
        <div class="ranking">
          <p>🥇 JugadorPro — 🪙 985.000</p>
          <p>🥈 Crack26 — 🪙 750.000</p>
          <p>🥉 FútbolKing — 🪙 500.000</p>
          <hr>
          <p>⭐ ${playerName} — 🪙 ${tokens.toLocaleString("es-ES")}</p>
        </div>
      `
    );

  }
);


/* =========================
   TOKENS
========================= */

function addTokens(amount) {

  tokens += amount;

  localStorage.setItem(
    "sf26_tokens",
    tokens
  );

  $("tokenAmount").textContent =
    tokens.toLocaleString("es-ES");

  alert(
    `💰 +${amount.toLocaleString("es-ES")} tokens`
  );

}


/* =========================
   COMPRAR JUGADOR
========================= */

function buyPlayer(price) {

  if (tokens < price) {

    alert("❌ No tienes suficientes tokens.");

    return;
  }

  tokens -= price;

  localStorage.setItem(
    "sf26_tokens",
    tokens
  );

  $("tokenAmount").textContent =
    tokens.toLocaleString("es-ES");

  alert(
    "✅ ¡Jugador comprado!"
  );

}


/* =========================
   JUEGO
========================= */

const canvas = $("field");
const ctx = canvas.getContext("2d");

let W;
let H;

let running = false;

let home = 0;
let away = 0;

let timeLeft = 180;

let joyX = 0;
let joyY = 0;
let sprinting = false;


const player = {
  x: 0,
  y: 0,
  r: 18,
  speed: 4
};


const ball = {
  x: 0,
  y: 0,
  r: 8,
  vx: 0,
  vy: 0
};


const enemies = [
  {x:0,y:0,r:17,speed:1.5},
  {x:0,y:0,r:17,speed:1.7},
  {x:0,y:0,r:17,speed:1.4},
  {x:0,y:0,r:17,speed:1.3},
  {x:0,y:0,r:17,speed:1.6}
];


/* =========================
   PARTIDO
========================= */

function startMatch(mode) {

  modal.classList.add("hidden");

  menu.classList.add("hidden");

  game.classList.remove("hidden");

  home = 0;
  away = 0;

  timeLeft = 180;

  $("homeScore").textContent = "0";
  $("awayScore").textContent = "0";

  $("timer").textContent = "03:00";

  resize();

  running = true;

  requestAnimationFrame(loop);

}


/* =========================
   POSICIONES
========================= */

function resetPositions() {

  player.x = W * .25;
  player.y = H * .5;

  ball.x = player.x + 25;
  ball.y = player.y;

  ball.vx = 0;
  ball.vy = 0;

  enemies.forEach((enemy, i) => {

    enemy.x = W * (.55 + i * .06);

    enemy.y =
      H * (.25 + (i % 4) * .18);

  });

}


/* =========================
   RESIZE
========================= */

function resize() {

  W = canvas.width =
    window.innerWidth;

  H = canvas.height =
    window.innerHeight;

  resetPositions();

}


/* =========================
   DISTANCIA
========================= */

function distance(a,b) {

  return Math.hypot(
    a.x-b.x,
    a.y-b.y
  );

}


/* =========================
   JUGADOR
========================= */

function updatePlayer() {

  const speed =
    sprinting ? 6 : player.speed;

  player.x += joyX * speed;
  player.y += joyY * speed;

  player.x =
    Math.max(
      30,
      Math.min(W-30,player.x)
    );

  player.y =
    Math.max(
      90,
      Math.min(H-30,player.y)
    );


  if (
    distance(player,ball)
    < 45
  ) {

    ball.x +=
      (player.x-ball.x)*.25;

    ball.y +=
      (player.y-ball.y)*.25;

  }

}


/* =========================
   BOTS
========================= */

function updateEnemies() {

  enemies.forEach(enemy => {

    const dx =
      player.x-enemy.x;

    const dy =
      player.y-enemy.y;

    const d =
      Math.hypot(dx,dy);


    if(d>1) {

      enemy.x +=
        dx/d*enemy.speed;

      enemy.y +=
        dy/d*enemy.speed;

    }


    /* ROBO */

    if (
      distance(enemy,ball)
      < 35
    ) {

      ball.vx = -4;

      ball.vy =
        (Math.random()-.5)*6;

    }

  });

}


/* =========================
   BALÓN
========================= */

function updateBall() {

  ball.x += ball.vx;
  ball.y += ball.vy;

  ball.vx *= .96;
  ball.vy *= .96;

  if(
    ball.y<90 ||
    ball.y>H-25
  ) {

    ball.vy *= -.8;

  }

  checkGoal();

}


/* =========================
   GOLES
========================= */

function checkGoal() {

  const top = H*.4;
  const bottom = H*.6;


  if(
    ball.x<15 &&
    ball.y>top &&
    ball.y<bottom
  ) {

    away++;

    $("awayScore").textContent =
      away;

    resetPositions();

  }


  if(
    ball.x>W-15 &&
    ball.y>top &&
    ball.y<bottom
  ) {

    home++;

    $("homeScore").textContent =
      home;

    resetPositions();

  }


  if(ball.x<20) {

    ball.x=20;
    ball.vx*=-1;

  }


  if(ball.x>W-20) {

    ball.x=W-20;
    ball.vx*=-1;

  }

}


/* =========================
   CAMPO
========================= */

function drawField() {

  ctx.fillStyle="#08752e";

  ctx.fillRect(
    0,0,W,H
  );


  ctx.strokeStyle="white";
  ctx.lineWidth=3;


  ctx.strokeRect(
    15,80,
    W-30,
    H-105
  );


  ctx.beginPath();

  ctx.moveTo(
    W/2,80
  );

  ctx.lineTo(
    W/2,H-25
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.arc(
    W/2,
    H/2,
    70,
    0,
    Math.PI*2
  );

  ctx.stroke();


  ctx.strokeRect(
    15,
    H*.32,
    130,
    H*.36
  );


  ctx.strokeRect(
    W-145,
    H*.32,
    130,
    H*.36
  );


  /* PORTERÍAS */

  ctx.strokeRect(
    0,H*.42,
    18,H*.16
  );

  ctx.strokeRect(
    W-18,H*.42,
    18,H*.16
  );

}


/* =========================
   PERSONAJES
========================= */

function drawCharacter(x,y,r,body) {

  ctx.fillStyle="rgba(0,0,0,.25)";

  ctx.beginPath();

  ctx.ellipse(
    x,y+15,
    r+3,7,
    0,0,Math.PI*2
  );

  ctx.fill();


  ctx.fillStyle=body;

  ctx.beginPath();

  ctx.arc(
    x,y,
    r,
    0,
    Math.PI*2
  );

  ctx.fill();


  /* CABEZA */

  ctx.fillStyle="#d99a6c";

  ctx.beginPath();

  ctx.arc(
    x,
    y-r,
    9,
    0,
    Math.PI*2
  );

  ctx.fill();

}


/* =========================
   DIBUJAR
========================= */

function draw() {

  drawField();

  enemies.forEach(e =>
    drawCharacter(
      e.x,
      e.y,
      e.r,
      "#e33"
    )
  );

  drawCharacter(
    player.x,
    player.y,
    player.r,
    "#39ff88"
  );


  ctx.fillStyle="white";

  ctx.beginPath();

  ctx.arc(
    ball.x,
    ball.y,
    ball.r,
    0,
    Math.PI*2
  );

  ctx.fill();

}


/* =========================
   LOOP
========================= */

function loop() {

  if(!running) return;

  updatePlayer();

  updateEnemies();

  updateBall();

  draw();

  requestAnimationFrame(loop);

}


/* =========================
   JOYSTICK
========================= */

const joystick = $("joystick");
const stick = $("stick");

function moveJoystick(x,y) {

  const rect =
    joystick.getBoundingClientRect();

  const cx =
    rect.left+rect.width/2;

  const cy =
    rect.top+rect.height/2;

  let dx=x-cx;
  let dy=y-cy;

  const max=45;

  const d=Math.hypot(dx,dy);

  if(d>max) {

    dx=dx/d*max;
    dy=dy/d*max;

  }

  stick.style.transform =
    `translate(${dx}px,${dy}px)`;

  joyX=dx/max;
  joyY=dy/max;

}


function resetJoystick() {

  stick.style.transform=
    "translate(0,0)";

  joyX=0;
  joyY=0;

}


joystick.addEventListener(
  "pointerdown",
  e => {

    joystick.setPointerCapture(
      e.pointerId
    );

    moveJoystick(
      e.clientX,
      e.clientY
    );

  }
);


joystick.addEventListener(
  "pointermove",
  e => {

    if(e.buttons)
      moveJoystick(
        e.clientX,
        e.clientY
      );

  }
);


joystick.addEventListener(
  "pointerup",
  resetJoystick
);


joystick.addEventListener(
  "pointercancel",
  resetJoystick
);


/* =========================
   TIRO
========================= */

function shoot() {

  if(
    distance(player,ball)>70
  ) return;

  let dx=joyX;
  let dy=joyY;

  if(
    Math.abs(dx)<.1 &&
    Math.abs(dy)<.1
  ) dx=1;

  ball.vx=dx*12;
  ball.vy=dy*12;

}


$("shoot").addEventListener(
  "pointerdown",
  e => {

    e.preventDefault();

    shoot();

  }
);


/* =========================
   PASE
========================= */

function pass() {

  if(
    distance(player,ball)>70
  ) return;

  let dx=joyX;
  let dy=joyY;

  if(
    Math.abs(dx)<.1 &&
    Math.abs(dy)<.1
  ) dx=1;

  ball.vx=dx*7;
  ball.vy=dy*7;

}


$("pass").addEventListener(
  "pointerdown",
  e => {

    e.preventDefault();

    pass();

  }
);


/* =========================
   SPRINT
========================= */

$("sprint").addEventListener(
  "pointerdown",
  () => sprinting=true
);

$("sprint").addEventListener(
  "pointerup",
  () => sprinting=false
);

$("sprint").addEventListener(
  "pointercancel",
  () => sprinting=false
);


/* =========================
   VOLVER
========================= */

$("back").addEventListener(
  "click",
  () => {

    running=false;

    game.classList.add("hidden");

    menu.classList.remove("hidden");

    resetJoystick();

  }
);


/* =========================
   TEMPORIZADOR
========================= */

setInterval(() => {

  if(!running) return;

  timeLeft--;

  const min =
    Math.floor(timeLeft/60);

  const sec =
    timeLeft%60;

  $("timer").textContent =
    `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;


  if(timeLeft<=0) {

    running=false;

    alert(
      `🏁 FINAL\n\n${home} - ${away}`
    );

    game.classList.add("hidden");

    menu.classList.remove("hidden");

  }

},1000);


/* =========================
   INICIO
========================= */

window.addEventListener(
  "resize",
  resize
);

resize();
