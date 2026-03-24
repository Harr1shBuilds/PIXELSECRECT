import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Loader2, Eye, EyeOff, Lock, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Textarea } from './ui/textarea';

export function RevealSecret() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [revealedMessage, setRevealedMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleDecode = async () => {
    if (!imageFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setRevealedMessage('');

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (password) {
        formData.append('password', password);
      }

      const response = await fetch(`http://${window.location.hostname}:8000/decode`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Decoding failed');
      }

      const data = await response.json();
      setRevealedMessage(data.secret);
      toast.success('Secret message revealed successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to decode message');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(revealedMessage);
      setCopied(true);
      toast.success('Message copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setPassword('');
    setRevealedMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label className="text-gray-300">Upload Encoded Image</Label>
        <FileUpload
          onFileSelect={setImageFile}
          selectedFileName={imageFile?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="decode-password" className="text-gray-300 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Password (If Encrypted)
        </Label>
        <div className="relative">
          <Input
            id="decode-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password if message was encrypted"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-zinc-900/50 border-zinc-700 text-gray-100 placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500/20 pr-10"
            disabled={isProcessing}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleDecode}
          disabled={!imageFile || isProcessing}
          className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Decoding...
            </>
          ) : (
            'Reveal Secret'
          )}
        </Button>

        {(imageFile || password) && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white"
          >
            Reset
          </Button>
        )}
      </div>

      {revealedMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <Label className="text-gray-300">Revealed Message</Label>
            <Button
              onClick={handleCopy}
              size="sm"
              variant="ghost"
              className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
          
          <Textarea
            value={revealedMessage}
            readOnly
            className="min-h-[200px] bg-gradient-to-br from-orange-900/20 to-amber-900/20 border-orange-500/30 text-gray-100 resize-none font-mono"
          />

          <div className="p-4 bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-500/30 rounded-xl">
            <p className="text-orange-400 text-center">
              ✓ Secret message successfully revealed!
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}