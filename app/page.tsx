import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Page() {
  const { userId } = await auth()

  if (userId) {
    redirect('/channels/@me')
  }

  return (
    <div className="min-h-screen bg-[#404EED] overflow-hidden relative font-sans text-white">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[url('https://cdn.prod.website-files.com/6257adef93867e56f84d3092/6259c8aeaa6928734614e54e_Cloud-Left.svg')] bg-no-repeat bg-bottom bg-left opacity-80 pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[url('https://cdn.prod.website-files.com/6257adef93867e56f84d3092/6259c8aee1269399d82121e7_Cloud-Right.svg')] bg-no-repeat bg-bottom bg-right opacity-80 pointer-events-none z-0"></div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-6" role="banner">
        <div className="flex items-center gap-2">
          {/* Simple Discord Logo Mockup */}
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.486 13.486 0 0 0-.64 1.343 18.258 18.258 0 0 0-4.868 0C9.66 5.86 9.49 6.206 9.4 6.326a.072.072 0 0 0-.078-.037 19.8 19.8 0 0 0-4.887 1.515.075.075 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .03.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.127 10.2 10.2 0 0 0 .373-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.158-1.085-2.158-2.419 0-1.333.956-2.418 2.159-2.418 1.21 0 2.176 1.085 2.159 2.419 0 1.334-.95 2.419-2.159 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.085 2.158 2.419 0 1.334-.949 2.419-2.158 2.419z" />
          </svg>
          <span className="font-bold text-2xl tracking-wide">Cordis</span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-semibold text-sm">
          <Link href="#" className="hover:underline">Download</Link>
          <Link href="#" className="hover:underline">Nitro</Link>
          <Link href="#" className="hover:underline">Discover</Link>
          <Link href="#" className="hover:underline">Safety</Link>
          <Link href="#" className="hover:underline">Support</Link>
        </div>

        <Link
          href="/sign-in"
          className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium text-sm hover:text-indigo-600 transition-colors shadow-md"
        >
          Login
        </Link>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-40 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-tight">
          Imagine a place...
        </h1>
        <p className="text-lg md:text-xl leading-relaxed max-w-2xl mb-12 font-light">
          ...where you can belong to a school club, a gaming group, or a worldwide art community.
          Where just you and a handful of friends can spend time together. A place that makes it
          easy to talk every day and hang out more often.
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          <Link
            href="/sign-up"
            className="bg-white text-slate-900 text-lg font-medium px-8 py-4 rounded-full flex items-center gap-3 hover:text-indigo-600 hover:shadow-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Sign Up
          </Link>
          <Link
            href="/sign-up"
            className="bg-slate-900 text-white text-lg font-medium px-8 py-4 rounded-full hover:bg-slate-800 hover:shadow-xl transition-all"
          >
            Open Cordis in your browser
          </Link>
        </div>
      </main>

      {/* Background Images Mockup */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 pointer-events-none">
        <img src="https://cdn.prod.website-files.com/6257adef93867e56f84d3092/6257d006b9efe721c431418e_Background-Wave.svg" alt="" className="w-full h-full object-cover opacity-20" />
      </div>
    </div>
  )
}
