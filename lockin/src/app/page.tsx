"use client"

import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { UserButton as ClerkUserButton } from "@clerk/nextjs"
import { SignInButton as ClerkSignInButton } from "@clerk/nextjs"

export default function Home() {
  const { isSignedIn } = useUser()

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Lock In</h1>
          <h2 className="text-xl mb-8">manage your time effectively and lock in bro</h2>
          <p className="text-gray-600 mb-6">
          <ClerkSignInButton mode="modal" className="font-bold hover:text-blue-800">
            Sign in
          </ClerkSignInButton> to access your calendar</p>
          <div className="flex gap-3 justify-center">
            <ClerkUserButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Lock In</h1>
        <h2 className="text-xl mb-8">manage your time effectively and lock in bro</h2>
        <Link 
          href="/calendar" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open Calendar
        </Link>
      </div>
    </div>
  )
}