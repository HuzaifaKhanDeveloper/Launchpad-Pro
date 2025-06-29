import React from 'react';
import { Loader2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import GradientButton from './GradientButton';

interface LoadingStateProps {
  type: 'loading' | 'error' | 'empty' | 'success';
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const LoadingStates: React.FC<LoadingStateProps> = ({
  type,
  title,
  message,
  onRetry,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-400" />;
      case 'empty':
        return <RefreshCw className="h-12 w-12 text-gray-400" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-400" />;
      default:
        return <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />;
    }
  };

  const getDefaultContent = () => {
    switch (type) {
      case 'loading':
        return {
          title: 'Loading Token Sales...',
          message: 'Please wait while we fetch the latest token sales for you.'
        };
      case 'error':
        return {
          title: 'Failed to Load',
          message: 'Something went wrong while loading token sales. Please try again.'
        };
      case 'empty':
        return {
          title: 'No Token Sales Found',
          message: 'There are currently no token sales available. Check back later or create your own!'
        };
      case 'success':
        return {
          title: 'Success!',
          message: 'Operation completed successfully.'
        };
      default:
        return {
          title: 'Loading...',
          message: 'Please wait...'
        };
    }
  };

  const content = {
    title: title || getDefaultContent().title,
    message: message || getDefaultContent().message
  };

  return (
    <AnimatedCard direction="scale" className={`text-center py-16 ${className}`}>
      <div className="glass rounded-2xl p-12 border border-gray-700/50 max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          {getIcon()}
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-4">
          {content.title}
        </h3>
        
        <p className="text-gray-300 mb-8 leading-relaxed">
          {content.message}
        </p>
        
        {type === 'error' && onRetry && (
          <GradientButton onClick={onRetry} variant="primary">
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </GradientButton>
        )}
        
        {type === 'empty' && (
          <div className="space-y-4">
            <GradientButton onClick={() => window.location.href = '/create-sale'} variant="primary">
              <span>Create Your Sale</span>
            </GradientButton>
            <button 
              onClick={onRetry}
              className="block w-full px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};

export default LoadingStates;