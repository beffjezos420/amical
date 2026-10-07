import { init } from "@paralleldrive/cuid2";

const prefixes = { note: "nt", vocabulary: "voc", snippet: "snp" } as const;
export type EntityType = keyof typeof prefixes;

// Keep the complete default CUID2 length. Each runtime supplies secure randomness.
const createCuid = init({
  length: 24,
  random: () => crypto.getRandomValues(new Uint32Array(1))[0]! / 0x1_0000_0000,
});

export function createEntityId(entity: EntityType): string {
  return `${prefixes[entity]}_${createCuid()}`;
}

const entityIdPattern = /^(nt|voc|snp)_[a-z][a-z0-9]{23}$/;

/** Returns true when `value` is a well-formed entity ID for any known type. */
export function isValidEntityId(value: string): boolean {
  return entityIdPattern.test(value);
}
