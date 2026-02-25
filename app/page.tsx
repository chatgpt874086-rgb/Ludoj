'use client'

import AppLayout from '@/components/AppLayout'
import { motion } from 'motion/react'
import { Trophy, Star, Play, Search, Plus, Copy, Clock, User as UserIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { db, auth } from '@/lib/firebase'
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc, where } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function HomePage() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [bets, setBets] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [betAmount, setBetAmount] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bets'), (snapshot) => {
      const betsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setBets(betsData)
    })

    const fetchUser = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
        if (userDoc.exists()) {
          setUser(userDoc.data())
        }
      }
    }
    fetchUser()

    return () => unsubscribe()
  }, [])

  const handleCreateBet = async () => {
    if (!betAmount || !roomCode) {
      toast.error('Please enter amount and room code')
      return
    }

    const amount = parseInt(betAmount)
    if (amount < 50) {
      toast.error('Minimum bet is ₹50')
      return
    }

    if (!user || user.balance < amount) {
      toast.error('Insufficient balance in wallet')
      return
    }

    try {
      // Create bet
      await addDoc(collection(db, 'bets'), {
        creatorId: auth.currentUser?.uid,
        creatorName: user.username,
        creatorMobile: user.mobile,
        amount: amount,
        roomCode: roomCode,
        status: 'open',
        createdAt: serverTimestamp(),
        gameType: activeGame
      })

      // Deduct balance
      await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
        balance: user.balance - amount
      })

      toast.success('Bet created successfully!')
      setShowCreateModal(false)
      setBetAmount('')
      setRoomCode('')
    } catch (error) {
      toast.error('Failed to create bet')
    }
  }

  const handlePlayBet = async (bet: any) => {
    if (bet.creatorId === auth.currentUser?.uid) {
      toast.error('You cannot play your own bet')
      return
    }

    if (!user || user.balance < bet.amount) {
      toast.error('Insufficient balance to play this bet')
      return
    }

    try {
      // Update bet status
      await updateDoc(doc(db, 'bets', bet.id), {
        status: 'playing',
        opponentId: auth.currentUser?.uid,
        opponentName: user.username
      })

      // Deduct balance from opponent
      await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
        balance: user.balance - bet.amount
      })

      toast.success('Joined game! Room code: ' + bet.roomCode)
    } catch (error) {
      toast.error('Failed to join bet')
    }
  }

  if (activeGame) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveGame(null)}
              className="p-2 bg-white rounded-xl shadow-sm text-slate-600"
            >
              <Plus className="rotate-45" />
            </button>
            <h2 className="text-xl font-bold">{activeGame} Ludo</h2>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by user ID..." 
              className="ios-input pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-full ios-button-primary flex items-center justify-center gap-2 shadow-lg shadow-[#007AFF]/20"
          >
            <Plus size={20} />
            Create Bet
          </button>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-500 text-sm uppercase tracking-wider">Active Bets</h3>
            {bets.filter(b => b.status === 'open' && (activeGame === 'Classic' ? b.gameType === 'Classic' : b.gameType === 'Popular')).map((bet) => (
              <motion.div 
                layout
                key={bet.id} 
                className="ios-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <UserIcon size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{bet.creatorName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={12} />
                      <span>Just now</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="font-display font-bold text-lg text-[#34C759]">₹{bet.amount}</p>
                  <button 
                    onClick={() => handlePlayBet(bet)}
                    className="bg-[#007AFF] text-white text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95"
                  >
                    Play
                  </button>
                </div>
              </motion.div>
            ))}
            {bets.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                <p>No active bets. Create one!</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Bet Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="w-full max-w-md bg-white rounded-3xl p-6 space-y-6 shadow-2xl"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Create New Bet</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 bg-slate-100 rounded-full">
                    <Plus className="rotate-45" size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-500 mb-1 block">Bet Amount (₹)</label>
                    <input 
                      type="number" 
                      placeholder="Enter amount (min ₹50)" 
                      className="ios-input"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-500 mb-1 block">Ludo Room Code</label>
                    <input 
                      type="text" 
                      placeholder="Enter room code" 
                      className="ios-input"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleCreateBet}
                  className="w-full bg-[#34C759] text-white font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-[#34C759]/20"
                >
                  Submit Bet
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="ios-card p-6 bg-gradient-to-br from-[#007AFF] to-[#00C6FF] text-white border-none">
          <p className="text-white/80 font-medium">Welcome back,</p>
          <h2 className="text-3xl font-display font-bold mt-1">{user?.username || 'Player'}</h2>
          <div className="mt-6 flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl p-4">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wider font-bold">Total Balance</p>
              <p className="text-2xl font-display font-bold">₹{user?.balance || 0}</p>
            </div>
            <Link href="/wallet" className="bg-white text-[#007AFF] px-4 py-2 rounded-xl font-bold text-sm">
              Add Cash
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <h3 className="font-display font-bold text-xl text-slate-900">Select Game Mode</h3>
          
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveGame('Classic')}
            className="ios-card p-4 flex items-center gap-4 group"
          >
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
              <Trophy size={32} />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-bold text-lg">Classic Ludo</h4>
              <p className="text-sm text-slate-400">Standard rules, big wins.</p>
            </div>
            <div className="bg-slate-100 p-2 rounded-full">
              <Play size={20} className="text-[#007AFF]" fill="currentColor" />
            </div>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveGame('Popular')}
            className="ios-card p-4 flex items-center gap-4 group"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Star size={32} />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-bold text-lg">Popular Ludo</h4>
              <p className="text-sm text-slate-400">Most played by community.</p>
            </div>
            <div className="bg-slate-100 p-2 rounded-full">
              <Play size={20} className="text-[#007AFF]" fill="currentColor" />
            </div>
          </motion.button>
        </div>

        <div className="ios-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Recent Winners</h3>
            <Link href="/history" className="text-[#007AFF] text-sm font-bold">View All</Link>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-400">
                    {i}
                  </div>
                  <p className="text-sm font-medium">User_{Math.floor(Math.random() * 9999)}</p>
                </div>
                <p className="text-sm font-bold text-[#34C759]">Won ₹{Math.floor(Math.random() * 500) + 100}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
