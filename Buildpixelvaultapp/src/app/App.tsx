import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Unlock } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { HideSecret } from './components/HideSecret';
import { RevealSecret } from './components/RevealSecret';
import { LoginPage } from './components/LoginPage';
import { Logo } from './components/Logo';

type Tab = 'hide' | 'reveal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('hide');

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#f5f5f5',
            border: '1px solid #2a2a2a',
          },
        }}
      />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-flex items-center justify-center mb-6"
          >
            <Logo />
          </motion.div>
          
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            PixelVault
          </h1>
          <p className="text-gray-400 text-lg">
            Hide secrets in plain sight with steganography
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 bg-zinc-900/80 backdrop-blur-xl p-2 rounded-2xl border border-zinc-800/50">
          <button
            onClick={() => setActiveTab('hide')}
            className="relative flex-1 py-4 px-6 rounded-xl transition-all duration-300 group"
          >
            {activeTab === 'hide' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl shadow-lg shadow-orange-500/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className="relative flex items-center justify-center gap-2">
              <Lock className={`w-5 h-5 transition-colors ${
                activeTab === 'hide' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
              }`} />
              <span className={`font-medium transition-colors ${
                activeTab === 'hide' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
              }`}>
                Hide Secret
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('reveal')}
            className="relative flex-1 py-4 px-6 rounded-xl transition-all duration-300 group"
          >
            {activeTab === 'reveal' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl shadow-lg shadow-amber-500/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className="relative flex items-center justify-center gap-2">
              <Unlock className={`w-5 h-5 transition-colors ${
                activeTab === 'reveal' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
              }`} />
              <span className={`font-medium transition-colors ${
                activeTab === 'reveal' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
              }`}>
                Reveal Secret
              </span>
            </div>
          </button>
        </div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-zinc-800/50 p-8 shadow-2xl"
        >
          {activeTab === 'hide' ? <HideSecret /> : <RevealSecret />}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span>LSB Steganography</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span>AES-256 Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span>Server-Side Processing</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-600">
            Securely encrypted and steganographically encoded via the FastAPI backend.
          </p>
        </motion.div>
      </div>
    </div>
  );
}