import React from 'react';
import './Button.css';

/**
 * Reusable Button Component following modern 2026 UI rules
 * @param {string} variant - 'primary' | 'secondary' | 'accent' | 'outline' | 'text'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - spans 100% width
 * @param {boolean} disabled - disabled state
 * @param {React.ReactNode} leftIcon - icon element
 * @param {React.ReactNode} rightIcon - icon element
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {leftIcon && <span className="btn-icon left">{leftIcon}</span>}
      <span className="btn-text">{children}</span>
      {rightIcon && <span className="btn-icon right">{rightIcon}</span>}
    </button>
  );
};
