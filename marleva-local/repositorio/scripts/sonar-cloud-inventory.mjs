import { setTimeout as delay } from 'node:timers/promises';

function consistent(inventory, pullRequest) {
  const value = inventory.measures.measures.find((item) => item.metric === 'violations')?.value;
  if (value === undefined && pullRequest) return true;
  const expected = Number(value);
  if (typeof value !== 'string' || !/^\d+$/.test(value) || !Number.isSafeInteger(expected))
    throw new Error('Medida de incidencias Cloud ausente o inválida');
  return expected === inventory.issues.length;
}

export async function consistentCloudInventory(read, verify, persist, pullRequest, pause = delay) {
  for (let attempt = 1; attempt <= 8; attempt++) {
    await verify();
    const inventory = await read();
    await verify();
    persist(attempt, inventory);
    if (consistent(inventory, pullRequest)) return { ...inventory, inventoryAttempts: attempt };
    if (attempt === 8) throw new Error('Inventario Cloud no coincide con medida nativa');
    await pause(Math.min(2 ** attempt, 32) * 1000);
  }
  throw new Error('Inventario Cloud sin resultado');
}
