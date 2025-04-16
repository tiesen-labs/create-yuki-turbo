import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useTheme } from '@react-navigation/native'
import { Loader2Icon } from 'lucide-react-native'

import { useSession } from '@yuki/auth/react'

import { signIn } from '@/lib/auth'
import { deleteToken } from '@/lib/session'

export default function ProfilePage() {
  const { fonts, colors } = useTheme()
  const { session, isLoading, refresh } = useSession()

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loader2Icon size={32} color="#78a9ff" />
      </View>
    )
  }

  if (!session.user) {
    return (
      <View style={styles.container}>
        <Text style={{ ...fonts.bold, color: colors.text }}>
          No session found
        </Text>

        <View>
          <Pressable
            style={{
              ...styles.actionButton,
              width: 100,
              marginTop: 20,
              backgroundColor: colors.primary,
            }}
            onPress={async () => {
              const token = await signIn()
              refresh(token)
            }}
          >
            <Text
              style={{
                ...fonts.bold,
                color: colors.background,
              }}
            >
              Login
            </Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.coverContainer}>
        <View
          style={{ ...styles.coverImage, backgroundColor: colors.primary }}
        />
        <View
          style={{
            ...styles.profileImageContainer,
            borderColor: colors.primary,
          }}
        >
          <Image
            source={{ uri: session.user.image, cache: 'force-cache' }}
            style={styles.profileImage}
          />
        </View>
      </View>

      <View style={styles.userInfoContainer}>
        <Text style={{ ...styles.userName, ...fonts.bold, color: colors.text }}>
          {session.user.name}
        </Text>
        <Text
          style={{
            ...styles.userEmail,
            ...fonts.regular,
            color: colors.text + '50',
          }}
        >
          {session.user.email}
        </Text>
      </View>

      <Pressable
        style={{
          ...styles.actionButton,
          backgroundColor: colors.card,
          marginTop: 20,
        }}
        onPress={async () => {
          await deleteToken()
          await refresh('')
        }}
      >
        <Text
          style={{
            ...fonts.bold,
            color: colors.text,
          }}
        >
          Sign out
        </Text>
      </Pressable>
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  coverContainer: {
    height: 150,
    position: 'relative',
  },
  coverImage: {
    height: '100%',
    opacity: 0.7,
  },
  profileImageContainer: {
    position: 'absolute',
    bottom: -50,
    left: 20,
    borderWidth: 2,
    borderRadius: 75,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userInfoContainer: {
    marginTop: 60,
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 24,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  actionButton: {
    height: 36,
    borderRadius: 6,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
