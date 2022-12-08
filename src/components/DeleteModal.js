import axios from 'axios';
import { Button, Modal } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi'

export default function DeleteModal({ open = false, text = '', url = null, onClose, onSubmit, onError }) {
  const [show, setShow] = useState(open);
  const [title, setTitle] = useState(text);
  const [link, setLink] = useState(url);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setShow(open);
    setTitle(text);
    setLink(url);
    setDisabled(false);
  }, [open, text, url])

  const submit = async () => {
    setDisabled(true);
    try {
      const res = await axios.delete(link);
      setDisabled(false);
      onSubmit(res);
    } catch (error) {
      onError(error);
    }
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
          <HiOutlineQuestionMarkCircle className="mx-auto mb-4 h-14 w-14 text-red-600 dark:text-red-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Anda yakin ingin menghapus data ini?
            <p className='font-bold font-xl'>{title}</p>
          </h3>
          <div className="flex justify-center gap-4">
            <Button
              color="failure"
              onClick={submit}
              disabled={disabled}
            >
              Ya, Saya Yakin
            </Button>
            <Button
              color="gray"
              onClick={onClose}
              disabled={disabled}
            >
              Tidak
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
