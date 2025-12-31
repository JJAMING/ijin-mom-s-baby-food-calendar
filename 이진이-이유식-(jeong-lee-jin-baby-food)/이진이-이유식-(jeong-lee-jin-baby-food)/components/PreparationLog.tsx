
import React, { useState } from 'react';
import { ClipboardList, Plus, CheckCircle2, Circle, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { PreparationRecord } from '../types';

interface PreparationLogProps {
  preps: PreparationRecord[];
  onAddPrep: (prep: Omit<PreparationRecord, 'id'>) => void;
  onTogglePrep: (id: string) => void;
  onUpdatePrep: (id: string, updates: Partial<PreparationRecord>) => void;
  onDeletePrep: (id: string) => void;
}

const PreparationLog: React.FC<PreparationLogProps> = ({ preps, onAddPrep, onTogglePrep, onUpdatePrep, onDeletePrep }) => {
  const [itemName, setItemName] = useState('');
  const [prepDate, setPrepDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;
    onAddPrep({
      itemName,
      prepDate,
      isCompleted: false
    });
    setItemName('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 h-full">
      <div className="flex items-center gap-2 mb-6 text-amber-600 font-bold text-xl">
        <ClipboardList className="w-6 h-6" />
        <h2>제조 예정 리스트</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="제조할 재료 (예: 닭고기 안심)"
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 ring-amber-400 outline-none transition-all"
          />
          <button type="submit" className="px-4 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-100 active:scale-95">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-1">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" /> 제조 계획일:
          </label>
          <input
            type="date"
            value={prepDate}
            onChange={(e) => setPrepDate(e.target.value)}
            className="text-xs bg-transparent border-none focus:ring-0 text-slate-600 font-medium cursor-pointer"
          />
        </div>
      </form>

      <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
        {preps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <ClipboardList className="w-12 h-12 mb-2 opacity-10" />
            <p className="text-sm">아직 제조 계획이 없어요.</p>
          </div>
        ) : (
          preps.map(prep => (
            <div key={prep.id} className={`flex items-center justify-between p-4 bg-white rounded-2xl border transition-all group ${prep.isCompleted ? 'border-slate-100 opacity-70 bg-slate-50' : 'border-amber-100 shadow-sm bg-amber-50/10'}`}>
              <div className="flex items-center gap-3 flex-1">
                <button 
                  onClick={() => onTogglePrep(prep.id)}
                  className="flex-shrink-0"
                >
                  {prep.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-amber-300" />
                  )}
                </button>
                <div className="flex-1">
                  <span className={`text-sm font-bold block ${prep.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {prep.itemName}
                  </span>
                  <div className="mt-1 flex items-center gap-1 group/date">
                    <CalendarIcon className="w-3 h-3 text-slate-300" />
                    <input 
                      type="date" 
                      value={prep.prepDate}
                      onChange={(e) => onUpdatePrep(prep.id, { prepDate: e.target.value })}
                      className="text-[10px] text-slate-400 bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onDeletePrep(prep.id)} 
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-200 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PreparationLog;
