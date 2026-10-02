import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { NotificationItem } from '../../types/crm';
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  ShoppingBag, 
  PackageCheck, 
  AlertTriangle, 
  ShoppingCart, 
  Bot, 
  Info, 
  CheckCircle2, 
  ExternalLink,
  Coins,
  Clock,
  UserCheck
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification, 
    deleteReadNotifications,
    clearAllNotifications,
    setAdminActiveTab 
  } = useCrm();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order_received':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'order_assigned':
        return <UserCheck className="w-4 h-4 text-sky-400" />;
      case 'delivery_completed':
        return <PackageCheck className="w-4 h-4 text-emerald-400" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'cart_abandoned':
        return <ShoppingCart className="w-4 h-4 text-rose-400" />;
      case 'ai_call':
        return <Bot className="w-4 h-4 text-purple-400" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  const getNotificationBadgeClass = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order_received':
      case 'delivery_completed':
      case 'success':
        return 'bg-emerald-950/80 border-emerald-800/60 text-emerald-400';
      case 'order_assigned':
        return 'bg-sky-950/80 border-sky-800/60 text-sky-400';
      case 'low_stock':
        return 'bg-amber-950/80 border-amber-800/60 text-amber-400';
      case 'cart_abandoned':
        return 'bg-rose-950/80 border-rose-800/60 text-rose-400';
      case 'ai_call':
        return 'bg-purple-950/80 border-purple-800/60 text-purple-400';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-300';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto text-slate-100 select-none">
      
      {/* 1. Header matching BettaTraka exact styling in noti.png */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Notifications
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Stay updated on orders, status changes, and important activities
        </p>
      </div>

      {/* 2. Filter Bar & Actions matching noti.png */}
      <div className="p-2 sm:p-2.5 rounded-2xl border border-slate-800/80 bg-[#090d16] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        {/* Filter Pills: All | Unread */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'all'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <span>All</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300">
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Right side actions: Delete read & Mark all read */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark all read</span>
            </button>
          )}

          <button
            type="button"
            onClick={deleteReadNotifications}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-slate-800/80 hover:border-rose-900/50 transition cursor-pointer flex items-center gap-1.5"
            title="Delete read notifications"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete read</span>
          </button>
        </div>
      </div>

      {/* 3. Main Notifications Container */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#090d16] p-4 sm:p-6 shadow-xl min-h-[420px] flex flex-col justify-center">
        
        {filteredNotifications.length === 0 ? (
          /* Exact Empty State matching noti.png */
          <div className="py-16 sm:py-24 text-center space-y-3 max-w-sm mx-auto animate-in fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-950 border border-slate-800/80 flex items-center justify-center shadow-inner">
              <Bell className="w-8 h-8 text-slate-500 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                No notifications yet
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You'll see updates about orders and activities here.
              </p>
            </div>
          </div>
        ) : (
          /* Populated Notifications List */
          <div className="space-y-3 w-full">
            {filteredNotifications.map((n, idx) => (
              <div
                key={`${n.id || 'notif'}-${idx}`}
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs ${
                  n.isRead
                    ? 'border-slate-800/60 bg-slate-950/40 opacity-75 hover:opacity-100 hover:border-slate-700'
                    : 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${getNotificationBadgeClass(n.type)}`}>
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {n.timestamp}
                      </span>
                      {n.linkTab && (
                        <button
                          type="button"
                          onClick={() => setAdminActiveTab(n.linkTab as any)}
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-sans font-semibold cursor-pointer underline"
                        >
                          <span>Go to {n.linkTab.replace('-', ' ')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Individual Action Controls */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => markNotificationAsRead(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition cursor-pointer"
                    title={n.isRead ? 'Already read' : 'Mark as read'}
                  >
                    <CheckCheck className={`w-4 h-4 ${n.isRead ? 'text-slate-600' : 'text-emerald-400'}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteNotification(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
