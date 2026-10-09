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

/**
 * Returns the entity type a well-formed entity ID was created for, or `null`
 * when the value is not a valid entity ID for any known type.
 *
 * Inverse of {@link createEntityId}.
 */
export function getEntityType(value: string): EntityType | null {
  if (!isValidEntityId(value)) return null;
  const prefix = value.slice(0, value.indexOf("_"));
  for (const [type, p] of Object.entries(prefixes)) {
    if (p === prefix) return type as EntityType;
  }
  return null;
}

export interface ParsedEntityId {
  /** The entity type this ID was created for. */
  type: EntityType;
  /**
   * The unique CUID2 body — everything after the prefix and underscore.
   * The part of the ID that distinguishes one entity from another within
   * the same type.
   */
  id: string;
  /** The original entity ID string, preserved for pass-through use. */
  raw: string;
}

/**
 * Parse a well-formed entity ID into its type and unique-id parts.
 *
 * Combines validation, type extraction, and CUID body extraction in one
 * call. Returns `null` when the value is not a valid entity ID for any
 * known type.
 *
 * Inverse of {@link createEntityId}: every string produced by
 * `createEntityId(type)` can be decomposed back into
 * `{ type, id, raw }` via this function.
 *
 * @example
 * ```ts
 * const parsed = parseEntityId("nt_abcdef...");
 * // { type: "note", id: "abcdef...", raw: "nt_abcdef..." }
 * ```
 */
export function parseEntityId(value: string): ParsedEntityId | null {
  if (!isValidEntityId(value)) return null;
  const type = getEntityType(value);
  if (!type) return null;
  const prefix = prefixes[type];
  return { type, id: value.slice(prefix.length + 1), raw: value };
}
