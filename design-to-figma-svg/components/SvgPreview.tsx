import React, { useState } from 'react';

interface SvgPreviewProps {
  svgCode: string;
}

export const SvgPreview: React.FC<SvgPreviewProps> = ({ svgCode }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            预览 Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            代码 Code
          </button>
        </div>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已复制 (可粘贴至Figma)
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              复制 SVG 代码
            </>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative bg-gray-50/50">
        {activeTab === 'preview' ? (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div 
              className="bg-white shadow-sm border border-gray-200 max-w-full max-h-full overflow-hidden"
              // Using dangerouslySetInnerHTML to render the raw SVG string
              dangerouslySetInnerHTML={{ __html: svgCode }} 
            />
          </div>
        ) : (
          <pre className="w-full h-full p-4 text-xs font-mono text-gray-300 bg-gray-900 overflow-auto custom-scrollbar">
            <code>{svgCode}</code>
          </pre>
        )}
      </div>
    </div>
  );
};