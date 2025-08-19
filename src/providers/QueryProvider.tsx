import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';
import { cacheUtils, debugUtils, queryClient } from '../lib/queryClient';

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const [showDevtools, setShowDevtools] = useState(false);

  // 開発環境でのデバッグ機能
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // グローバルに便利な関数を公開（開発時のみ）
      ((window as unknown) as Record<string, unknown>).recipeDebug = {
        queryClient,
        cacheUtils,
        debugUtils,
        showDevtools: () => setShowDevtools(true),
        hideDevtools: () => setShowDevtools(false),
        clearCache: () => queryClient.clear(),
        getCacheInfo: cacheUtils.getCacheInfo,
      };
      
      console.log('🔧 Recipe Debug Tools Available:', {
        'window.recipeDebug.getCacheInfo()': 'キャッシュ情報を表示',
        'window.recipeDebug.debugUtils.logAllQueries()': '全クエリ状態をログ出力',
        'window.recipeDebug.clearCache()': 'キャッシュをクリア',
        'window.recipeDebug.showDevtools()': 'React Query Devtoolsを表示',
      });
    }

    // クリーンアップ
    return () => {
      if (process.env.NODE_ENV === 'development') {
        delete ((window as unknown) as Record<string, unknown>).recipeDebug;
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 開発環境でのみReact Query Devtoolsを表示 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={showDevtools} 
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
};

// エラーバウンダリー用のコンポーネント
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class QueryErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Query Error Boundary caught an error:', error, errorInfo);
    
    // エラー情報をローカルストレージに保存（デバッグ用）
    try {
      const errorLog = {
        error: error.message,
        stack: error.stack,
        errorInfo,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
      
      localStorage.setItem('lastError', JSON.stringify(errorLog));
    } catch (e) {
      console.warn('Failed to save error log:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  アプリケーションエラー
                </h3>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              予期しないエラーが発生しました。ページを再読み込みしてください。
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  エラー詳細（開発モード）
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                ページを再読み込み
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                再試行
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// React Query用のエラーフォールバックコンポーネント
export const QueryErrorFallback: React.FC<{ error: Error }> = ({ error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            データの読み込みに失敗しました
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message || '予期しないエラーが発生しました'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    </div>
  );
};