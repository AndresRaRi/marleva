import React, { useState } from 'react';
import { ManagementClient, ManagementError, inputOf, type ManagedOffer } from './management-client';
import { Field } from './management-components';
import { initial, input, type Form } from './management-form-data';
import { ManagementFormView } from './management-form-view';
import { useManagedAction } from './management-state';
export function ManagementForm({
  client,
  original,
  sellerId,
  back,
  changed,
  expired,
}: {
  client: ManagementClient;
  original: ManagedOffer | null;
  sellerId: string;
  back: () => void;
  changed: () => void;
  expired: () => void;
}) {
  const [form, setForm] = useState(() => initial(original)),
    [step, setStep] = useState(1),
    [offer, setOffer] = useState(original),
    [newId] = useState(() => client.newId()),
    [saved, setSaved] = useState(
      original ? JSON.stringify(inputOf(original.versions.at(-1)!)) : '',
    ),
    [notice, setNotice] = useState<string | null>(null);
  const action = useManagedAction(client, expired),
    version = offer?.versions.at(-1),
    locked = version?.state === 'pending';
  const field = (key: keyof Form, label: string, multiline = false) => (
    <Field
      key={key}
      label={label}
      value={String(form[key])}
      change={(value) => setForm({ ...form, [key]: value })}
      multiline={multiline}
    />
  );
  async function save() {
    const result = await action.run('save:' + JSON.stringify(form), async (key, signal) => {
      const data = input(form),
        signature = JSON.stringify(data);
      if (offer && version?.state === 'draft' && saved === signature) return offer;
      const operation = offer ? 'edit' : 'create';
      const body = offer
        ? { expected_version: offer.revision, data }
        : { id: newId, seller_id: sellerId, data };
      const response = await client.command(operation, offer?.id ?? newId, body, key, signal);
      return client.detail(response.id, signal);
    });
    if (result) {
      setOffer(result);
      setSaved(JSON.stringify(inputOf(result.versions.at(-1)!)));
      setNotice('Borrador guardado. Todavía no se publica.');
      changed();
    }
    return result;
  }
  async function send() {
    const current = await save();
    if (!current) return;
    const v = current.versions.at(-1)!;
    const result = await action.run(
      'submit:' + current.id + ':' + current.revision,
      async (key, signal) => {
        await client.command(
          'submit',
          current.id,
          { expected_version: current.revision, version_id: v.id },
          key,
          signal,
        );
        return client.detail(current.id, signal);
      },
    );
    if (result) {
      setOffer(result);
      setNotice('Tu oferta se envió a revisión. Todavía no se publica.');
      changed();
    }
  }
  async function upload(file: File) {
    if (!offer || !version) return;
    const result = await action.run(
      'photo:' + version.id + ':' + file.name + ':' + file.size + ':' + file.lastModified,
      async (key, signal) => {
        if (saved !== JSON.stringify(input(form)))
          throw new ManagementError('Guarda los cambios antes de añadir fotos.', 422);
        if (version.photos.length >= 6)
          throw new ManagementError('Puedes añadir hasta seis fotos.', 422);
        const used = new Set(version.photos.map((p) => p.position));
        const position = [1, 2, 3, 4, 5, 6].find((p) => !used.has(p))!;
        await client.upload(offer, version.id, file, position, key, signal);
        return client.detail(offer.id, signal);
      },
    );
    if (result) {
      setOffer(result);
      setNotice('Foto procesada y guardada de forma privada.');
      changed();
    }
  }
  async function next() {
    const result = await action.run('step:' + step, async () => {
      if (step === 1 && (form.title.trim().length < 3 || form.description.trim().length < 20))
        throw new ManagementError('Completa el título y la descripción.', 422);
      if (step === 2) input(form);
      return true;
    });
    if (result) setStep(step + 1);
  }
  return (
    <ManagementFormView
      client={client}
      original={original}
      back={back}
      step={step}
      setStep={setStep}
      form={form}
      setForm={setForm}
      field={field}
      offer={offer}
      version={version}
      action={action}
      save={save}
      upload={upload}
      send={send}
      next={next}
      notice={notice}
      locked={locked}
    />
  );
}
