'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Home, 
  Wallet, 
  Users, 
  MessageCircle, 
  User, 
  Trophy,
  History,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (userDoc.exists()) {
          setUser({ ...firebaseUser, ...userDoc.data() })
        } else {
          setUser(firebaseUser)
        }
      } else {
        setUser(null)
        if (!pathname.startsWith('/auth') && !pathname.startsWith('/admin')) {
          router.push('/auth/login')
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [pathname, router])

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: Users, label: 'Refer', path: '/referral' },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F2F2F7]">
        <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const isAuthPage = pathname.startsWith('/auth')
  const isAdminPage = pathname.startsWith('/admin')

  if (isAuthPage || isAdminPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-[#F2F2F7] relative shadow-2xl">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-black/5 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-display font-bold text-slate-900">Ludo Joy</h1>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2">
            <Wallet size={16} className="text-[#007AFF]" />
            <span className="font-bold text-sm">₹{user?.balance || 0}</span>
          </div>
        </div>
      </header>

      <main className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-black/5 px-4 py-3 pb-8 flex justify-between items-center z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1 group">
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-[#007AFF] text-white' : 'text-slate-400 group-active:scale-90'}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-[#007AFF]' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
