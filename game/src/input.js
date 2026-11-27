// Keyboard and mouse input, gathered into one small state object.
export function createInput(canvas) {
  const input = { jump: false, duck: false, sprint: false, confirm: false };
  const jumpKeys = new Set(['Space', 'ArrowUp', 'KeyW']);
  const duckKeys = new Set(['ArrowDown', 'KeyS']);
  function onKey(down) {
    return (event) => {
      if (jumpKeys.has(event.code)) { input.jump = down; event.preventDefault(); }
      if (duckKeys.has(event.code)) { input.duck = down; event.preventDefault(); }
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') input.sprint = down;
      if (event.code === 'Enter' && down) input.confirm = true;
    };
  }
  window.addEventListener('keydown', onKey(true));
  window.addEventListener('keyup', onKey(false));
  canvas.addEventListener('pointerdown', () => { input.jump = true; input.confirm = true; });
  canvas.addEventListener('pointerup', () => { input.jump = false; });
  return input;
}

export function consumeConfirm(input) {
  const was = input.confirm;
  input.confirm = false;
  return was;
}
