
import React, { useState } from 'react';
import { Settings as SettingsIcon, Weight, Info, Check, Calendar, Plus, Trash2, ListChecks } from 'lucide-react';
import { PreparationPlan } from '../types';

interface SettingsProps {
  weightPerCube: number;
  onUpdateWeight: (weight: number) => void;
  prepPlans: PreparationPlan[];
  onUpdatePrepPlans: (plans: PreparationPlan[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ weightPerCube, onUpdateWeight, prepPlans, onUpdatePrepPlans }) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'prep'>('general');
  const weightOptions = [10, 15, 20, 25, 30];
  
  // Prep Plan Form State
  const [newItemName, setNewItemName] = useState('');
  const [newRequiredQty, setNewRequiredQty] = useState(14);

  const handleAddPrepPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;
    const newPlan: PreparationPlan = {
      id: Math.random().toString(36).substr(2, 9),
      itemName: newItemName,
      requiredQuantity: newRequiredQty
    };
    onUpdatePrepPlans([...prepPlans, newPlan]);
    setNewItemName('');
    setNewRequiredQty(14);
  };

  const handleDeletePrepPlan = (id: string) => {
    onUpdatePrepPlans(prepPlans.filter(p => p.id !== id));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-6 text-slate-600 font-bold text-xl">
          <SettingsIcon className="w-6 h-6" />
          <h2>앱 설정</h2>
        </div>
        
        <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl">
          <button 
            onClick={() => setActiveSubTab('general')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeSubTab === 'general' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            일반 설정
          </button>
          <button 
            onClick={() => setActiveSubTab('prep')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeSubTab === 'prep' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            14일 준비 계획
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        {activeSubTab === 'general' ? (
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Weight className="w-5 h-5 text-pink-500" />
                <h3 className="font-bold text-slate-800">큐브 기본 용량 설정</h3>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                큐브 1개당 무게를 설정합니다. 이 설정값은 레시피 계산 및 권장 섭취량 가이드에 활용됩니다.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {weightOptions.map((weight) => (
                  <button
                    key={weight}
                    onClick={() => onUpdateWeight(weight)}
                    className={`flex-1 min-w-[80px] py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 group
                      ${weightPerCube === weight 
                        ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-md scale-105' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-pink-200'}`}
                  >
                    <span className={`text-lg font-black ${weightPerCube === weight ? 'text-pink-600' : 'text-slate-600'}`}>
                      {weight}g
                    </span>
                    {weightPerCube === weight && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-blue-50 rounded-2xl p-5 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 leading-relaxed">
                <p className="font-bold mb-1">팁: 이유식 시기별 권장 용량</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>초기: 큐브 당 10~15g이 적당해요.</li>
                  <li>중기: 큐브 당 20~25g으로 늘려주세요.</li>
                  <li>후기: 아이의 식사량에 맞춰 30g까지 조절하세요.</li>
                </ul>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800">14일 큐브 준비 목표</h3>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                향후 14일(2주) 동안 필요한 재료별 큐브 목표 개수를 관리합니다. 
              </p>

              <form onSubmit={handleAddPrepPlan} className="space-y-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="재료명 (예: 소고기)"
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-400"
                  />
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">목표</span>
                    <input
                      type="number"
                      value={newRequiredQty}
                      onChange={(e) => setNewRequiredQty(parseInt(e.target.value))}
                      className="w-12 text-center text-sm font-bold text-slate-700 outline-none"
                    />
                    <span className="text-[10px] text-slate-400">개</span>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  계획 추가하기
                </button>
              </form>

              <div className="space-y-3">
                {prepPlans.length === 0 ? (
                  <div className="text-center py-12 text-slate-300">
                    <ListChecks className="w-12 h-12 mx-auto mb-2 opacity-10" />
                    <p className="text-xs">설정된 2주 준비 계획이 없습니다.</p>
                  </div>
                ) : (
                  prepPlans.map(plan => (
                    <div key={plan.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-black">
                          {plan.requiredQuantity}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-700">{plan.itemName}</h4>
                          <p className="text-[10px] text-slate-400">14일 소요 예정 큐브</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeletePrepPlan(plan.id)}
                        className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
