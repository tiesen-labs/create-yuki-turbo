import React, { useState } from 'react'
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useMutation } from '@tanstack/react-query'

import { setToken } from '@/lib/session'
import { trpc } from '@/lib/trpc'

export default function LoginPage() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <LoginForm />
    </SafeAreaView>
  )
}

const LoginForm = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { mutate, isPending } = useMutation(
    trpc.auth.signIn.mutationOptions({
      onError: (error) => {
        Alert.alert('Error:', error.message)
      },
      onSuccess: (data) => {
        setToken(data.sessionToken)
        Alert.alert('Success:', 'You are now logged in')
        router.push('/')
      },
    }),
  )

  return (
    <View style={styles.form}>
      <View style={styles.formItem}>
        <Text style={styles.formLabel}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#555"
          style={styles.formInput}
          aria-disabled={isPending}
          value={formData.email}
          onChangeText={(text) => {
            setFormData({ ...formData, email: text })
          }}
        />
      </View>

      <View style={styles.formItem}>
        <Text style={styles.formLabel}>Password</Text>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#555"
          secureTextEntry
          style={styles.formInput}
          aria-disabled={isPending}
          value={formData.password}
          onChangeText={(text) => {
            setFormData({ ...formData, password: text })
          }}
        />
      </View>

      <Pressable
        style={styles.formSubmit}
        onPress={() => {
          mutate(formData)
        }}
        disabled={isPending}
      >
        <Text style={styles.formLabel}>Login</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  title: {
    fontFamily: 'Geist_700Bold',
    fontSize: 24,
    color: '#fafafa',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  formItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  formLabel: {
    fontFamily: 'Geist_400Regular',
    fontSize: 16,
    color: '#fafafa',
  },
  formInput: {
    backgroundColor: '#222',
    color: '#fafafa',
    padding: 10,
    borderRadius: 5,
  },
  formSubmit: {
    backgroundColor: '#0070f3',
    padding: 10,
    borderRadius: 5,
  },
})
