
import React from 'react';
import { 
  format, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  endOfWeek,
  differenceInDays
} from 'date-fns';
// Fix: Use individual imports for parseISO and startOfDay to resolve module export errors
import parseISO from 'date-fns/parseISO';
import startOfDay from 'date-fns/startOfDay';
import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import startOfWeek from 'date-fns/startOfWeek';
import { ko } from 'date-fns/locale/ko';
import { ChevronLeft, ChevronRight, Baby, Box, AlertCircle, ShoppingCart, Utensils, ClipboardList } from 'lucide-react';
import { DayPlan, CubeRecord, OrderRecord, PreparationRecord } from '../types';

interface CalendarProps {
  plans: DayPlan[];
  cubes: CubeRecord[];
  orders: OrderRecord[];
  preps?: PreparationRecord[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ plans, cubes, orders, preps = [], selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayEvents = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const madeCubes = cubes.filter(c => c.madeDate === dateStr);
    const expiringCubes = cubes.filter(c => c.expiryDate === dateStr);
    const dayOrders = orders.filter(o => o.orderDate === dateStr);
    const dayPreps = preps.filter(p => p.prepDate === dateStr);
    const dayPlan = plans.find(p => p.date === dateStr);
    const fedCubes = dayPlan ? dayPlan.meals : [];
    
    return { madeCubes, expiringCubes, dayOrders, dayPreps, fedCubes };
  };

  const today = startOfDay(new Date());

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="flex items-center justify-between px-6 py-4 bg-orange-50 border-b border-orange-100">
        <h2 className="text-xl font-bold text-orange-600 flex items-center gap-2">
          <Baby className="w-6 h-6" />
          {format(currentMonth, 'yyyy년 MMMM', { locale: ko })}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-white rounded-full transition-colors text-orange-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-white rounded-full transition-colors text-orange-400"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-50">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const { madeCubes, expiringCubes, dayOrders, dayPreps, fedCubes } = getDayEvents(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);

          return (
            <div
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`min-h-[110px] p-1 md:p-2 border-r border-b border-slate-50 cursor-pointer transition-all hover:bg-orange-50/30
                ${isSelected ? 'bg-orange-50 ring-2 ring-orange-400 ring-inset z-10' : ''}
                ${!isCurrentMonth ? 'text-slate-300 bg-slate-50/50' : 'text-slate-700'}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs md:text-sm font-black ${isSelected ? 'text-orange-600' : 'text-slate-400'}`}>
                  {format(day, 'd')}
                </span>
                <div className="flex gap-0.5">
                   {madeCubes.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-pink-400" title="큐브 제조됨"></span>}
                   {fedCubes.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="급여 완료"></span>}
                   {dayPreps.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="제조 예정"></span>}
                   {dayOrders.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="주문 예정"></span>}
                   {expiringCubes.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="만료 예정"></span>}
                </div>
              </div>
              
              <div className="space-y-1">
                {fedCubes.map(meal => {
                  const matchingCube = meal.isFromCube ? cubes.find(c => c.id === meal.cubeId) : null;
                  const itemColor = matchingCube ? matchingCube.color : '#22c55e';
                  const ingredientName = meal.ingredients[0]?.name || '정보없음';
                  
                  return (
                    <div 
                      key={meal.id} 
                      className="text-[8px] md:text-[9px] leading-[1.1] px-1 py-0.5 rounded whitespace-normal break-all flex items-start gap-0.5 border font-bold text-slate-800"
                      style={{ 
                        backgroundColor: itemColor + '26', 
                        borderColor: itemColor + '66' 
                      }}
                    >
                      <Utensils className="w-2 h-2 mt-0.5 flex-shrink-0" style={{ color: itemColor }} />
                      <div className="truncate">
                        <span className="opacity-70">{meal.fedTime}</span> {ingredientName}({meal.amount})
                      </div>
                    </div>
                  );
                })}
                {dayPreps.map(prep => (
                  <div 
                    key={prep.id} 
                    className={`text-[8px] md:text-[9px] leading-[1.1] px-1 py-0.5 rounded whitespace-normal break-all border flex items-start gap-0.5 font-bold
                      ${prep.isCompleted 
                        ? 'bg-slate-50 text-slate-400 border-slate-100 line-through' 
                        : 'bg-amber-50 text-amber-900 border-amber-200 shadow-sm'}`}
                  >
                    <ClipboardList className={`w-2 h-2 mt-0.5 flex-shrink-0 ${prep.isCompleted ? 'text-slate-300' : 'text-amber-500'}`} />
                    <span className="truncate">제조예정: {prep.itemName}</span>
                  </div>
                ))}
                {dayOrders.map(order => (
                  <div 
                    key={order.id} 
                    className={`text-[8px] md:text-[9px] leading-[1.1] px-1 py-0.5 rounded whitespace-normal break-all border flex items-start gap-0.5 font-bold
                      ${order.isReceived 
                        ? 'bg-slate-50 text-slate-400 border-slate-100 line-through' 
                        : 'bg-indigo-50 text-indigo-900 border-indigo-200'}`}
                  >
                    <ShoppingCart className={`w-2 h-2 mt-0.5 flex-shrink-0 ${order.isReceived ? 'text-slate-300' : 'text-indigo-500'}`} />
                    <span className="truncate">주문: {order.itemName}</span>
                  </div>
                ))}
                {madeCubes.map(cube => {
                  const diff = differenceInDays(parseISO(cube.expiryDate), today);
                  const dDayText = diff < 0 ? '만료' : `D-${diff}`;
                  
                  return (
                    <div 
                      key={cube.id} 
                      className="text-[8px] md:text-[9px] leading-[1.1] px-1 py-0.5 rounded whitespace-normal break-all border flex items-start gap-0.5 font-bold text-slate-800"
                      style={{ 
                        backgroundColor: cube.color + '26', 
                        borderColor: cube.color + '66' 
                      }}
                    >
                      <Box className="w-2 h-2 mt-0.5 flex-shrink-0" style={{ color: cube.color }} />
                      <span className="truncate">제조: {cube.name}({cube.weight}g) <span className={diff <= 3 ? "text-red-500" : "text-blue-500"}>{dDayText}</span></span>
                    </div>
                  );
                })}
                {expiringCubes.map(cube => (
                  <div 
                    key={cube.id} 
                    className="text-[8px] md:text-[9px] leading-[1.1] px-1 py-0.5 rounded whitespace-normal break-all border border-red-200 bg-red-50 text-red-900 flex items-start gap-0.5 font-bold"
                  >
                    <AlertCircle className="w-2 h-2 mt-0.5 flex-shrink-0 text-red-500" />
                    <span className="truncate">만료: {cube.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
