// LSB Steganography Implementation
const DELIMITER = '<<<END_OF_MESSAGE>>>';

export function textToBinary(text: string): string {
  return text
    .split('')
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

export function binaryToText(binary: string): string {
  const bytes = binary.match(/.{1,8}/g) || [];
  return bytes.map((byte) => String.fromCharCode(parseInt(byte, 2))).join('');
}

export function encodeMessage(
  imageFile: File,
  message: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Add delimiter to mark end of message
          const fullMessage = message + DELIMITER;
          const binaryMessage = textToBinary(fullMessage);

          // Check if image is large enough
          const maxBits = (data.length / 4) * 3; // 3 bits per pixel (RGB)
          if (binaryMessage.length > maxBits) {
            reject(
              new Error(
                'Image is too small to hide this message. Try a larger image or shorter message.'
              )
            );
            return;
          }

          // Encode message into LSB of RGB channels
          let binaryIndex = 0;
          for (let i = 0; i < data.length && binaryIndex < binaryMessage.length; i += 4) {
            // Skip alpha channel, use only RGB
            for (let j = 0; j < 3 && binaryIndex < binaryMessage.length; j++) {
              // Clear LSB and set it to message bit
              data[i + j] = (data[i + j] & 0xfe) | parseInt(binaryMessage[binaryIndex]);
              binaryIndex++;
            }
          }

          ctx.putImageData(imageData, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create image blob'));
            }
          }, 'image/png');
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}

export function decodeMessage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          let binaryMessage = '';
          
          // Extract LSB from RGB channels
          for (let i = 0; i < data.length; i += 4) {
            for (let j = 0; j < 3; j++) {
              binaryMessage += (data[i + j] & 1).toString();
            }
          }

          // Convert binary to text
          const message = binaryToText(binaryMessage);
          
          // Find delimiter
          const delimiterIndex = message.indexOf(DELIMITER);
          if (delimiterIndex === -1) {
            reject(new Error('No hidden message found in this image'));
            return;
          }

          resolve(message.substring(0, delimiterIndex));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}
