import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Discord Clone</h1>
        <p className="text-slate-400">Connect with your community in real-time</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'bg-slate-800 border border-slate-700',
            formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700',
            footerActionLink: 'text-indigo-400 hover:text-indigo-300',
            headerTitle: 'text-white',
            headerSubtitle: 'text-slate-300',
            socialButtonsBlockButton: 'bg-slate-700 border-slate-600 text-white',
            dividerLine: 'bg-slate-700',
            dividerText: 'text-slate-400',
          },
        }}
      />
    </div>
  )
}
