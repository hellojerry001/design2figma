import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { SvgPreview } from './components/SvgPreview';
import { Loader } from './components/Loader';
import { generateSvgFromImage } from './services/geminiService';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [svgCode, setSvgCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (base64: string) => {
    setImage(base64);
    setSvgCode(null);
    setError(null);
    setIsLoading(true);

    try {
      const generatedSvg = await generateSvgFromImage(base64);
      setSvgCode(generatedSvg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发生未知错误");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setSvgCode(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)] min-h-[600px]">
          
          {/* Left Column: Input */}
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">原始图片 Original</h2>
              
              {!image ? (
                <div className="flex-1 flex flex-col justify-center">
                   <UploadZone onImageSelected={handleImageSelected} />
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4 relative overflow-hidden bg-gray-50 rounded-lg border border-gray-100">
                  <div className="absolute inset-0 p-4 flex items-center justify-center">
                    <img 
                      src={image} 
                      alt="Uploaded Preview" 
                      className="max-w-full max-h-full object-contain shadow-lg" 
                    />
                  </div>
                  <button 
                    onClick={handleReset}
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-gray-700 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 text-sm font-medium hover:bg-white hover:text-red-500 transition-colors z-10"
                  >
                    重新上传
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="flex flex-col h-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col p-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">生成结果 Generated SVG</h2>
              
              <div className="flex-1 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden relative">
                {!image ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">请先在左侧上传图片</p>
                  </div>
                ) : isLoading ? (
                  <Loader />
                ) : svgCode ? (
                  <div className="h-full">
                     <SvgPreview svgCode={svgCode} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;