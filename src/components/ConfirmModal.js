import axios from 'axios';
import { Button, Modal } from 'flowbite-react'
import React, { useEffect, useState } from 'react'

export default function ConfirmModal({ open = false, children, accept = "Ya", reject = "Tidak", onSubmit, onClose }) {
  const [show, setShow] = useState(open);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setShow(open);
    setDisabled(false);
  }, [open]);

  const submit = () => {
    setDisabled(true);
    onSubmit();
  }

  return (
    <Modal
      show={show}
      size="md"
      popup={true}
      onClose={onClose}
    >
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <div>{children}</div>
          <div className="flex justify-center gap-4">
            <Button
              color="failure"
              onClick={submit}
              disabled={disabled}
            >
              {accept}
            </Button>
            <Button
              color="gray"
              onClick={onClose}
              disabled={disabled}
            >
              {reject}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
