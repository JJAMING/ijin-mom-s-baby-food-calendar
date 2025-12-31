
import React from 'react';
import { format } from 'date-fns';
import { History, Trash2, Calendar, Scale, Box, Edit3, Save, X, Clock } from 'lucide-react';
import { ManufacturingRecord } from '../types';

interface ManufacturingLogProps {
  records: ManufacturingRecord[];
  onUpdateRecord: (id: string, updates: Partial<ManufacturingRecord>) => void;
  onDeleteRecord: (id: string) => void;
}

const ManufacturingLog: React.FC<ManufacturingLogProps> = ({ records, onUpdateRecord, onDeleteRecord }) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editNote, setEditNote] = React.useState('');

  const startEdit = (record: ManufacturingRecord) => {
    setEditingId(record.id);
    setEditNote(record.note || '');
  };

  const saveEdit = (id: string) => {
    onUpdateRecord(id, { note: editNote });
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
          <History className="w-6 h-6" />
          <h2>이유식 제조 아카이브</h2>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Safe Storage On
          </span>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-300">
            <History className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-sm font-bold">아직 영구 저장된 기록이 없습니다.</p>
            <p className="text-[10px] mt-2 text-slate-400">레시피 도우미에서 "기록으로 저장"을 클릭하세요.</p>
          </div>
        ) : (
          records.map(record => (
            <div key={record.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-800 mb-1">{record.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm')} 생성</span>
                    {record.updatedAt !== record.createdAt && (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <Clock className="w-3 h-3" /> {format(new Date(record.updatedAt), 'HH:mm')} 수정됨
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteRecord(record.id)}
                  className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Scale className="w-3 h-3" /> 개당
                  </p>
                  <p className="text-sm font-black text-slate-700">{record.cubeWeight}g</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Box className="w-3 h-3" /> 수량
                  </p>
                  <p className="text-sm font-black text-slate-700">{record.cubeCount}개</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100/50">
                  <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">총 중량</p>
                  <p className="text-sm font-black text-emerald-700">{record.totalWeight}g</p>
                </div>
              </div>

              <div className="relative">
                {editingId === record.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-emerald-200 rounded-2xl text-xs outline-none focus:ring-2 ring-emerald-400 min-h-[80px]"
                      placeholder="기록에 대한 메모를 남겨주세요..."
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                      <button onClick={() => saveEdit(record.id)} className="flex items-center gap-1 px-4 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"><Save className="w-3 h-3" /> 기록 수정</button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => startEdit(record)}
                    className="cursor-pointer p-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group/note"
                  >
                    <p className={`text-xs ${record.note ? 'text-slate-600' : 'text-slate-300 italic'}`}>
                      {record.note || '메모를 추가하려면 여기를 탭하세요...'}
                    </p>
                    <Edit3 className="absolute bottom-2 right-2 w-3 h-3 text-slate-300 opacity-0 group-hover/note:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManufacturingLog;
