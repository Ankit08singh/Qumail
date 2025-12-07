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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-7xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col lg:flex-row">
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
          <div className="flex-1 overflow-y-auto min-h-0">
            <form onSubmit={onSend} className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">To</label>
                <input
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => handleInputChange('to', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="recipient@example.com"
                  required
                />
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-700">
                <div className="text-xs sm:text-sm text-gray-400">
                  {emailForm.body.length} / 12000 char
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
                    disabled={loading || !emailForm.to.trim() || !emailForm.subject.trim()}
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

        {/* Right Side - Security Panel - Hidden on mobile, shown on lg+ */}
        <div className="hidden lg:block">
          <SecurityPanel 
            selectedType={emailForm.type}
            onTypeChange={(type) => handleInputChange('type', type)}
          />
        </div>
      </div>
    </div>
  );
}