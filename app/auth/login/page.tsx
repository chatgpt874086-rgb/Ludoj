'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Phone, Lock, User, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function AuthPage({ params }: { params: { type: string } }) {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  })

  const generateUserId = () => {
    return Math.floor(10000 + Math.random() * 90000).toString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        // Firebase Auth requires email, so we use mobile@ludojoy.com
        const email = `${formData.mobile}@ludojoy.com`
        await signInWithEmailAndPassword(auth, email, formData.password)
        toast.success('Welcome back!')
        router.push('/')
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          setLoading(false)
          return
        }
        
        const email = `${formData.mobile}@ludojoy.com`
        const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password)
        const userId = generateUserId()

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          userId: userId,
          username: formData.username,
          mobile: formData.mobile,
          balance: 0,
          referralCode: `LJ${userId}`,
          referredBy: formData.referralCode || null,
          createdAt: new Date().toISOString(),
          stats: {
            totalDeposit: 0,
            totalWithdraw: 0,
            totalWin: 0
          }
        })

        toast.success('Account created successfully!')
        router.push('/')
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-[#007AFF] rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-[#007AFF]/20 mb-6">
            <Lock className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-400 font-medium">
            {isLogin ? 'Enter your details to play' : 'Join the Ludo Joy community'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Username" 
                className="ios-input pl-12"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          )}

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="tel" 
              placeholder="Mobile Number" 
              className="ios-input pl-12"
              required
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              className="ios-input pl-12"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {!isLogin && (
            <>
              <div className="relative">
                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  className="ios-input pl-12"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Referral Code (Optional)" 
                  className="ios-input pl-12"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full ios-button-primary flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {isLogin ? 'Login' : 'Sign Up'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#007AFF] font-bold text-sm"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
