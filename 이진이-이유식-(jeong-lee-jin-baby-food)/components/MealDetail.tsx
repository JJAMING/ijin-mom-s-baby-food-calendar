
import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import startOfDay from 'date-fns/startOfDay';
import { Trash2, Sparkles, Box, Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { DayPlan, MealType, CubeRecord } from '../types';

interface MealDetailProps {
  date: Date;
  plan: DayPlan | undefined;
  availableCubes: CubeRecord[];
  onAddMeal: (type: MealType) => void;
  onDeleteMeal: (id: string) => void;
  onFeedCube: (cubeId: string, time: string) => void;
  onAIRecommend: () => void;
}

const MealDetail: React.FC<MealDetailProps> = ({ date, plan, availableCubes, onDeleteMeal, onFeedCube, onAIRecommend }) => {
  const [hour, setHour] = useState<string>('09');
  const [minute, setMinute] = useState<string>('00');
  const [isPM, setIsPM] = useState<boolean>(false);

  const today = startOfDay(new Date());

  // 초기 시간 설정 (현재 시간 기준)
  useEffect(() => {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    
    setIsPM(h >= 12);
    
    const displayHour = h % 12 || 12;
    setHour(displayHour.toString().padStart(2, '0'));
    setMinute(m.toString().padStart(2, '0'));
  }, [date]);

  // UI 상태로부터 HH:mm 24시간 형식 문자열 생성
  const getFormattedTime = () => {
    let h = parseInt(hour);
    if (isNaN(h)) h = 12;
    if (h > 12) h = 12;
    if (h < 1) h = 1;

    let finalHour = h;
    if (isPM && h < 12) finalHour += 12;
    if (!isPM && h === 12) finalHour = 0;

    const m = parseInt(minute);
    const finalMinute = isNaN(m) ? 0 : Math.min(59, Math.max(0, m));

    return `${finalHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`;
  };

  const handleHourChange = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 12)) {
      setHour(num);
    }
  };

  const handleMinuteChange = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 59)) {
      setMinute(num);
    }
  };

  const formattedTimeStr = getFormattedTime();

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 h-full flex flex-col overflow-hidden">
      <div className="p-4 lg:p-6 bg-white border-b border-slate-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-black text-slate-400">
            {format(date, 'M/d')} 급여 설정
          </h3>
        </div>
        
        <div className="flex flex-col items-center justify-center py-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1 shadow-sm">
              <input
                type="text"
                value={hour}
                onChange={(e) => handleHourChange(e.target.value)}
                onBlur={() => setHour(prev => (prev === '' ? '12' : prev.padStart(2, '0')))}
                className="w-10 text-2xl lg:text-3xl font-black text-slate-700 text-center bg-transparent outline-none"
                placeholder="12"
              />
              <span className="text-xl font-black text-slate-300 mx-1">:</span>
              <input
                type="text"
                value={minute}
                onChange={(e) => handleMinuteChange(e.target.value)}
                onBlur={() => setMinute(prev => (prev === '' ? '00' : prev.padStart(2, '0')))}
                className="w-10 text-2xl lg:text-3xl font-black text-slate-700 text-center bg-transparent outline-none"
                placeholder="00"
              />
            </div>
            
            <button
              onClick={() => setIsPM(!isPM)}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all shadow-sm border ${
                isPM 
                  ? 'bg-orange-500 text-white border-orange-400' 
                  : 'bg-blue-500 text-white border-blue-400'
              }`}
            >
              {isPM ? 'PM' : 'AM'}
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-slate-400">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-bold">시간과 분을 직접 입력하세요</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              급여 기록
            </h3>
            <button 
              onClick={onAIRecommend}
              className="p-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          {(!plan || plan.meals.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-300 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
              <p className="text-[10px] font-bold">기록 없음</p>
            </div>
          ) : (
            <div className="space-y-2">
              {plan.meals.map(meal => (
                <div key={meal.id} className="group p-2.5 rounded-xl border bg-white border-slate-100 flex items-center justify-between hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-[9px] font-black flex-shrink-0">
                      {meal.fedTime}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-slate-800 text-xs truncate">{meal.title}</h4>
                      <p className="text-[8px] text-slate-400 truncate">{meal.amount}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDeleteMeal(meal.id)}
                    className="p-1 text-slate-200 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-50">
          <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-3">
            <Box className="w-3.5 h-3.5 text-pink-500" />
            큐브 선택
          </h3>

          {availableCubes.length === 0 ? (
            <p className="text-[10px] text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-100">
              보관 큐브 없음
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {availableCubes.map(cube => {
                const diff = differenceInDays(parseISO(cube.expiryDate), today);
                const dDayText = diff < 0 ? '만료됨' : `D-${diff}`;
                const isNearExpiry = diff >= 0 && diff <= 3;

                return (
                  <button
                    key={cube.id}
                    onClick={() => onFeedCube(cube.id, formattedTimeStr)}
                    className="flex flex-col p-3 bg-white border border-slate-100 rounded-2xl hover:border-pink-300 hover:bg-pink-50 transition-all group text-left shadow-sm"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cube.color }}></div>
                        <span className="text-[11px] font-black text-slate-700 truncate">
                          {cube.name} <span className="text-blue-500">({cube.weight}g)</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">
                        {cube.quantity}개 남음
                      </span>
                    </div>

                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold">
                          <CalendarIcon className="w-2.5 h-2.5" />
                          제조: {format(parseISO(cube.madeDate), 'MM/dd')}
                        </div>
                        <div className={`flex items-center gap-1 text-[8px] font-black ${isNearExpiry ? 'text-red-500' : 'text-slate-500'}`}>
                          <AlertCircle className="w-2.5 h-2.5" />
                          만료: {format(parseISO(cube.expiryDate), 'MM/dd')} ({dDayText})
                        </div>
                      </div>
                      <div className="text-[9px] text-pink-500 font-black opacity-0 group-hover:opacity-100 transition-opacity">
                        {formattedTimeStr} 급여하기
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealDetail;
