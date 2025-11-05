/**
 * Emergency Logging Service
 * Handles logging and monitoring of emergency events for safety oversight
 */

class EmergencyLogger {
  constructor() {
    this.logQueue = [];
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Logs an emergency detection event
   * @param {Object} detectionResult - Result from emergency detection
   * @param {string} userId - User identifier
   * @param {Object} additionalContext - Additional context information
   */
  async logEmergencyDetection(detectionResult, userId, additionalContext = {}) {
    const logEntry = {
      type: 'EMERGENCY_DETECTION',
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      sessionId: this.getSessionId(),
      detection: {
        isEmergency: detectionResult.isEmergency,
        riskLevel: detectionResult.riskLevel,
        matchedPhrases: detectionResult.matchedPhrases,
        originalMessage: detectionResult.originalMessage,
        normalizedMessage: detectionResult.normalizedMessage,
        detectionTimestamp: detectionResult.timestamp
      },
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        ...additionalContext
      },
      severity: 'CRITICAL',
      requiresImmedateAttention: true
    };

    await this.processLogEntry(logEntry);
  }

  /**
   * Logs an emergency action taken (e.g., call initiated, modal shown)
   * @param {string} action - Action taken
   * @param {Object} details - Action details
   * @param {string} userId - User identifier
   */
  async logEmergencyAction(action, details, userId) {
    const logEntry = {
      type: 'EMERGENCY_ACTION',
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      sessionId: this.getSessionId(),
      action: action,
      details: details,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      },
      severity: 'HIGH'
    };

    await this.processLogEntry(logEntry);
  }

  /**
   * Logs user interaction with emergency features
   * @param {string} interaction - Type of interaction
   * @param {Object} details - Interaction details
   * @param {string} userId - User identifier
   */
  async logEmergencyInteraction(interaction, details, userId) {
    const logEntry = {
      type: 'EMERGENCY_INTERACTION',
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      sessionId: this.getSessionId(),
      interaction: interaction,
      details: details,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      severity: 'MEDIUM'
    };

    await this.processLogEntry(logEntry);
  }

  /**
   * Processes a log entry through multiple channels
   * @param {Object} logEntry - Log entry to process
   */
  async processLogEntry(logEntry) {
    // Immediate console logging for development
    console.warn(`🚨 EMERGENCY LOG [${logEntry.type}]:`, logEntry);

    // Store in localStorage for persistence
    this.storeLocally(logEntry);

    // Add to queue for backend transmission
    this.logQueue.push(logEntry);

    // Attempt to send to backend
    await this.sendToBackend(logEntry);

    // For critical events, also attempt alternative channels
    if (logEntry.severity === 'CRITICAL') {
      await this.sendToCriticalChannels(logEntry);
    }
  }

  /**
   * Stores log entry in localStorage
   * @param {Object} logEntry - Log entry to store
   */
  storeLocally(logEntry) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('emergency-logs') || '[]');
      existingLogs.push(logEntry);

      // Keep only last 50 logs to prevent storage bloat
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }

      localStorage.setItem('emergency-logs', JSON.stringify(existingLogs));
      
      // Also store in a separate critical logs storage
      if (logEntry.severity === 'CRITICAL') {
        const criticalLogs = JSON.parse(localStorage.getItem('critical-emergency-logs') || '[]');
        criticalLogs.push(logEntry);
        
        if (criticalLogs.length > 20) {
          criticalLogs.splice(0, criticalLogs.length - 20);
        }
        
        localStorage.setItem('critical-emergency-logs', JSON.stringify(criticalLogs));
      }
    } catch (error) {
      console.error('Failed to store emergency log locally:', error);
    }
  }

  /**
   * Sends log entry to backend service
   * @param {Object} logEntry - Log entry to send
   * @param {number} retryCount - Current retry count
   */
  async sendToBackend(logEntry, retryCount = 0) {
    try {
      // TODO: Replace with actual backend endpoint
      const response = await fetch('/api/emergency-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Emergency-Log': 'true'
        },
        body: JSON.stringify(logEntry)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Emergency log sent to backend successfully');
    } catch (error) {
      console.error('Failed to send emergency log to backend:', error);

      // Retry logic for critical events
      if (logEntry.severity === 'CRITICAL' && retryCount < this.maxRetries) {
        setTimeout(() => {
          this.sendToBackend(logEntry, retryCount + 1);
        }, this.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      }
    }
  }

  /**
   * Sends critical events to alternative monitoring channels
   * @param {Object} logEntry - Critical log entry
   */
  async sendToCriticalChannels(logEntry) {
    // Store in IndexedDB for better persistence
    await this.storeInIndexedDB(logEntry);

    // Attempt to send to monitoring services
    await this.sendToMonitoringServices(logEntry);
  }

  /**
   * Stores critical logs in IndexedDB
   * @param {Object} logEntry - Log entry to store
   */
  async storeInIndexedDB(logEntry) {
    try {
      if (!window.indexedDB) return;

      const request = indexedDB.open('EmergencyLogs', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('logs')) {
          const objectStore = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('severity', 'severity', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['logs'], 'readwrite');
        const objectStore = transaction.objectStore('logs');
        
        objectStore.add({
          ...logEntry,
          id: Date.now() + Math.random()
        });
      };
    } catch (error) {
      console.error('Failed to store in IndexedDB:', error);
    }
  }

  /**
   * Sends to external monitoring services
   * @param {Object} logEntry - Log entry to send
   */
  async sendToMonitoringServices(logEntry) {
    // Example: Send to error tracking services like Sentry
    try {
      if (window.Sentry) {
        window.Sentry.captureException(new Error('Emergency Detection Triggered'), {
          tags: {
            type: 'emergency_detection',
            severity: logEntry.severity
          },
          extra: logEntry
        });
      }
    } catch (error) {
      console.error('Failed to send to monitoring services:', error);
    }
  }

  /**
   * Gets or creates a session ID
   * @returns {string} Session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('emergency-session-id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('emergency-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Retrieves emergency logs from localStorage
   * @returns {Array} Array of emergency logs
   */
  getStoredLogs() {
    try {
      return JSON.parse(localStorage.getItem('emergency-logs') || '[]');
    } catch (error) {
      console.error('Failed to retrieve stored logs:', error);
      return [];
    }
  }

  /**
   * Retrieves critical emergency logs
   * @returns {Array} Array of critical emergency logs
   */
  getCriticalLogs() {
    try {
      return JSON.parse(localStorage.getItem('critical-emergency-logs') || '[]');
    } catch (error) {
      console.error('Failed to retrieve critical logs:', error);
      return [];
    }
  }

  /**
   * Clears old logs (for maintenance)
   * @param {number} daysToKeep - Number of days of logs to keep
   */
  clearOldLogs(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const logs = this.getStoredLogs();
      const filteredLogs = logs.filter(log => new Date(log.timestamp) > cutoffDate);
      
      localStorage.setItem('emergency-logs', JSON.stringify(filteredLogs));
      
      console.log(`Cleared ${logs.length - filteredLogs.length} old emergency logs`);
    } catch (error) {
      console.error('Failed to clear old logs:', error);
    }
  }

  /**
   * Exports emergency logs for analysis
   * @returns {Object} Exported logs data
   */
  exportLogs() {
    return {
      regularLogs: this.getStoredLogs(),
      criticalLogs: this.getCriticalLogs(),
      exportTimestamp: new Date().toISOString(),
      sessionId: this.getSessionId()
    };
  }
}

// Create singleton instance
const emergencyLogger = new EmergencyLogger();

export default emergencyLogger;
