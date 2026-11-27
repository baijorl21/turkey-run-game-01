// All drawing: autumn farmyard, kitchen, turkey, farmer, hazards and HUD.
import { VIEW_W, VIEW_H, GROUND_Y, GOAL_DISTANCE, KITCHEN_DISTANCE } from './config.js';

export function drawGame(ctx, world) {
  const kitchen = world.distance >= KITCHEN_DISTANCE;
  drawBackdrop(ctx, world, kitchen);
  drawGround(ctx, world, kitchen);
  for (const corn of world.pickups) drawCorn(ctx, corn);
  for (const hz of world.hazards) drawHazard(ctx, hz);
  drawGate(ctx, world);
  drawFarmer(ctx, world);
  drawTurkey(ctx, world);
  drawHud(ctx, world);
  if (world.mode === 'title') drawTitle(ctx, world);
  if (world.mode === 'caught' || world.mode === 'escaped') drawEnd(ctx, world);
}

function drawBackdrop(ctx, world, kitchen) {
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  if (kitchen) {
    sky.addColorStop(0, '#5b3a29');
    sky.addColorStop(1, '#8a5a35');
  } else {
    sky.addColorStop(0, '#f9d976');
    sky.addColorStop(0.55, '#f6a65b');
    sky.addColorStop(1, '#e2703a');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const drift = (world.distance * 6) % 480;
  ctx.fillStyle = kitchen ? 'rgba(255,214,150,0.16)' : 'rgba(255,255,255,0.35)';
  for (let i = -1; i < 4; i++) {
    const x = i * 480 - drift;
    if (kitchen) {
      ctx.fillRect(x + 40, 70, 150, 110);
      ctx.fillRect(x + 260, 50, 90, 70);
    } else {
      ctx.beginPath();
      ctx.ellipse(x + 130, 90, 90, 26, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 190, 76, 60, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (!kitchen) {
    ctx.fillStyle = '#b5522d';
    ctx.fillRect(700 - (world.distance * 2 % 900), 250, 150, 120);
    ctx.fillStyle = '#7c3319';
    ctx.beginPath();
    ctx.moveTo(690 - (world.distance * 2 % 900), 250);
    ctx.lineTo(775 - (world.distance * 2 % 900), 195);
    ctx.lineTo(860 - (world.distance * 2 % 900), 250);
    ctx.fill();
  } else {
    ctx.fillStyle = '#3d2415';
    ctx.fillRect(0, 330, VIEW_W, 14);
    ctx.fillStyle = '#d9a05b';
    for (let i = 0; i < 6; i++) ctx.fillRect(80 + i * 160, 300, 60, 30);
  }
}

function drawGround(ctx, world, kitchen) {
  ctx.fillStyle = kitchen ? '#6e4525' : '#8a5a2b';
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = kitchen ? '#8a5f36' : '#a9713a';
  const step = 64;
  const off = (world.distance * 10) % step;
  for (let x = -step; x < VIEW_W + step; x += step) {
    ctx.fillRect(x - off, GROUND_Y + 18, 34, 6);
  }
  ctx.fillStyle = kitchen ? '#e8b26a' : '#f2c14e';
  ctx.fillRect(0, GROUND_Y, VIEW_W, 5);
}

function drawCorn(ctx, corn) {
  ctx.save();
  ctx.translate(corn.x, corn.y);
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 16, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8a812';
  for (let i = -1; i <= 1; i++) ctx.fillRect(i * 6 - 2, -12, 3, 24);
  ctx.fillStyle = '#5d8a3c';
  ctx.beginPath();
  ctx.moveTo(-6, 12);
  ctx.lineTo(-20, 24);
  ctx.lineTo(-2, 16);
  ctx.fill();
  ctx.restore();
}

function drawHazard(ctx, hz) {
  const base = GROUND_Y;
  if (hz.kind === 'fence') {
    ctx.fillStyle = '#7c4a21';
    ctx.fillRect(hz.x, base - hz.h, 10, hz.h);
    ctx.fillRect(hz.x + hz.w - 10, base - hz.h, 10, hz.h);
    ctx.fillRect(hz.x - 4, base - hz.h + 10, hz.w + 8, 9);
    ctx.fillRect(hz.x - 4, base - 22, hz.w + 8, 9);
  } else if (hz.kind === 'oven') {
    ctx.fillStyle = '#4a4a52';
    ctx.fillRect(hz.x, base - hz.h, hz.w, hz.h);
    ctx.fillStyle = '#2c2c33';
    ctx.fillRect(hz.x + 8, base - hz.h + 22, hz.w - 16, hz.h - 34);
    ctx.fillStyle = '#ff7b33';
    ctx.fillRect(hz.x + 14, base - 34, hz.w - 28, 14);
    ctx.fillStyle = '#c9c9d1';
    ctx.fillRect(hz.x + 6, base - hz.h + 8, hz.w - 12, 6);
  } else {
    ctx.save();
    ctx.translate(hz.x + hz.w / 2, base - hz.h / 2);
    ctx.rotate(-0.5);
    ctx.fillStyle = '#dfe6ee';
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.lineTo(18, -9);
    ctx.lineTo(26, 2);
    ctx.lineTo(-18, 9);
    ctx.fill();
    ctx.fillStyle = '#5b3a1e';
    ctx.fillRect(20, -4, 18, 8);
    ctx.restore();
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(hz.x + 8, base - 14, hz.w - 16, 14);
  }
}

function drawGate(ctx, world) {
  const remaining = GOAL_DISTANCE - world.distance;
  if (remaining > 260) return;
  const x = 760 + remaining * 0.4;
  ctx.fillStyle = '#5d8a3c';
  ctx.fillRect(x, GROUND_Y - 150, 14, 150);
  ctx.fillRect(x + 86, GROUND_Y - 150, 14, 150);
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(x - 8, GROUND_Y - 168, 116, 22);
  ctx.fillStyle = '#5b3a1e';
  ctx.font = 'bold 17px Georgia';
  ctx.fillText('FREEDOM', x + 4, GROUND_Y - 152);
}

function drawFarmer(ctx, world) {
  const f = world.farmer;
  const x = f.x;
  const base = GROUND_Y;
  const bob = Math.sin(f.swing) * 4;
  ctx.save();
  ctx.translate(x, base + bob * 0.3);
  ctx.fillStyle = '#33526e';
  ctx.fillRect(-14, -52, 12, 52);
  ctx.fillRect(4, -52, 12, 52);
  ctx.fillStyle = '#b5522d';
  ctx.fillRect(-20, -96, 42, 48);
  ctx.fillStyle = '#f2c49b';
  ctx.beginPath();
  ctx.arc(2, -108, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8b23a';
  ctx.fillRect(-20, -124, 44, 7);
  ctx.fillRect(-8, -136, 22, 13);
  ctx.strokeStyle = '#6e4525';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(18, -84);
  ctx.lineTo(52, -104 + Math.sin(f.swing) * 8);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(240,240,240,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(66, -108 + Math.sin(f.swing) * 8, 20, 26, 0.4, 0, Math.PI * 2);
  ctx.stroke();
  if (f.spotted) {
    ctx.fillStyle = '#fff3c4';
    ctx.font = 'bold 26px Georgia';
    ctx.fillText('!', -4, -146);
  }
  ctx.restore();
}

function drawTurkey(ctx, world) {
  const t = world.turkey;
  const blink = t.hurtTimer > 0 && Math.floor(world.time * 14) % 2 === 0;
  ctx.save();
  ctx.translate(t.x, t.y);
  if (blink) ctx.globalAlpha = 0.45;
  const squash = t.ducking ? 0.62 : 1;
  ctx.scale(1, squash);
  const legSwing = Math.sin(t.runPhase) * 10;
  ctx.strokeStyle = '#d98a2b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-6, -16);
  ctx.lineTo(-6 + legSwing, 0);
  ctx.moveTo(8, -16);
  ctx.lineTo(8 - legSwing, 0);
  ctx.stroke();
  ctx.fillStyle = '#8a5a2b';
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + i * 0.42;
    ctx.save();
    ctx.translate(-22, -42);
    ctx.rotate(a);
    ctx.fillRect(-4, -34, 8, 34);
    ctx.restore();
  }
  ctx.fillStyle = '#a9713a';
  ctx.beginPath();
  ctx.ellipse(0, -34, 30, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c98d4b';
  ctx.beginPath();
  ctx.ellipse(6, -30, 18, 12, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a9713a';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(20, -46);
  ctx.lineTo(34, -66);
  ctx.stroke();
  ctx.fillStyle = '#b57a3e';
  ctx.beginPath();
  ctx.arc(38, -70, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e2703a';
  ctx.beginPath();
  ctx.moveTo(47, -70);
  ctx.lineTo(60, -66);
  ctx.lineTo(47, -62);
  ctx.fill();
  ctx.fillStyle = '#d64541';
  ctx.beginPath();
  ctx.ellipse(42, -56, 4, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(41, -73, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(42, -73, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHud(ctx, world) {
  ctx.fillStyle = 'rgba(43,22,8,0.72)';
  ctx.fillRect(14, 12, 430, 54);
  ctx.fillStyle = '#ffe9bd';
  ctx.font = 'bold 21px Georgia';
  ctx.fillText(`Score ${Math.floor(world.score)}`, 28, 46);
  ctx.fillText(`Corn ${world.corn}`, 180, 46);
  ctx.fillText(`Lives ${'♥'.repeat(Math.max(0, world.lives))}`, 292, 46);
  const progress = Math.min(1, world.distance / GOAL_DISTANCE);
  ctx.fillStyle = 'rgba(43,22,8,0.72)';
  ctx.fillRect(14, 74, 430, 16);
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(17, 77, 424 * progress, 10);
  ctx.fillStyle = '#ffe9bd';
  ctx.font = '16px Georgia';
  ctx.fillText(world.distance >= KITCHEN_DISTANCE ? 'Kitchen run' : 'Farmyard escape', 700, 40);
  ctx.fillText(`${Math.floor(world.distance)}m / ${GOAL_DISTANCE}m`, 700, 64);
  if (world.messageTimer > 0 && world.message) {
    ctx.font = 'bold 24px Georgia';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff3c4';
    ctx.fillText(world.message, VIEW_W / 2, 120);
    ctx.textAlign = 'left';
  }
}

function panel(ctx, title, lines) {
  ctx.fillStyle = 'rgba(43,22,8,0.82)';
  ctx.fillRect(190, 96, 580, 330);
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 3;
  ctx.strokeRect(190, 96, 580, 330);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 44px Georgia';
  ctx.fillText(title, VIEW_W / 2, 170);
  ctx.fillStyle = '#ffe9bd';
  ctx.font = '21px Georgia';
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 220 + i * 34));
  ctx.textAlign = 'left';
}

function drawTitle(ctx, world) {
  panel(ctx, 'Turkey Breakout', [
    'Dinner Dash: outrun the farmer,',
    'dodge the oven and the carving knife,',
    'grab corn and reach the far gate.',
    '',
    'Space jump · S duck · Shift sprint',
    'Press Enter or click to run',
    world.best ? `Best score: ${world.best}` : '',
  ]);
}

function drawEnd(ctx, world) {
  const escaped = world.mode === 'escaped';
  panel(ctx, escaped ? 'You Escaped!' : 'Caught!', [
    escaped ? 'No Thanksgiving dinner tonight.' : 'The farmer got his turkey.',
    `Score: ${world.score}   Corn: ${world.corn}`,
    `Distance: ${Math.floor(world.distance)}m   Best: ${world.best}`,
    '',
    'Press Enter or click to run again',
  ]);
}
