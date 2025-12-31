
import React from 'react';
import { DayPlan, CubeRecord, Ingredient } from '../types';
import { 
  BarChart3, 
  Utensils, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  Box, 
  Trophy,
  History,
  Info,
  ShieldCheck,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import parseISO from 'date-fns/parseISO';

interface StatsDashboardProps {
  plans: DayPlan[];
  cubes: CubeRecord[];
  weightPerCube: number;
  ingredientStatuses: Record<string, Ingredient['status']>;
  onUpdateIngredientStatus: (name: string, status: Ingredient['status']) => void;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ 
  plans, 
  cubes, 
  weightPerCube, 
  ingredientStatuses,
  onUpdateIngredientStatus 
}) => {
  // 1. 기본 통계 계산
  const totalMeals = plans.reduce((acc, p) => acc + p.meals.length, 0);
  const totalWeight = plans.reduce((acc, p) => {
    return acc + p.meals.reduce((mAcc, m) => {
      const weightMatch = m.amount.match(/\d+/);
      return mAcc + (weightMatch ? parseInt(weightMatch[0]) : weightPerCube);
    }, 0);
  }, 0);

  // 2. 재료별 통계 및 상태 분석
  const ingredientStats: Record<string, { count: number }> = {};
  
  // 모든 식사 기록에서 재료 추출
  plans.forEach(plan => {
    plan.meals.forEach(meal => {
      meal.ingredients.forEach(ing => {
        if (!ingredientStats[ing.name]) {
          ingredientStats[ing.name] = { count: 0 };
        }
        ingredientStats[ing.name].count += 1;
      });
    });
  });

  // 큐브 보관소에서도 재료 추출 (아직 안먹었을 수도 있으니)
  cubes.forEach(cube => {
    if (!ingredientStats[cube.name]) {
      ingredientStats[cube.name] = { count: 0 };
    }
  });

  const sortedIngredients = Object.entries(ingredientStats)
    .sort(([, a], [, b]) => b.count - a.count);

  // 분류 로직: 명시적 상태가 없으면 'success'가 기본값
  const successIngredients = sortedIngredients.filter(([name]) => (ingredientStatuses[name] || 'success') === 'success');
  const allergicIngredients = sortedIngredients.filter(([name]) => ingredientStatuses[name] === 'allergic');
  const watchingIngredients = sortedIngredients.filter(([name]) => ingredientStatuses[name] === 'watching');

  // 3. 큐브 현황 분석
  const totalCubesInStock = cubes.reduce((acc, c) => acc + c.quantity, 0);
  const expiredCubes = cubes.filter(c => differenceInDays(parseISO(c.expiryDate), new Date()) < 0);
  const expiringSoonCubes = cubes.filter(c => {
    const diff = differenceInDays(parseISO(c.expiryDate), new Date());
    return diff >= 0 && diff <= 3;
  });

  const StatusButtonSet = ({ name, current }: { name: string; current: Ingredient['status'] }) => (
    <div className="flex items-center gap-1 ml-auto">
      <button 
        onClick={() => onUpdateIngredientStatus(name, 'success')}
        title="통과"
        className={`p-1 rounded-md transition-all ${current === 'success' || !current ? 'bg-green-500 text-white' : 'text-slate-300 hover:text-green-400 border border-slate-100'}`}
      >
        <ShieldCheck className="w-3 h-3" />
      </button>
      <button 
        onClick={() => onUpdateIngredientStatus(name, 'watching')}
        title="관찰"
        className={`p-1 rounded-md transition-all ${current === 'watching' ? 'bg-orange-400 text-white' : 'text-slate-300 hover:text-orange-400 border border-slate-100'}`}
      >
        <Eye className="w-3 h-3" />
      </button>
      <button 
        onClick={() => onUpdateIngredientStatus(name, 'allergic')}
        title="주의"
        className={`p-1 rounded-md transition-all ${current === 'allergic' ? 'bg-red-500 text-white' : 'text-slate-300 hover:text-red-400 border border-slate-100'}`}
      >
        <AlertTriangle className="w-3 h-3" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-slate-800 font-black text-2xl mb-2">
        <BarChart3 className="w-7 h-7 text-blue-500" />
        <h2>이진이의 식사 통계</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">누적 섭취량</p>
            <p className="text-xl font-black text-slate-800">{totalWeight.toLocaleString()}g</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">총 급여 횟수</p>
            <p className="text-xl font-black text-slate-800">{totalMeals}회</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">통과 재료</p>
            <p className="text-xl font-black text-slate-800">{successIngredients.length}종</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2 mb-6">
            <History className="w-4 h-4 text-purple-500" />
            자주 먹는 재료 TOP 5
          </h3>
          <div className="space-y-4">
            {sortedIngredients.slice(0, 5).map(([name, data]) => (
              <div key={name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-700">{name}</span>
                  <span className="text-[10px] font-black text-slate-400">{data.count}회</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-400 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, totalMeals > 0 ? (data.count / totalMeals) * 100 : 0)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {sortedIngredients.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-10">데이터가 부족합니다.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2 mb-6">
            <Box className="w-4 h-4 text-pink-500" />
            큐브 인벤토리 요약
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-slate-400 mb-1">현재 보관 중</p>
              <p className="text-2xl font-black text-slate-800">{totalCubesInStock}<span className="text-xs font-normal">개</span></p>
            </div>
            <div className="p-4 bg-red-50 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-red-400 mb-1">유통기한 만료</p>
              <p className="text-2xl font-black text-red-600">{expiredCubes.length}<span className="text-xs font-normal">종</span></p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-orange-50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-orange-700">3일 내 만료 예정</span>
            </div>
            <span className="text-sm font-black text-orange-700">{expiringSoonCubes.length}종</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-black text-slate-700 flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          재료별 테스트 결과 (클릭하여 상태 변경)
        </h3>
        
        <div className="space-y-8">
          <div>
            <p className="text-[10px] font-bold text-green-500 uppercase mb-3 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 통과 (Success)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {successIngredients.map(([name]) => (
                <div key={name} className="px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100 flex items-center">
                  {name}
                  <StatusButtonSet name={name} current={ingredientStatuses[name] || 'success'} />
                </div>
              ))}
              {successIngredients.length === 0 && <span className="text-xs text-slate-300">데이터가 없습니다.</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-bold text-red-500 uppercase mb-3 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> 알레르기 (Allergic)
              </p>
              <div className="space-y-2">
                {allergicIngredients.map(([name]) => (
                  <div key={name} className="px-3 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100 flex items-center">
                    {name}
                    <StatusButtonSet name={name} current={ingredientStatuses[name]} />
                  </div>
                ))}
                {allergicIngredients.length === 0 && <span className="text-xs text-slate-300">발견된 알레르기가 없어요.</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-orange-500 uppercase mb-3 flex items-center gap-1">
                <Eye className="w-3 h-3" /> 관찰 중 (Watching)
              </p>
              <div className="space-y-2">
                {watchingIngredients.map(([name]) => (
                  <div key={name} className="px-3 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-bold border border-orange-100 flex items-center">
                    {name}
                    <StatusButtonSet name={name} current={ingredientStatuses[name]} />
                  </div>
                ))}
                {watchingIngredients.length === 0 && <span className="text-xs text-slate-300">관찰 중인 재료가 없습니다.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
