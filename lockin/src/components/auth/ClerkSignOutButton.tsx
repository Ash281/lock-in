'use client'

import { useClerk } from '@clerk/nextjs'

export function SignOutButton() {
  const { signOut } = useClerk()

  return (
    <button
      onClick={() => signOut()}
      className="border-2 border-red-600 text-red-600 rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-red-600 hover:text-white transition-colors"
    >
      Sign Out
    </button>
  )
}