import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Loader2, Download, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function HideSecret() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [secretText, setSecretText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [encodedImageUrl, setEncodedImageUrl] = useState<string | null>(null);

  const handleEncode = async () => {
    if (!imageFile) {
      toast.error('Please select an image first');
      return;
    }

    if (!secretText.trim()) {
      toast.error('Please enter a secret message');
      return;
    }

    setIsProcessing(true);
    setEncodedImageUrl(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('secret_text', secretText);
      if (password) {
        formData.append('password', password);
      }

      const response = await fetch(`http://${window.location.hostname}:8000/encode`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Encoding failed');
      }

      const data = await response.json();
      if (data.image_url) {
        setEncodedImageUrl(data.image_url);
      } else {
        // Fallback for local blob if no supabase configured
        const blob = await response.blob();
        setEncodedImageUrl(URL.createObjectURL(blob));
      }
      
      toast.success('Message successfully hidden in image!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to encode message');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!encodedImageUrl) return;

    if (encodedImageUrl.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = encodedImageUrl;
      a.download = `encoded_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Supabase public URL or signed URL
      window.open(encodedImageUrl, '_blank');
    }
    
    toast.success('Image accessed successfully!');
  };

  const handleReset = () => {
    setImageFile(null);
    setSecretText('');
    setPassword('');
    setEncodedImageUrl(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label className="text-gray-300">Upload Cover Image</Label>
        <FileUpload
          onFileSelect={setImageFile}
          selectedFileName={imageFile?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="secret-text" className="text-gray-300">
          Secret Message
        </Label>
        <Textarea
          id="secret-text"
          placeholder="Enter your secret message here..."
          value={secretText}
          onChange={(e) => setSecretText(e.target.value)}
          className="min-h-[150px] bg-zinc-900/50 border-zinc-700 text-gray-100 placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500/20 resize-none"
          disabled={isProcessing}
        />
        <p className="text-sm text-gray-500">
          {secretText.length} characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Password (Optional)
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password for encryption"
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
        {password && (
          <p className="text-sm text-orange-500 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Message will be encrypted with AES-256
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleEncode}
          disabled={!imageFile || !secretText || isProcessing}
          className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Encoding...
            </>
          ) : (
            'Hide Secret'
          )}
        </Button>

        {encodedImageUrl && (
          <Button
            onClick={handleDownload}
            className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Image
          </Button>
        )}

        {(imageFile || secretText || password) && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white"
          >
            Reset
          </Button>
        )}
      </div>

      {encodedImageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-500/30 rounded-xl"
        >
          <p className="text-orange-400 text-center">
            ✓ Your secret message has been hidden! Download the image to save it.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}