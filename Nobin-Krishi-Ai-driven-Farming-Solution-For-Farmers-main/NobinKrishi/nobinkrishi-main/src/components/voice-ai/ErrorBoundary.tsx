import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  language?: 'bn' | 'en';
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Voice AI Error Boundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const language = this.props.language || 'en';
      
      return (
        <Card className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {language === 'bn' ? 'ভয়েস AI লোড করতে সমস্যা' : 'Voice AI Loading Error'}
            </h3>
            <p className="text-sm text-red-600 mb-4">
              {language === 'bn' 
                ? 'ভয়েস AI ফিচার লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
                : 'There was a problem loading the Voice AI features. Please try again.'}
            </p>
            <Button
              onClick={this.handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
            </Button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-red-700 cursor-pointer">
                  Technical Details (Development)
                </summary>
                <pre className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;