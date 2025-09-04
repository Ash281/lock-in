import Link from "next/link"

export default function Home() {
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