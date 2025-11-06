import React from 'react';
import { Target, Calendar, Trash2, Edit, Star, Clock, CheckCircle, Circle, AlertTriangle } from 'lucide-react';

const GoalCard = ({ goal, progress, onEdit, onDelete, linkedActions = [] }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'not-started': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'in-progress': return <Clock size={14} />;
      case 'not-started': return <Circle size={14} />;
      default: return <Circle size={14} />;
    }
  };

  const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && goal.status !== 'completed';
  const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = goal.milestones?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-yellow-gold transition-all duration-200 p-5 relative">
      {/* Priority Badge */}
      {goal.priority === 'high' && (
        <div className="absolute top-3 right-3">
          <Star size={16} className="text-yellow-500 fill-current" />
        </div>
      )}

      {/* Goal Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 pr-6">{goal.title}</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(goal)}
              className="p-2 text-gray-400 hover:text-blue-500 active:scale-90 transition-all cursor-pointer touch-manipulation"
              title="Edit goal"
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(goal)}
              className="p-2 text-gray-400 hover:text-red-500 active:scale-90 transition-all cursor-pointer touch-manipulation"
              title="Delete goal"
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Status and Priority Tags */}
        <div className="flex items-center space-x-2 mb-2">
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
            {getStatusIcon(goal.status)}
            <span className="capitalize">{goal.status?.replace('-', ' ')}</span>
          </span>
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
            <span className="capitalize">{goal.priority} Priority</span>
          </span>
        </div>

        {/* Target Date */}
        {goal.targetDate && (
          <div className={`flex items-center space-x-2 text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            {isOverdue && <AlertTriangle size={14} />}
            <Calendar size={14} />
            <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
            {isOverdue && <span className="text-xs font-medium">(Overdue)</span>}
          </div>
        )}
      </div>

      {/* Description */}
      {goal.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{goal.description}</p>
      )}

      {/* Milestones */}
      {goal.milestones && goal.milestones.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Milestones</span>
            <span className="text-xs text-gray-500">{completedMilestones}/{totalMilestones}</span>
          </div>
          <div className="space-y-1">
            {goal.milestones.slice(0, 2).map((milestone) => (
              <div key={milestone.id} className="flex items-center space-x-2 text-sm">
                {milestone.completed ? 
                  <CheckCircle size={14} className="text-green-500" /> : 
                  <Circle size={14} className="text-gray-400" />
                }
                <span className={milestone.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                  {milestone.title}
                </span>
              </div>
            ))}
            {goal.milestones.length > 2 && (
              <p className="text-xs text-gray-500">+{goal.milestones.length - 2} more milestones</p>
            )}
          </div>
        </div>
      )}

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-yellow-gold">{Math.round(progress)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="h-3 rounded-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              background: progress === 100 ? '#10B981' : progress > 50 ? 'linear-gradient(to right, #f7be4b, #f59e0b)' : 'linear-gradient(to right, #f7be4b, #fbbf24)'
            }}
          ></div>
        </div>

        {/* Linked Actions Count */}
        <div className="text-xs text-gray-500">
          {linkedActions.length > 0 ? (
            <span>{linkedActions.filter(a => a.completed).length}/{linkedActions.length} actions completed</span>
          ) : (
            <span>No linked actions</span>
          )}
        </div>
      </div>

      {/* Notes */}
      {goal.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 italic">"{goal.notes}"</p>
        </div>
      )}

      {/* Goal Icon */}
      <div className="flex justify-center">
        <div className="p-3 rounded-full" style={{ backgroundColor: '#f7be4b' }}>
          <Target size={20} style={{ color: '#0f343c' }} />
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
