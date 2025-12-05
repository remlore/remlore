import { NullAble } from '@remlore/shared/util/types'

export const removeUndefined = <T extends object>(obj: T): NullAble<T> => {
  const _obj = {} as NullAble<T>

  for (const key in obj) {
    if (obj[key] === undefined) {
      continue
    }

    _obj[key] = obj[key]
  }

  return _obj
}
