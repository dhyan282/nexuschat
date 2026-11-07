import React from 'react';
export function Button({ children, className = '', variant = 'primary', ...props }: any) {
  const base = 'px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const styles: any = {
    primary: 'bg-primary text-white hover:bg-indigo-500',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800',
    danger: 'bg-danger text-white hover:bg-red-500',
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props}>{children}</button>;
}
export function Input({ className = '', ...props }: any) {
  return <input className={`w-full px-3 py-2 rounded-lg bg-card border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary ${className}`} {...props} />;
}
export function Avatar({ src, name, size = 40 }: any) {
  const initials = (name || '?').split(' ').map((s: string) => s[0]).join('').slice(0,2).toUpperCase();
  if (src) return <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return <div className="rounded-full bg-primary/30 text-primary flex items-center justify-center font-semibold" style={{ width: size, height: size }}>{initials}</div>;
}
export function Modal({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
