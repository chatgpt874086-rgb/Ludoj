'use client'

import AppLayout from '@/components/AppLayout'
import { motion } from 'motion/react'
import { Users, Gift, Share2, Copy, MessageSquare, Send, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function ReferralPage() {
  const [user, setUser] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
        setUser(doc.data())
      })
      return () => unsub()
    }
  }, [])

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup?ref=${user?.referralCode}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user?.referralCode || '')
    setCopied(true)
    toast.success('Referral code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnWhatsApp = () => {
    const text = `Hey! Join me on Ludo Joy and win real money. Use my referral code: ${user?.referralCode}. Download now: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareOnTelegram = () => {
    const text = `Hey! Join me on Ludo Joy and win real money. Use my referral code: ${user?.referralCode}.`
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="ios-card p-8 bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white border-none text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center shadow-xl">
              <Gift size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold">Refer & Earn</h2>
            <p className="text-white/80 font-medium">Get 2% commission on every bet your friends play!</p>
          </div>
        </div>

        <div className="ios-card p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Your Referral Code</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center">
                <span className="text-2xl font-display font-black text-slate-900 tracking-widest">{user?.referralCode || '------'}</span>
              </div>
              <button 
                onClick={copyToClipboard}
                className={`p-4 rounded-2xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-[#007AFF] text-white'}`}
              >
                {copied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={shareOnWhatsApp}
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-[#25D366]/20"
            >
              <MessageSquare size={20} />
              WhatsApp
            </button>
            <button 
              onClick={shareOnTelegram}
              className="flex items-center justify-center gap-2 bg-[#0088CC] text-white font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-[#0088CC]/20"
            >
              <Send size={20} />
              Telegram
            </button>
          </div>
        </div>

        <div className="ios-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Users size={20} className="text-[#007AFF]" />
            Referral Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Referrals</p>
              <p className="text-2xl font-display font-bold text-slate-900">0</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Earnings</p>
              <p className="text-2xl font-display font-bold text-[#34C759]">₹0.00</p>
            </div>
          </div>
        </div>

        <div className="ios-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900">How it works?</h3>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Invite Friends', desc: 'Share your referral code with your friends.' },
              { step: '2', title: 'They Join', desc: 'Your friends sign up using your referral code.' },
              { step: '3', title: 'Earn Commission', desc: 'Get 2% of every bet amount they play, instantly!' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 bg-[#007AFF] text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
