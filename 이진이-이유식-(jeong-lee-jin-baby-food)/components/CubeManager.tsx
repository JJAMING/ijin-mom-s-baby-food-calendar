
import React, { useState } from 'react';
import { format, addDays, differenceInDays, startOfDay, parseISO } from 'date-fns';
import { Box, Plus, Minus, Trash2, Calendar as CalendarIcon, Check, AlertTriangle, Scale, Edit2, X, Save, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { CubeRecord } from '../types';

interface CubeManagerProps {
  cubes: CubeRecord[];
  onAddCube: (cube: Omit<CubeRecord, 'id'>) => void;
  onDeleteCube: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdateCube?: (id: string, updates: Partial<CubeRecord>) => void;
}

const PRESET_COLORS = [
  { name: 'blue', hex: '#93c5fd' },
  { name: 'green', hex: '#86efac' },
  { name: 'yellow', hex: '#fde047' },
  { name: 'pink', hex: '#f9a8d4' },
  { name: 'orange', hex: '#fdba74' },
  { name: 'purple', hex: '#d8b4fe' },
  // 추가된 색상 5종
  { name: 'mint', hex: '#a7f3d0' },
  { name: 'olive', hex: '#bef264' },
  { name: 'latte', hex: '#e5e7eb' },
  { name: 'rose', hex: '#fca5a5' },
  { name: 'slate', hex: '#94a3b8' },
];

const CubeManager: React.FC<CubeManagerProps> = ({ cubes, onAddCube, onDeleteCube, onUpdateQuantity, onUpdateCube }) => {
  const [name, setName] = useState('');
  const [madeDate, setMadeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expiryDate, setExpiryDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [quantity, setQuantity] = useState(10);
  const [weight, setWeight] = useState(20); 
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].hex);

  // 인라인 편집 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState(0);
  const [editMadeDate, setEditMadeDate] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');

  const handleMadeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMadeDate = e.target.value;
    setMadeDate(newMadeDate);
    setExpiryDate(format(addDays(parseISO(newMadeDate), 14), 'yyyy-MM-dd'));
  };

  const startEditing = (cube: CubeRecord) => {
    setEditingId(cube.id);
    setEditName(cube.name);
    setEditWeight(cube.weight);
    setEditMadeDate(cube.madeDate);
    setEditExpiryDate(cube.expiryDate);
  };

  const handleEditMadeDateChange = (val: string) => {
    setEditMadeDate(val);
    setEditExpiryDate(format(addDays(parseISO(val), 14), 'yyyy-MM-dd'));
  };

  const saveEditing = (id: string) => {
    if (onUpdateCube) {
      onUpdateCube(id, {
        name: editName,
        weight: editWeight,
        madeDate: editMadeDate,
        expiryDate: editExpiryDate
      });
    }
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddCube({
      name,
      madeDate,
      expiryDate,
      quantity,
      weight,
      color: selectedColor
    });
    setName('');
    setQuantity(10);
  };

  const today = startOfDay(new Date());

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
      <div className="flex items-center gap-2 mb-6 text-pink-600 font-bold text-xl">
        <Box className="w-6 h-6" />
        <h2>큐브 보관소</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">재료 명칭</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="재료 이름 (예: 소고기)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 ring-pink-400 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">제조일</label>
                <input
                  type="date"
                  value={madeDate}
                  onChange={handleMadeDateChange}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block text-pink-500">만료일 (기본 14일)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-3 bg-pink-50 border border-pink-100 rounded-2xl text-sm text-pink-600 focus:ring-2 ring-pink-400 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">보관 수량</label>
                <div className="flex items-center justify-between">
                  <button 
                    type="button" 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-pink-500 hover:bg-white rounded-xl transition-all shadow-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-black text-slate-700">{quantity}개</span>
                  <button 
                    type="button" 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-pink-500 hover:bg-white rounded-xl transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-blue-500 uppercase">개당 무게 (g)</label>
                  <span className="text-xs font-black text-blue-700 bg-white px-2 py-0.5 rounded-full shadow-sm">{weight}g</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-1">
                    <button 
                      type="button" 
                      onClick={() => setWeight(prev => Math.max(5, prev - 10))}
                      className="flex-1 h-9 flex items-center justify-center bg-white text-blue-400 hover:text-blue-600 rounded-lg border border-blue-100 shadow-sm transition-all"
                      title="-10g"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setWeight(prev => Math.max(5, prev - 1))}
                      className="flex-1 h-9 flex items-center justify-center bg-white text-blue-400 hover:text-blue-600 rounded-lg border border-blue-100 shadow-sm transition-all"
                      title="-1g"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex flex-1 items-center gap-1">
                    <button 
                      type="button" 
                      onClick={() => setWeight(prev => Math.min(300, prev + 1))}
                      className="flex-1 h-9 flex items-center justify-center bg-white text-blue-400 hover:text-blue-600 rounded-lg border border-blue-100 shadow-sm transition-all"
                      title="+1g"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setWeight(prev => Math.min(300, prev + 10))}
                      className="flex-1 h-9 flex items-center justify-center bg-white text-blue-400 hover:text-blue-600 rounded-lg border border-blue-100 shadow-sm transition-all"
                      title="+10g"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block">재료 색상</label>
              <div className="flex flex-wrap items-center gap-2 max-w-[300px]">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setSelectedColor(color.hex)}
                    className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === color.hex ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.hex && <Check className="w-4 h-4 text-slate-800" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full py-4 bg-pink-500 text-white font-black rounded-2xl hover:bg-pink-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-100 active:scale-[0.98]"
        >
          <Plus className="w-6 h-6" />
          보관함에 저장하기
        </button>
      </form>

      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1 mt-8 pt-6 border-t border-slate-50">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Box className="w-3 h-3" /> 보관 리스트
          </h3>
          <span className="text-[10px] text-slate-300">수정 아이콘을 눌러 정보를 변경하세요</span>
        </div>
        
        {cubes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <Box className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-sm font-medium">보관 중인 큐브가 없습니다.</p>
          </div>
        ) : (
          cubes.map(cube => {
            const isEditing = editingId === cube.id;
            const diff = differenceInDays(parseISO(cube.expiryDate), today);
            const isExpired = diff < 0;
            const isNearExpiry = diff >= 0 && diff <= 3;

            return (
              <div 
                key={cube.id} 
                className={`group p-4 rounded-3xl border-l-[12px] flex flex-col md:flex-row md:items-center justify-between transition-all bg-white shadow-sm border ${isEditing ? 'border-pink-300 ring-2 ring-pink-50' : 'border-slate-100'} hover:shadow-md ${isExpired ? 'bg-red-50/30' : ''}`}
                style={{ borderLeftColor: cube.color }}
              >
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        placeholder="이름"
                      />
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                           <div className="flex items-center gap-1">
                             <Scale className="w-3 h-3 text-blue-500" />
                             <span className="text-[10px] font-bold text-blue-400 uppercase">무게 설정</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <button onClick={() => setEditWeight(prev => Math.max(5, prev - 1))} className="p-1 bg-white rounded border border-blue-100 text-blue-500"><Minus className="w-3 h-3"/></button>
                             <span className="text-xs font-black text-blue-700 w-8 text-center">{editWeight}g</span>
                             <button onClick={() => setEditWeight(prev => Math.min(300, prev + 1))} className="p-1 bg-white rounded border border-blue-100 text-blue-500"><Plus className="w-3 h-3"/></button>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => saveEditing(cube.id)} className="flex-1 py-2 bg-pink-500 text-white rounded-xl flex items-center justify-center gap-1 text-[10px] font-black"><Save className="w-3 h-3"/>저장</button>
                          <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center gap-1 text-[10px] font-black"><X className="w-3 h-3"/>취소</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8px] font-bold text-slate-400 ml-1">제조일</label>
                          <input 
                            type="date" 
                            value={editMadeDate} 
                            onChange={(e) => handleEditMadeDateChange(e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px]"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-pink-400 ml-1">만료일</label>
                          <input 
                            type="date" 
                            value={editExpiryDate} 
                            onChange={(e) => setEditExpiryDate(e.target.value)}
                            className="w-full px-2 py-1 bg-pink-50 border border-pink-100 rounded-lg text-[10px] text-pink-600"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-base">{cube.name}</h4>
                        <span 
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1
                            ${isExpired ? 'bg-red-100 text-red-600' : 
                              isNearExpiry ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {isExpired ? '만료됨' : isNearExpiry ? <><AlertTriangle className="w-3 h-3"/> D-{diff}</> : `D-${diff}`}
                        </span>
                        <span className="text-[10px] font-black bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Scale className="w-3 h-3" /> {cube.weight}g
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{format(parseISO(cube.madeDate), 'M/d')} 제조</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-pink-400 font-bold">
                          <Check className="w-3 h-3" />
                          <span>{format(parseISO(cube.expiryDate), 'M/d')} 만료</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-2 mt-4 md:mt-0 md:ml-4">
                    <div className="flex items-center bg-slate-50 rounded-2xl px-2 py-1.5 border border-slate-100">
                      <button 
                        onClick={() => onUpdateQuantity(cube.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-pink-500 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-black text-slate-800">{cube.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(cube.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-pink-500 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => startEditing(cube)} 
                        className="p-2.5 text-slate-200 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all"
                        title="정보 수정"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onDeleteCube(cube.id)} 
                        className="p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        title="삭제"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CubeManager;
