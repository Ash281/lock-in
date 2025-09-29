import { SignUpButton as ClerkSignUpButton } from '@clerk/nextjs'

export function SignUpButton() {
  return (
    <ClerkSignUpButton mode='modal'>
      <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-[#5a3ad6] transition-colors">
        Sign Up
      </button>
    </ClerkSignUpButton>
  )
}