const NUMBER = '0123456789'
const CHAR = 'abcdefghijklmnopqrstuvwxyz'
const CAP_CHAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const SCP = '!@#$%^&*()_+{}:+=-<>?|[];"\\\'`,./~'

export const randomString = (length: number, special = false) => {
  const str = CHAR + CAP_CHAR + NUMBER + (special ? SCP : '')

  let password = ''

  for (let i = 0; i < length; i++) password += str[Math.floor(Math.random() * str.length)]

  return password
}

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
