const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const game = document.getElementById("game");

const playBtn = document.getElementById("playBtn");
const tournamentBtn = document.getElementById("tournamentBtn");
const playerBtn = document.getElementById("playerBtn");
const backBtn = document.getElementById("back");

const homeScore = document.getElementById("homeScore");
const awayScore = document.getElementById("awayScore");
const timerText = document.getElementById("timer");

const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");

const passBtn = document.getElementById("pass");
const shootBtn = document.getElementById("shoot");
const sprintBtn = document.getElementById("sprint");


/* =========================
   VARIABLES
========================= */

let W = 0;
let H = 0;

let running = false;

let home = 0;
let away = 0;

let timeLeft = 180;

let joyX = 0;
let joyY = 0;

let sprinting = false;


/* =========================
   JUGADOR
========================= */

const player = {
  x: 0,
  y: 0,
  r: 18,
  speed: 3.8
};


/* =========================
   BALÓN
========================= */

const ball = {
  x: 0,
  y: 0,
  r: 8,
  vx: 0,
  vy: 0
};


/* =========================
   RIVALES
========================= */

const enemies = [

  {
    x: 0,
    y: 0,
    r: 17,
    speed: 1.5
  },

  {
    x: 0,
    y: 0,
    r: 17,
    speed: 1.7
  },

  {
    x: 0,
    y: 0,
    r: 17,
    speed: 1.4
  }

];


/* =========================
   REDIMENSIONAR
========================= */

function resize() {

  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W;
  canvas.height = H;

  resetPositions();
}


/* =========================
   POSICIONES INICIALES
========================= */

function resetPositions() {

  player.x = W * 0.25;
  player.y = H * 0.5;

  ball.x = player.x + 25;
  ball.y = player.y;

  ball.vx = 0;
  ball.vy = 0;


  enemies[0].x = W * 0.65;
  enemies[0].y = H * 0.35;

  enemies[1].x = W * 0.72;
  enemies[1].y = H * 0.65;

  enemies[2].x = W * 0.55;
  enemies[2].y = H * 0.5;
}


/* =========================
   DISTANCIA
========================= */

function distance(a, b) {

  return Math.hypot(
    a.x - b.x,
    a.y - b.y
  );

}


/* =========================
   INICIAR PARTIDO
========================= */

function startGame() {

  menu.classList.add("hidden");

  game.classList.remove("hidden");

  home = 0;
  away = 0;

  timeLeft = 180;

  homeScore.textContent = "0";
  awayScore.textContent = "0";

  timerText.textContent = "03:00";

  resize();

  running = true;

  requestAnimationFrame(loop);
}


/* =========================
   BOTÓN JUGAR
========================= */

playBtn.addEventListener("click", function () {

  startGame();

});


/* =========================
   TORNEO
========================= */

tournamentBtn.addEventListener("click", function () {

  alert(
    "🏆 TORNEO\n\n" +
    "Modo torneo próximamente."
  );

});


/* =========================
   MI JUGADOR
========================= */

playerBtn.addEventListener("click", function () {

  alert(
    "👤 MI JUGADOR\n\n" +
    "Crea y mejora tu jugador próximamente."
  );

});


/* =========================
   VOLVER AL MENÚ
========================= */

backBtn.addEventListener("click", function () {

  running = false;

  game.classList.add("hidden");

  menu.classList.remove("hidden");

  resetJoystick();

});


/* =========================
   JUGADOR
========================= */

function updatePlayer() {

  const speed = sprinting
    ? 6
    : player.speed;


  player.x += joyX * speed;
  player.y += joyY * speed;


  player.x = Math.max(
    35,
    Math.min(
      W - 35,
      player.x
    )
  );


  player.y = Math.max(
    90,
    Math.min(
      H - 35,
      player.y
    )
  );


  /* CONTROL DEL BALÓN */

  if (
    distance(player, ball)
    <
    player.r + ball.r + 10
  ) {

    ball.x +=
      (player.x - ball.x) * 0.25;

    ball.y +=
      (player.y - ball.y) * 0.25;

  }

}


/* =========================
   BALÓN
========================= */

function updateBall() {

  ball.x += ball.vx;
  ball.y += ball.vy;


  ball.vx *= 0.96;
  ball.vy *= 0.96;


  if (
    ball.y < 90 ||
    ball.y > H - 20
  ) {

    ball.vy *= -0.8;

  }


  checkGoal();

}


/* =========================
   RIVALES
========================= */

function updateEnemies() {

  enemies.forEach(enemy => {

    const dx =
      player.x - enemy.x;

    const dy =
      player.y - enemy.y;

    const d =
      Math.hypot(dx, dy);


    if (d > 1) {

      enemy.x +=
        dx / d * enemy.speed;

      enemy.y +=
        dy / d * enemy.speed;

    }


    if (
      distance(enemy, player)
      <
      enemy.r + player.r
    ) {

      ball.vx = -3;

      ball.vy =
        (Math.random() - 0.5) * 4;

    }

  });

}


