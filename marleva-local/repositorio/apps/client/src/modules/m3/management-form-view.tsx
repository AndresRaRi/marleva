import React from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { Action, Message, developmentNames, styles } from './components';
import { VersionSummary } from './management-components';
import { categories, toggle, type Form } from './management-form-data';
import type {
  ManagementClient,
  ManagedOffer,
  ManagedVersion,
  OfferInput,
} from './management-client';
type Field = (key: keyof Form, label: string, multiline?: boolean) => React.ReactNode;
type SetForm = React.Dispatch<React.SetStateAction<Form>>;
interface PhotoProps {
  client: ManagementClient;
  offer: ManagedOffer | null;
  version: ManagedVersion | undefined;
  action: { busy: boolean };
  save: () => Promise<ManagedOffer | null>;
  upload: (file: File) => Promise<void>;
  send: () => Promise<void>;
}
interface ViewProps extends PhotoProps {
  original: ManagedOffer | null;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  form: Form;
  setForm: SetForm;
  field: Field;
  back: () => void;
  next: () => Promise<void>;
  notice: string | null;
  action: { busy: boolean; error: string | null };
  locked: boolean;
}
function Basics({ form, setForm, field }: { form: Form; setForm: SetForm; field: Field }) {
  return (
    <>
      <Text style={styles.heading}>Qué ofreces</Text>
      <View style={styles.row}>
        {(['product', 'service'] as const).map((kind) => (
          <Action
            key={kind}
            label={kind === 'product' ? 'Producto' : 'Servicio'}
            secondary={form.kind !== kind}
            onPress={() => setForm({ ...form, kind, modalities: [] })}
          />
        ))}
      </View>
      {field('title', 'Título')}
      {field('description', 'Descripción', true)}
      <Text style={styles.text}>Categoría</Text>
      <View style={styles.row}>
        {categories.map(([category, label]) => (
          <Action
            key={category}
            label={label}
            secondary={form.category !== category}
            onPress={() => setForm({ ...form, category })}
          />
        ))}
      </View>
    </>
  );
}
function Details({ form, setForm, field }: { form: Form; setForm: SetForm; field: Field }) {
  const modes =
    form.kind === 'product'
      ? [
          ['delivery', 'Entrega'],
          ['pickup', 'Recogida'],
        ]
      : [
          ['home', 'A domicilio'],
          ['establishment', 'En establecimiento'],
        ];
  return (
    <>
      <Text style={styles.heading}>Precio y disponibilidad</Text>
      {form.kind === 'product' ? (
        <>
          {field('price', 'Precio en pesos MXN')}
          {field('unit', 'Unidad')}
          <Action
            label={form.made ? 'Por encargo: sí' : 'Por encargo: no'}
            secondary
            onPress={() => setForm({ ...form, made: !form.made })}
          />
          {!form.made && field('stock', 'Cantidad disponible')}
        </>
      ) : (
        <Message message="Los servicios requieren cotización; no llevan precio fijo ni cantidad." />
      )}
      <Text style={styles.heading}>Desarrollos atendidos</Text>
      {developmentNames.map((name, index) => (
        <Action
          key={name}
          label={name}
          secondary={!form.developments.includes(index + 1)}
          onPress={() => setForm({ ...form, developments: toggle(form.developments, index + 1) })}
        />
      ))}
      <Text style={styles.heading}>Modalidad</Text>
      <View style={styles.row}>
        {modes.map(([mode, label]) => (
          <Action
            key={mode}
            label={label}
            secondary={!form.modalities.includes(mode as OfferInput['modalities'][number])}
            onPress={() =>
              setForm({
                ...form,
                modalities: toggle(form.modalities, mode as OfferInput['modalities'][number]),
              })
            }
          />
        ))}
      </View>
      {field('response', 'Respuesta en minutos')}
      {field('preparation', 'Preparación en minutos')}
      {form.category === 'food' && (
        <>
          {field('ingredients', 'Ingredientes', true)}
          {field('allergens', 'Alérgenos', true)}
          {field('storage', 'Conservación', true)}
        </>
      )}
    </>
  );
}
function Photos({ client, offer, version, action, save, upload, send }: PhotoProps) {
  return (
    <>
      <Text style={styles.heading}>Fotos y revisión final</Text>
      <Text style={styles.text}>
        Guarda el borrador antes de añadir fotos. Enviar a revisión no publica.
      </Text>
      <Action
        label="Guardar borrador"
        disabled={action.busy}
        onPress={() => {
          void save();
        }}
      />
      {version && offer && <VersionSummary client={client} offer={offer} version={version} />}
      {version?.state === 'draft' && (
        <>
          {Platform.OS === 'web' ? (
            <input
              type="file"
              style={{
                fontSize: 16,
                minHeight: 48,
                width: '100%',
                maxWidth: '100%',
                padding: 8,
                border: '1px solid #6A8878',
                borderRadius: 12,
              }}
              accept="image/jpeg,image/png"
              aria-label="Añadir foto"
              disabled={action.busy || version.photos.length >= 6}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = '';
                if (file) void upload(file);
              }}
            />
          ) : (
            <Message message="La selección de fotos en dispositivo requiere la integración nativa pendiente." />
          )}
          <Text style={styles.small}>JPEG o PNG · Hasta 5 MB por foto · Máximo seis</Text>
        </>
      )}
      <Action
        label="Enviar a revisión"
        disabled={action.busy}
        onPress={() => {
          void send();
        }}
      />
    </>
  );
}
function Steps(props: ViewProps) {
  if (props.step === 1)
    return <Basics form={props.form} setForm={props.setForm} field={props.field} />;
  if (props.step === 2)
    return <Details form={props.form} setForm={props.setForm} field={props.field} />;
  return <Photos {...props} />;
}
function Navigation({
  step,
  setStep,
  busy,
  next,
}: {
  step: number;
  setStep: ViewProps['setStep'];
  busy: boolean;
  next: () => Promise<void>;
}) {
  return (
    <View style={styles.row}>
      {step > 1 && (
        <Action label="Paso anterior" secondary disabled={busy} onPress={() => setStep(step - 1)} />
      )}
      {step < 3 && (
        <Action
          label="Continuar"
          disabled={busy}
          onPress={() => {
            void next();
          }}
        />
      )}
    </View>
  );
}
export function ManagementFormView(props: ViewProps) {
  return (
    <ScrollView style={styles.root}>
      <View style={styles.content}>
        <Action label="Volver a mis ofertas" secondary onPress={props.back} />
        <Text accessibilityRole="header" aria-level={1} style={styles.title}>
          {props.original ? 'Editar oferta' : 'Nueva oferta'}
        </Text>
        <Text style={styles.small}>Paso {props.step} de 3</Text>
        {props.action.error && <Message message={props.action.error} />}
        {props.notice && <Message message={props.notice} />}
        {props.locked ? (
          <Message message="Esta versión está en revisión. Espera la decisión antes de editar." />
        ) : (
          <>
            <Steps {...props} />
            <Navigation
              step={props.step}
              setStep={props.setStep}
              busy={props.action.busy}
              next={props.next}
            />
          </>
        )}
        {props.action.busy && <Message message="Guardando cambios…" />}
      </View>
    </ScrollView>
  );
}
