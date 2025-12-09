import { ArrowLeft, X, Save, Send, Loader2, Paperclip, Mic, FileText, Image as ImageIcon, StopCircle, Play, Key, RefreshCw, Shield } from "lucide-react";
import SecurityPanel from "./SecurityPanel";
import RecipientInput from "./RecipientInput";
import { useState, useEffect, useRef } from "react";
import { blobToArrayBuffer, compressAudioForSender } from "@/utils/audioCompression";
import { compressMultipleFiles, CompressedFile, formatFileSize } from "@/utils/fileCompression";

type EncryptionType = 'AES' | 'QKD' | 'OTP' | 'PQC' | 'None';

interface EmailForm {
  to: string[];
  subject: string;
  body: string;
  isHtml: boolean;
  type: EncryptionType;
}

interface ComposeModalProps {
  isOpen: boolean;
  emailForm: EmailForm;
  loading: boolean;
  onClose: () => void;
  onFormChange: (form: EmailForm) => void;
  onSend: (e: React.FormEvent, audioData?: string, filesData?: CompressedFile[]) => void;
}

export default function ComposeModal({
  isOpen,
  emailForm,
  loading,
  onClose,
  onFormChange,
  onSend
}: ComposeModalProps) {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/webm');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [keySize, setKeySize] = useState<number>(1); // in KB
  const [generatingKey, setGeneratingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  useEffect(() => {
    if (!audioBlob) {
      setAudioUrl(null);
      return;
    }

    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto stop at 10 seconds
          if (newTime >= 10) {
            stopRecording();
            return 10;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof EmailForm, value: string | EncryptionType | string[]) => {
    onFormChange({ ...emailForm, [field]: value });
  };

  const handleRecipientsChange = (recipients: string[]) => {
    onFormChange({ ...emailForm, to: recipients });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isPDF = file.type === 'application/pdf';
      const isImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
      return isPDF || isImage;
    });
    
    // Store original files for display
    setAttachedFiles(prev => [...prev, ...validFiles]);
    
    // Compress files and store compressed data
    try {
      const compressed = await compressMultipleFiles(validFiles);
      setCompressedFiles(prev => [...prev, ...compressed]);
      console.log('Files compressed successfully:', compressed.map(f => ({ name: f.name, ratio: f.compressionRatio.toFixed(2) + '%' })));
    } catch (error) {
      console.error('Error compressing files:', error);
      alert('Failed to compress some files. They will be sent uncompressed.');
      // Keep original files as fallback
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    setCompressedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = []; // Using buffer to collect audio chunks

      recorder.ondataavailable = (e) => {
        chunks.push(e.data); // Buffer approach - collecting audio chunks
        console.log('Audio chunk received:', e.data.size, 'bytes, MIME type:', e.data.type, 'total chunks:', chunks.length);
      };

      recorder.onstop = () => {
        console.log('Recording stopped. Total chunks collected:', chunks.length);
        console.log('Total buffer size:', chunks.reduce((total, chunk) => total + (chunk as Blob).size, 0), 'bytes');
        
        // Detect the actual MIME type from the first chunk or use MediaRecorder's MIME type
        const detectedMimeType = chunks[0] && (chunks[0] as Blob).type ? (chunks[0] as Blob).type : recorder.mimeType || 'audio/webm';
        console.log('Detected MIME type:', detectedMimeType);
        
        const blob = new Blob(chunks, { type: detectedMimeType });
        console.log('Final audio blob created:', blob.size, 'bytes');
        console.log('Voice Blob Details:', {
          size: blob.size,
          type: blob.type,
          lastModified: Date.now(),
          duration: recordingTime + ' seconds'
        });
        console.log('Blob Object:', blob);
        
        // Store the MIME type for later use
        setAudioMimeType(detectedMimeType);
        setAudioBlob(blob);
        
        blob.arrayBuffer()
          .then((buffer) => {
            const binaryData = new Uint8Array(buffer);
            console.log('Voice binary data (Uint8Array):', binaryData);
          })
          .catch((error) => {
            console.error('Error reading blob binary data:', error);
          });
        stream.getTracks().forEach(track => track.stop());
      };

      // Auto stop after 10 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          console.log('10-second limit reached, auto-stopping recording...');
          recorder.stop();
        }
      }, 10000);

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const removeAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const handlePlayAudio = () => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioUrl) return;

    audioElement.play().catch((error) => {
      console.error('Error playing audio:', error);
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to get compressed files data for sending
  const getCompressedFilesData = (): CompressedFile[] => {
    return compressedFiles;
  };

  // Function to compress audio data before sending
  const getCompressedAudioData = async (): Promise<string | null> => {
    if (!audioBlob) return null;
    
    try {
      console.log('Compressing audio data for transmission...');
      console.log('Audio MIME type:', audioMimeType);
      
      const arrayBuffer = await blobToArrayBuffer(audioBlob);
      const compressedAudio = compressAudioForSender(arrayBuffer);
      
      // Include MIME type in the compressed data for receiver
      const audioDataWithMimeType = `${audioMimeType}:${compressedAudio}`;
      
      console.log('Audio compressed successfully with MIME type');
      return audioDataWithMimeType;
    } catch (error) {
      console.error('Error compressing audio:', error);
      throw new Error('Failed to compress audio for transmission');
    }
  };

  // Handle form submission with audio and file data
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const compressedAudio = await getCompressedAudioData();
      const compressedFilesData = getCompressedFilesData();
      
      // Pass both audio and files data to parent
      onSend(e, compressedAudio || undefined, compressedFilesData);
    } catch (error) {
      console.error('Error preparing email for sending:', error);
      alert('Failed to prepare attachments for sending');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-gray-900 border-0 sm:border border-gray-700 rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:w-[95vw] max-w-7xl sm:max-h-[95vh] flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Left Side - New Message */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Compose Header */}
          <div className="border-b border-gray-700 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-white">Compose Email</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* New Message Section */}
          <div className="p-3 sm:p-4 lg:p-6 bg-gray-800/50 flex-shrink-0">
            <h3 className="text-base sm:text-lg font-semibold text-white">New Message</h3>
          </div>

          {/* Compose Form */}
          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
            <form onSubmit={handleFormSubmit} className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 pb-24 sm:pb-20">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">To</label>
                <RecipientInput
                  recipients={emailForm.to}
                  onChange={handleRecipientsChange}
                  placeholder="Add recipients..."
                />
              </div>

              {/* Security Level Selector - Mobile & Desktop */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Encryption Type</span>
                </label>
                <select
                  value={emailForm.type}
                  onChange={(e) => handleInputChange('type', e.target.value as EncryptionType)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="OTP" className="bg-gray-800 py-2">🔐 Quantum Secure (OTP)</option>
                  <option value="QKD" className="bg-gray-800 py-2">⚡ Quantum-Aided AES</option>
                  <option value="PQC" className="bg-gray-800 py-2">🛡️ Post-Quantum</option>
                  <option value="AES" className="bg-gray-800 py-2">🔒 AES Standard</option>
                  <option value="None" className="bg-gray-800 py-2">📧 Standard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject"
                  required
                />
              </div>

              {/* Key Size Selector - Show for OTP and QKD only */}
              {(emailForm.type === 'OTP' || emailForm.type === 'QKD') && (
                <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-white flex items-center space-x-2">
                        <Key className={`w-4 h-4 ${emailForm.type === 'OTP' ? 'text-green-400' : 'text-blue-400'}`} />
                        <span>Quantum Key Size</span>
                      </label>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Select key length for encryption. Larger keys = stronger security.
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${emailForm.type === 'OTP' ? 'text-green-400' : 'text-blue-400'} whitespace-nowrap`}>
                      {keySize} KB<br />({keySize * 1024} bits)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={keySize}
                      onChange={(e) => setKeySize(Number(e.target.value))}
                      className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${emailForm.type === 'OTP' ? 'accent-green-500' : 'accent-blue-500'}`}
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>1 KB</span>
                      <span>100 KB</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setGeneratingKey(true);
                      setKeyError(null);
                      try {
                        const response = await fetch('/auth/generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ keySize: keySize * 1024 })
                        });
                        if (!response.ok) throw new Error('Key generation failed');
                        const data = await response.json();
                        setGeneratedKey(data.key || 'Key generated successfully');
                      } catch (error) {
                        setKeyError(error instanceof Error ? error.message : 'Failed to generate key');
                      } finally {
                        setGeneratingKey(false);
                      }
                    }}
                    disabled={generatingKey}
                    className={`w-full flex items-center justify-center gap-2 ${emailForm.type === 'OTP' ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'} disabled:bg-gray-600 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-semibold`}
                  >
                    {generatingKey ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Generate Key</span>
                      </>
                    )}
                  </button>

                  {generatedKey && (
                    <div className={`border ${emailForm.type === 'OTP' ? 'border-green-500/30 bg-green-900/20' : 'border-blue-500/30 bg-blue-900/20'} rounded-lg p-3`}>
                      <p className={`text-xs ${emailForm.type === 'OTP' ? 'text-green-400' : 'text-blue-400'} font-mono break-all`}>
                        {generatedKey.substring(0, 60)}...
                      </p>
                    </div>
                  )}

                  {keyError && (
                    <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3">
                      <p className="text-xs text-red-400">{keyError}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Message</label>
                <textarea
                  value={emailForm.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 sm:h-52 lg:h-64 resize-none"
                  placeholder="Type your message here..."
                  maxLength={12000}
                  required
                />
              </div>

              {/* Attachments Display */}
              {(attachedFiles.length > 0 || audioBlob) && (
                <div className="space-y-2">
                  {attachedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400">Attached Files:</p>
                      <div className="space-y-1.5">
                        {attachedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
                            <div className="flex items-center space-x-2">
                              {file.type === 'application/pdf' ? (
                                <FileText className="w-4 h-4 text-red-400" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-blue-400" />
                              )}
                              <span className="text-sm text-gray-300 truncate max-w-xs">{file.name}</span>
                              <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                              {compressedFiles[index] && (
                                <span className="text-xs text-green-400 ml-1">
                                  ({compressedFiles[index].compressionRatio.toFixed(1)}% saved)
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {audioBlob && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400">Voice Recording:</p>
                      <div className="flex items-center justify-between bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <Mic className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Voice Message</span>
                          <span className="text-xs text-gray-500">({recordingTime}s / 10s max)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={handlePlayAudio}
                            className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 hover:bg-gray-700 px-2 py-1 rounded-lg transition-colors"
                            title="Replay voice message"
                          >
                            <Play className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm">Replay</span>
                          </button>
                          <button
                            type="button"
                            onClick={removeAudio}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <audio ref={audioRef} src={audioUrl ?? undefined} preload="auto" className="hidden" />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2 flex-wrap">
                  <div className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                    {emailForm.body.length} / 12000 char
                  </div>
                  
                  {/* Attachment Buttons */}
                  <div className="flex items-center space-x-1">
                    {/* File Attachment */}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors" title="Attach files (PDF, JPG, PNG)">
                        <Paperclip className="w-4 h-4" />
                      </div>
                    </label>

                    {/* Voice Recording */}
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Record voice message (Max 10 seconds)"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="p-2 text-red-400 hover:text-red-500 hover:bg-gray-700 rounded-lg transition-colors animate-pulse"
                          title="Stop recording"
                        >
                          <StopCircle className="w-4 h-4" />
                        </button>
                        
                        {/* Recording Progress Bar */}
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 transition-all duration-1000 ease-linear"
                              style={{ width: `${(recordingTime / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-red-400 font-mono min-w-[2rem]">
                            {recordingTime}/10s
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
                  <button 
                    type="button"
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2 text-sm sm:text-base"
                  >
                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Save Draft</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || emailForm.to.length === 0 || !emailForm.subject.trim()}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Security Panel - stacks below on mobile, sidebar on desktop */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <SecurityPanel 
            selectedType={emailForm.type}
            onTypeChange={(type) => handleInputChange('type', type)}
          />
        </div>
      </div>
    </div>
  );
}