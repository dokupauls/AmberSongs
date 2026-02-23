import React from 'react';

export default function Card({ title, subtitle, children }) {
  return (
    <div className="card">
      {title    && <div className="card-title">{title}</div>}
      {subtitle && <div className="card-sub">{subtitle}</div>}
      {children}
    </div>
  );
}
