/**
 * Emergency Detection Utility
 * Detects high-risk phrases indicating suicidal ideation or self-harm
 */

// High-risk keywords and phrases for detection
const HIGH_RISK_PATTERNS = [
  // Direct suicidal statements
  'kill myself',
  'kill me',
  'end my life',
  'end it all',
  'take my life',
  'suicide',
  'suicidal',
  'commit suicide',
  'want to die',
  'going to die',
  'better off dead',
  'not worth living',
  'life is not worth',
  'don\'t want to live',
  'can\'t go on',
  'want it to end',
  'end the pain',
  'no point in living',
  'tired of living',
  'done with life',
  'feel suicidal',
  'thinking about suicide',
  'planning to kill',
  'ready to die',
  'time to go',
  'checking out',
  'ending things',
  'permanent solution',
  
  // Self-harm indicators
  'hurt myself',
  'harm myself',
  'cut myself',
  'self harm',
  'self-harm',
  'overdose',
  'pills to end',
  'razor blade',
  'cutting again',
  'self destruct',
  
  // Crisis expressions
  'goodbye forever',
  'this is goodbye',
  'won\'t see me again',
  'final goodbye',
  'last time',
  'can\'t take it anymore',
  'nothing left',
  'give up',
  'no hope',
  'hopeless',
  'worthless',
  'burden to everyone',
  'everyone would be better',
  'world without me',
  'disappear forever',
  'stop existing',
  'cease to exist',
  'don\'t deserve to live',
  'failed at life',
  'useless person',
  'waste of space',
  
  // Method-specific phrases
  'jump off',
  'hanging myself',
  'shoot myself',
  'crash my car',
  'drive into',
  'tall building',
  'bridge jump',
  'train tracks',
  'sleeping pills',
  'carbon monoxide',
];

