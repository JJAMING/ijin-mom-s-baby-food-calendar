
import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import startOfDay from 'date-fns/startOfDay';
import { ko } from 'date-fns/locale/ko';
import { 
  X, Utensils, Box, ClipboardList, ShoppingCart, 
  Trash2, CheckCircle2, Circle, Clock, Edit3, Check, Plus, Minus, AlertCircle 
} from 'lucide-react';
import { DayPlan, CubeRecord, OrderRecord, PreparationRecord, MealRecord } from '../types';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  plan: DayPlan | undefined;
  cubesMade: CubeRecord[];
  preps: PreparationRecord[];
  orders: OrderRecord[];
  onDeleteMeal: (id: string) => void;
  onUpdateMeal: (id: string, updates: Partial<MealRecord>) => void;
  onTogglePrep: (id: string) => void;
  onUpdatePrep: (id: string, updates: Partial<PreparationRecord>) => void;
  onDeletePrep: (id: string) => void;
  onToggleOrder: (id: string) => void;
  onUpdateOrder: (id: string, updates: Partial<OrderRecord>) => void;
  onDeleteOrder: (id: string) => void;
  onUpdateCube: (id: string, updates: Partial<CubeRecord>) => void;
  onUpdateCubeQuantity: (id: string, delta: number) => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen, onClose, date, plan, cubesMade, preps, orders,
  onDeleteMeal, onUpdateMeal, onTogglePrep, onUpdatePrep, onDeletePrep,
  onToggleOrder, onUpdateOrder, onDeleteOrder, onUpdateCube, onUpdateCubeQuantity
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');

  if (!isOpen) return null;

  const dateStr = format(date, 'yyyy년 M월 d일 (EEEE)', { locale: ko });
  const today = startOfDay(new Date());

  const startEditing = (id: string, initialValue: string, initialDate?: string) => {
    setEditingId(id);
    setEditValue(initialValue);
    if (initialDate) setEditDate(initialDate);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
    setEditDate('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">{dateStr}</h2>
            <p className="text-xs font-bold text-slate-400 mt-0.5">항목을 탭하여 수정하세요</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section: Meals */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-orange-500 font-black text-sm">
              <Utensils className="w-4 h-4" />
              <h3>급여 기록 (시간 수정 가능)</h3>
            </div>
            <div className="space-y-2">
              {(!plan || plan.meals.length === 0) ? (
                <p className="text-xs text-slate-300 italic py-2">등록된 급여 기록이 없습니다.</p>
              ) : (
                plan.meals.map(meal => (
                  <div key={meal.id} className="flex items-center justify-between p-3 bg-orange-50/50 border border-orange-100 rounded-2xl group">
                    <div className="flex items-center gap-3 flex-1">
                      {editingId === meal.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="time" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            className="text-xs font-bold p-1 border rounded-lg outline-none focus:ring-2 ring-orange-400"
                          />
                          <button 
                            onClick={() => { onUpdateMeal(meal.id, { fedTime: editValue }); cancelEditing(); }}
                            className="p-1 bg-orange-500 text-white rounded-lg"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={cancelEditing} className="p-1 bg-slate-200 text-slate-500 rounded-lg">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => startEditing(meal.id, meal.fedTime || '09:00')}
                          className="flex items-center gap-3 hover:opacity-70 transition-opacity"
                        >
                          <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-lg text-orange-500 border border-orange-100 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {meal.fedTime}
                          </span>
                          <span className="text-sm font-bold text-slate-700">{meal.title}</span>
                          <Edit3 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />
                        </button>
                      )}
                    </div>
                    <button onClick={() => onDeleteMeal(meal.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Section: Cubes Made */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-pink-500 font-black text-sm">
              <Box className="w-4 h-4" />
              <h3>제조한 큐브 (이름/날짜/수량 수정 가능)</h3>
            </div>
            <div className="space-y-2">
              {cubesMade.length === 0 ? (
                <p className="text-xs text-slate-300 italic py-2">오늘 조리한 큐브가 없습니다.</p>
              ) : (
                cubesMade.map(cube => {
                  const diff = differenceInDays(parseISO(cube.expiryDate), today);
                  const dDayText = diff < 0 ? '만료됨' : `D-${diff}`;

                  return (
                    <div key={cube.id} className="flex items-center justify-between p-3 bg-pink-50/50 border border-pink-100 rounded-2xl group">
                      <div className="flex-1">
                        {editingId === cube.id ? (
                          <div className="space-y-2">
                            <input 
                              type="text" 
                              value={editValue} 
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full text-xs font-bold p-2 border rounded-xl outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <input 
                                type="date" 
                                value={editDate} 
                                onChange={(e) => setEditDate(e.target.value)}
                                className="text-xs font-bold p-1 border rounded-lg"
                              />
                              <button 
                                onClick={() => { onUpdateCube(cube.id, { name: editValue, madeDate: editDate }); cancelEditing(); }}
                                className="p-1.5 bg-pink-500 text-white rounded-lg"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button onClick={cancelEditing} className="p-1.5 bg-slate-200 text-slate-500 rounded-lg">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => startEditing(cube.id, cube.name, cube.madeDate)}
                            className="flex items-center gap-3 hover:opacity-70 transition-opacity flex-1 text-left"
                          >
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cube.color }} />
                            <div className="overflow-hidden">
                              <span className="text-sm font-bold text-slate-700 block truncate">
                                {cube.name} <span className="text-blue-500 font-black">({cube.weight}g)</span>
                              </span>
                              <div className="flex flex-col gap-0.5 mt-0.5">
                                <span className="text-[9px] text-pink-500 flex items-center gap-1 font-bold">
                                  <Edit3 className="w-2.5 h-2.5" /> 제조일: {cube.madeDate}
                                </span>
                                <span className={`text-[9px] flex items-center gap-1 font-black ${diff <= 3 ? 'text-red-500' : 'text-slate-400'}`}>
                                  <AlertCircle className="w-2.5 h-2.5" /> 만료일: {cube.expiryDate} ({dDayText})
                                </span>
                              </div>
                            </div>
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-pink-100 ml-2">
                        <button 
                          onClick={() => onUpdateCubeQuantity(cube.id, -1)}
                          className="p-1 text-slate-400 hover:text-pink-500"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] font-black text-slate-700 w-6 text-center">{cube.quantity}개</span>
                        <button 
                          onClick={() => onUpdateCubeQuantity(cube.id, 1)}
                          className="p-1 text-slate-400 hover:text-pink-500"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Section: Preps */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-amber-500 font-black text-sm">
              <ClipboardList className="w-4 h-4" />
              <h3>제조 예정 (날짜/이름 수정 가능)</h3>
            </div>
            <div className="space-y-2">
              {preps.length === 0 ? (
                <p className="text-xs text-slate-300 italic py-2">예정된 일정이 없습니다.</p>
              ) : (
                preps.map(prep => (
                  <div key={prep.id} className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-2xl group">
                    <div className="flex-1">
                      {editingId === prep.id ? (
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full text-xs font-bold p-2 border rounded-xl outline-none"
                          />
                          <div className="flex items-center gap-2">
                            <input 
                              type="date" 
                              value={editDate} 
                              onChange={(e) => setEditDate(e.target.value)}
                              className="text-xs font-bold p-1 border rounded-lg"
                            />
                            <button 
                              onClick={() => { onUpdatePrep(prep.id, { itemName: editValue, prepDate: editDate }); cancelEditing(); }}
                              className="p-1.5 bg-amber-500 text-white rounded-lg"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button onClick={cancelEditing} className="p-1.5 bg-slate-200 text-slate-500 rounded-lg">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button onClick={() => onTogglePrep(prep.id)}>
                            {prep.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-amber-300" />
                            )}
                          </button>
                          <button 
                            onClick={() => startEditing(prep.id, prep.itemName, prep.prepDate)}
                            className="flex-1 text-left hover:opacity-70 transition-opacity"
                          >
                            <span className={`text-sm font-bold block ${prep.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {prep.itemName}
                            </span>
                            <span className="text-[9px] text-amber-500 flex items-center gap-1 font-bold">
                              <Edit3 className="w-2.5 h-2.5" /> 예정일: {prep.prepDate}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                    <button onClick={() => onDeletePrep(prep.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Section: Orders */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-indigo-500 font-black text-sm">
              <ShoppingCart className="w-4 h-4" />
              <h3>재료 주문 (날짜/이름 수정 가능)</h3>
            </div>
            <div className="space-y-2">
              {orders.length === 0 ? (
                <p className="text-xs text-slate-300 italic py-2">주문 내역이 없습니다.</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl group">
                    <div className="flex-1">
                      {editingId === order.id ? (
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full text-xs font-bold p-2 border rounded-xl outline-none"
                          />
                          <div className="flex items-center gap-2">
                            <input 
                              type="date" 
                              value={editDate} 
                              onChange={(e) => setEditDate(e.target.value)}
                              className="text-xs font-bold p-1 border rounded-lg"
                            />
                            <button 
                              onClick={() => { onUpdateOrder(order.id, { itemName: editValue, orderDate: editDate }); cancelEditing(); }}
                              className="p-1.5 bg-indigo-500 text-white rounded-lg"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button onClick={cancelEditing} className="p-1.5 bg-slate-200 text-slate-500 rounded-lg">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button onClick={() => onToggleOrder(order.id)}>
                            {order.isReceived ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-indigo-300" />
                            )}
                          </button>
                          <button 
                            onClick={() => startEditing(order.id, order.itemName, order.orderDate)}
                            className="flex-1 text-left hover:opacity-70 transition-opacity"
                          >
                            <span className={`text-sm font-bold block ${order.isReceived ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {order.itemName}
                            </span>
                            <span className="text-[9px] text-indigo-500 flex items-center gap-1 font-bold">
                              <Edit3 className="w-2.5 h-2.5" /> 주문일: {order.orderDate}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                    <button onClick={() => onDeleteOrder(order.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-800 text-white rounded-2xl font-black text-sm shadow-lg shadow-slate-200 active:scale-95 transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayDetailModal;
