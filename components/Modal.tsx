import { ReactNode } from 'react';

interface ModalProps {
    title: string;
    children?: ReactNode;
    onClose: () => void;
  }

  const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full lg:w-[95vw] mx-4 overflow-hidden">
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
            &times;
          </button>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
  
  export default Modal;
