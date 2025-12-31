
import React, { useState } from 'react';
import { ShoppingCart, Plus, CheckCircle2, Circle, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { OrderRecord } from '../types';

interface OrderLogProps {
  orders: OrderRecord[];
  onAddOrder: (order: Omit<OrderRecord, 'id'>) => void;
  onToggleOrder: (id: string) => void;
  onUpdateOrder: (id: string, updates: Partial<OrderRecord>) => void;
  onDeleteOrder: (id: string) => void;
}

const OrderLog: React.FC<OrderLogProps> = ({ orders, onAddOrder, onToggleOrder, onUpdateOrder, onDeleteOrder }) => {
  const [itemName, setItemName] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;
    onAddOrder({
      itemName,
      orderDate,
      isReceived: false
    });
    setItemName('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 h-full">
      <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold text-xl">
        <ShoppingCart className="w-6 h-6" />
        <h2>재료 주문</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="주문할 재료 (예: 유기농 브로콜리)"
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 ring-indigo-400 outline-none transition-all"
          />
          <button type="submit" className="px-4 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-100 active:scale-95">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-1">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" /> 주문 날짜:
          </label>
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className="text-xs bg-transparent border-none focus:ring-0 text-slate-600 font-medium cursor-pointer"
          />
        </div>
      </form>

      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <ShoppingCart className="w-12 h-12 mb-2 opacity-10" />
            <p className="text-sm">주문 기록이 없어요.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className={`flex items-center justify-between p-4 bg-white rounded-2xl border transition-all group ${order.isReceived ? 'border-slate-100 opacity-70 bg-slate-50' : 'border-slate-100 shadow-sm'}`}>
              <div className="flex items-center gap-3 flex-1">
                <button 
                  onClick={() => onToggleOrder(order.id)}
                  className="flex-shrink-0"
                >
                  {order.isReceived ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300" />
                  )}
                </button>
                <div className="flex-1">
                  <span className={`text-sm font-bold block ${order.isReceived ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {order.itemName}
                  </span>
                  <div className="mt-1 flex items-center gap-1 group/date">
                    <CalendarIcon className="w-3 h-3 text-slate-300" />
                    <input 
                      type="date" 
                      value={order.orderDate}
                      onChange={(e) => onUpdateOrder(order.id, { orderDate: e.target.value })}
                      className="text-[10px] text-slate-400 bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onDeleteOrder(order.id)} 
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
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

export default OrderLog;
