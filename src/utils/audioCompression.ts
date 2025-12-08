import pako from 'pako';

/**
 * SENDER SIDE: Direct gzip compression of binary audio data
 * @param audioBuffer - The audio buffer (ArrayBuffer or Uint8Array)
 * @returns Compressed audio data as base64 string
 */
export function compressAudioForSender(audioBuffer: ArrayBuffer | Uint8Array): string {
  try {
    // Convert to Uint8Array if it's an ArrayBuffer
    const uint8Array = audioBuffer instanceof ArrayBuffer ? new Uint8Array(audioBuffer) : audioBuffer;
    
    // Step 1: Direct gzip compression of binary data
    const gzippedBytes = pako.gzip(uint8Array);
    
    // Step 2: Convert gzipped data to base64 for JSON transmission
    const compressedBase64 = Buffer.from(gzippedBytes).toString('base64');
    
    console.log('Audio compression stats (optimized):', {
      originalSize: uint8Array.length,
      compressedSize: gzippedBytes.length,
      finalSize: compressedBase64.length,
      compressionRatio: ((uint8Array.length - gzippedBytes.length) / uint8Array.length * 100).toFixed(2) + '%',
      transmissionOverhead: ((compressedBase64.length - gzippedBytes.length) / gzippedBytes.length * 100).toFixed(2) + '%'
    });
    
    return compressedBase64;
  } catch (error) {
    console.error('Error compressing audio:', error);
    throw new Error('Failed to compress audio data');
  }
}

/**
 * RECEIVER SIDE: Receive JSON, ungzip directly to binary buffer
 * @param compressedBase64 - The compressed base64 string from sender
 * @returns Audio data as binary buffer (Uint8Array)
 */
export function decompressAudioForReceiver(compressedBase64: string): Uint8Array {
  try {
    console.log('=== DECOMPRESSION START (OPTIMIZED) ===');
    console.log('Input compressedBase64 length:', compressedBase64.length);
    console.log('Input compressedBase64 preview:', compressedBase64.substring(0, 100) + '...');
    
    // Step 1: Convert base64 to bytes
    const compressedBytes = Buffer.from(compressedBase64, 'base64');
    console.log('Compressed bytes length:', compressedBytes.length);
    
    // Step 2: Direct ungzip to binary data
    const audioData = pako.ungzip(compressedBytes);
    console.log('Decompressed audio bytes length:', audioData.length);
    
    console.log('=== DECOMPRESSION STATS (OPTIMIZED) ===');
    console.log('Compressed size:', compressedBytes.length);
    console.log('Final audio size:', audioData.length);
    console.log('Compression ratio:', ((compressedBytes.length / audioData.length) * 100).toFixed(2) + '%');
    console.log('=== DECOMPRESSION END ===');
    
    return audioData;
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
