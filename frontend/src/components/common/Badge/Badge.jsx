import React from 'react';
import './Badge.css';

/**
 * Reusable Badge / Tag Component
 * @param {string} variant - 'indigo' | 'emerald' | 'amber' | 'coral' | 'lime' | 'slate'
 * @param {string} size - 'sm' | 'md'
 */
export const Badge = ({
  children,
  variant = 'indigo',
  size = 'md',
  className = '',
  icon,
  ...props
}) => {
  const classes = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {icon && <span className="badge-icon">{icon}</span>}
      <span className="badge-label">{children}</span>
    </span>
  );
};
