import { auth } from '@/server/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== 'ATTENDEE') redirect('/auth/attendee/login')

  return <>{children}</>
}
