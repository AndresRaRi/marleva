import { CatalogClient, type CatalogPage, type Search } from './catalog-client';
export interface CatalogState extends CatalogPage {
  phase: 'idle' | 'loading' | 'ready' | 'error' | 'more';
  error: string | null;
  search: Search;
}
export class CatalogStore {
  state: CatalogState = { phase: 'idle', error: null, search: {}, items: [], next_cursor: null };
  private generation = 0;
  private controller: AbortController | null = null;
  private listeners = new Set<() => void>();
  constructor(private readonly client = new CatalogClient()) {}
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  snapshot = () => this.state;
  private publish(state: CatalogState) {
    this.state = state;
    this.listeners.forEach((listener) => listener());
  }
  dispose() {
    this.generation++;
    this.controller?.abort();
  }
  private accept(page: CatalogPage, search: Search, previous: CatalogState, more: boolean) {
    const items = more
      ? [
          ...previous.items,
          ...page.items.filter((item) => !previous.items.some((old) => old.id === item.id)),
        ]
      : page.items;
    this.publish({ search, phase: 'ready', error: null, items, next_cursor: page.next_cursor });
  }
  private begin(search: Search, more: boolean) {
    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;
    const previous = this.state;
    this.publish({
      ...previous,
      search,
      phase: more ? 'more' : 'loading',
      error: null,
      items: more ? previous.items : [],
      next_cursor: more ? previous.next_cursor : null,
    });
    return { previous, controller, generation: ++this.generation };
  }
  private rejected(error: unknown, generation: number, controller: AbortController) {
    if (generation !== this.generation || controller.signal.aborted) return;
    this.publish({
      ...this.state,
      phase: 'error',
      error: error instanceof Error ? error.message : 'No pudimos cargar las ofertas.',
    });
  }
  async load(search: Search = this.state.search, more = false) {
    if (more && (!this.state.next_cursor || ['more', 'loading'].includes(this.state.phase))) return;
    const { previous, controller, generation } = this.begin(search, more);
    try {
      const page = await this.client.list(
        search,
        more ? previous.next_cursor : null,
        controller.signal,
      );
      if (generation === this.generation) this.accept(page, search, previous, more);
    } catch (error) {
      this.rejected(error, generation, controller);
    }
  }
}
