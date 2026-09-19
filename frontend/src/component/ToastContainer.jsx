import { MdCheckCircle, MdErrorOutline, MdInfoOutline } from 'react-icons/md';

const ICONS = {
  success: <MdCheckCircle size={19} />,
  error: <MdErrorOutline size={19} />,
  info: <MdInfoOutline size={19} />,
};

export default function ToastContainer({ toasts }) {
  if (!toasts?.length) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast-msg ${t.type}`}>
          <span className="t-ico">{ICONS[t.type] || ICONS.info}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
