import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Calendar, Award, Activity, Download, RotateCcw } from 'lucide-react';
import { getAnalytics, getCurrentMonthReport, exportAnalytics, resetAnalytics } from '../utils/analytics';

const StatsModal = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setAnalytics(getAnalytics());
    setMonthlyReport(getCurrentMonthReport());
  };

  const handleReset = () => {
    resetAnalytics();
    loadData();
    setShowResetConfirm(false);
  };

  const handleExport = () => {
    exportAnalytics();
  };

  if (!isOpen || !analytics || !monthlyReport) return null;

  const stats = [
    { icon: Activity, label: 'Sessions', value: analytics.sessions, color: 'from-blue-400 to-blue-600' },
    { icon: TrendingUp, label: 'Chat Messages', value: analytics.chatMessagesCount, color: 'from-purple-400 to-purple-600' },
    { icon: Award, label: 'Goals Created', value: analytics.goalsCreated, color: 'from-green-400 to-green-600' },
    { icon: Calendar, label: 'Plans Created', value: analytics.plansCreated, color: 'from-orange-400 to-orange-600' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Your Progress</h2>
                <p className="text-sm opacity-90">Anonymous wellness metrics</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-r p-4 rounded-2xl shadow-lg text-white"
                  style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))`, '--tw-gradient-stops': `#667eea 0%, #764ba2 100%` }}
                >
                  <Icon size={24} className="mb-2" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Additional Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Additional Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Crisis Support Used:</span>
                <span className="font-semibold">{analytics.crisisFlowCompletions} times</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resource Calls Clicked:</span>
                <span className="font-semibold">{analytics.resourceCallClicks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Safety Plans Created:</span>
                <span className="font-semibold">{analytics.safetyPlansCreated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exports Generated:</span>
                <span className="font-semibold">{analytics.exportsGenerated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Achievements Unlocked:</span>
                <span className="font-semibold">{analytics.achievementsUnlocked}</span>
              </div>
            </div>
          </div>

          {/* Monthly Insights */}
          {monthlyReport.insights && monthlyReport.insights.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                <Award size={20} className="text-purple-600" />
                <span>Your Insights</span>
              </h3>
              <div className="space-y-3">
                {monthlyReport.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-purple-200 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-3xl">{insight.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">{insight.title}</div>
                        <p className="text-sm text-gray-600">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-600 text-xl flex-shrink-0">🔒</div>
              <div className="text-sm">
                <div className="font-semibold text-yellow-900 mb-1">Privacy Note</div>
                <p className="text-yellow-800">
                  All metrics are stored anonymously on your device only. No data is sent to any server. You can export or reset your data anytime.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RotateCcw size={16} />
            <span>Reset Data</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium bg-white border-2 border-gray-200 hover:border-gray-300 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reset All Data?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete all your progress metrics. Your goals, plans, and other app data will not be affected.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-3 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-3 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsModal;

