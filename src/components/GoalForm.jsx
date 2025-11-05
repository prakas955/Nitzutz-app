import React, { useState, useEffect } from 'react';
import { X, Target, Plus, Trash2 } from 'lucide-react';

const GoalForm = ({ isOpen, onClose, onAddGoal, goal = null, onUpdateGoal, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    targetDate: '',
    description: '',
    priority: 'medium',
    status: 'not-started',
    notes: '',
    milestones: []
  });

  const [newMilestone, setNewMilestone] = useState('');

  // Load goal data for editing
  useEffect(() => {
    if (isEditing && goal) {
      setFormData({
        title: goal.title || '',
        targetDate: goal.targetDate || '',
        description: goal.description || '',
        priority: goal.priority || 'medium',
        status: goal.status || 'not-started',
        notes: goal.notes || '',
        milestones: goal.milestones || []
      });
    } else if (!isEditing) {
      setFormData({
        title: '',
        targetDate: '',
        description: '',
        priority: 'medium',
        status: 'not-started',
        notes: '',
        milestones: []
      });
    }
  }, [isEditing, goal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const goalData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      notes: formData.notes.trim(),
      milestones: formData.milestones.map(m => ({
        ...m,
        title: m.title.trim()
      }))
    };

    if (isEditing) {
      onUpdateGoal({ ...goal, ...goalData });
    } else {
      onAddGoal(goalData);
    }

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      targetDate: '',
      description: '',
      priority: 'medium',
      status: 'not-started',
      notes: '',
      milestones: []
    });
    setNewMilestone('');
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    
    const milestone = {
      id: Date.now(),
      title: newMilestone.trim(),
      completed: false
    };
    
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, milestone]
    }));
    setNewMilestone('');
  };

  const removeMilestone = (milestoneId) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== milestoneId)
    }));
  };

  const toggleMilestone = (milestoneId) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#f7be4b' }}>
              <Target size={20} style={{ color: '#0f343c' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#0f343c' }}>
              {isEditing ? 'Edit Goal' : 'Add New Goal'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Goal Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Learn meditation techniques"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-gold focus:ring-1 focus:ring-yellow-gold text-sm"
              required
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-gold focus:ring-1 focus:ring-yellow-gold text-sm"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-gold focus:ring-1 focus:ring-yellow-gold text-sm"
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => handleChange('targetDate', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-gold focus:ring-1 focus:ring-yellow-gold text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of your goal..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-gold focus:ring-1 focus:ring-yellow-gold text-sm resize-none"
            />
          </div>

          {/* Milestones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Milestones (Optional)
            </label>
            
            {/* Add Milestone */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                placeholder="Add a milestone..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-gold focus:ring-1 focus:ring-yellow-gold text-sm"
              />
              <button
                type="button"
                onClick={addMilestone}
                className="px-4 py-2 bg-yellow-gold text-dark-teal rounded-lg hover:bg-yellow-gold/90 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Milestone List */}
            {formData.milestones.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {formData.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      onChange={() => toggleMilestone(milestone.id)}
                      className="w-4 h-4 text-yellow-gold focus:ring-yellow-gold border-gray-300 rounded"
                    />
                    <span className={`flex-1 text-sm ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {milestone.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMilestone(milestone.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes & Reflections (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Personal notes, reminders, or reflections..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-gold focus:ring-1 focus:ring-yellow-gold text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: '#0f343c' }}
            >
              {isEditing ? 'Update Goal' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
