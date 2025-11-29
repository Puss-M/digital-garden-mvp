'use client'

import dynamic from 'next/dynamic'

const PrototypeDemo = dynamic(() => import('./components/PrototypeDemo').then(mod => mod.PrototypeDemo), { 
  ssr: false,
  loading: () => <div className="p-8 text-center text-slate-500">Loading Prototype...</div>
})

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-emerald-500/30">
      <nav className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight text-white">Digital<span className="text-emerald-400">Garden</span></span>
            </div>
          </div>
        </div>
      </nav>
      <div className="pt-6">
        <PrototypeDemo />
      </div>
    </main>
  )
}