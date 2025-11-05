// Anonymous Analytics Utility
// Tracks usage metrics without any personally identifiable information

const ANALYTICS_KEY = 'nitzutz-analytics';
const MONTHLY_REPORT_KEY = 'nitzutz-monthly-reports';

// Initialize analytics data structure
const initAnalytics = () => {
  const existing = localStorage.getItem(ANALYTICS_KEY);
  if (!existing) {
    const initialData = {
      sessions: 0,
      lastSessionDate: null,
      crisisFlowCompletions: 0,
      plansCreated: 0,
      goalsCreated: 0,
      resourceCallClicks: 0,
      chatMessagesCount: 0,
      safetyPlansCreated: 0,
      exportsGenerated: 0,
      achievementsUnlocked: 0,
      totalTimeSpent: 0, // in minutes
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(existing);
};

// Get current analytics
export const getAnalytics = () => {
  return initAnalytics();
};

// Track a session start
export const trackSession = () => {
  const analytics = initAnalytics();
  const today = new Date().toDateString();
  
  // Only increment if it's a new day
  if (analytics.lastSessionDate !== today) {
    analytics.sessions += 1;
    analytics.lastSessionDate = today;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  }
};

// Track crisis flow completion
export const trackCrisisFlow = () => {
  const analytics = initAnalytics();
  analytics.crisisFlowCompletions += 1;
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
};

// Track action plan creation
export const trackPlanCreation = () => {
  const analytics = initAnalytics();
  analytics.plansCreated += 1;
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
};

// Track goal creation
export const trackGoalCreation = () => {
  const analytics = initAnalytics();
  analytics.goalsCreated += 1;
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
};

// Track resource call clicks
export const trackResourceCall = () => {
  const analytics = initAnalytics();
  analytics.resourceCallClicks += 1;
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
};

// Track chat messages
export const trackChatMessage = () => {
  const analytics = initAnalytics();
  analytics.chatMessagesCount += 1;
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
};

// Track safety plan creation
export const trackSafetyPlan = () => {
  const analytics = initAnalytics();
  analytics.safetyPlansCreated += 1;
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
};

// Track export generation
export const trackExport = (format) => {
  const analytics = initAnalytics();
  analytics.exportsGenerated += 1;
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
};

// Track achievement unlock
export const trackAchievement = () => {
  const analytics = initAnalytics();
  analytics.achievementsUnlocked += 1;
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
};

// Generate monthly report
export const generateMonthlyReport = () => {
  const analytics = getAnalytics();
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const report = {
    month: monthKey,
    generatedAt: now.toISOString(),
    data: { ...analytics },
    insights: generateInsights(analytics)
  };
  
  // Save report
  const reports = getMonthlyReports();
  reports[monthKey] = report;
  localStorage.setItem(MONTHLY_REPORT_KEY, JSON.stringify(reports));
  
  return report;
};

// Get all monthly reports
export const getMonthlyReports = () => {
  const existing = localStorage.getItem(MONTHLY_REPORT_KEY);
  return existing ? JSON.parse(existing) : {};
};

// Get current month report
export const getCurrentMonthReport = () => {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const reports = getMonthlyReports();
  return reports[monthKey] || generateMonthlyReport();
};

// Generate insights from analytics data
const generateInsights = (analytics) => {
  const insights = [];
  
  // Session insights
  if (analytics.sessions >= 30) {
    insights.push({
      type: 'milestone',
      icon: '🎉',
      title: 'Consistency Champion!',
      message: `You've logged ${analytics.sessions} sessions. Daily check-ins are building healthy habits!`
    });
  } else if (analytics.sessions >= 7) {
    insights.push({
      type: 'progress',
      icon: '⭐',
      title: 'Building Momentum',
      message: `${analytics.sessions} sessions and counting! You're developing a great routine.`
    });
  }
  
  // Goal insights
  if (analytics.goalsCreated >= 10) {
    insights.push({
      type: 'milestone',
      icon: '🎯',
      title: 'Goal Setting Pro',
      message: `${analytics.goalsCreated} goals created! You're taking charge of your wellness journey.`
    });
  }
  
  // Resource engagement
  if (analytics.resourceCallClicks >= 5) {
    insights.push({
      type: 'positive',
      icon: '💪',
      title: 'Reaching Out',
      message: `You've reached out for professional support ${analytics.resourceCallClicks} times. That takes courage!`
    });
  }
  
  // Crisis support
  if (analytics.crisisFlowCompletions > 0) {
    insights.push({
      type: 'supportive',
      icon: '🛡️',
      title: 'Safety First',
      message: 'You activated crisis support when needed. That shows real self-awareness and strength.'
    });
  }
  
  // Planning insights
  if (analytics.plansCreated >= 3) {
    insights.push({
      type: 'achievement',
      icon: '📋',
      title: 'Planning Expert',
      message: `${analytics.plansCreated} action plans created. Breaking things down helps make progress!`
    });
  }
  
  // Engagement score
  const totalEngagement = 
    analytics.sessions + 
    (analytics.chatMessagesCount / 10) + 
    (analytics.goalsCreated * 2) + 
    (analytics.plansCreated * 2) +
    (analytics.resourceCallClicks * 3);
  
  let engagementLevel = 'Getting Started';
  if (totalEngagement > 100) engagementLevel = 'Highly Engaged';
  else if (totalEngagement > 50) engagementLevel = 'Active User';
  else if (totalEngagement > 20) engagementLevel = 'Regular User';
  
  insights.push({
    type: 'summary',
    icon: '📊',
    title: `Engagement Level: ${engagementLevel}`,
    message: `Your wellness journey score: ${Math.round(totalEngagement)} points`
  });
  
  return insights;
};

// Check if feedback prompt should be shown
export const shouldShowFeedbackPrompt = () => {
  const lastPrompt = localStorage.getItem('nitzutz-last-feedback-prompt');
  const analytics = getAnalytics();
  
  // Show after 10+ chat messages and hasn't been shown in last 7 days
  if (analytics.chatMessagesCount >= 10) {
    if (!lastPrompt) return true;
    
    const lastPromptDate = new Date(lastPrompt);
    const daysSince = (new Date() - lastPromptDate) / (1000 * 60 * 60 * 24);
    return daysSince >= 7;
  }
  
  return false;
};

// Mark feedback prompt as shown
export const markFeedbackPromptShown = () => {
  localStorage.setItem('nitzutz-last-feedback-prompt', new Date().toISOString());
};

// Reset analytics (for testing or user request)
export const resetAnalytics = () => {
  localStorage.removeItem(ANALYTICS_KEY);
  return initAnalytics();
};

// Export analytics as JSON
export const exportAnalytics = () => {
  const analytics = getAnalytics();
  const reports = getMonthlyReports();
  
  const exportData = {
    current: analytics,
    monthlyReports: reports,
    exportedAt: new Date().toISOString(),
    note: 'This data is completely anonymous and contains no personally identifiable information.'
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nitzutz-analytics-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