// Variations and common misspellings
const FUZZY_PATTERNS = [
  { pattern: /su[i1]c[i1]de?/gi, risk: 'high' },
  { pattern: /k[i1]ll?\s+m[y3]?\s*s[e3]lf/gi, risk: 'high' },
  { pattern: /[e3]nd\s+m[y3]?\s*l[i1]f[e3]/gi, risk: 'high' },
  { pattern: /want\s+t[o0]\s+d[i1][e3]/gi, risk: 'high' },
  { pattern: /b[e3]tt[e3]r\s+[o0]ff\s+d[e3][a@]d/gi, risk: 'high' },
  { pattern: /n[o0]t\s+w[o0]rth\s+l[i1]v[i1]ng/gi, risk: 'high' },
  { pattern: /c[a@]n['t]*\s+g[o0]\s+[o0]n/gi, risk: 'medium' },
  { pattern: /h[u0]rt\s+m[y3]?\s*s[e3]lf/gi, risk: 'high' },
  { pattern: /[o0]v[e3]rd[o0]s[e3]/gi, risk: 'high' },
  { pattern: /g[i1]v[e3]\s+[u0]p/gi, risk: 'medium' },
  { pattern: /n[o0]\s+h[o0]p[e3]/gi, risk: 'medium' },
  { pattern: /h[o0]p[e3]l[e3]ss/gi, risk: 'medium' },
  { pattern: /w[o0]rthl[e3]ss/gi, risk: 'medium' },
];

/**
 * Normalizes text for better matching
 * @param {string} text - Input text to normalize
 * @returns {string} - Normalized text
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Calculates Levenshtein distance for fuzzy matching
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Checks for fuzzy matches with high-risk patterns
 * @param {string} text - Text to analyze
 * @param {string} pattern - Pattern to match against
 * @param {number} threshold - Maximum allowed edit distance
 * @returns {boolean} - Whether a fuzzy match was found
 */
function fuzzyMatch(text, pattern, threshold = 2) {
  const words = text.split(' ');
  const patternWords = pattern.split(' ');
  
  // For single word patterns
  if (patternWords.length === 1) {
    return words.some(word => {
      if (word.length < 3) return false; // Skip very short words
      const distance = levenshteinDistance(word, pattern);
      const maxLength = Math.max(word.length, pattern.length);
      return distance <= threshold && distance / maxLength <= 0.3;
    });
  }
  
  // For multi-word patterns, check sliding windows
  for (let i = 0; i <= words.length - patternWords.length; i++) {
    const windowText = words.slice(i, i + patternWords.length).join(' ');
    const distance = levenshteinDistance(windowText, pattern);
    const maxLength = Math.max(windowText.length, pattern.length);
    if (distance <= threshold * patternWords.length && distance / maxLength <= 0.3) {
      return true;
    }
  }
  
  return false;
}

/**
 * Main emergency detection function
 * @param {string} message - User message to analyze
 * @returns {Object} - Detection result with risk level and matched phrases
 */
export function detectEmergency(message) {
  if (!message || typeof message !== 'string') {
    return { isEmergency: false, riskLevel: 'none', matchedPhrases: [] };
  }
  
  const normalizedMessage = normalizeText(message);
  const matchedPhrases = [];
  let highestRiskLevel = 'none';
  
  // Check exact phrase matches
  for (const pattern of HIGH_RISK_PATTERNS) {
    if (normalizedMessage.includes(pattern.toLowerCase())) {
      matchedPhrases.push(pattern);
      highestRiskLevel = 'high';
    }
  }
  
  // Check fuzzy pattern matches
  for (const { pattern, risk } of FUZZY_PATTERNS) {
    const matches = normalizedMessage.match(pattern);
    if (matches) {
      matchedPhrases.push(...matches);
      if (risk === 'high') {
        highestRiskLevel = 'high';
      } else if (risk === 'medium' && highestRiskLevel !== 'high') {
        highestRiskLevel = 'medium';
      }
    }
  }
  
  // Additional fuzzy matching for key phrases
  const keyPhrases = ['kill myself', 'end my life', 'want to die', 'commit suicide'];
  for (const phrase of keyPhrases) {
    if (fuzzyMatch(normalizedMessage, phrase)) {
      matchedPhrases.push(`${phrase} (fuzzy match)`);
      highestRiskLevel = 'high';
    }
  }
  
  // Determine if this constitutes an emergency
  const isEmergency = highestRiskLevel === 'high';
  
  return {
    isEmergency,
    riskLevel: highestRiskLevel,
    matchedPhrases: [...new Set(matchedPhrases)], // Remove duplicates
    originalMessage: message,
    normalizedMessage,
    timestamp: new Date().toISOString()
  };
}

/**
 * Logs emergency detection for monitoring
 * @param {Object} detectionResult - Result from detectEmergency
 * @param {string} userId - User identifier
 */
export async function logEmergencyDetection(detectionResult, userId) {
  try {
    // Use the comprehensive logging service
    const emergencyLogger = (await import('../services/emergencyLogger.js')).default;
    await emergencyLogger.logEmergencyDetection(detectionResult, userId);
  } catch (error) {
    // Fallback to basic logging if service fails
    console.error('Emergency logging service failed, using fallback:', error);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      detection: detectionResult,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: sessionStorage.getItem('session-id') || 'unknown'
    };
    
    console.warn('🚨 EMERGENCY DETECTION TRIGGERED (FALLBACK):', logEntry);
    
    try {
      const emergencyLogs = JSON.parse(localStorage.getItem('emergency-logs-fallback') || '[]');
      emergencyLogs.push(logEntry);
      
      if (emergencyLogs.length > 10) {
        emergencyLogs.splice(0, emergencyLogs.length - 10);
      }
      
      localStorage.setItem('emergency-logs-fallback', JSON.stringify(emergencyLogs));
    } catch (storageError) {
      console.error('Failed to store emergency log:', storageError);
    }
  }
}

/**
 * Test function to validate detection patterns
 */
export function testEmergencyDetection() {
  const testCases = [
    'I want to kill myself',
    'I want to die',
    'I\'m going to commit suicide',
    'I can\'t go on anymore',
    'Life is not worth living',
    'I\'m having a bad day', // Should not trigger
    'I feel sad', // Should not trigger
    'k1ll mys3lf', // Fuzzy match should trigger
    'su1c1de', // Fuzzy match should trigger
  ];
  
  console.log('Testing emergency detection:');
  testCases.forEach(testCase => {
    const result = detectEmergency(testCase);
    console.log(`"${testCase}": ${result.isEmergency ? '🚨 EMERGENCY' : '✅ Safe'} (${result.riskLevel})`);
  });
}
