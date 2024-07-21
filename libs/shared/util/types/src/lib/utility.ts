export type NullAble<T> = T | null

export type MapedValue<T extends object, V> = { [P in keyof T]: V }

export type MapKeyToOption<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | undefined : T[P]
}

export type MapKeyToRequire<T, K extends keyof T> = T & { [P in K]-?: NonNullable<T[K]> }

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys]

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

export type Either<T, K extends keyof T = keyof T> = K extends keyof T
  ? { [P in K]: T[K] } & Partial<Record<Exclude<keyof T, K>, never>>
  : never
