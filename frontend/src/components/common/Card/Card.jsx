import React from 'react';
import './Card.css';

/**
 * Clean Content Card component
 * Avoids excessive rounded corners & unnecessary heavy shadows as specified
 */
export const Card = ({
  children,
  variant = 'default',
  interactive = false,
  onClick,
  className = '',
  ...props
}) => {
  const classes = [
    'card',
    `card-${variant}`,
    interactive ? 'card-interactive' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};
