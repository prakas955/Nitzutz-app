import React, { useState, useEffect } from 'react';
import { Plus, Target, Download, Calendar, Trash2 } from 'lucide-react';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';
import firestoreService from '../services/firestoreService';
import { trackGoalCreation } from '../utils/analytics';

const GoalsTab = ({ userId }) => {
  // Goals state
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Improve Mental Wellness',
      targetTimeFrame: '3 months',
      description: 'Build healthy habits and coping mechanisms for better mental health',
      createdAt: new Date()
    },
    {
      id: 2,
      title: 'Reduce Anxiety',
      targetTimeFrame: '6 weeks',
      description: 'Learn and practice anxiety management techniques',
      createdAt: new Date()
    }
  ]);

  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);

  // Load goals from Firebase on mount
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const savedGoals = await firestoreService.loadGoals();
        if (savedGoals && savedGoals.length > 0) {
          setGoals(savedGoals);
          console.log(`✅ Loaded ${savedGoals.length} goals from Firebase`);
        }
      } catch (error) {
        console.error('❌ Error loading goals:', error);
      }
    };

    // Wait for Firebase auth to initialize
    const timer = setTimeout(() => {
      loadGoals();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Helper function to calculate goal progress (placeholder for now)
  const calculateGoalProgress = (goalId) => {
    // For now, return random progress. Later this will be calculated from linked actions
    return Math.floor(Math.random() * 100);
  };

  // Goal management functions
  const addGoal = async (newGoal) => {
    setGoals(prev => [...prev, newGoal]);
    
    // Save to Firebase
    try {
      await firestoreService.saveGoal(newGoal);
      trackGoalCreation();
      console.log('✅ Goal saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving goal to Firebase:', error);
    }
  };

  const deleteGoal = async (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    
    // Delete from Firebase
    try {
      await firestoreService.deleteGoal(goalId);
      console.log('✅ Goal deleted from Firebase');
    } catch (error) {
      console.error('❌ Error deleting goal from Firebase:', error);
    }
  };

  // Export function for goals
  const exportGoals = () => {
    const goalsData = {
      date: new Date().toLocaleDateString(),
      goals: goals.map(goal => ({
        ...goal,
        progress: calculateGoalProgress(goal.id)
      })),
      totalGoals: goals.length,
      averageProgress: goals.length > 0 
        ? goals.reduce((sum, goal) => sum + calculateGoalProgress(goal.id), 0) / goals.length 
        : 0
    };

    const dataStr = JSON.stringify(goalsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nitzutz-goals-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 pb-32 overflow-y-auto relative" style={{ backgroundColor: '#f7be4b', minHeight: '100vh', maxHeight: 'calc(100vh - 200px)', touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold" style={{ color: '#0f343c' }}>My Goals</h2>
          <button
            onClick={exportGoals}
            className="px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm cursor-pointer touch-manipulation active:scale-95"
            style={{ backgroundColor: '#ffffff', color: '#0f343c', border: '2px solid #0f343c', minWidth: '44px', minHeight: '44px' }}
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
        <p className="text-sm" style={{ color: '#0f343c', opacity: 0.8 }}>
          Set meaningful goals and track your progress toward better mental health.
        </p>
      </div>

      {/* Add Goal Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsGoalFormOpen(true)}
          className="w-full px-6 py-4 rounded-lg flex items-center justify-center space-x-3 transition-all text-lg font-medium shadow-lg cursor-pointer touch-manipulation active:scale-98"
          style={{ backgroundColor: '#0f343c', color: '#f7be4b', minHeight: '56px' }}
        >
          <Plus size={24} />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Target size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No goals set yet</h3>
          <p className="text-sm text-gray-400 mb-4">Start your journey by setting your first goal</p>
          <button
            onClick={() => setIsGoalFormOpen(true)}
            className="px-6 py-3 rounded-lg text-white font-medium cursor-pointer touch-manipulation active:scale-95"
            style={{ backgroundColor: '#0f343c', minHeight: '44px' }}
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={deleteGoal}
              progress={calculateGoalProgress(goal.id)}
            />
          ))}
        </div>
      )}

      {/* Goals Statistics */}
      {goals.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#f7be4b' }}>
                <Target size={20} style={{ color: '#0f343c' }} />
              </div>
              <h4 className="font-semibold text-gray-900">Total Goals</h4>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#0f343c' }}>{goals.length}</p>
            <p className="text-sm text-gray-600">Active goals</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar size={20} className="text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Average Progress</h4>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {Math.round(goals.reduce((sum, goal) => sum + calculateGoalProgress(goal.id), 0) / goals.length)}%
            </p>
            <p className="text-sm text-gray-600">Across all goals</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <Trash2 size={20} className="text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">This Month</h4>
            </div>
            <p className="text-3xl font-bold text-purple-600">{goals.length}</p>
            <p className="text-sm text-gray-600">Goals created</p>
          </div>
        </div>
      )}

      {/* Motivational Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
          <Target size={20} className="text-blue-600" />
          <span>Goal Setting Tips</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h5 className="font-semibold mb-1">Make it SMART</h5>
            <p>Specific, Measurable, Achievable, Relevant, Time-bound</p>
          </div>
          <div>
            <h5 className="font-semibold mb-1">Break it down</h5>
            <p>Large goals become manageable with smaller steps</p>
          </div>
          <div>
            <h5 className="font-semibold mb-1">Track progress</h5>
            <p>Regular check-ins help maintain momentum</p>
          </div>
          <div>
            <h5 className="font-semibold mb-1">Celebrate wins</h5>
            <p>Acknowledge progress, no matter how small</p>
          </div>
        </div>
      </div>

      {/* Goal Form Modal */}
      <GoalForm
        isOpen={isGoalFormOpen}
        onClose={() => setIsGoalFormOpen(false)}
        onAddGoal={addGoal}
      />
    </div>
  );
};

export default GoalsTab;
