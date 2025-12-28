import { X } from "lucide-react";
import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";

interface RecipientInputProps {
  recipients: string[];
  onChange: (recipients: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function RecipientInput({
  recipients,
  onChange,
  placeholder = "Add recipients",
  className = ""
}: RecipientInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Email validation regex
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if email already exists in recipients
  const isDuplicate = (email: string): boolean => {
    return recipients.some(recipient => 
      recipient.toLowerCase() === email.toLowerCase()
    );
  };

  // Add recipient to the list
  const addRecipient = (email: string) => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) return;
    
    if (!isValidEmail(trimmedEmail)) {
      // Show brief error feedback
      if (inputRef.current) {
        inputRef.current.classList.add('border-red-500');
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.classList.remove('border-red-500');
          }
        }, 2000);
      }
      return;
    }

    if (isDuplicate(trimmedEmail)) {
      // Show brief duplicate feedback
      if (inputRef.current) {
        inputRef.current.classList.add('border-yellow-500');
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.classList.remove('border-yellow-500');
          }
        }, 2000);
      }
      return;
    }

    onChange([...recipients, trimmedEmail]);
    setInputValue("");
  };

  // Remove recipient from the list
  const removeRecipient = (index: number) => {
    const newRecipients = recipients.filter((_, i) => i !== index);
    onChange(newRecipients);
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRecipient(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && recipients.length > 0) {
      // Remove last recipient when backspace is pressed on empty input
      removeRecipient(recipients.length - 1);
    } else if (e.key === "Escape") {
      setInputValue("");
    }
  };

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Auto-add recipient if comma is typed
    if (value.includes(",")) {
      const parts = value.split(",");
      const partsToAdd = parts.slice(0, -1).filter(part => part.trim());
      
      partsToAdd.forEach(part => {
        addRecipient(part);
      });
      
      setInputValue(parts[parts.length - 1]);
    } else {
      setInputValue(value);
    }
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    
    // Split by commas, semicolons, or newlines
    const emails = pastedText
      .split(/[,;\n\r]+/)
      .map(email => email.trim())
      .filter(email => email);
    
    // Add valid emails
    emails.forEach(email => {
      if (isValidEmail(email) && !isDuplicate(email)) {
        addRecipient(email);
      }
    });
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-800 border border-gray-600 rounded-lg min-h-[42px] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        {/* Recipient pills */}
        {recipients.map((recipient, index) => (
          <div
            key={index}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-sm
              ${focusedIndex === index 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }
              transition-colors cursor-pointer
            `}
            onClick={() => setFocusedIndex(index)}
            onMouseDown={() => setFocusedIndex(index)}
          >
            <span className="max-w-[200px] truncate">{recipient}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeRecipient(index);
              }}
              className="ml-1 hover:text-red-400 transition-colors"
              title="Remove recipient"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={recipients.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-white placeholder-gray-400 outline-none text-sm"
        />
      </div>
      
      {/* Helper text */}
      {recipients.length > 0 && (
        <div className="mt-1 text-xs text-gray-400">
          {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} • Press Enter or comma to add • Backspace to remove last
        </div>
      )}
    </div>
  );
}
