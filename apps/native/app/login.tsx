import React, { useState } from 'react'
import {
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@react-navigation/native'
import { useMutation } from '@tanstack/react-query'

import { useSession } from '@yuki/auth/react'

import { setToken } from '@/lib/session'
import { trpc } from '@/lib/trpc'
import { getBaseUrl } from '@/lib/utils'

export default function LoginPage() {
  const { fonts, colors } = useTheme()
  const { refresh } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { mutate, isPending, error } = useMutation(
    trpc.auth.signIn.mutationOptions({
      onSuccess: (data) => {
        setToken(data.sessionToken)
        void refresh()
        router.push('/')
      },
    }),
  )

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ ...styles.title, ...fonts.bold, color: colors.text }}>
        Login
      </Text>
      <View style={styles.form}>
        <View style={styles.form_item}>
          <Text style={{ ...styles.form_label, color: colors.text }}>
            Email
          </Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor={colors.text + '50'}
            style={{
              ...styles.form_input,
              borderColor: colors.border,
              color: colors.text,
            }}
            aria-disabled={isPending}
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text })
            }}
          />
        </View>

        <View style={styles.form_item}>
          <Text style={{ ...styles.form_label, color: colors.text }}>
            Password
          </Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor={colors.text + '50'}
            secureTextEntry
            style={{
              ...styles.form_input,
              borderColor: colors.border,
              color: colors.text,
            }}
            aria-disabled={isPending}
            value={formData.password}
            onChangeText={(text) => {
              setFormData({ ...formData, password: text })
            }}
          />
        </View>

        <Text style={{ color: colors.text }}>
          Don&apos;t have an account?{' '}
          <Pressable
            onPress={async () => {
              await Linking.openURL(`${getBaseUrl()}/register`)
            }}
          >
            <Text style={{ ...fonts.bold, color: colors.text }}>
              Register here
            </Text>
          </Pressable>
        </Text>

        <Pressable
          style={{
            ...styles.form_button,
            backgroundColor: colors.primary,
            opacity: isPending ? 0.8 : 1,
          }}
          onPress={() => {
            mutate(formData)
          }}
          disabled={isPending}
        >
          <Text>Login</Text>
        </Pressable>

        {error && <Text style={{ color: '#ff0000' }}>{error.message}</Text>}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 16,
    gap: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  form_item: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  form_label: {
    fontSize: 16,
  },
  form_input: {
    borderWidth: 1,
    borderRadius: 6,
    fontSize: 16,
  },
  form_button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 6,
    fontSize: 12,
    height: 36,
  },
})