/* =========================
   GOLES
========================= */

function checkGoal() {

  const goalTop = H * 0.42;
  const goalBottom = H * 0.58;


  /* GOL VISITANTE */

  if (
    ball.x < 15 &&
    ball.y > goalTop &&
    ball.y < goalBottom
  ) {

    away++;

    awayScore.textContent = away;

    resetPositions();

  }


  /* GOL LOCAL */

  if (
    ball.x > W - 15 &&
    ball.y > goalTop &&
    ball.y < goalBottom
  ) {

    home++;

    homeScore.textContent = home;

    resetPositions();

  }


  /* PARED IZQUIERDA */

  if (ball.x < 20) {

    ball.x = 20;

    ball.vx *= -1;

  }


  /* PARED DERECHA */

  if (ball.x > W - 20) {

    ball.x = W - 20;

    ball.vx *= -1;

  }

}


/* =========================
   CAMPO
========================= */

function drawField() {

  ctx.clearRect(
    0,
    0,
    W,
    H
  );


  /* CÉSPED */

  ctx.fillStyle = "#08752e";

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /* FRANJAS */

  for (
    let x = 0;
    x < W;
    x += 80
  ) {

    ctx.fillStyle =
      x % 160 === 0
      ? "rgba(255,255,255,.025)"
      : "rgba(0,0,0,.025)";

    ctx.fillRect(
      x,
      0,
      80,
      H
    );

  }


  /* LÍNEAS */

  ctx.strokeStyle =
    "rgba(255,255,255,.85)";

  ctx.lineWidth = 3;


  /* BORDE */

  ctx.strokeRect(
    15,
    80,
    W - 30,
    H - 100
  );


  /* CENTRO */

  ctx.beginPath();

  ctx.moveTo(
    W / 2,
    80
  );

  ctx.lineTo(
    W / 2,
    H - 20
  );

  ctx.stroke();


  /* CÍRCULO CENTRAL */

  ctx.beginPath();

  ctx.arc(
    W / 2,
    H / 2,
    75,
    0,
    Math.PI * 2
  );

  ctx.stroke();


  /* PUNTO CENTRAL */

  ctx.fillStyle = "white";

  ctx.beginPath();

  ctx.arc(
    W / 2,
    H / 2,
    4,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* ÁREAS */

  ctx.strokeRect(
    15,
    H * .32,
    130,
    H * .36
  );


  ctx.strokeRect(
    W - 145,
    H * .32,
    130,
    H * .36
  );


  /* PORTERÍAS */

  ctx.strokeRect(
    0,
    H * .42,
    18,
    H * .16
  );


  ctx.strokeRect(
    W - 18,
    H * .42,
    18,
    H * .16
  );

}


/* =========================
   JUGADOR
========================= */

function drawPlayer() {

  /* SOMBRA */

  ctx.fillStyle =
    "rgba(0,0,0,.25)";

  ctx.beginPath();

  ctx.ellipse(
    player.x,
    player.y + 16,
    20,
    8,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* CUERPO */

  ctx.fillStyle = "#39ff88";

  ctx.beginPath();

  ctx.arc(
    player.x,
    player.y,
    player.r,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* CAMISETA */

  ctx.fillStyle = "#10251a";

  ctx.fillRect(
    player.x - 10,
    player.y - 5,
    20,
    15
  );


  /* CABEZA */

  ctx.fillStyle = "#d99a6c";

  ctx.beginPath();

  ctx.arc(
    player.x,
    player.y - 16,
    9,
    0,
    Math.PI * 2
  );

  ctx.fill();

}


/* =========================
   RIVALES
========================= */

function drawEnemies() {

  enemies.forEach(enemy => {

    /* SOMBRA */

    ctx.fillStyle =
      "rgba(0,0,0,.25)";

    ctx.beginPath();

    ctx.ellipse(
      enemy.x,
      enemy.y + 15,
      19,
      7,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();


    /* CUERPO */

    ctx.fillStyle = "#ff4040";

    ctx.beginPath();

    ctx.arc(
      enemy.x,
      enemy.y,
      enemy.r,
      0,
      Math.PI * 2
    );

    ctx.fill();


    /* CAMISETA */

    ctx.fillStyle = "#222";

    ctx.fillRect(
      enemy.x - 10,
      enemy.y - 5,
      20,
      15
    );


    /* CABEZA */

    ctx.fillStyle = "#d99a6c";

    ctx.beginPath();

    ctx.arc(
      enemy.x,
      enemy.y - 15,
      9,
      0,
      Math.PI * 2
    );

    ctx.fill();

  });

}


/* =========================
   BALÓN
========================= */

function drawBall() {

  ctx.fillStyle = "white";

  ctx.beginPath();

  ctx.arc(
    ball.x,
    ball.y,
    ball.r,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.strokeStyle = "#222";

  ctx.lineWidth = 2;

  ctx.stroke();

}


/* =========================
   DIBUJAR TODO
========================= */

function draw() {

  drawField();

  drawEnemies();

  drawPlayer();

  drawBall();

}


/* =========================
   BUCLE DEL JUEGO
========================= */

function loop() {

  if (!running) {
    return;
  }


  updatePlayer();

  updateEnemies();

  updateBall();

  draw();


  requestAnimationFrame(loop);

}


/* =========================
   JOYSTICK
========================= */

function moveJoystick(clientX, clientY) {

  const rect =
    joystick.getBoundingClientRect();


  const centerX =
    rect.left + rect.width / 2;


  const centerY =
    rect.top + rect.height / 2;


  let dx =
    clientX - centerX;


  let dy =
    clientY - centerY;


  const max = 45;


  const d =
    Math.hypot(dx, dy);


  if (d > max) {

    dx =
      dx / d * max;

    dy =
      dy / d * max;

  }


  stick.style.transform =
    `translate(${dx}px, ${dy}px)`;


  joyX =
    dx / max;

  joyY =
    dy / max;

}


/* =========================
   JOYSTICK RESET
========================= */

function resetJoystick() {

  stick.style.transform =
    "translate(0,0)";

  joyX = 0;

  joyY = 0;

}


/* =========================
   JOYSTICK TOUCH
========================= */

joystick.addEventListener(
  "pointerdown",
  function(event) {

    event.preventDefault();

    joystick.setPointerCapture(
      event.pointerId
    );

    moveJoystick(
      event.clientX,
      event.clientY
    );

  }
);


joystick.addEventListener(
  "pointermove",
  function(event) {

    if (
      event.buttons === 0
    ) {
      return;
    }

    event.preventDefault();

    moveJoystick(
      event.clientX,
      event.clientY
    );

  }
);


joystick.addEventListener(
  "pointerup",
  function() {

    resetJoystick();

  }
);


joystick.addEventListener(
  "pointercancel",
  function() {

    resetJoystick();

  }
);


/* =========================
   TIRAR
========================= */

function shoot() {

  if (
    distance(player, ball) > 70
  ) {
    return;
  }


  let dx = joyX;
  let dy = joyY;


  if (
    Math.abs(dx) < 0.1 &&
    Math.abs(dy) < 0.1
  ) {

    dx = 1;
    dy = 0;

  }


  ball.vx = dx * 12;

  ball.vy = dy * 12;

}


/* =========================
   PASAR
========================= */

function pass() {

  if (
    distance(player, ball) > 70
  ) {
    return;
  }


  let dx = joyX;
  let dy = joyY;


  if (
    Math.abs(dx) < 0.1 &&
    Math.abs(dy) < 0.1
  ) {

    dx = 1;
    dy = 0;

  }


  ball.vx = dx * 7;

  ball.vy = dy * 7;

}


/* =========================
   BOTÓN TIRAR
========================= */

shootBtn.addEventListener(
  "pointerdown",
  function(event) {

    event.preventDefault();

    shoot();

  }
);


/* =========================
   BOTÓN PASE
========================= */

passBtn.addEventListener(
  "pointerdown",
  function(event) {

    event.preventDefault();

    pass();

  }
);


/* =========================
   SPRINT
========================= */

sprintBtn.addEventListener(
  "pointerdown",
  function(event) {

    event.preventDefault();

    sprinting = true;

  }
);


sprintBtn.addEventListener(
  "pointerup",
  function() {

    sprinting = false;

  }
);


sprintBtn.addEventListener(
  "pointercancel",
  function() {

    sprinting = false;

  }
);


sprintBtn.addEventListener(
  "pointerleave",
  function() {

    sprinting = false;

  }
);


/* =========================
   TEMPORIZADOR
========================= */

setInterval(
  function() {

    if (!running) {
      return;
    }


    timeLeft--;


    const minutes =
      Math.floor(timeLeft / 60);


    const seconds =
      timeLeft % 60;


    timerText.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    if (timeLeft <= 0) {

      running = false;


      setTimeout(
        function() {

          alert(
            `FINAL\n\n${home} - ${away}`
          );


          game.classList.add("hidden");

          menu.classList.remove("hidden");

        },
        100
      );

    }

  },
  1000
);


/* =========================
   INICIO
========================= */

window.addEventListener(
  "resize",
  resize
);

resize();
