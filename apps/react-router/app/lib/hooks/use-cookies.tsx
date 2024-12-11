import { createContext, use } from 'react'

type Cookies<T extends Record<string, string>> = T | undefined

const cookiesContext = createContext<Cookies<Record<string, string>>>(undefined)

export const CookiesProvider: React.FC<{
  allCookies: Record<string, string>
  children: React.ReactNode
}> = ({ allCookies, children }) => (
  <cookiesContext.Provider value={allCookies}>{children}</cookiesContext.Provider>
)

export const useCookies = <T extends Record<string, string>>(): Cookies<T> => {
  const context = use(cookiesContext)
  if (context === undefined) throw new Error('useCookies must be used within a CookiesProvider')

  return {
    ...context,
  } as T
}
