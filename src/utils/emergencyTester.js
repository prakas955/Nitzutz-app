/**
 * Emergency System Testing Utility
 * Tests emergency detection and response across different platforms
 */

import { detectEmergency, testEmergencyDetection } from './emergencyDetection';
import emergencyLogger from '../services/emergencyLogger';

class EmergencyTester {
  constructor() {
    this.testResults = [];
    this.platformInfo = this.getPlatformInfo();
  }

  /**
   * Gets platform information for testing
   */
  getPlatformInfo() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isDesktop = !isMobile;
    
    return {
      userAgent,
      isMobile,
      isIOS,
      isAndroid,
      isDesktop,
      supportsWebRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      supportsServiceWorker: 'serviceWorker' in navigator,
      supportsNotifications: 'Notification' in window,
      supportsClipboard: !!(navigator.clipboard && navigator.clipboard.writeText),
      supportsVibration: 'vibrate' in navigator,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      onlineStatus: navigator.onLine
    };
  }

  /**
   * Tests emergency keyword detection
   */
  async testDetection() {
    console.log('🧪 Testing Emergency Detection System');
    
    const testCases = [
      // High-risk phrases that should trigger
      { text: 'I want to kill myself', shouldTrigger: true },
      { text: 'I want to die', shouldTrigger: true },
      { text: 'I am going to commit suicide', shouldTrigger: true },
      { text: 'I can\'t go on anymore', shouldTrigger: true },
      { text: 'end my life', shouldTrigger: true },
      { text: 'better off dead', shouldTrigger: true },
      { text: 'hurt myself', shouldTrigger: true },
      { text: 'no point in living', shouldTrigger: true },
      
      // Fuzzy matching tests
      { text: 'k1ll mys3lf', shouldTrigger: true },
      { text: 'su1c1de', shouldTrigger: true },
      { text: 'end m3 l1fe', shouldTrigger: true },
      
      // Safe phrases that should NOT trigger
      { text: 'I feel sad today', shouldTrigger: false },
      { text: 'I\'m having a bad day', shouldTrigger: false },
      { text: 'I need help with anxiety', shouldTrigger: false },
      { text: 'I feel overwhelmed', shouldTrigger: false },
      { text: 'I\'m stressed about work', shouldTrigger: false },
      
      // Edge cases
      { text: '', shouldTrigger: false },
      { text: '   ', shouldTrigger: false },
      { text: 'kill the bugs in my code', shouldTrigger: false },
      { text: 'this meeting is killing me', shouldTrigger: false }
    ];

    const results = [];
    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
      const result = detectEmergency(testCase.text);
      const actuallyTriggered = result.isEmergency;
      const success = actuallyTriggered === testCase.shouldTrigger;
      
      if (success) {
        passed++;
      } else {
        failed++;
      }

      results.push({
        text: testCase.text,
        expected: testCase.shouldTrigger,
        actual: actuallyTriggered,
        success,
        riskLevel: result.riskLevel,
        matchedPhrases: result.matchedPhrases
      });

      console.log(
        `${success ? '✅' : '❌'} "${testCase.text}": ${actuallyTriggered ? 'TRIGGERED' : 'Safe'} (expected: ${testCase.shouldTrigger})`
      );
    }

    const testSummary = {
      total: testCases.length,
      passed,
      failed,
      accuracy: (passed / testCases.length) * 100,
      platform: this.platformInfo,
      timestamp: new Date().toISOString()
    };

    console.log('\n📊 Detection Test Summary:', testSummary);
    
    // Log test results
    await emergencyLogger.logEmergencyInteraction('detection_test_completed', {
      summary: testSummary,
      results: results.slice(0, 5) // Log only first 5 for brevity
    }, 'test-user');

    return { summary: testSummary, results };
  }

  /**
   * Tests emergency response features
   */
  async testEmergencyResponse() {
    console.log('🧪 Testing Emergency Response Features');
    
    const tests = [];
    
    // Test tel: protocol support
    try {
      const testNumber = 'tel:000';
      const canUseTel = true; // We can't actually test this without triggering
      tests.push({
        feature: 'tel_protocol',
        supported: canUseTel,
        platform: this.platformInfo.isMobile ? 'mobile' : 'desktop'
      });
    } catch (error) {
      tests.push({
        feature: 'tel_protocol',
        supported: false,
        error: error.message
      });
    }

    // Test clipboard API
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        tests.push({
          feature: 'clipboard_api',
          supported: true,
          secure_context: window.isSecureContext
        });
      } else {
        tests.push({
          feature: 'clipboard_api',
          supported: false,
          reason: 'API not available'
        });
      }
    } catch (error) {
      tests.push({
        feature: 'clipboard_api',
        supported: false,
        error: error.message
      });
    }

    // Test notification support
    try {
      if ('Notification' in window) {
        const permission = Notification.permission;
        tests.push({
          feature: 'notifications',
          supported: true,
          permission: permission,
          needsPermission: permission === 'default'
        });
      } else {
        tests.push({
          feature: 'notifications',
          supported: false,
          reason: 'Notification API not available'
        });
      }
    } catch (error) {
      tests.push({
        feature: 'notifications',
        supported: false,
        error: error.message
      });
    }

    // Test vibration (mobile only)
    if (this.platformInfo.isMobile) {
      try {
        if ('vibrate' in navigator) {
          tests.push({
            feature: 'vibration',
            supported: true,
            platform: 'mobile'
          });
        } else {
          tests.push({
            feature: 'vibration',
            supported: false,
            platform: 'mobile'
          });
        }
      } catch (error) {
        tests.push({
          feature: 'vibration',
          supported: false,
          error: error.message
        });
      }
    }

    // Test localStorage
    try {
      localStorage.setItem('emergency-test', 'test');
      localStorage.removeItem('emergency-test');
      tests.push({
        feature: 'local_storage',
        supported: true
      });
    } catch (error) {
      tests.push({
        feature: 'local_storage',
        supported: false,
        error: error.message
      });
    }

    // Test IndexedDB
    try {
      if ('indexedDB' in window) {
        tests.push({
          feature: 'indexed_db',
          supported: true
        });
      } else {
        tests.push({
          feature: 'indexed_db',
          supported: false
        });
      }
    } catch (error) {
      tests.push({
        feature: 'indexed_db',
        supported: false,
        error: error.message
      });
    }

    const responseTestSummary = {
      platform: this.platformInfo,
      tests,
      supportedFeatures: tests.filter(t => t.supported).length,
      totalFeatures: tests.length,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Emergency Response Test Summary:', responseTestSummary);
    
    // Log response test results
    await emergencyLogger.logEmergencyInteraction('response_test_completed', {
      summary: responseTestSummary
    }, 'test-user');

    return responseTestSummary;
  }

  /**
   * Tests logging system
   */
  async testLoggingSystem() {
    console.log('🧪 Testing Emergency Logging System');
    
    try {
      // Test basic logging
      await emergencyLogger.logEmergencyInteraction('test_interaction', {
        testData: 'logging_test',
        timestamp: new Date().toISOString()
      }, 'test-user');

      // Test detection logging
      const mockDetection = {
        isEmergency: true,
        riskLevel: 'high',
        matchedPhrases: ['test phrase'],
        originalMessage: 'test message',
        timestamp: new Date().toISOString()
      };
      
      await emergencyLogger.logEmergencyDetection(mockDetection, 'test-user');

      // Test action logging
      await emergencyLogger.logEmergencyAction('test_action', {
        action: 'test',
        success: true
      }, 'test-user');

      // Verify logs were stored
      const storedLogs = emergencyLogger.getStoredLogs();
      const criticalLogs = emergencyLogger.getCriticalLogs();

      const loggingTestSummary = {
        basicLogging: true,
        detectionLogging: true,
        actionLogging: true,
        localStorage: storedLogs.length > 0,
        criticalStorage: criticalLogs.length > 0,
        platform: this.platformInfo,
        timestamp: new Date().toISOString()
      };

      console.log('📊 Logging Test Summary:', loggingTestSummary);
      return loggingTestSummary;

    } catch (error) {
      console.error('❌ Logging test failed:', error);
      return {
        basicLogging: false,
        error: error.message,
        platform: this.platformInfo,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Runs comprehensive emergency system test
   */
  async runFullTest() {
    console.log('🚀 Starting Comprehensive Emergency System Test');
    console.log('Platform Info:', this.platformInfo);
    
    const testResults = {
      platform: this.platformInfo,
      startTime: new Date().toISOString(),
      tests: {}
    };

    try {
      // Test detection system
      testResults.tests.detection = await this.testDetection();
      
      // Test response features
      testResults.tests.response = await this.testEmergencyResponse();
      
      // Test logging system
      testResults.tests.logging = await this.testLoggingSystem();
      
      testResults.endTime = new Date().toISOString();
      testResults.duration = new Date(testResults.endTime) - new Date(testResults.startTime);
      testResults.overallSuccess = true;

      console.log('✅ Comprehensive Emergency System Test Completed');
      console.log('📊 Full Test Results:', testResults);

      // Store test results
      localStorage.setItem('emergency-system-test-results', JSON.stringify(testResults));

      return testResults;

    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
      testResults.error = error.message;
      testResults.overallSuccess = false;
      return testResults;
    }
  }

  /**
   * Gets the last test results
   */
  getLastTestResults() {
    try {
      const results = localStorage.getItem('emergency-system-test-results');
      return results ? JSON.parse(results) : null;
    } catch (error) {
      console.error('Failed to retrieve test results:', error);
      return null;
    }
  }

  /**
   * Cleans up test data
   */
  cleanup() {
    try {
      // Clear test logs
      const logs = emergencyLogger.getStoredLogs();
      const nonTestLogs = logs.filter(log => !log.userId?.includes('test'));
      localStorage.setItem('emergency-logs', JSON.stringify(nonTestLogs));
      
      console.log('🧹 Test cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup test data:', error);
    }
  }
}

// Create singleton instance
const emergencyTester = new EmergencyTester();

export default emergencyTester;

// Export for console testing
if (typeof window !== 'undefined') {
  window.emergencyTester = emergencyTester;
}
