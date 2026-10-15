import { categories, modalities, fail, type OfferData, type Food } from '../../domain/catalog.js';
import { object, keys, string, integer, choice, list } from './validation.js';
function food(value: unknown): Food | null {
  if (value === null) return null;
  const data = object(value);
  keys(data, ['ingredients', 'allergens', 'storage']);
  return {
    ingredients: string(data.ingredients, 1, 500),
    allergens: string(data.allergens, 1, 500),
    storage: string(data.storage, 1, 500),
  };
}
function commercial(data: Record<string, unknown>, kind: string) {
  if (typeof data.made_to_order !== 'boolean') fail('FIELDS', 'Indica la disponibilidad.');
  if (kind === 'service') {
    if (
      data.price_cents !== null ||
      data.unit !== null ||
      data.stock !== null ||
      data.made_to_order
    ) {
      fail('FIELDS', 'Los servicios requieren cotización.');
    }
    return { price_cents: null, unit: null, stock: null, made_to_order: false };
  }
  const stock = data.made_to_order ? null : integer(data.stock, 0, 2147483647);
  if (data.made_to_order && data.stock !== null)
    fail('FIELDS', 'Por encargo no lleva cantidad fija.');
  return {
    price_cents: integer(data.price_cents, 1, 2147483647),
    unit: string(data.unit, 1, 60),
    stock,
    made_to_order: data.made_to_order,
  };
}
export function parseOfferData(value: unknown): OfferData {
  const data = object(value);
  keys(data, [
    'title',
    'description',
    'kind',
    'category',
    'price_cents',
    'unit',
    'stock',
    'made_to_order',
    'developments',
    'modalities',
    'response_minutes',
    'preparation_minutes',
    'food',
  ]);
  const kind = choice(data.kind, ['product', 'service']);
  const category = choice(data.category, categories);
  const details = food(data.food);
  if (category === 'food' && details === null)
    fail('FIELDS', 'Indica ingredientes, alérgenos y conservación.');
  const modes = list(data.modalities, 4, (item) => choice(item, modalities));
  const allowed = kind === 'product' ? ['delivery', 'pickup'] : ['home', 'establishment'];
  if (modes.some((mode) => !allowed.includes(mode)))
    fail('FIELDS', 'La modalidad no corresponde a la oferta.');
  return {
    title: string(data.title, 3, 120),
    description: string(data.description, 20, 2000),
    kind,
    category,
    ...commercial(data, kind),
    developments: list(data.developments, 7, (item) => integer(item, 1, 7)),
    modalities: modes,
    response_minutes: integer(data.response_minutes, 1, 1440),
    preparation_minutes: integer(data.preparation_minutes, 0, 525600),
    food: details,
  };
}
