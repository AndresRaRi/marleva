export interface FileStorage {
  read(key: string): Promise<{ data: Uint8Array; mime: string }>;
  remove(key: string): Promise<void>;
  absent(key: string): Promise<boolean>;
}
