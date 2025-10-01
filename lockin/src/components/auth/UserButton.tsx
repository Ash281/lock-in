'use client'

import { useUser } from '@clerk/nextjs'
import { SignInButton } from './ClerkSignInButton'
import { SignUpButton } from './ClerkSignUpButton'
import { UserButton as ClerkUserButton } from '@clerk/nextjs'

export function UserButton() {
  const { isSignedIn, user } = useUser()

  if (isSignedIn) {
    return (
      <ClerkUserButton/>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <SignInButton />
      <SignUpButton />
    </div>
  )
}