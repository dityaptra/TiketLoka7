import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  // Redirect otomatis ke dashboard
  redirect('/admin/dashboard');
}