import { ManagementError, type ManagedOffer, type OfferInput } from './management-client';
export const categories = [
  ['everyday', 'Artículos cotidianos'],
  ['food', 'Comida y postres'],
  ['classes', 'Clases'],
  ['repairs', 'Reparaciones'],
  ['personal_care', 'Cuidado personal'],
] as const;
export interface Form {
  title: string;
  description: string;
  kind: 'product' | 'service';
  category: OfferInput['category'];
  price: string;
  unit: string;
  stock: string;
  made: boolean;
  developments: number[];
  modalities: OfferInput['modalities'];
  response: string;
  preparation: string;
  ingredients: string;
  allergens: string;
  storage: string;
}
export function initial(offer: ManagedOffer | null): Form {
  if (!offer)
    return {
      title: '',
      description: '',
      kind: 'product',
      category: 'everyday',
      price: '',
      unit: 'pieza',
      stock: '0',
      made: false,
      developments: [],
      modalities: [],
      response: '60',
      preparation: '0',
      ingredients: '',
      allergens: '',
      storage: '',
    };
  const v = offer.versions.at(-1)!;
  const food = v.food ?? { ingredients: '', allergens: '', storage: '' };
  return {
    title: v.title,
    description: v.description,
    kind: v.kind,
    category: v.category,
    price: v.price_cents === null ? '' : (v.price_cents / 100).toFixed(2),
    unit: v.unit ?? 'pieza',
    stock: String(v.stock ?? 0),
    made: v.made_to_order,
    developments: v.developments,
    modalities: v.modalities,
    response: String(v.response_minutes),
    preparation: String(v.preparation_minutes),
    ingredients: food.ingredients,
    allergens: food.allergens,
    storage: food.storage,
  };
}
function number(value: string): number {
  if (!/^\d+$/u.test(value)) throw new ManagementError('Escribe cantidades enteras válidas.', 422);
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result > 2147483647)
    throw new ManagementError('La cantidad está fuera del límite permitido.', 422);
  return result;
}
function commercial(form: Form) {
  if (form.kind === 'service')
    return { price_cents: null, unit: null, stock: null, made_to_order: false };
  if (!/^\d{1,8}(\.\d{1,2})?$/u.test(form.price))
    throw new ManagementError('Escribe un precio en pesos con hasta dos decimales.', 422);
  const parts = form.price.split('.');
  const cents = Number(parts[0]) * 100 + Number((parts[1] ?? '').padEnd(2, '0'));
  if (cents < 1 || cents > 2147483647)
    throw new ManagementError(
      'El precio debe ser mayor que cero y estar dentro del límite permitido.',
      422,
    );
  return {
    price_cents: cents,
    unit: text(form.unit, 1, 60, 'unidad'),
    stock: form.made ? null : number(form.stock),
    made_to_order: form.made,
  };
}
function text(value: string, min: number, max: number, label: string) {
  const result = value.normalize('NFC').trim();
  if ([...result].length < min || [...result].length > max)
    throw new ManagementError('Revisa ' + label + '.', 422);
  return result;
}
function durations(form: Form) {
  const response = number(form.response),
    preparation = number(form.preparation);
  if (response < 1 || response > 1440 || preparation > 525600)
    throw new ManagementError('Revisa los tiempos de respuesta y preparación.', 422);
  return { response_minutes: response, preparation_minutes: preparation };
}
function food(form: Form) {
  if (form.category !== 'food') return null;
  return {
    ingredients: text(form.ingredients, 1, 500, 'los ingredientes'),
    allergens: text(form.allergens, 1, 500, 'los alérgenos'),
    storage: text(form.storage, 1, 500, 'la conservación'),
  };
}
export function input(form: Form): OfferInput {
  if (form.title.trim().length < 3 || form.description.trim().length < 20)
    throw new ManagementError(
      'Escribe un título de al menos 3 caracteres y una descripción de al menos 20.',
      422,
    );
  if (!form.developments.length || !form.modalities.length)
    throw new ManagementError('Elige cobertura y modalidad.', 422);
  return {
    title: text(form.title, 3, 120, 'el título'),
    description: text(form.description, 20, 2000, 'la descripción'),
    kind: form.kind,
    category: form.category,
    ...commercial(form),
    developments: form.developments,
    modalities: form.modalities,
    ...durations(form),
    food: food(form),
  };
}
export function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
