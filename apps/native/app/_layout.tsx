import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_700Bold,
  Geist_900Black,
  useFonts,
} from '@expo-google-fonts/geist'
import { ThemeProvider } from '@react-navigation/native'
import { QueryClientProvider } from '@tanstack/react-query'

import { SessionProvider } from '@yuki/auth/react'

import { getToken } from '@/lib/session'
import { DarkTheme, LightTheme } from '@/lib/theme'
import { queryClient } from '@/lib/trpc'
import { getBaseUrl } from '@/lib/utils'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  useFonts([Geist_400Regular, Geist_500Medium, Geist_700Bold, Geist_900Black])

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : LightTheme}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider
          baseUrl={getBaseUrl()}
          sessionToken={getToken() ?? undefined}
        >
          <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar />
          </SafeAreaProvider>
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
