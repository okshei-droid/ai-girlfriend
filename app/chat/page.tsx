import AuthGate from '@/components/AuthGate'
import Chat from '@/components/Chat'

export default async function ChatPage() {
  return (
    <AuthGate>
      <Chat />
    </AuthGate>
  )
}
