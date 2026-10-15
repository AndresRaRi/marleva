export const categories = ['food', 'everyday', 'classes', 'repairs', 'personal_care'] as const;
export const modalities = ['delivery', 'pickup', 'home', 'establishment'] as const;
type Category = (typeof categories)[number];
type Modality = (typeof modalities)[number];
type Kind = 'product' | 'service';
type VersionState = 'draft' | 'pending' | 'approved' | 'correction' | 'rejected';
export interface Food {
  ingredients: string;
  allergens: string;
  storage: string;
}
export interface OfferData {
  title: string;
  description: string;
  kind: Kind;
  category: Category;
  price_cents: number | null;
  unit: string | null;
  stock: number | null;
  made_to_order: boolean;
  developments: number[];
  modalities: Modality[];
  response_minutes: number;
  preparation_minutes: number;
  food: Food | null;
}
export interface Seller {
  id: string;
  owner_id: string;
  public_name: string;
  membership_current: boolean;
  enabled: boolean;
  version: number;
}
export interface OfferVersion extends OfferData {
  id: string;
  number: number;
  state: VersionState;
  reason: string | null;
  reviewed_by: string | null;
}
export interface Offer {
  id: string;
  seller_id: string;
  paused: boolean;
  revision: number;
  public_version_id: string | null;
  versions: OfferVersion[];
}
export interface PublicSeller {
  id: string;
  name: string;
}
export interface PublicOffer extends OfferData {
  id: string;
  version_id: string;
  version: number;
  seller: PublicSeller;
  photos: { id: string; url: string }[];
  updated_at: string;
}
export interface Page {
  items: PublicOffer[];
  next_cursor: string | null;
}
export interface Filters {
  q?: string;
  category?: Category;
  kind?: Kind;
  development?: number;
  modality?: Modality;
  seller_id?: string;
}
export interface CatalogQuery extends Filters {
  limit: number;
  cursor?: string;
}
export class CatalogError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
export function fail(code: string, message: string, status = 422): never {
  throw new CatalogError(status, code, message);
}
export function eligible(seller: Seller): boolean {
  return seller.enabled && seller.membership_current;
}
export function publicSeller(seller: Seller): PublicSeller {
  return { id: seller.id, name: seller.public_name };
}
export function publicData(data: OfferData): OfferData {
  return {
    title: data.title,
    description: data.description,
    kind: data.kind,
    category: data.category,
    price_cents: data.price_cents,
    unit: data.unit,
    stock: data.stock,
    made_to_order: data.made_to_order,
    developments: data.developments,
    modalities: data.modalities,
    response_minutes: data.response_minutes,
    preparation_minutes: data.preparation_minutes,
    food: data.food,
  };
}
