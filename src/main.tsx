import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryErrorBoundary, QueryProvider } from './providers/QueryProvider';

// サービスワーカーの登録（PWA化への準備）
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// アプリケーションの初期化
const initializeApp = async () => {
  try {
    console.log('🚀 レシピ管理アプリを初期化中...');
    
    // IndexedDBが利用可能かチェック
    if (!('indexedDB' in window)) {
      throw new Error('このブラウザはIndexedDBをサポートしていません。');
    }
    console.log('✅ IndexedDB サポート確認済み');

    // データベースの初期化テスト
    console.log('🔍 データベース接続をテスト中...');
    const testDB = indexedDB.open('RecipeManagerDBTest', 1);
    
    await new Promise((resolve, reject) => {
      testDB.onsuccess = () => {
        console.log('✅ データベース接続テスト成功');
        testDB.result.close();
        // テスト用DBを削除
        indexedDB.deleteDatabase('RecipeManagerDBTest');
        resolve(true);
      };
      testDB.onerror = () => {
        console.error('❌ データベース接続テスト失敗');
        reject(new Error('IndexedDBへのアクセスが拒否されました。'));
      };
      testDB.onblocked = () => {
        console.warn('⚠️ データベースアクセスがブロックされました');
        reject(new Error('データベースアクセスがブロックされています。'));
      };
    });

    console.log('✅ レシピ管理アプリを初期化しました');
    console.log('📊 データベース: IndexedDB');
    console.log('⚡ キャッシュ: React Query');
    
  } catch (error) {
    console.error('❌ アプリケーションの初期化に失敗:', error);
    
    // ユーザーに分かりやすいエラーメッセージを表示
    if (error instanceof Error) {
      if (error.message.includes('IndexedDB')) {
        alert('データベースの初期化に失敗しました。ブラウザのプライベートモードを無効にするか、別のブラウザをお試しください。');
      } else {
        alert(`アプリの初期化に失敗しました: ${error.message}`);
      }
    }
    
    throw error;
  }
};

// アプリの起動
const startApp = () => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <QueryErrorBoundary>
        <QueryProvider>
          <App />
        </QueryProvider>
      </QueryErrorBoundary>
    </React.StrictMode>
  );
};

// 初期化してアプリを開始
initializeApp().then(startApp);

// 開発環境でのホットリロード対応
if (process.env.NODE_ENV === 'development') {
  // React Query Devtools の情報
  console.log('🔧 React Query Devtools が利用可能です');
  console.log('💡 F12 でデベロッパーツールを開き、左下のボタンから確認できます');
  
  // パフォーマンス測定
  if ('performance' in window && 'mark' in performance) {
    performance.mark('app-start');
  }
}

// グローバルエラーハンドラー
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  
  // エラー情報を保存（デバッグ用）
  try {
    const errorInfo = {
      message: event.error?.message || event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    
    localStorage.setItem('lastGlobalError', JSON.stringify(errorInfo));
  } catch (e) {
    console.warn('Failed to save error info:', e);
  }
});

// 未処理のPromise拒否をキャッチ
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // React Queryのエラーは既にハンドリングされているので、
  // それ以外のPromise拒否のみログ出力
  if (event.reason && !event.reason.name?.includes('Query')) {
    try {
      const errorInfo = {
        reason: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };
      
      localStorage.setItem('lastPromiseRejection', JSON.stringify(errorInfo));
    } catch (e) {
      console.warn('Failed to save promise rejection info:', e);
    }
  }
});

// アプリケーション終了時のクリーンアップ
window.addEventListener('beforeunload', () => {
  // パフォーマンス測定の終了
  if (process.env.NODE_ENV === 'development' && 'performance' in window) {
    try {
      performance.mark('app-end');
      performance.measure('app-lifetime', 'app-start', 'app-end');
      const measures = performance.getEntriesByType('measure');
      const appLifetime = measures.find(m => m.name === 'app-lifetime');
      if (appLifetime) {
        console.log(`📊 アプリケーション実行時間: ${Math.round(appLifetime.duration)}ms`);
      }
    } catch (e) {
      // パフォーマンス測定エラーは無視
    }
  }
});