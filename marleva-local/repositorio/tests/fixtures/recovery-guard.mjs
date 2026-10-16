import assert from 'node:assert/strict';
export const sourceVolumes = {
  supabase_db_marleva_m1: 'supabase_db_marleva-m1',
  supabase_storage_marleva_m1: 'supabase_storage_marleva-m1',
};
export function recoveryNames(run) {
  assert.match(run, /^\d{13}$/);
  const prefix = 'marleva-b12-' + run;
  return {
    prefix,
    network: prefix + '-private',
    db: prefix + '-db',
    pgBackup: prefix + '-backup-pg',
    storageBackup: prefix + '-backup-storage',
    pgTarget: prefix + '-target-pg',
    storageTarget: prefix + '-target-storage',
  };
}
export function assertRecoverySource(
  container,
  name,
  volume,
  destination,
  network = 'marleva-private',
) {
  assert.equal(container.Name, '/' + name);
  assert.match(container.Image, /^sha256:[a-f0-9]{64}$/);
  assert.equal(container.Mounts.length, 1, 'Montajes adicionales requieren revisión');
  const mount = container.Mounts[0];
  assert.equal(mount.Type, 'volume');
  assert.equal(mount.Name, volume);
  assert.equal(mount.Destination, destination);
  assert.ok(Object.hasOwn(container.NetworkSettings.Networks, network));
}
export function assertRecoveryCopy(source, target, names, volumes = sourceVolumes) {
  const knownSources = [...Object.values(volumes), names.pgBackup, names.storageBackup];
  const targets = [names.pgBackup, names.storageBackup, names.pgTarget, names.storageTarget];
  assert.ok(knownSources.includes(source), 'Origen no identificado');
  assert.ok(targets.includes(target), 'Destino no identificado');
  assert.notEqual(source, target);
  assert.ok(!Object.values(volumes).includes(target), 'No escribir en origen');
  assert.ok(
    [
      [volumes.supabase_db_marleva_m1, names.pgBackup],
      [volumes.supabase_storage_marleva_m1, names.storageBackup],
      [names.pgBackup, names.pgTarget],
      [names.storageBackup, names.storageTarget],
    ].some(([from, to]) => source === from && target === to),
    'No mezclar datos de PG y Storage',
  );
}
export function assertRecoveryManifest(expected, restored) {
  assert.deepEqual(restored, expected, 'Copia incompleta o contenido distinto: destino bloqueado');
}

export function assertRecoveryRepeat(previousRun, nextRun) {
  const previous = recoveryNames(previousRun);
  const next = recoveryNames(nextRun);
  assert.notEqual(previousRun, nextRun, 'Repetición exige destino nuevo');
  return { ...next, pgBackup: previous.pgBackup, storageBackup: previous.storageBackup };
}
