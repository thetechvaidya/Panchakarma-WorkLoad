import React, { useState, useEffect, useRef } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, text }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset button text when modal opens
      setCopyButtonText('Copy to Clipboard');
      // Select text for easy copying
      setTimeout(() => {
        textareaRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setCopyButtonText('Copy Failed');
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all" role="dialog" aria-modal="true">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Exported Workload</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times fa-lg"></i>
          </button>
        </div>
        <div className="p-6">
          <textarea
            ref={textareaRef}
            readOnly
            className="w-full h-80 p-3 border border-gray-300 rounded-lg shadow-inner bg-slate-50 text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            value={text}
          />
        </div>
        <div className="p-4 bg-slate-50 rounded-b-xl flex justify-end items-center space-x-3">
            <button
                onClick={handleCopy}
                className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 flex items-center space-x-2"
            >
                <i className="fas fa-copy"></i>
                <span>{copyButtonText}</span>
            </button>
            <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-200"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
