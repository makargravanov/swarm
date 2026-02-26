export type Locale = 'en' | 'ru'

export interface Dictionary {
  header: {
    eyebrow: string
    title: string
    localeLabel: string
    themeToDark: string
    themeToLight: string
  }
  server: {
    title: string
    description: string
    statusChecking: string
    statusOnline: string
    statusOffline: string
    lastChecked: string
    checkNow: string
  }
  auth: {
    modeAriaLabel: string
    registerTab: string
    loginTab: string
    nicknameLabel: string
    emailLabel: string
    passwordLabel: string
    registerNicknamePlaceholder: string
    registerEmailPlaceholder: string
    registerPasswordPlaceholder: string
    loginEmailPlaceholder: string
    loginPasswordPlaceholder: string
    submitRegister: string
    submitRegisterPending: string
    submitLogin: string
    submitLoginPending: string
  }
  session: {
    title: string
    empty: string
    nicknameLabel: string
    emailLabel: string
    roleLabel: string
    roleAdmin: string
    roleUser: string
    refresh: string
    refreshPending: string
    logout: string
  }
  notices: {
    registered: string
    loggedIn: string
    signedOut: string
    sessionRefreshed: string
    unexpectedError: string
  }
}