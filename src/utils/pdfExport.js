// PDF Export utility using browser print functionality
// Generates a printable HTML page that can be saved as PDF

export const exportPlanToPDF = (planData) => {
  const {
    goals = [],
    todaySteps = [],
    weekSteps = [],
    exportDate = new Date().toLocaleDateString()
  } = planData;

  // Calculate statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const todayCompleted = todaySteps.filter(s => s.completed).length;
  const weekCompleted = weekSteps.filter(s => s.completed).length;

  // Create printable HTML
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nitzutz Action Plan - ${exportDate}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background: white;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 4px solid #667eea;
      padding-bottom: 20px;
    }

    .header h1 {
      color: #667eea;
      font-size: 32px;
      margin-bottom: 10px;
    }

    .header p {
      color: #666;
      font-size: 14px;
    }

    .summary {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
      border-left: 4px solid #667eea;
    }

    .summary h2 {
      color: #667eea;
      font-size: 20px;
      margin-bottom: 15px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .summary-item {
      background: white;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .summary-item strong {
      display: block;
      color: #667eea;
      font-size: 24px;
      margin-bottom: 5px;
    }

    .summary-item span {
      color: #666;
      font-size: 14px;
    }

    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .section h2 {
      color: #667eea;
      font-size: 24px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
    }

    .goal-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    .goal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .goal-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .goal-priority {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .priority-high {
      background: #fee;
      color: #c00;
    }

    .priority-medium {
      background: #ffeaa7;
      color: #b8860b;
    }

    .priority-low {
      background: #d1f2eb;
      color: #008b8b;
    }

    .goal-description {
      color: #666;
      margin-bottom: 10px;
    }

    .goal-meta {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: #666;
      margin-top: 10px;
    }

    .goal-meta span {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .milestones {
      margin-top: 15px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .milestones h4 {
      font-size: 14px;
      color: #667eea;
      margin-bottom: 8px;
    }

    .milestone {
      padding: 6px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .milestone:last-child {
      border-bottom: none;
    }

    .milestone.completed {
      text-decoration: line-through;
      color: #999;
    }

    .steps-list {
      list-style: none;
    }

    .step-item {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .step-item.completed {
      background: #f0fdf4;
      border-color: #86efac;
    }

    .step-checkbox {
      width: 24px;
      height: 24px;
      border: 2px solid #667eea;
      border-radius: 6px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step-item.completed .step-checkbox {
      background: #667eea;
      color: white;
      font-weight: bold;
    }

    .step-text {
      flex: 1;
      color: #333;
    }

    .step-item.completed .step-text {
      text-decoration: line-through;
      color: #999;
    }

    .step-meta {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 14px;
    }

    .privacy-note {
      background: #fff9e6;
      border: 2px solid #ffd700;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
      text-align: left;
    }

    .privacy-note strong {
      color: #b8860b;
      display: block;
      margin-bottom: 8px;
    }

    @media print {
      body {
        padding: 20px;
      }

      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌟 Nitzutz Mental Health Action Plan</h1>
    <p>Generated on ${exportDate} | Anonymous Report</p>
  </div>

  <div class="summary">
    <h2>📊 Progress Summary</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <strong>${totalGoals}</strong>
        <span>Total Goals</span>
      </div>
      <div class="summary-item">
        <strong>${completedGoals}</strong>
        <span>Completed Goals</span>
      </div>
      <div class="summary-item">
        <strong>${todayCompleted}/${todaySteps.length}</strong>
        <span>Today's Actions Done</span>
      </div>
      <div class="summary-item">
        <strong>${weekCompleted}/${weekSteps.length}</strong>
        <span>Weekly Actions Done</span>
      </div>
    </div>
  </div>

  ${goals.length > 0 ? `
  <div class="section">
    <h2>🎯 My Goals</h2>
    ${goals.map(goal => `
      <div class="goal-card">
        <div class="goal-header">
          <div class="goal-title">${goal.title}</div>
          ${goal.priority ? `
            <div class="goal-priority priority-${goal.priority}">
              ${goal.priority}
            </div>
          ` : ''}
        </div>
        ${goal.description ? `
          <div class="goal-description">${goal.description}</div>
        ` : ''}
        <div class="goal-meta">
          ${goal.targetDate ? `
            <span>📅 Target: ${new Date(goal.targetDate).toLocaleDateString()}</span>
          ` : ''}
          ${goal.status ? `
            <span>📍 Status: ${goal.status}</span>
          ` : ''}
        </div>
        ${goal.milestones && goal.milestones.length > 0 ? `
          <div class="milestones">
            <h4>Milestones:</h4>
            ${goal.milestones.map(m => `
              <div class="milestone ${m.completed ? 'completed' : ''}">
                ${m.completed ? '✓' : '○'} ${m.title}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${todaySteps.length > 0 ? `
  <div class="section">
    <h2>📅 Today's Action Steps</h2>
    <ul class="steps-list">
      ${todaySteps.map(step => `
        <li class="step-item ${step.completed ? 'completed' : ''}">
          <div class="step-checkbox">
            ${step.completed ? '✓' : ''}
          </div>
          <div class="step-text">
            ${step.text}
            ${step.timeEstimate ? `
              <div class="step-meta">Est. ${step.timeEstimate}</div>
            ` : ''}
          </div>
        </li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  ${weekSteps.length > 0 ? `
  <div class="section">
    <h2>📆 This Week's Action Steps</h2>
    <ul class="steps-list">
      ${weekSteps.map(step => `
        <li class="step-item ${step.completed ? 'completed' : ''}">
          <div class="step-checkbox">
            ${step.completed ? '✓' : ''}
          </div>
          <div class="step-text">
            ${step.text}
            ${step.target ? `
              <div class="step-meta">${step.target}</div>
            ` : ''}
          </div>
        </li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="footer">
    <p><strong>Nitzutz Mental Health Support</strong></p>
    <p>Anonymous, Privacy-First Mental Wellness</p>
    
    <div class="privacy-note">
      <strong>🔒 Privacy Note:</strong>
      <p>This document contains no personally identifiable information. All data is generated anonymously from your local device. You can safely share this document without compromising your privacy.</p>
    </div>
  </div>
</body>
</html>
  `;

  // Open print dialog with the content
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = function() {
    printWindow.print();
  };
};

// Export as text (simple format)
export const exportPlanAsText = (planData) => {
  const {
    goals = [],
    todaySteps = [],
    weekSteps = [],
    exportDate = new Date().toLocaleDateString()
  } = planData;

  let textContent = `NITZUTZ MENTAL HEALTH ACTION PLAN\n`;
  textContent += `Generated: ${exportDate}\n`;
  textContent += `==========================================\n\n`;

  // Summary
  textContent += `SUMMARY\n`;
  textContent += `-------\n`;
  textContent += `Total Goals: ${goals.length}\n`;
  textContent += `Completed Goals: ${goals.filter(g => g.status === 'completed').length}\n`;
  textContent += `Today's Actions: ${todaySteps.filter(s => s.completed).length}/${todaySteps.length} completed\n`;
  textContent += `Weekly Actions: ${weekSteps.filter(s => s.completed).length}/${weekSteps.length} completed\n\n`;

  // Goals
  if (goals.length > 0) {
    textContent += `MY GOALS\n`;
    textContent += `========\n\n`;
    goals.forEach((goal, index) => {
      textContent += `${index + 1}. ${goal.title}\n`;
      if (goal.description) textContent += `   ${goal.description}\n`;
      if (goal.targetDate) textContent += `   Target: ${new Date(goal.targetDate).toLocaleDateString()}\n`;
      if (goal.priority) textContent += `   Priority: ${goal.priority.toUpperCase()}\n`;
      if (goal.status) textContent += `   Status: ${goal.status}\n`;
      if (goal.milestones && goal.milestones.length > 0) {
        textContent += `   Milestones:\n`;
        goal.milestones.forEach(m => {
          textContent += `   ${m.completed ? '[✓]' : '[ ]'} ${m.title}\n`;
        });
      }
      textContent += `\n`;
    });
  }

  // Today's steps
  if (todaySteps.length > 0) {
    textContent += `TODAY'S ACTION STEPS\n`;
    textContent += `====================\n\n`;
    todaySteps.forEach((step, index) => {
      textContent += `${step.completed ? '[✓]' : '[ ]'} ${step.text}`;
      if (step.timeEstimate) textContent += ` (${step.timeEstimate})`;
      textContent += `\n`;
    });
    textContent += `\n`;
  }

  // Week's steps
  if (weekSteps.length > 0) {
    textContent += `THIS WEEK'S ACTION STEPS\n`;
    textContent += `========================\n\n`;
    weekSteps.forEach((step, index) => {
      textContent += `${step.completed ? '[✓]' : '[ ]'} ${step.text}`;
      if (step.target) textContent += ` (${step.target})`;
      textContent += `\n`;
    });
    textContent += `\n`;
  }

  textContent += `==========================================\n`;
  textContent += `Privacy Note: This document contains no personally\n`;
  textContent += `identifiable information. All data is anonymous.\n`;

  // Create downloadable text file
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nitzutz-action-plan-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

