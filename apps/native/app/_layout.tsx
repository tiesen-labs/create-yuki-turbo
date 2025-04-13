import { Fragment } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_700Bold,
  useFonts,
} from '@expo-google-fonts/geist'

export default function RootLayout() {
  useFonts([Geist_400Regular, Geist_500Medium, Geist_700Bold])

  return (
    <Fragment>
      <Stack />
      <StatusBar />
    </Fragment>
  )
}
