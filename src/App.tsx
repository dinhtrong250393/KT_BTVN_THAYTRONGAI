/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [essay, setEssay] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGrade = async () => {
    if (!prompt.trim() || !essay.trim()) {
      setError('Vui lòng nhập đầy đủ đề bài và bài làm của học sinh.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, essay }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi chấm bài.');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trợ Lý Chấm Bài Tự Luận
          </h1>
          <p className="mt-2 text-slate-600 text-lg">
            Sử dụng AI để phân tích, chấm điểm và đưa ra nhận xét chi tiết cho bài làm của học sinh.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <label htmlFor="prompt" className="block text-sm font-semibold text-slate-700 mb-2">
                Đề bài / Yêu cầu
              </label>
              <textarea
                id="prompt"
                className="w-full h-32 md:h-40 px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                placeholder="Nhập đề bài hoặc các tiêu chí chấm điểm vào đây..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <label htmlFor="essay" className="block text-sm font-semibold text-slate-700 mb-2">
                Bài làm của học sinh
              </label>
              <textarea
                id="essay"
                className="w-full h-64 md:h-80 px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                placeholder="Nhập bài văn hoặc câu trả lời tự luận của học sinh vào đây..."
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
              />
            </div>

            <button
              onClick={handleGrade}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang chấm bài...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Chấm Điểm Ngay</span>
                </>
              )}
            </button>
            
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:min-h-[600px] flex flex-col">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Kết Quả Đánh Giá</span>
              {result && <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Đã hoàn thành</span>}
            </h2>
            
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p>AI đang đọc và phân tích bài làm...</p>
                </div>
              ) : result ? (
                <div className="prose prose-slate prose-sm sm:prose-base max-w-none prose-headings:text-slate-800 prose-a:text-blue-600">
                  <Markdown>{result}</Markdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                    <CheckCircle className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-center max-w-[250px]">Kết quả chấm điểm và nhận xét sẽ hiển thị ở đây.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
