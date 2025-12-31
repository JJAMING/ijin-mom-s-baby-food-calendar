
import React, { useState } from 'react';
import { Search, Loader2, ChefHat, Scale, Info } from 'lucide-react';
import { searchRecipe } from '../services/geminiService';

interface RecipeHelperProps {
  weightPerCube: number;
  onUpdateWeight: (weight: number) => void;
}

const RecipeHelper: React.FC<RecipeHelperProps> = ({ weightPerCube, onUpdateWeight }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // UI에서 설정창이 사라졌으므로, 밍키봇에게 기본 설정을 전달하기 위한 값
  // 사용자가 검색어에 직접 정보를 넣도록 유도함
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // weightPerCube는 설정의 기본값을 사용하고, targetCount는 밍키봇이 검색어에서 파악하도록 위임하거나 기본 14로 설정
      const data = await searchRecipe(query, weightPerCube, 14);
      setResult(data || "검색 결과가 없습니다.");
    } catch (error) {
      setResult("레시피를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const cleanResult = (text: string) => {
    return text.replace(/[#*]/g, '').trim();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xl">
            <ChefHat className="w-6 h-6" />
            <h2>밍키봇 큐브 레시피 도우미</h2>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
            <Scale className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500">지능형 레시피 검색</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-purple-100/50 border border-purple-200 rounded-2xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-purple-800 leading-relaxed font-medium">
              찾고 싶은 재료와 원하는 분량을 함께 입력해보세요!<br/>
              예: <span className="font-black">"소고기 비타민 30g 큐브 12개 레시피"</span>, <span className="font-black">"브로콜리 20g 큐브 20개 만드는법"</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="어떤 이유식 큐브를 만들까요?"
            className="w-full pl-12 pr-4 py-5 bg-white border border-slate-200 rounded-3xl text-sm focus:ring-2 ring-purple-400 outline-none transition-all shadow-sm"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-purple-500 text-white rounded-2xl font-black hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-100"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "레시피 생성"}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <ChefHat className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-sm font-bold text-slate-400">메뉴와 용량을 자유롭게 입력해보세요.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
            <p className="text-slate-600 font-bold">밍키봇이 레시피를 구상 중...</p>
          </div>
        )}

        {result && !loading && (
          <div className="max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
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
