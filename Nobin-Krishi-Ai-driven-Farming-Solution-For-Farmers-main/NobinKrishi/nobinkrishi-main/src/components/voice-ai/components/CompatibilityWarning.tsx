import React, { useState } from 'react';
import { AlertTriangle, Info, X, RefreshCw, ExternalLink } from 'lucide-react';
import { useBrowserCompatibility } from '../hooks/useBrowserCompatibility';
import { CompatibilityIssue } from '../services/BrowserCompatibilityService';

interface CompatibilityWarningProps {
  language: 'bn' | 'en';
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

const CompatibilityWarning: React.FC<CompatibilityWarningProps> = ({
  language,
  onDismiss,
  showDetails = false,
  className = ''
}) => {
  const {
    compatibilityIssues,
    fallbackMode,
    browserInfo,
    isOnline,
    refreshCapabilities,
    getRecommendations
  } = useBrowserCompatibility();

  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter issues by severity
  const errorIssues = compatibilityIssues.filter(issue => issue.type === 'error');
  const warningIssues = compatibilityIssues.filter(issue => issue.type === 'warning');
  const infoIssues = compatibilityIssues.filter(issue => issue.type === 'info');

  // Don't show if no issues
  if (compatibilityIssues.length === 0) {
    return null;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCapabilities();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getIssueIcon = (type: CompatibilityIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getIssueColor = (type: CompatibilityIssue['type']) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getFallbackModeText = () => {
    const texts = {
      bn: {
        'text-only': 'শুধুমাত্র টেক্সট মোড',
        'speech-output-only': 'শুধুমাত্র ভয়েস আউটপুট',
        'speech-input-only': 'শুধুমাত্র ভয়েস ইনপুট',
        'full-voice': 'সম্পূর্ণ ভয়েস সাপোর্ট'
      },
      en: {
        'text-only': 'Text-only mode',
        'speech-output-only': 'Speech output only',
        'speech-input-only': 'Speech input only',
        'full-voice': 'Full voice support'
      }
    };
    return texts[language][fallbackMode];
  };

  const translations = {
    bn: {
      title: 'ব্রাউজার সামঞ্জস্য সতর্কতা',
      currentMode: 'বর্তমান মোড',
      browser: 'ব্রাউজার',
      issues: 'সমস্যাসমূহ',
      recommendations: 'সুপারিশ',
      fallback: 'বিকল্প',
      refresh: 'রিফ্রেশ করুন',
      showDetails: 'বিস্তারিত দেখুন',
      hideDetails: 'বিস্তারিত লুকান',
      offline: 'অফলাইন',
      noRecommendations: 'কোনো সুপারিশ নেই'
    },
    en: {
      title: 'Browser Compatibility Warning',
      currentMode: 'Current Mode',
      browser: 'Browser',
      issues: 'Issues',
      recommendations: 'Recommendations',
      fallback: 'Fallback',
      refresh: 'Refresh',
      showDetails: 'Show Details',
      hideDetails: 'Hide Details',
      offline: 'Offline',
      noRecommendations: 'No recommendations'
    }
  };

  const t = translations[language];

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getIssueColor(errorIssues.length > 0 ? 'error' : warningIssues.length > 0 ? 'warning' : 'info')} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getIssueIcon(errorIssues.length > 0 ? 'error' : warningIssues.length > 0 ? 'warning' : 'info')}
          <h3 className="font-medium text-sm">{t.title}</h3>
          {!isOnline && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
              {t.offline}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={t.refresh}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{t.currentMode}:</span>
          <span className="font-medium">{getFallbackModeText()}</span>
        </div>
        {browserInfo && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{t.browser}:</span>
            <span className="font-medium">
              {browserInfo.name} {browserInfo.version}
              {browserInfo.mobile && ' (Mobile)'}
            </span>
          </div>
        )}
      </div>

      {/* Quick Summary */}
      {!isExpanded && compatibilityIssues.length > 0 && (
        <div className="mb-2">
          <p className="text-sm text-gray-700">
            {errorIssues.length > 0 && (
              <span className="text-red-600">
                {errorIssues.length} error{errorIssues.length > 1 ? 's' : ''}
              </span>
            )}
            {errorIssues.length > 0 && warningIssues.length > 0 && ', '}
            {warningIssues.length > 0 && (
              <span className="text-yellow-600">
                {warningIssues.length} warning{warningIssues.length > 1 ? 's' : ''}
              </span>
            )}
            {(errorIssues.length > 0 || warningIssues.length > 0) && infoIssues.length > 0 && ', '}
            {infoIssues.length > 0 && (
              <span className="text-blue-600">
                {infoIssues.length} info
              </span>
            )}
          </p>
        </div>
      )}

      {/* Toggle Details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-blue-600 hover:text-blue-800 underline mb-2"
      >
        {isExpanded ? t.hideDetails : t.showDetails}
      </button>

      {/* Detailed Issues */}
      {isExpanded && (
        <div className="space-y-3">
          {/* Issues List */}
          {compatibilityIssues.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">{t.issues}:</h4>
              <div className="space-y-2">
                {compatibilityIssues.map((issue, index) => (
                  <div key={index} className="flex gap-2 text-sm">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <p className="font-medium">{issue.feature}</p>
                      <p className="text-gray-600">{issue.message}</p>
                      {issue.fallback && (
                        <p className="text-gray-500 text-xs">
                          {t.fallback}: {issue.fallback}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {(() => {
            const recommendations = getRecommendations();
            return recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">{t.recommendations}:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {/* Browser-specific help links */}
          {browserInfo && (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ExternalLink className="w-3 h-3" />
                <span>
                  {language === 'bn' 
                    ? 'আরও সাহায্যের জন্য আপনার ব্রাউজারের সেটিংস চেক করুন'
                    : 'Check your browser settings for more help'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompatibilityWarning;