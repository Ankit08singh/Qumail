import pako from 'pako';

export interface CompressedFile {
  name: string;
  type: string;
  size: number;
  compressedData: string;
  originalSize: number;
  compressionRatio: number;
}

/**
 * SENDER SIDE: Direct gzip compression of binary file data
 * @param file - The file to compress
 * @returns Compressed file data with metadata
 */
export async function compressFileForSender(file: File): Promise<CompressedFile> {
  try {
    console.log('Starting file compression for:', file.name);
    
    // Step 1: Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Step 2: Direct gzip compression of binary data
    const gzippedBytes = pako.gzip(uint8Array);
    
    // Step 3: Convert gzipped data to base64 for JSON transmission
    const compressedBase64 = Buffer.from(gzippedBytes).toString('base64');
    
    const originalSize = uint8Array.length;
    const compressedSize = gzippedBytes.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100);
    
    console.log('File compression stats (optimized):', {
      fileName: file.name,
      fileType: file.type,
      originalSize: originalSize,
      compressedSize: compressedSize,
      finalSize: compressedBase64.length,
      compressionRatio: compressionRatio.toFixed(2) + '%',
      transmissionOverhead: ((compressedBase64.length - compressedSize) / compressedSize * 100).toFixed(2) + '%'
    });
    
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      compressedData: compressedBase64,
      originalSize: originalSize,
      compressionRatio: compressionRatio
    };
  } catch (error) {
    console.error('Error compressing file:', error);
    throw new Error(`Failed to compress file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * RECEIVER SIDE: Receive JSON, ungzip directly to binary buffer
 * @param compressedFile - The compressed file data
 * @returns File blob with original data
 */
export function decompressFileForReceiver(compressedFile: CompressedFile): Blob {
  try {
    console.log('=== FILE DECOMPRESSION START (OPTIMIZED) ===');
    console.log('File name:', compressedFile.name);
    console.log('File type:', compressedFile.type);
    console.log('Compressed data length:', compressedFile.compressedData.length);
    
    // Step 1: Convert base64 to bytes
    const compressedBytes = Buffer.from(compressedFile.compressedData, 'base64');
    console.log('Compressed bytes length:', compressedBytes.length);
    
    // Step 2: Direct ungzip to binary data
    const fileData = pako.ungzip(compressedBytes);
    console.log('Decompressed file bytes length:', fileData.length);
    
    console.log('=== FILE DECOMPRESSION STATS (OPTIMIZED) ===');
    console.log('Original size:', compressedFile.originalSize);
    console.log('Compressed size:', compressedBytes.length);
    console.log('Final size:', fileData.length);
    console.log('Compression ratio:', compressedFile.compressionRatio.toFixed(2) + '%');
    console.log('=== FILE DECOMPRESSION END ===');
    
    // Create blob with original file type
    return new Blob([fileData], { type: compressedFile.type });
  } catch (error) {
    console.error('Error decompressing file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    throw new Error(`Failed to decompress file ${compressedFile.name}: ${errorMessage}`);
  }
}

/**
 * Create a File object from decompressed blob
 * @param blob - The decompressed blob
 * @param compressedFile - Original file metadata
 * @returns File object
 */
export function createFileFromBlob(blob: Blob, compressedFile: CompressedFile): File {
  return new File([blob], compressedFile.name, { type: compressedFile.type });
}

/**
 * Compress multiple files
 * @param files - Array of files to compress
 * @returns Array of compressed file data
 */
export async function compressMultipleFiles(files: File[]): Promise<CompressedFile[]> {
  const compressionPromises = files.map(file => compressFileForSender(file));
  return Promise.all(compressionPromises);
}

/**
 * Get file size in human readable format
 * @param bytes - Size in bytes
 * @returns Formatted string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
