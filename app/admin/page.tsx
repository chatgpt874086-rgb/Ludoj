'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  Wallet, 
  Settings, 
  LogOut, 
  Search, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  ShieldAlert
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, query, onSnapshot, doc, updateDoc, getDocs, where } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'bets' | 'settings'>('dashboard')
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBets: 0,
    totalDeposits: 0,
    totalWithdrawals: 0
  })

  const [users, setUsers] = useState<any[]>([])
  const [bets, setBets] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({
    razorpayKey: '',
    razorpaySecret: '',
    minDeposit: 100,
    minWithdraw: 100,
    referralCommission: 2
  })

  useEffect(() => {
    if (isLoggedIn) {
      const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
        setStats(prev => ({ ...prev, totalUsers: snapshot.size }))
      })

      const unsubBets = onSnapshot(collection(db, 'bets'), (snapshot) => {
        setBets(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
        setStats(prev => ({ ...prev, totalBets: snapshot.size }))
      })

      const unsubTrans = onSnapshot(collection(db, 'transactions'), (snapshot) => {
        const trans = snapshot.docs.map(d => d.data())
        const deposits = trans.filter(t => t.type === 'deposit').reduce((acc, curr) => acc + curr.amount, 0)
        const withdrawals = trans.filter(t => t.type === 'withdraw').reduce((acc, curr) => acc + curr.amount, 0)
        setStats(prev => ({ ...prev, totalDeposits: deposits, totalWithdrawals: withdrawals }))
      })

      return () => {
        unsubUsers()
        unsubBets()
        unsubTrans()
      }
    }
  }, [isLoggedIn])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'vsmkhan89@gmail.com' && password === 'vsmkhan8740') {
      setIsLoggedIn(true)
      toast.success('Admin access granted')
    } else {
      toast.error('Invalid credentials')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700"
        >
          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 bg-red-500 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-red-500/20">
              <ShieldAlert className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-slate-400 text-sm">Restricted access for authorized personnel only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Admin Email" 
              className="w-full bg-slate-700 border-none rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-slate-700 border-none rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-red-500 text-white font-bold py-4 rounded-xl active:scale-95 transition-all shadow-lg shadow-red-500/20">
              Login to Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-xl font-bold">Ludo Joy</h2>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'users', icon: Users, label: 'User Management' },
            { id: 'bets', icon: Gamepad2, label: 'Bet Monitor' },
            { id: 'settings', icon: Settings, label: 'App Settings' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-red-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={() => setIsLoggedIn(false)}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Server Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-slate-900">Live</span>
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Active Bets', value: stats.totalBets, icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'Total Deposits', value: `₹${stats.totalDeposits}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Total Withdrawals', value: `₹${stats.totalWithdrawals}`, icon: Wallet, color: 'text-red-500', bg: 'bg-red-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4">Recent Users</h3>
                <div className="space-y-4">
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{u.username}</p>
                          <p className="text-xs text-slate-400">{u.mobile}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-[#007AFF]">₹{u.balance}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4">Recent Bets</h3>
                <div className="space-y-4">
                  {bets.slice(0, 5).map((b) => (
                    <div key={b.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="font-bold text-sm">{b.creatorName}</p>
                        <p className="text-xs text-slate-400">Room: {b.roomCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-500">₹{b.amount}</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">{b.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase">User</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase">Mobile</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase">Balance</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase">ID</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{u.username}</td>
                    <td className="px-6 py-4 text-slate-500">{u.mobile}</td>
                    <td className="px-6 py-4 font-bold text-emerald-500">₹{u.balance}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{u.userId}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#007AFF] font-bold text-sm hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <h3 className="font-bold text-xl">Payment Gateway (Razorpay)</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-400 mb-1 block">Razorpay Key ID</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="rzp_live_..." />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-400 mb-1 block">Razorpay Secret Key</label>
                  <input type="password" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="••••••••••••" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <h3 className="font-bold text-xl">Game Configuration</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-400 mb-1 block">Min Deposit (₹)</label>
                  <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" defaultValue={100} />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-400 mb-1 block">Referral Commission (%)</label>
                  <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" defaultValue={2} />
                </div>
              </div>
            </div>

            <button className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/20 active:scale-95 transition-all">
              Save All Settings
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
