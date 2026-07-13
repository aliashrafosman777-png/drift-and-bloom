import type { Metadata } from 'next'
import AdminMessages from '@/views/admin/AdminMessages'

export const metadata: Metadata = {
  title: 'Messages',
  robots: 'noindex, nofollow',
}

export default function AdminMessagesPage() {
  return <AdminMessages />
}
