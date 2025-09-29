import { SignInButton as ClerkSignInButton } from '@clerk/nextjs'

export function SignInButton() {
  return (
    <ClerkSignInButton mode='modal'>
      <button className="border-2 border-[#6c47ff] text-[#6c47ff] rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-[#6c47ff] hover:text-white transition-colors">
        Sign In
      </button>
    </ClerkSignInButton>
  )
}