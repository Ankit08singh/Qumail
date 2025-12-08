import pako from 'pako';

/**
 * SENDER SIDE: Convert buffer audio to base64 and then gzip it
 * @param audioBuffer - The audio buffer (ArrayBuffer or Uint8Array)
 * @returns Compressed and encoded audio data as base64 string
 */
export function compressAudioForSender(audioBuffer: ArrayBuffer | Uint8Array): string {
  try {
    // Convert to Uint8Array if it's an ArrayBuffer
    const uint8Array = audioBuffer instanceof ArrayBuffer ? new Uint8Array(audioBuffer) : audioBuffer;
    
    // Step 1: Convert buffer to base64
    const base64String = Buffer.from(uint8Array).toString('base64');
    
    // Step 2: Gzip the base64 string
    const textEncoder = new TextEncoder();
    const base64Bytes = textEncoder.encode(base64String);
    const gzippedBytes = pako.gzip(base64Bytes);
    
    // Step 3: Convert gzipped data to base64 for JSON transmission
    const compressedBase64 = Buffer.from(gzippedBytes).toString('base64');
    
    console.log('Audio compression stats:', {
      originalSize: uint8Array.length,
      base64Size: base64String.length,
      compressedSize: gzippedBytes.length,
      finalSize: compressedBase64.length,
      compressionRatio: ((uint8Array.length - gzippedBytes.length) / uint8Array.length * 100).toFixed(2) + '%'
    });
    
    return compressedBase64;
  } catch (error) {
    console.error('Error compressing audio:', error);
    throw new Error('Failed to compress audio data');
  }
}

/**
 * RECEIVER SIDE: Receive JSON, ungzip it, convert base64 to binary buffer
 * @param compressedBase64 - The compressed base64 string from sender
 * @returns Audio data as binary buffer (Uint8Array)
 */
export function decompressAudioForReceiver(compressedBase64: string): Uint8Array {
  try {
    console.log('=== DECOMPRESSION START ===');
    console.log('Input compressedBase64 length:', compressedBase64.length);
    console.log('Input compressedBase64 preview:', compressedBase64.substring(0, 100) + '...');
    
    // Step 1: Convert base64 to bytes
    const compressedBytes = Buffer.from(compressedBase64, 'base64');
    console.log('Compressed bytes length:', compressedBytes.length);
    
    // Step 2: Ungzip the data
    const decompressedBytes = pako.ungzip(compressedBytes);
    console.log('Decompressed bytes length:', decompressedBytes.length);
    
    // Step 3: Convert decompressed bytes back to base64 string
    const textDecoder = new TextDecoder();
    const originalBase64 = textDecoder.decode(decompressedBytes);
    console.log('Original base64 string length:', originalBase64.length);
    console.log('Original base64 preview:', originalBase64.substring(0, 100) + '...');
    
    // Step 4: Convert base64 back to binary buffer (native format)
    const audioBuffer = Buffer.from(originalBase64, 'base64');
    console.log('Final audio buffer length:', audioBuffer.length);
    
    console.log('=== DECOMPRESSION STATS ===');
    console.log('Compressed size:', compressedBytes.length);
    console.log('Decompressed size:', decompressedBytes.length);
    console.log('Final audio size:', audioBuffer.length);
    console.log('Compression ratio:', ((compressedBytes.length / audioBuffer.length) * 100).toFixed(2) + '%');
    console.log('=== DECOMPRESSION END ===');
    
    return new Uint8Array(audioBuffer);
  } catch (error) {
    console.error('Error decompressing audio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    throw new Error('Failed to decompress audio data: ' + errorMessage);
  }
}

/**
 * Create an audio blob from the decompressed binary data
 * @param audioData - The binary audio data
 * @param mimeType - The MIME type of the audio (default: 'audio/webm')
 * @returns Audio blob for playback
 */
export function createAudioBlob(audioData: Uint8Array, mimeType: string = 'audio/webm'): Blob {
  // Create a new ArrayBuffer from the Uint8Array to ensure type compatibility
  const arrayBuffer = new ArrayBuffer(audioData.byteLength);
  const view = new Uint8Array(arrayBuffer);
  view.set(audioData);
  return new Blob([arrayBuffer], { type: mimeType });
}

/**
 * Create an object URL for audio playback
 * @param audioBlob - The audio blob
 * @returns Object URL for audio element
 */
export function createAudioUrl(audioBlob: Blob): string {
  return URL.createObjectURL(audioBlob);
}

/**
 * Utility function to convert blob to buffer for sender
 * @param blob - Audio blob
 * @returns Promise<ArrayBuffer>
 */
export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return await blob.arrayBuffer();
}
