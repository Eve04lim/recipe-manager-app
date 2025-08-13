import { clsx } from 'clsx';
import React from 'react';

// カードコンポーネントの基本型定義
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

// カードコンポーネント本体
export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
  shadow = 'md',
}) => {
  // パディングのクラス
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  // 影のクラス
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div
      className={clsx(
        // 基本スタイル
        'bg-white rounded-lg border border-gray-200',
        // パディング
        paddingClasses[padding],
        // 影
        shadowClasses[shadow],
        // ホバーエフェクト
        hover && 'hover:shadow-lg transition-shadow duration-200 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

// カードヘッダーコンポーネント
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={clsx('border-b border-gray-200 pb-4 mb-4', className)}>
    {children}
  </div>
);

// カードフッターコンポーネント
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={clsx('border-t border-gray-200 pt-4 mt-4', className)}>
    {children}
  </div>
);