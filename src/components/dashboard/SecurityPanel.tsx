import { Shield, Lock } from "lucide-react";

type EncryptionType = 'AES' | 'QKD' | 'OTP' | 'PQC' | 'None';

interface SecurityPanelProps {
  selectedType: EncryptionType;
  onTypeChange: (type: EncryptionType) => void;
}

export default function SecurityPanel({ selectedType, onTypeChange }: SecurityPanelProps) {
  const securityOptions = [
    {
      id: 'OTP' as EncryptionType,
      title: 'Quantum Secure',
      description: 'One-Time Pad encryption using QKD keys for unbreakable security',
      keyRequirement: '1 KB',
      color: 'green',
      icon: null
    },
    {
      id: 'QKD' as EncryptionType,
      title: 'Quantum-Aided AES',
      description: 'AES encryption seeded with quantum-distributed keys',
      keyRequirement: '32 Bytes',
      color: 'blue',
      icon: null
    },
    {
      id: 'PQC' as EncryptionType,
      title: 'Post-Quantum',
      description: 'Quantum-resistant algorithms for future-proof security',
      keyRequirement: '64 Bytes',
      color: 'purple',
      icon: null
    },
    {
      id: 'AES' as EncryptionType,
      title: 'AES Standard',
      description: 'Standard AES encryption for secure communication',
      keyRequirement: '32 Bytes',
      color: 'orange',
      icon: <Lock className="w-4 h-4 text-white" />
    },
    {
      id: 'None' as EncryptionType,
      title: 'Standard',
      description: 'Traditional encryption methods for compatibility',
      keyRequirement: 'None',
      color: 'gray',
      icon: <Lock className="w-4 h-4 text-white" />
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap = {
      green: {
        border: isSelected ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-green-500',
        dot: 'bg-green-500',
        text: 'text-green-400',
        checkBg: 'bg-green-500'
      },
      blue: {
        border: isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-500',
        dot: 'bg-blue-500',
        text: 'text-blue-400',
        checkBg: 'bg-blue-500'
      },
      purple: {
        border: isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500',
        dot: 'bg-purple-500',
        text: 'text-purple-400',
        checkBg: 'bg-purple-500'
      },
      orange: {
        border: isSelected ? 'border-orange-500 bg-orange-500/10' : 'border-gray-600 hover:border-orange-500',
        dot: 'bg-orange-500',
        text: 'text-orange-400',
        checkBg: 'bg-orange-500'
      },
      gray: {
        border: isSelected ? 'border-gray-500 bg-gray-500/10' : 'border-gray-600 hover:border-gray-500',
        dot: 'bg-gray-600',
        text: 'text-gray-400',
        checkBg: 'bg-gray-500'
      }
    };
    return colorMap[color as keyof typeof colorMap];
  };

  return (
    <div className="w-full lg:w-80 xl:w-96 bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700 flex flex-col h-full max-h-[90vh] lg:max-h-full overflow-hidden">
      {/* Security Level Header */}
      <div className="p-3 sm:p-4 lg:p-5 border-b border-gray-700 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span>Security Level</span>
        </h3>
      </div>

      {/* Security Options */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 space-y-3">
        {securityOptions.map((option) => {
          const isSelected = selectedType === option.id;
          const colors = getColorClasses(option.color, isSelected);

          return (
            <div
              key={option.id}
              className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all relative ${colors.border}`}
              onClick={() => onTypeChange(option.id)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <div className={`w-6 h-6 ${colors.checkBg} rounded-full flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2 mb-1.5 sm:mb-2">
                {option.icon ? (
                  <div className={`w-8 h-8 ${colors.dot} rounded flex items-center justify-center`}>
                    {option.icon}
                  </div>
                ) : (
                  <div className={`w-3 h-3 ${colors.dot} rounded-full`}></div>
                )}
                <span className={`${colors.text} font-semibold`}>{option.title}</span>
              </div>
              
              <div className="text-xs sm:text-sm text-gray-300 mb-1.5 sm:mb-2 leading-relaxed">
                {option.description}
              </div>
              
              <div className="text-xs text-gray-400 mb-1.5 sm:mb-2">
                <div>Key Requirement: {option.keyRequirement}</div>
              </div>
              
              <div className={`flex items-center text-xs ${colors.text} mt-1.5 sm:mt-2`}>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Available
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Tips */}
      <div className="p-3 sm:p-4 lg:p-5 border-t border-gray-700 flex-shrink-0">
        <div className="bg-gray-900 rounded-lg p-3">
          <h4 className="text-xs sm:text-sm font-semibold text-white mb-2 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Security Tips</span>
          </h4>
          <ul className="text-xs text-gray-400 space-y-1 leading-relaxed">
            <li>• Use Quantum Secure for highly confidential data</li>
            <li>• Quantum-Aided AES offers good security with efficiency</li>
            <li>• Large attachments require more quantum keys</li>
            <li>• Standard: Compatible with all email clients</li>
          </ul>
        </div>
      </div>
    </div>
  );
}