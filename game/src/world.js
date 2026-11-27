// Game state and rules: the turkey, the chasing farmer, hazards and corn.
import {
  VIEW_W, GROUND_Y, GRAVITY, JUMP_V, BASE_SPEED, SPRINT_BONUS,
  GOAL_DISTANCE, KITCHEN_DISTANCE, START_LIVES, CORN_POINTS, DODGE_POINTS,
} from './config.js';

export function createWorld() {
  return {
    mode: 'title',
    time: 0,
    distance: 0,
    score: 0,
    corn: 0,
    lives: START_LIVES,
    speed: BASE_SPEED,
    turkey: { x: 170, y: GROUND_Y, vy: 0, ducking: false, hurtTimer: 0, runPhase: 0 },
    farmer: { x: -40, gap: 210, swing: 0, spotted: false },
    hazards: [],
    pickups: [],
    spawnTimer: 0.6,
    cornTimer: 1.4,
    message: '',
    messageTimer: 0,
    best: Number(localStorage.getItem('turkey-breakout-best') || 0),
  };
}

export function startRun(world) {
  const fresh = createWorld();
  fresh.mode = 'play';
  fresh.best = world.best;
  Object.assign(world, fresh);
  world.message = 'Run, turkey, run!';
  world.messageTimer = 1.6;
}

function spawnHazard(world) {
  const kitchen = world.distance >= KITCHEN_DISTANCE;
  const kinds = kitchen ? ['oven', 'knife', 'knife', 'fence'] : ['fence', 'oven', 'knife'];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  const tall = kind === 'oven';
  world.hazards.push({
    kind,
    x: VIEW_W + 60,
    w: kind === 'knife' ? 54 : 64,
    h: tall ? 86 : kind === 'knife' ? 40 : 52,
    passed: false,
  });
}

function spawnCorn(world) {
  const high = Math.random() < 0.45;
  world.pickups.push({ x: VIEW_W + 40, y: high ? GROUND_Y - 120 : GROUND_Y - 36, taken: false });
}

function turkeyBox(world) {
  const t = world.turkey;
  const h = t.ducking ? 34 : 58;
  return { x: t.x - 26, y: t.y - h, w: 52, h };
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function updateWorld(world, input, dt, audio) {
  world.time += dt;
  if (world.messageTimer > 0) world.messageTimer -= dt;
  if (world.mode !== 'play') return;

  const t = world.turkey;
  const sprinting = input.sprint && t.y >= GROUND_Y;
  world.speed = BASE_SPEED + Math.min(190, world.distance * 0.09) + (sprinting ? SPRINT_BONUS : 0);
  world.distance += (world.speed * dt) / 10;
  world.score += dt * 4;

  t.ducking = input.duck && t.y >= GROUND_Y;
  if (input.jump && t.y >= GROUND_Y && !t.ducking) {
    t.vy = JUMP_V;
    audio.jump();
  }
  t.vy += GRAVITY * dt;
  t.y += t.vy * dt;
  if (t.y > GROUND_Y) { t.y = GROUND_Y; t.vy = 0; }
  t.runPhase += dt * (sprinting ? 16 : 11);
  if (t.hurtTimer > 0) t.hurtTimer -= dt;

  // The farmer closes in when the turkey dawdles and falls back on sprints.
  const f = world.farmer;
  f.gap += ((sprinting ? 26 : -14) + (t.hurtTimer > 0 ? -60 : 0)) * dt;
  f.gap = Math.max(70, Math.min(320, f.gap));
  f.x = t.x - f.gap;
  f.swing += dt * 7;
  const nowSpotted = f.gap < 130;
  if (nowSpotted && !f.spotted) audio.spot();
  f.spotted = nowSpotted;
  if (f.gap <= 72 && t.hurtTimer <= 0) hurt(world, audio, 'The farmer nearly netted you!');

  world.spawnTimer -= dt;
  if (world.spawnTimer <= 0) {
    spawnHazard(world);
    const pace = Math.max(0.62, 1.25 - world.distance / 2600);
    world.spawnTimer = pace * (0.8 + Math.random() * 0.5);
  }
  world.cornTimer -= dt;
  if (world.cornTimer <= 0) {
    spawnCorn(world);
    world.cornTimer = 1.1 + Math.random() * 1.4;
  }

  const box = turkeyBox(world);
  for (const hz of world.hazards) {
    hz.x -= world.speed * dt;
    const hzBox = { x: hz.x, y: GROUND_Y - hz.h, w: hz.w, h: hz.h };
    if (!hz.passed && hz.x + hz.w < box.x) {
      hz.passed = true;
      world.score += DODGE_POINTS;
    }
    if (t.hurtTimer <= 0 && overlaps(box, hzBox)) {
      hurt(world, audio, hz.kind === 'oven' ? 'Too close to the oven!' : hz.kind === 'knife' ? 'The carving knife nicked a feather!' : 'You clipped the fence!');
      hz.passed = true;
    }
  }
  world.hazards = world.hazards.filter((hz) => hz.x > -120);

  for (const corn of world.pickups) {
    corn.x -= world.speed * dt;
    if (!corn.taken && overlaps(box, { x: corn.x - 14, y: corn.y - 14, w: 28, h: 28 })) {
      corn.taken = true;
      world.corn += 1;
      world.score += CORN_POINTS;
      world.farmer.gap = Math.min(320, world.farmer.gap + 18);
      audio.corn();
    }
  }
  world.pickups = world.pickups.filter((c) => !c.taken && c.x > -60);

  if (world.distance >= KITCHEN_DISTANCE && world.messageTimer <= 0 && world.distance < KITCHEN_DISTANCE + 4) {
    world.message = 'Into the kitchen — watch the knives!';
    world.messageTimer = 1.8;
  }
  if (world.distance >= GOAL_DISTANCE) endRun(world, true, audio);
}

function hurt(world, audio, text) {
  world.lives -= 1;
  world.turkey.hurtTimer = 1.1;
  world.farmer.gap = 230;
  world.message = text;
  world.messageTimer = 1.4;
  audio.hurt();
  if (world.lives <= 0) endRun(world, false, audio);
}

function endRun(world, escaped, audio) {
  world.mode = escaped ? 'escaped' : 'caught';
  world.score = Math.floor(world.score);
  if (world.score > world.best) {
    world.best = world.score;
    localStorage.setItem('turkey-breakout-best', String(world.best));
  }
  if (escaped) audio.win(); else audio.lose();
}
