import { ArrowLeft, X, Save, Send, Loader2 } from "lucide-react";
import SecurityPanel from "./SecurityPanel";
import { useState, useEffect } from "react";

type EncryptionType = 'AES' | 'QKD' | 'OTP' | 'PQC' | 'None';

interface EmailForm {
  to: string;
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
  onSend: (e: React.FormEvent) => void;
}

export default function ComposeModal({
  isOpen,
  emailForm,
  loading,
  onClose,
  onFormChange,
  onSend
}: ComposeModalProps) {
  if (!isOpen) return null;

  const handleInputChange = (field: keyof EmailForm, value: string | EncryptionType) => {
    onFormChange({ ...emailForm, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex">
        {/* Left Side - New Message */}
        <div className="flex-1 flex flex-col">
          {/* Compose Header */}
          <div className="border-b border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-white">Compose Email</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* New Message Section */}
          <div className="p-6 bg-gray-800/50 flex-shrink-0">
            <h3 className="text-lg font-semibold text-white mb-4">New Message</h3>
          </div>

          {/* Compose Form */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={onSend} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
                <input
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => handleInputChange('to', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="recipient@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  value={emailForm.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-64 resize-none"
                  placeholder="Type your message here..."
                  maxLength={12000}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Message size: {emailForm.body.length} / 12000 char
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    type="button"
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Draft</span>
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || !emailForm.to.trim() || !emailForm.subject.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Security Panel */}
        <SecurityPanel 
          selectedType={emailForm.type}
          onTypeChange={(type) => handleInputChange('type', type)}
        />
      </div>
    </div>
  );
}