import { Icon } from "@stellar/design-system";

interface IModal {
  title: string;
  closeModal: () => void;
  children: React.ReactNode;
}

function Modal({ title, closeModal, children }: IModal) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 shadow-lg"
      data-test="modal-container"
      onClick={closeModal}
    >
      <div
        className="relative w-11/12 max-w-lg rounded-lg bg-white shadow"
        data-test="modal-outside-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t p-4 md:p-5">
          <h3
            className="text-lg font-semibold text-gray-900"
            data-test="modal-title"
          >
            {title}
          </h3>
          <button
            type="button"
            className="end-2.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
            data-test="modal-btn-close"
            onClick={closeModal}
          >
            <Icon.XClose className="h-5 w-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
