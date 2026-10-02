import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Order } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  X, 
  Calendar, 
  Clock, 
  Truck, 
  User, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Phone
} from 'lucide-react';

interface ScheduleDeliveryModalProps {
  order: Order;
  onClose: () => void;
  onScheduled?: (date: string, time: string) => void;
}

export const ScheduleDeliveryModal: React.FC<ScheduleDeliveryModalProps> = ({ 
  order, 
  onClose,
  onScheduled 
}) => {
  const { 
    scheduleOrderDelivery, 
    agents, 
    currency, 
    themeMode,
    addNotification 
  } = useCrm();

  const isLight = themeMode === 'light';

  // Dates computation based on app current anchor (2026-10-01)
  const defaultDate = order.scheduledDate || '2026-10-02';
  const [scheduledDate, setScheduledDate] = useState<string>(defaultDate);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>(
    order.preferredDeliveryTime || 'Morning (8:00 AM - 12:00 PM)'
  );
  const [selectedAgentId, setSelectedAgentId] = useState<string>(order.agentId || '');
  const [scheduleNotes, setScheduleNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick preset dates
  const presets = [
    { label: 'Today', date: '2026-10-01', day: 'Thu, Oct 01' },
    { label: 'Tomorrow', date: '2026-10-02', day: 'Fri, Oct 02' },
    { label: 'Saturday', date: '2026-10-03', day: 'Sat, Oct 03' },
    { label: 'Next Monday', date: '2026-10-05', day: 'Mon, Oct 05' },
  ];

  const timeSlots = [
    { id: 'Morning (8:00 AM - 12:00 PM)', label: 'Morning', desc: '8:00 AM – 12:00 PM' },
    { id: 'Afternoon (12:00 PM - 4:00 PM)', label: 'Afternoon', desc: '12:00 PM – 4:00 PM' },
    { id: 'Evening (4:00 PM - 7:30 PM)', label: 'Evening', desc: '4:00 PM – 7:30 PM' },
    { id: 'Anytime / Flexible', label: 'Flexible', desc: 'All Day Doorstep' }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate) return;

    setIsSubmitting(true);
    scheduleOrderDelivery(
      order.id, 
      scheduledDate, 
      deliveryTimeSlot, 
      selectedAgentId || undefined, 
      scheduleNotes
    );

    if (addNotification) {
      addNotification({
        title: 'Delivery Scheduled',
        message: `Order #${order.orderNumber} successfully scheduled for ${scheduledDate} (${deliveryTimeSlot})`,
        type: 'info'
      });
    }

    if (onScheduled) {
      onScheduled(scheduledDate, deliveryTimeSlot);
    }

    setIsSubmitting(false);
    onClose();
  };

  const formattedDisplayDate = () => {
    try {
      const parts = scheduledDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {
      // fallback
    }
    return scheduledDate;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">Schedule Delivery Date</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  {order.orderNumber}
                </span>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Set committed doorstep delivery date, time window, and dispatch agent.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Quick Context */}
        <div className={`px-6 py-3 border-b text-xs flex flex-wrap items-center justify-between gap-2 ${
          isLight ? 'bg-emerald-50/50 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">{order.customerName}</span>
            <span className="font-mono text-slate-400 text-[11px] flex items-center gap-1">
              <Phone className="w-3 h-3" /> {order.customerPhone}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              <MapPin className="w-3 h-3 text-emerald-400" /> {order.deliveryCity}, {order.deliveryState}
            </span>
            <span className="font-mono font-bold text-emerald-500">
              {formatCurrency(convertAmount(order.totalAmount, currency), currency)}
            </span>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* 1. Date Selection Section */}
          <div className="space-y-2.5">
            <label className="font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Select Delivery Date</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                {formattedDisplayDate()}
              </span>
            </label>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map(p => {
                const isSelected = scheduledDate === p.date;
                return (
                  <button
                    key={p.date}
                    type="button"
                    onClick={() => setScheduledDate(p.date)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-sm'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="block text-[11px]">{p.label}</span>
                    <span className={`block text-[10px] font-mono mt-0.5 ${
                      isSelected ? 'text-emerald-100' : isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {p.day}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Date Input */}
            <div className="pt-1">
              <label className={`block text-[11px] mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Or choose custom delivery date:
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min="2026-09-01"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-800'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>
          </div>

          {/* 2. Preferred Delivery Time Slot */}
          <div className="space-y-2">
            <label className="font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Preferred Delivery Time Window</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map(slot => {
                const isSelected = deliveryTimeSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setDeliveryTimeSlot(slot.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? isLight 
                          ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold' 
                          : 'bg-blue-950/50 border-blue-500/80 text-blue-200 font-semibold'
                        : isLight
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{slot.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <span className={`block text-[10px] font-mono mt-0.5 ${
                      isSelected ? 'text-blue-500' : isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {slot.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Assigned Courier / Agent (Optional) */}
          <div className="space-y-1.5">
            <label className="font-bold flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Assigned Dispatch Agent / Courier (Optional)</span>
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-800' 
                  : 'bg-slate-950 border-slate-800 text-white'
              }`}
            >
              <option value="">Keep current / Auto-route to regional agent</option>
              {agents.map(ag => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} — {ag.primaryZone} ({ag.status})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Delivery Instructions & Notes */}
          <div className="space-y-1.5">
            <label className="font-bold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Delivery Instructions / Customer Availability</span>
            </label>
            <textarea
              rows={2}
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              placeholder="e.g. Customer will be home after 2pm; call 30 mins before arrival."
              className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-800 placeholder-slate-400' 
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
              }`}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/40">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl border font-semibold transition cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Schedule Delivery</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
