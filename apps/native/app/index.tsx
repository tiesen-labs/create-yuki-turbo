import { SafeAreaView, StyleSheet, Text } from 'react-native'
import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/hooks/use-session'
import { trpc } from '@/lib/trpc'

export default function HomePage() {
  const { session, isLoading } = useSession()
  const { data, isLoading: postLoading } = useQuery(
    trpc.post.all.queryOptions(),
  )

  return (
    <SafeAreaView>
      <Text style={styles.title}>Home Page</Text>

      <Text style={styles.pre}>
        {isLoading ? 'Loading session...' : JSON.stringify(session, null, 2)}
      </Text>

      <Text style={styles.pre}>
        {postLoading ? 'Loading posts...' : JSON.stringify(data, null, 2)}
      </Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
  },
  pre: {
    fontWeight: 400,
    fontSize: 16,
  },
})
