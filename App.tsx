
import React, { useState, useCallback } from 'react';
import { classifyImage } from './services/huggingFaceService';
import type { ClassificationResult } from './types';
import FileUploader from './components/FileUploader';
import ResultDisplay from './components/ResultDisplay';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [results, setResults] = useState<ClassificationResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (file: File) => {
    setImageFile(file);
    setResults(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClassify = useCallback(async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const classificationResults = await classifyImage(imageFile);
      setResults(classificationResults);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🌭 Not Hot Dog</h1>
          <p className="text-lg text-gray-400">The only app that matters. Upload an image to find out.</p>
        </header>

        <main className="bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-6">
          <FileUploader onFileSelect={handleImageChange} imageUrl={imageUrl} />
          
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative w-full text-center">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="w-full">
            <button
              onClick={handleClassify}
              disabled={!imageFile || isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Is it a Hot Dog?'}
            </button>
          </div>

          <ResultDisplay isLoading={isLoading} results={results} />
        </main>

        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Hugging Face 🤗 & React</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
