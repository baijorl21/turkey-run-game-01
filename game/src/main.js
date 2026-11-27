// Entry point: wires input, world, rendering and the animation loop.
import { createInput, consumeConfirm } from './input.js';
import { createWorld, startRun, updateWorld } from './world.js';
import { drawGame } from './render.js';
import { createAudio } from './audio.js';
import { GROUND_Y, KITCHEN_DISTANCE } from './config.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const audio = createAudio();
const world = createWorld();

function stageShot(kind) {
  if (kind === 'title') {
    world.mode = 'title';
    world.distance = 120;
  } else if (kind === 'cover') {
    startRun(world);
    world.distance = 420;
    world.score = 640;
    world.corn = 6;
    world.turkey.x = 270;
    world.turkey.y = GROUND_Y - 92;
    world.turkey.vy = -120;
    world.farmer.gap = 165;
    world.hazards = [{ kind: 'knife', x: 430, w: 54, h: 40, passed: false }, { kind: 'fence', x: 700, w: 64, h: 52, passed: false }];
    world.pickups = [{ x: 540, y: GROUND_Y - 120, taken: false }, { x: 810, y: GROUND_Y - 36, taken: false }];
    world.message = 'Leap the carving knife!';
    world.messageTimer = 2;
  } else if (kind === 'kitchen') {
    startRun(world);
    world.distance = KITCHEN_DISTANCE + 260;
    world.score = 1480;
    world.corn = 11;
    world.lives = 2;
    world.turkey.x = 260;
    world.farmer.gap = 150;
    world.farmer.spotted = true;
    world.turkey.ducking = true;
    world.hazards = [{ kind: 'oven', x: 560, w: 64, h: 86, passed: false }, { kind: 'knife', x: 820, w: 54, h: 40, passed: false }];
    world.pickups = [{ x: 380, y: GROUND_Y - 36, taken: false }];
    world.message = 'Into the kitchen — watch the knives!';
    world.messageTimer = 2;
  } else if (kind === 'end') {
    startRun(world);
    world.mode = 'escaped';
    world.distance = 1800;
    world.score = 2210;
    world.corn = 14;
    world.best = Math.max(world.best, 2210);
  }
  drawGame(ctx, world);
}

const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) {
  stageShot(shot);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (world.mode !== 'play' && consumeConfirm(input)) startRun(world);
    updateWorld(world, input, dt, audio);
    drawGame(ctx, world);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
