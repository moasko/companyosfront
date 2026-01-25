import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
  count = 1,
}) => {
  const baseStyles = 'animate-pulse bg-slate-200 rounded-sm';
  const variantStyles = {
    text: 'h-3 w-full mb-2',
    rect: 'w-full',
    circle: 'rounded-full',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseStyles} ${variantStyles[variant]} ${className}`}
          style={style}
        />
      ))}
    </>
  );
};

export const TableRowSkeleton: React.FC<{ columns: number }> = ({ columns }) => (
  <div className="flex gap-4 p-4 items-center border-b border-slate-50">
    {Array.from({ length: columns }).map((_, i) => (
      <div
        key={i}
        className={`flex-1 h-4 bg-slate-100 animate-pulse rounded-sm ${i === 0 ? 'flex-[2]' : ''}`}
      />
    ))}
  </div>
);

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Skeleton height={120} count={4} className="rounded-sm" />
  </div>
);
