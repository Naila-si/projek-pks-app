// src/components/common/Card.jsx
export default function Card({
  children,
  title,
  subtitle,
  actions,
  className = '',
  noPadding = false,
  onClick
}) {
  const cardStyles = `bg-white border border-slate-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-smooth ${
    onClick ? 'cursor-pointer hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:border-slate-200' : ''
  } ${className}`;

  return (
    <div className={cardStyles} onClick={onClick}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            {title && <h3 className="font-bold text-slate-800 text-base lg:text-lg">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
}
