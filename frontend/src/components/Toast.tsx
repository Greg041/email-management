import React, { useEffect } from "react";
import { useApp } from "../contexts/AppContext";

const Toast: React.FC = () => {
  const { toast, setToast } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast, setToast]);

  return (
    <>
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded shadow-lg text-white flex items-center space-x-3 transition-all
        ${toast?.type === "success" ? "bg-green-500" : "bg-red-500"}
      `}
          role="alert"
        >
          <span>{toast?.message}</span>
          {/* <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200 font-bold"
            aria-label="Close"
          >
            ×
          </button> */}
        </div>
      )}
    </>
  );
};

export default Toast;
