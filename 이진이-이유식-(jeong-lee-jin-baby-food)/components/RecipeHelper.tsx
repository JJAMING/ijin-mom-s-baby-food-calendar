
import React, { useState } from 'react';
import { Search, Loader2, ChefHat, Scale, Info, Save, Trash2, Calendar, FileText } from 'lucide-react';
import { searchRecipe } from '../services/geminiService';
import { SavedRecipe } from '../types';
import { format } from 'date-fns';

interface RecipeHelperProps {
  weightPerCube: number;
  onUpdateWeight: (weight: number) => void;
  savedRecipes: SavedRecipe[];
  onSaveRecipe: (title: string, content: string) => void;
  onDeleteRecipe: (id: string) => void;
}

const RecipeHelper: React.FC<RecipeHelperProps> = ({ 
  weightPerCube, 
  onUpdateWeight, 
  savedRecipes, 
  onSaveRecipe, 
  onDeleteRecipe 
}) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await searchRecipe(query, weightPerCube, 14);
      setResult(data || "검색 결과가 없습니다.");
      setLastQuery(query);
    } catch (error) {
      setResult("레시피를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (result && lastQuery) {
      onSaveRecipe(lastQuery, result);
      setResult(null);
      setQuery('');
    }
  };

  const cleanResult = (text: string) => {
    return text.replace(/[#*]/g, '').trim();
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
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
                예: <span className="font-black">"소고기 비타민 큐브"</span>, <span className="font-black">"브로콜리 20g 큐브 20개"</span>
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

        <div className="p-6 bg-white">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
              <p className="text-slate-600 font-bold">밍키봇이 레시피를 구상 중...</p>
            </div>
          )}

          {result && !loading && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed bg-slate-50/50 p-6 rounded-3xl border border-slate-100 mb-4">
                {cleanResult(result)}
              </div>
              <button
                onClick={handleSave}
                className="w-full py-4 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
              >
                <Save className="w-5 h-5" />
                이 레시피 저장소에 담기
              </button>
            </div>
          )}
          
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-300">
              <ChefHat className="w-12 h-12 opacity-10 mb-2" />
              <p className="text-xs font-bold text-slate-400">새로운 레시피를 검색해보세요.</p>
            </div>
          )}
        </div>
      </div>

      {/* 저장된 레시피 리스트 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <FileText className="w-5 h-5 text-slate-400" />
          <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider">나만의 레시피 저장소</h3>
          <span className="text-[10px] font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">{savedRecipes.length}개</span>
        </div>

        {savedRecipes.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl py-12 flex flex-col items-center justify-center text-slate-300">
             <Save className="w-10 h-10 opacity-5 mb-2" />
             <p className="text-xs font-bold">아직 저장된 레시피가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedRecipes.map(recipe => (
              <div key={recipe.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="overflow-hidden pr-8">
                    <h4 className="font-black text-slate-800 text-sm truncate">{recipe.title}</h4>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold mt-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(recipe.createdAt), 'yyyy.MM.dd')} 저장됨
                    </div>
                  </div>
                  <button 
                    onClick={() => onDeleteRecipe(recipe.id)}
                    className="absolute top-4 right-4 p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 max-h-[150px] overflow-y-auto custom-scrollbar">
                   <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                     {cleanResult(recipe.content)}
                   </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeHelper;
