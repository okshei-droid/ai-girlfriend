import SessionGuard from '@/components/SessionGuard'
import AuthGate from '@/components/AuthGate'
import Chat from '@/components/Chat'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  return (
    <>
      <SessionGuard />
      <AuthGate>
        <Chat />
      </AuthGate>
    </>
  )
}
