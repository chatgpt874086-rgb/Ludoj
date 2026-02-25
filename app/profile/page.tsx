'use client'

import AppLayout from '@/components/AppLayout'
import { motion } from 'motion/react'
import { 
  User, 
  Camera, 
  ChevronRight, 
  LogOut, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Edit3,
  Shield,
  HelpCircle,
  Share2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
        setUser(doc.data())
      })
      return () => unsub()
    }
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Logged out successfully')
    router.push('/auth/login')
  }

  const chartData = [
    { name: 'Mon', win: 400, loss: 240 },
    { name: 'Tue', win: 300, loss: 139 },
    { name: 'Wed', win: 200, loss: 980 },
    { name: 'Thu', win: 278, loss: 390 },
    { name: 'Fri', win: 189, loss: 480 },
    { name: 'Sat', win: 239, loss: 380 },
    { name: 'Sun', win: 349, loss: 430 },
  ]

  const stats = [
    { label: 'Total Win', value: `₹${user?.stats?.totalWin || 0}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Deposit', value: `₹${user?.stats?.totalDeposit || 0}`, icon: TrendingDown, color: 'text-[#007AFF]', bg: 'bg-blue-50' },
    { label: 'Total Withdraw', value: `₹${user?.stats?.totalWithdraw || 0}`, icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="ios-card p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <button className="p-2 bg-slate-100 rounded-full text-slate-600 active:scale-90 transition-all">
              <Edit3 size={18} />
            </button>
          </div>
          
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <User size={48} className="text-slate-300" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-[#007AFF] text-white rounded-full border-2 border-white shadow-md">
              <Camera size={14} />
            </button>
          </div>
          
          <h2 className="text-2xl font-display font-bold text-slate-900">{user?.username || 'Player'}</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">User ID: {user?.userId || '-----'}</p>
          
          <div className="mt-6 w-full grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={20} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</p>
                <p className="text-sm font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="ios-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#007AFF]" />
            Performance Analytics
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="win" 
                  stroke="#007AFF" 
                  fillOpacity={1} 
                  fill="url(#colorWin)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Account Settings</h3>
          
          <div className="ios-card divide-y divide-slate-50">
            <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 text-[#007AFF] rounded-lg flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <span className="font-bold text-sm">KYC Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Verified</span>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            </button>

            <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-50 text-purple-500 rounded-lg flex items-center justify-center">
                  <Share2 size={18} />
                </div>
                <span className="font-bold text-sm">Refer & Earn</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>

            <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center">
                  <HelpCircle size={18} />
                </div>
                <span className="font-bold text-sm">Help & Support</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full p-4 ios-card flex items-center justify-center gap-2 text-red-500 font-bold active:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Logout Account
        </button>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-4">
          Ludo Joy v1.0.4 • Made with ❤️
        </p>
      </div>
    </AppLayout>
  )
}
