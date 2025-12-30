
import React, { useState } from 'react';
import { Search, Loader2, Weight, Hash, ChefHat, Plus, Minus, Scale } from 'lucide-react';
import { searchRecipe } from '../services/geminiService';

interface RecipeHelperProps {
  weightPerCube: number;
  onUpdateWeight: (weight: number) => void;
}

const RecipeHelper: React.FC<RecipeHelperProps> = ({ weightPerCube, onUpdateWeight }) => {
  const [query, setQuery] = useState('');
  const [targetCount, setTargetCount] = useState(14);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const weightOptions = [10, 15, 20, 25, 30];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await searchRecipe(query, weightPerCube, targetCount);
      setResult(data || "검색 결과가 없습니다.");
    } catch (error) {
      setResult("레시피를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const updateTargetCount = (delta: number) => {
    setTargetCount(prev => Math.max(1, Math.min(60, prev + delta)));
  };

  const cleanResult = (text: string) => {
    return text.replace(/[#*]/g, '').trim();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xl">
            <ChefHat className="w-6 h-6" />
            <h2>밍키봇 큐브 레시피 도우미</h2>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
            <Scale className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500">표준 계량 기준</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <Weight className="w-4 h-4 text-pink-500" />
              큐브 당 용량 (g)
            </label>
            <div className="flex flex-wrap gap-2">
              {weightOptions.map((w) => (
                <button
                  key={w}
                  onClick={() => onUpdateWeight(w)}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all
                    ${weightPerCube === w 
                      ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm' 
                      : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                >
                  {w}g
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <Hash className="w-4 h-4 text-indigo-500" />
              만들 큐브 개수
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
                <button onClick={() => updateTargetCount(-1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Minus className="w-5 h-5" /></button>
                <div className="w-16 text-center">
                  <span className="text-lg font-black text-indigo-600">{targetCount}</span>
                  <span className="text-[10px] text-slate-400 font-bold ml-0.5">개</span>
                </div>
                <button onClick={() => updateTargetCount(1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 bg-indigo-50 rounded-2xl px-4 py-2 border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">예상 총 무게</p>
                <p className="text-sm font-black text-indigo-700">{weightPerCube * targetCount}g</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="재료를 입력하세요 (예: 소고기 비타민 죽)"
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 ring-purple-400 outline-none transition-all shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-100"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "레시피 생성"}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Scale className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-sm font-bold text-slate-400">조리할 메뉴를 검색해보세요.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
            <p className="text-slate-600 font-bold">밍키봇이 레시피 계산 중...</p>
          </div>
        )}

        {result && !loading && (
          <div className="max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 p-4 bg-purple-50 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">표준 계량 핵심 요약</p>
                  <p className="text-sm font-bold text-purple-700">
                     {weightPerCube}g × {targetCount}개 (총 {weightPerCube * targetCount}g)
                  </p>
                </div>
            </div>
            <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed bg-slate-50/50 p-6 rounded-3xl border border-slate-100 mb-6">
              {cleanResult(result)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeHelper;
