'use client'

import AppLayout from '@/components/AppLayout'
import { motion, AnimatePresence } from 'motion/react'
import { Send, User, Search, Circle, MessageCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { auth, db, rtdb } from '@/lib/firebase'
import { collection, query, onSnapshot, where, getDocs } from 'firebase/firestore'
import { ref, push, onValue, serverTimestamp as rtdbTimestamp } from 'firebase/database'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch current user
    if (auth.currentUser) {
      setCurrentUser(auth.currentUser)
    }

    // Fetch all users for search
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    // Real-time global chat messages
    const chatRef = ref(rtdb, 'global_chat')
    const unsubChat = onValue(chatRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const msgList = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }))
        setMessages(msgList.sort((a, b) => a.timestamp - b.timestamp))
      }
    })

    return () => {
      unsubUsers()
      unsubChat()
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const chatRef = ref(rtdb, 'global_chat')
      await push(chatRef, {
        text: newMessage,
        senderId: auth.currentUser?.uid,
        senderName: auth.currentUser?.displayName || 'Player',
        timestamp: Date.now()
      })
      setNewMessage('')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.userId?.includes(searchQuery)
  )

  return (
    <AppLayout>
      <div className="h-[calc(100vh-180px)] flex flex-col gap-4">
        <div className="ios-card p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users by name or ID..." 
              className="ios-input pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchQuery && (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {filteredUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{u.username}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {u.userId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Circle size={8} className="fill-emerald-500 text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400">Online</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 ios-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex items-center gap-2">
            <MessageCircle size={20} className="text-[#007AFF]" />
            <h3 className="font-bold text-slate-900">Global Chat</h3>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
          >
            {messages.map((msg) => {
              const isMe = msg.senderId === auth.currentUser?.uid
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <p className="text-[10px] font-bold text-slate-400 ml-2 mb-1">{msg.senderName}</p>}
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm font-medium ${isMe ? 'bg-[#007AFF] text-white rounded-tr-none' : 'bg-slate-100 text-slate-900 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                  <p className="text-[8px] font-bold text-slate-300 mt-1 mx-2">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )
            })}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                <MessageCircle size={48} className="opacity-20" />
                <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 flex gap-2">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 ios-input bg-white"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button 
              type="submit"
              className="w-12 h-12 bg-[#007AFF] text-white rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-[#007AFF]/20"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
