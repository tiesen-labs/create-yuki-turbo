import { useState } from 'react'
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useTheme } from '@react-navigation/native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { XIcon } from 'lucide-react-native'

import type { RouterOutputs } from '@yuki/api'

import { trpc } from '@/lib/trpc'

export default function HomePage() {
  const { fonts, colors } = useTheme()

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ ...styles.title, ...fonts.heavy, color: colors.text }}>
        Create <Text style={{ color: '#78a9ff' }}>Yuki</Text> Turbo
      </Text>
      <CreatePost />
      <PostList />
    </SafeAreaView>
  )
}

const PostList: React.FC = () => {
  const { data = [], isLoading } = useQuery(trpc.post.all.queryOptions())

  return (
    <View className="flex-1">
      {isLoading && <Text>Loading...</Text>}
      {!isLoading && data.map((post) => <PostCard key={post.id} post={post} />)}
    </View>
  )
}

const PostCard: React.FC<{
  post: RouterOutputs['post']['all'][number]
}> = ({ post }) => {
  const { colors, fonts } = useTheme()
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation(
    trpc.post.delete.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(trpc.post.all.queryFilter())
      },
    }),
  )

  return (
    <View style={{ ...styles.card, backgroundColor: colors.card }}>
      <Text
        style={{
          ...styles.card_title,
          ...fonts.bold,
          color: colors.text,
        }}
      >
        {post.title}
      </Text>

      <Text
        style={{
          ...styles.card_content,
          ...fonts.regular,
          fontSize: 12,
          color: colors.text + '50',
        }}
      >
        {post.createdAt.toDateString()}
      </Text>

      <Text
        style={{
          ...styles.card_content,
          ...fonts.regular,
          marginTop: 8,
          color: colors.text,
        }}
      >
        {post.content}
      </Text>

      <Pressable
        style={{
          ...styles.card_action,
          backgroundColor: colors.card,
        }}
        onPress={() => {
          mutate(post)
        }}
        disabled={isPending}
      >
        <XIcon size={20} color={colors.primary} />
      </Pressable>
    </View>
  )
}

const CreatePost: React.FC = () => {
  const { colors } = useTheme()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation(
    trpc.post.create.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(trpc.post.all.queryFilter())
        setFormData({ title: '', content: '' })
      },
    }),
  )

  return (
    <View
      style={{
        ...styles.form,
        backgroundColor: colors.card,
      }}
    >
      <TextInput
        placeholder="Title"
        placeholderTextColor={colors.text + '50'}
        style={{
          ...styles.form_input,
          borderColor: colors.border,
          color: colors.text,
        }}
        value={formData.title}
        onChangeText={(text) => {
          setFormData({ ...formData, title: text })
        }}
      />
      <TextInput
        placeholder="Content"
        placeholderTextColor={colors.text + '50'}
        style={{
          ...styles.form_input,
          borderColor: colors.border,
          color: colors.text,
        }}
        value={formData.content}
        onChangeText={(text) => {
          setFormData({ ...formData, content: text })
        }}
      />
      <Pressable
        disabled={isPending}
        style={{
          ...styles.form_button,
          backgroundColor: colors.primary,
          opacity: isPending ? 0.8 : 1,
        }}
        onPress={() => {
          mutate(formData)
        }}
      >
        <Text
          style={{
            ...styles.card_content,
            color: colors.background,
          }}
        >
          {isPending ? 'Creating...' : 'Create Post'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    padding: 16,
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  card_title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card_content: {
    fontSize: 16,
  },
  card_action: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  form: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
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
