'use client'

import { useUser } from '@clerk/nextjs'
import { SignInButton } from './ClerkSignInButton'
import { SignOutButton } from './ClerkSignOutButton'
import { SignUpButton } from './ClerkSignUpButton'

export function UserButton() {
  const { isSignedIn, user } = useUser()

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-gray-700">
          Hello, {user.firstName}!
        </span>
        <SignOutButton />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <SignInButton />
      <SignUpButton />
    </div>
  )
}