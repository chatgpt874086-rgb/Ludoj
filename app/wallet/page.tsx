'use client'

import AppLayout from '@/components/AppLayout'
import { motion } from 'motion/react'
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, History, ShieldCheck, CreditCard, Landmark } from 'lucide-react'
import { useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function WalletPage() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [historyType, setHistoryType] = useState<'deposit' | 'withdraw'>('deposit')

  const depositOptions = [100, 200, 300, 400, 500, 1000, 2000, 5000]

  useEffect(() => {
    if (auth.currentUser) {
      const unsubUser = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
        setUser(doc.data())
      })

      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      )
      const unsubTrans = onSnapshot(q, (snapshot) => {
        setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      })

      return () => {
        unsubUser()
        unsubTrans()
      }
    }
  }, [])

  const handleDeposit = async () => {
    const depositAmount = parseInt(amount)
    if (!depositAmount || depositAmount < 100) {
      toast.error('Minimum deposit is ₹100')
      return
    }

    setLoading(true)
    try {
      // Simulate Razorpay Success for demo
      // In real app, call Razorpay SDK here
      
      await addDoc(collection(db, 'transactions'), {
        userId: auth.currentUser?.uid,
        amount: depositAmount,
        type: 'deposit',
        status: 'success',
        timestamp: serverTimestamp()
      })

      await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
        balance: (user?.balance || 0) + depositAmount,
        'stats.totalDeposit': (user?.stats?.totalDeposit || 0) + depositAmount
      })

      toast.success('Funds added successfully!')
      setAmount('')
    } catch (error) {
      toast.error('Deposit failed')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    const withdrawAmount = parseInt(amount)
    if (!withdrawAmount || withdrawAmount < 100) {
      toast.error('Minimum withdrawal is ₹100')
      return
    }

    if (withdrawAmount > (user?.balance || 0)) {
      toast.error('Insufficient balance')
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: auth.currentUser?.uid,
        amount: withdrawAmount,
        type: 'withdraw',
        status: 'pending',
        timestamp: serverTimestamp()
      })

      await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
        balance: user.balance - withdrawAmount,
        'stats.totalWithdraw': (user?.stats?.totalWithdraw || 0) + withdrawAmount
      })

      toast.success('Withdrawal request submitted!')
      setAmount('')
    } catch (error) {
      toast.error('Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="ios-card p-6 bg-white flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center text-[#007AFF] mb-2">
            <Wallet size={32} />
          </div>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Available Balance</p>
          <h2 className="text-4xl font-display font-bold text-slate-900">₹{user?.balance || 0}</h2>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-black/5">
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'deposit' ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/20' : 'text-slate-400'}`}
          >
            Deposit
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'withdraw' ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/20' : 'text-slate-400'}`}
          >
            Withdraw
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/20' : 'text-slate-400'}`}
          >
            History
          </button>
        </div>

        {activeTab === 'deposit' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="ios-card p-6 space-y-4">
              <h3 className="font-bold text-slate-900">Select Deposit Amount</h3>
              <div className="grid grid-cols-4 gap-2">
                {depositOptions.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setAmount(opt.toString())}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${amount === opt.toString() ? 'bg-[#007AFF] text-white border-[#007AFF]' : 'bg-slate-50 text-slate-600 border-slate-100'}`}
                  >
                    ₹{opt}
                  </button>
                ))}
              </div>
              <div className="relative mt-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input 
                  type="number" 
                  placeholder="Enter custom amount" 
                  className="ios-input pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <button 
                onClick={handleDeposit}
                disabled={loading}
                className="w-full ios-button-primary flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Add Cash Now'}
              </button>
            </div>

            <div className="ios-card p-4 flex items-center gap-3 bg-emerald-50 border-emerald-100">
              <ShieldCheck className="text-emerald-500" />
              <p className="text-xs font-medium text-emerald-700">100% Secure Payments via Razorpay</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'withdraw' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="ios-card p-6 space-y-4">
              <h3 className="font-bold text-slate-900">Withdraw Funds</h3>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input 
                  type="number" 
                  placeholder="Enter amount to withdraw" 
                  className="ios-input pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Withdraw To</p>
                <button className="w-full p-4 ios-card flex items-center justify-between border-2 border-[#007AFF]">
                  <div className="flex items-center gap-3">
                    <Landmark className="text-[#007AFF]" />
                    <div className="text-left">
                      <p className="font-bold text-sm">Bank Account</p>
                      <p className="text-xs text-slate-400">Primary Account</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-4 border-[#007AFF]"></div>
                </button>
                <button className="w-full p-4 ios-card flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-slate-400" />
                    <div className="text-left">
                      <p className="font-bold text-sm">UPI ID</p>
                      <p className="text-xs text-slate-400">Add UPI ID</p>
                    </div>
                  </div>
                </button>
              </div>

              <button 
                onClick={handleWithdraw}
                disabled={loading}
                className="w-full ios-button-primary"
              >
                {loading ? 'Processing...' : 'Withdraw Now'}
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex gap-2">
              <button 
                onClick={() => setHistoryType('deposit')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${historyType === 'deposit' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}
              >
                Deposits
              </button>
              <button 
                onClick={() => setHistoryType('withdraw')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${historyType === 'withdraw' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}
              >
                Withdrawals
              </button>
            </div>

            <div className="space-y-3">
              {transactions.filter(t => t.type === historyType).map((t) => (
                <div key={t.id} className="ios-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                      {t.type === 'deposit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.type === 'deposit' ? 'Money Added' : 'Withdrawal'}</p>
                      <p className="text-[10px] text-slate-400">{t.timestamp?.toDate().toLocaleString() || 'Just now'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.type === 'deposit' ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {t.type === 'deposit' ? '+' : '-'}₹{t.amount}
                    </p>
                    <p className={`text-[10px] font-bold uppercase ${t.status === 'success' ? 'text-emerald-500' : 'text-orange-500'}`}>
                      {t.status}
                    </p>
                  </div>
                </div>
              ))}
              {transactions.filter(t => t.type === historyType).length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <History size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No transaction history found.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}
