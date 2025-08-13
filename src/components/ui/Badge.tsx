import { clsx } from 'clsx';
import React from 'react';

// バッジコンポーネントの型定義
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  icon,
  dot = false,
}) => {
  // 基本的なクラス
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  // バリアント別のスタイル
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  // サイズ別のクラス
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {/* ドット表示 */}
      {dot && (
        <span className={clsx(
          'w-2 h-2 rounded-full mr-1.5',
          variant === 'primary' && 'bg-primary-500',
          variant === 'secondary' && 'bg-secondary-500',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'danger' && 'bg-red-500',
          variant === 'info' && 'bg-blue-500',
          variant === 'default' && 'bg-gray-500'
        )} />
      )}
      
      {/* アイコン */}
      {icon && !dot && (
        <span className="mr-1">
          {icon}
        </span>
      )}
      
      {/* テキスト */}
      {children}
    </span>
  );
};