import React, { useState, useEffect } from 'react';
import { Plus, Check, Calendar, Clock, Target, Download, Edit, Trash2, Star, Filter, AlertCircle, FileText, FileDown } from 'lucide-react';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';
import { exportPlanToPDF, exportPlanAsText } from '../utils/pdfExport';
import { trackGoalCreation, trackPlanCreation, trackExport } from '../utils/analytics';
import firestoreService from '../services/firestoreService';

const PlanTab = () => {
  // Goals state with advanced features
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Improve Mental Wellness',
      targetDate: '2024-06-01',
      description: 'Build healthy habits and coping mechanisms for better mental health',
      priority: 'high',
      status: 'in-progress',
      notes: 'Focus on daily mindfulness and exercise',
      milestones: [
        { id: 1, title: 'Complete 30 days of meditation', completed: false },
        { id: 2, title: 'Establish workout routine', completed: true },
      ],
      createdAt: new Date('2024-03-01')
    },
    {
      id: 2,
      title: 'Reduce Anxiety',
      targetDate: '2024-05-15',
      description: 'Learn and practice anxiety management techniques',
      priority: 'medium',
      status: 'in-progress',
      notes: 'Try breathing exercises and progressive muscle relaxation',
      milestones: [
        { id: 1, title: 'Learn 5 breathing techniques', completed: false },
        { id: 2, title: 'Practice daily for 2 weeks', completed: false },
      ],
      createdAt: new Date('2024-03-15')
    }
  ]);

  // Actions state with goal linking
  const [todaySteps, setTodaySteps] = useState([
    { id: 1, text: 'Take 5 deep breaths', completed: false, timeEstimate: '2 min', goalId: 1 },
    { id: 2, text: 'Drink a glass of water', completed: false, timeEstimate: '1 min', goalId: 1 },
    { id: 3, text: 'Write down one thing I\'m grateful for', completed: false, timeEstimate: '3 min', goalId: 1 },
  ]);

  const [weekSteps, setWeekSteps] = useState([
    { id: 1, text: 'Schedule a call with a friend', completed: false, target: 'By Wednesday', goalId: 2 },
    { id: 2, text: 'Go for a 20-minute walk outside', completed: false, target: 'This weekend', goalId: 1 },
    { id: 3, text: 'Practice a relaxation technique for 10 minutes', completed: false, target: 'Every other day', goalId: 2 },
  ]);

  // Form states
  const [newTodayStep, setNewTodayStep] = useState('');
  const [newWeekStep, setNewWeekStep] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteConfirmGoal, setDeleteConfirmGoal] = useState(null);
  
  // Filter and sort states
  const [goalFilter, setGoalFilter] = useState('all'); // all, high-priority, in-progress, completed
  const [goalSort, setGoalSort] = useState('created'); // created, progress, due-date, priority

  // Load action plan from Firebase on mount
  useEffect(() => {
    const loadPlan = async () => {
      try {
        const savedPlan = await firestoreService.loadPlan();
        if (savedPlan) {
          if (savedPlan.goals) setGoals(savedPlan.goals);
          if (savedPlan.todaySteps) setTodaySteps(savedPlan.todaySteps);
          if (savedPlan.weekSteps) setWeekSteps(savedPlan.weekSteps);
          console.log('✅ Loaded action plan from Firebase');
        }
      } catch (error) {
        console.error('❌ Error loading plan:', error);
      }
    };

    // Wait for Firebase auth to initialize
    const timer = setTimeout(() => {
      loadPlan();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Save plan to Firebase whenever it changes
  useEffect(() => {
    const savePlan = async () => {
      try {
        await firestoreService.savePlan({
          goals,
          todaySteps,
          weekSteps
        });
      } catch (error) {
        // Silent fail - don't block UI
      }
    };

    // Debounce saves to avoid too many writes
    const timer = setTimeout(() => {
      savePlan();
    }, 2000);

    return () => clearTimeout(timer);
  }, [goals, todaySteps, weekSteps]);

  // Helper function to calculate goal progress
  const calculateGoalProgress = (goalId) => {
    const allActions = [...todaySteps, ...weekSteps];
    const linkedActions = allActions.filter(action => action.goalId === goalId);
    const completed = linkedActions.filter(action => action.completed).length;
    return linkedActions.length === 0 ? 0 : (completed / linkedActions.length) * 100;
  };

  // Goal management functions
  const addGoal = (newGoal) => {
    const goal = {
      ...newGoal,
      id: Date.now(),
      createdAt: new Date(),
      status: 'not-started',
      milestones: newGoal.milestones || []
    };
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (updatedGoal) => {
    setGoals(prev => prev.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    ));
    setEditingGoal(null);
  };

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    // Remove goalId from actions that were linked to this goal
    setTodaySteps(prev => prev.map(step => 
      step.goalId === goalId ? { ...step, goalId: null } : step
    ));
    setWeekSteps(prev => prev.map(step => 
      step.goalId === goalId ? { ...step, goalId: null } : step
    ));
    setDeleteConfirmGoal(null);
  };

  // Filter and sort goals
  const getFilteredAndSortedGoals = () => {
    let filtered = goals;

    // Apply filters
    switch (goalFilter) {
      case 'high-priority':
        filtered = goals.filter(goal => goal.priority === 'high');
        break;
      case 'in-progress':
        filtered = goals.filter(goal => goal.status === 'in-progress');
        break;
      case 'completed':
        filtered = goals.filter(goal => goal.status === 'completed');
        break;
      default:
        filtered = goals;
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (goalSort) {
        case 'progress':
          return calculateGoalProgress(b.id) - calculateGoalProgress(a.id);
        case 'due-date':
          return new Date(a.targetDate || '9999-12-31') - new Date(b.targetDate || '9999-12-31');
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  // Action management functions
  const toggleTodayStep = (id) => {
    setTodaySteps(prev => 
      prev.map(step => 
        step.id === id ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const toggleWeekStep = (id) => {
    setWeekSteps(prev => 
      prev.map(step => 
        step.id === id ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const addTodayStep = () => {
    if (!newTodayStep.trim()) return;
    
    const newStep = {
      id: Date.now(),
      text: newTodayStep.trim(),
      completed: false,
      timeEstimate: '5 min',
      goalId: selectedGoalId || null
    };
    
    setTodaySteps(prev => [...prev, newStep]);
    setNewTodayStep('');
    setSelectedGoalId('');
  };

  const addWeekStep = () => {
    if (!newWeekStep.trim()) return;
    
    const newStep = {
      id: Date.now(),
      text: newWeekStep.trim(),
      completed: false,
      target: 'This week',
      goalId: selectedGoalId || null
    };
    
    setWeekSteps(prev => [...prev, newStep]);
    setNewWeekStep('');
    setSelectedGoalId('');
  };

  // Export menu state
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Prepare plan data for export
  const getPlanData = () => {
    return {
      exportDate: new Date().toLocaleDateString(),
      goals: goals,
      todaySteps: todaySteps,
      weekSteps: weekSteps
    };
  };

  // Export as PDF (printable)
  const handleExportPDF = () => {
    const planData = getPlanData();
    exportPlanToPDF(planData);
    trackExport('PDF');
    setShowExportMenu(false);
  };

  // Export as Text file
  const handleExportText = () => {
    const planData = getPlanData();
    exportPlanAsText(planData);
    trackExport('TEXT');
    setShowExportMenu(false);
  };

  // Export as JSON (original functionality)
  const handleExportJSON = () => {
    const planData = {
      ...getPlanData(),
      summary: {
        totalGoals: goals.length,
        completedGoals: goals.filter(goal => goal.status === 'completed').length,
        highPriorityGoals: goals.filter(goal => goal.priority === 'high').length,
        todayActions: {
          total: todaySteps.length,
          completed: todaySteps.filter(step => step.completed).length
        },
        weekActions: {
          total: weekSteps.length,
          completed: weekSteps.filter(step => step.completed).length
        }
      }
    };

    const dataStr = JSON.stringify(planData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nitzutz-goals-plan-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    trackExport('JSON');
    setShowExportMenu(false);
  };

  const todayCompletionRate = todaySteps.length > 0 ? (todaySteps.filter(step => step.completed).length / todaySteps.length) * 100 : 0;
  const weekCompletionRate = weekSteps.length > 0 ? (weekSteps.filter(step => step.completed).length / weekSteps.length) * 100 : 0;

  return (
    <div className="p-4 pb-24" style={{ backgroundColor: '#f7be4b', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold" style={{ color: '#0f343c' }}>Goals & Action Plan</h2>
          {/* Export dropdown menu */}
          <div className="relative">
          <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-all text-sm font-semibold hover:shadow-lg"
            style={{ backgroundColor: '#ffffff', color: '#0f343c', border: '2px solid #0f343c' }}
          >
              <Download size={18} />
              <span>Export Plan</span>
            </button>
            
            {showExportMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportMenu(false)}
                />
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden z-20 slide-up">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">
                      Export Format
                    </div>
                    
                    <button
                      onClick={handleExportPDF}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-3 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                        <FileText size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                          Export as PDF
                        </div>
                        <div className="text-xs text-gray-500">
                          Printable format
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleExportText}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-3 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                        <FileDown size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-green-600">
                          Export as Text
                        </div>
                        <div className="text-xs text-gray-500">
                          Simple text file
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleExportJSON}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-3 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                        <Download size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-purple-600">
                          Export as JSON
                        </div>
                        <div className="text-xs text-gray-500">
                          Data backup format
                        </div>
                      </div>
          </button>
                  </div>
                  
                  <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-100">
                    <div className="flex items-start space-x-2">
                      <div className="text-yellow-600 flex-shrink-0">🔒</div>
                      <p className="text-xs text-yellow-800">
                        <strong>Privacy:</strong> No personal information included in any export format.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <p className="text-sm" style={{ color: '#0f343c', opacity: 0.8 }}>
          Set meaningful goals and break them down into actionable daily and weekly steps.
        </p>
      </div>

      {/* Goals Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-xl font-bold" style={{ color: '#0f343c' }}>My Goals</h3>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            {/* Filter Dropdown */}
            <div className="flex items-center space-x-2">
              <Filter size={16} style={{ color: '#0f343c' }} />
              <select
                value={goalFilter}
                onChange={(e) => setGoalFilter(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-yellow-gold"
                style={{ color: '#0f343c' }}
              >
                <option value="all">All Goals</option>
                <option value="high-priority">High Priority</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <select
              value={goalSort}
              onChange={(e) => setGoalSort(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-yellow-gold"
              style={{ color: '#0f343c' }}
            >
              <option value="created">Sort by Created</option>
              <option value="progress">Sort by Progress</option>
              <option value="due-date">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
            </select>

            {/* Add Goal Button */}
            <button
              onClick={() => setIsGoalFormOpen(true)}
              className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm font-medium"
              style={{ backgroundColor: '#0f343c', color: '#f7be4b' }}
            >
              <Plus size={16} />
              <span>Add Goal</span>
            </button>
          </div>
        </div>

        {/* Goals Grid */}
        {getFilteredAndSortedGoals().length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Target size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {goalFilter === 'all' ? 'No goals set yet' : `No ${goalFilter.replace('-', ' ')} goals`}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {goalFilter === 'all' 
                ? 'Start your journey by setting your first goal' 
                : 'Try adjusting your filter to see more goals'
              }
            </p>
            {goalFilter === 'all' && (
              <button
                onClick={() => setIsGoalFormOpen(true)}
                className="px-6 py-3 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#0f343c' }}
              >
                Create Your First Goal
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredAndSortedGoals().map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                progress={calculateGoalProgress(goal.id)}
                onEdit={() => setEditingGoal(goal)}
                onDelete={() => setDeleteConfirmGoal(goal)}
                linkedActions={[...todaySteps, ...weekSteps].filter(action => action.goalId === goal.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Today's Steps Section */}
      <div className="rounded-lg shadow-sm mb-6" style={{ backgroundColor: '#ffffff', border: '2px solid #0f343c' }}>
        <div className="p-4 border-b" style={{ borderBottomColor: '#0f343c' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#f7be4b' }}>
                <Clock size={20} style={{ color: '#0f343c' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: '#0f343c' }}>Today's Steps</h3>
            </div>
            <div className="text-sm" style={{ color: '#0f343c', opacity: 0.7 }}>
              {todaySteps.filter(step => step.completed).length} / {todaySteps.length} completed
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full rounded-full h-2" style={{ backgroundColor: '#e5e5e5' }}>
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${todayCompletionRate}%`, backgroundColor: '#0f343c' }}
            ></div>
          </div>
        </div>

        <div className="p-4">
          {/* Steps List */}
          <div className="space-y-3 mb-4">
            {todaySteps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                  step.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:border-yellow-gold'
                }`}
              >
                <button
                  onClick={() => toggleTodayStep(step.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    step.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-yellow-gold'
                  }`}
                >
                  {step.completed && <Check size={14} />}
                </button>
                <div className="flex-1">
                  <p className={`${step.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {step.text}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{step.timeEstimate}</p>
                    {step.goalId && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-gold/20 text-yellow-gold font-medium">
                        {goals.find(g => g.id === step.goalId)?.title || 'Unknown Goal'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Step */}
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTodayStep}
                onChange={(e) => setNewTodayStep(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodayStep()}
                placeholder="Add a quick action for today..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-gold focus:ring-1 focus:ring-yellow-gold text-sm"
              />
              <button
                onClick={addTodayStep}
                className="bg-yellow-gold hover:bg-yellow-gold/90 text-dark-teal px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {/* Goal Selection */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">Link to goal:</span>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-yellow-gold"
              >
                <option value="">No goal</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title} {goal.priority === 'high' && '⭐'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* This Week's Steps Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-dark-teal/20 rounded-lg">
                <Calendar size={20} className="text-dark-teal" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">This Week's Steps</h3>
            </div>
            <div className="text-sm text-gray-500">
              {weekSteps.filter(step => step.completed).length} / {weekSteps.length} completed
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-dark-teal h-2 rounded-full transition-all duration-300"
              style={{ width: `${weekCompletionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4">
          {/* Steps List */}
          <div className="space-y-3 mb-4">
            {weekSteps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                  step.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:border-dark-teal'
                }`}
              >
                <button
                  onClick={() => toggleWeekStep(step.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    step.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-dark-teal'
                  }`}
                >
                  {step.completed && <Check size={14} />}
                </button>
                <div className="flex-1">
                  <p className={`${step.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {step.text}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 flex items-center space-x-1">
                      <Target size={12} />
                      <span>{step.target}</span>
                    </p>
                    {step.goalId && (
                      <span className="text-xs px-2 py-1 rounded-full bg-dark-teal/20 text-dark-teal font-medium">
                        {goals.find(g => g.id === step.goalId)?.title || 'Unknown Goal'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Step */}
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newWeekStep}
                onChange={(e) => setNewWeekStep(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addWeekStep()}
                placeholder="Add a goal for this week..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-dark-teal focus:ring-1 focus:ring-dark-teal text-sm"
              />
              <button
                onClick={addWeekStep}
                className="bg-dark-teal hover:bg-dark-teal/90 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {/* Goal Selection */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">Link to goal:</span>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-dark-teal"
              >
                <option value="">No goal</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title} {goal.priority === 'high' && '⭐'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Success Metrics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-gold/10 p-4 rounded-lg border border-yellow-gold/20">
          <div className="flex items-center space-x-2 mb-2">
            <Clock size={16} className="text-yellow-gold" />
            <h4 className="font-semibold text-gray-900">Today</h4>
          </div>
          <p className="text-2xl font-bold text-yellow-gold">{Math.round(todayCompletionRate)}%</p>
          <p className="text-xs text-gray-600">Complete</p>
        </div>
        
        <div className="bg-dark-teal/10 p-4 rounded-lg border border-dark-teal/20">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar size={16} className="text-dark-teal" />
            <h4 className="font-semibold text-gray-900">This Week</h4>
          </div>
          <p className="text-2xl font-bold text-dark-teal">{Math.round(weekCompletionRate)}%</p>
          <p className="text-xs text-gray-600">Complete</p>
        </div>

        <div className="bg-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Target size={16} className="text-purple-600" />
            <h4 className="font-semibold text-gray-900">Goals</h4>
          </div>
          <p className="text-2xl font-bold text-purple-600">{goals.length}</p>
          <p className="text-xs text-gray-600">Active</p>
        </div>

        <div className="bg-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <Star size={16} className="text-green-600" />
            <h4 className="font-semibold text-gray-900">Avg Progress</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + calculateGoalProgress(goal.id), 0) / goals.length) : 0}%
          </p>
          <p className="text-xs text-gray-600">Across Goals</p>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-gold/10 to-dark-teal/10 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">Remember:</h4>
        <p className="text-sm text-gray-600">
          Every small step counts toward your bigger goals. Progress isn't always linear, and that's okay. 
          Be kind to yourself and celebrate each completed action, no matter how small.
        </p>
      </div>

      {/* Goal Form Modal */}
      <GoalForm
        isOpen={isGoalFormOpen}
        onClose={() => setIsGoalFormOpen(false)}
        onAddGoal={addGoal}
        goal={editingGoal}
        onUpdateGoal={updateGoal}
        isEditing={!!editingGoal}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Goal</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirmGoal.title}"? This will also unlink all associated actions. This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirmGoal(null)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteGoal(deleteConfirmGoal.id)}
                className="flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors bg-red-600 hover:bg-red-700"
              >
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanTab;
