import { UserButton } from './auth/UserButton'
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Home
        </Link>
        <UserButton />
      </div>
    </header>
  )
}