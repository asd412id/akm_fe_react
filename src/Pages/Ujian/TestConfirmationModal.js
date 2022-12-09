import axios from 'axios';
import { Button, Modal } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi'
import { useRecoilState } from 'recoil';
import { DataUjian } from '../../recoil/atom/DataUjian';

export default function TestConfirmationModal({ open = false, children, jid, onClose, onSubmit, onError }) {
  const [show, setShow] = useState(open);
  const [id, setId] = useState(jid)
  const [disabled, setDisabled] = useState(false);
  const [dataUjian, setDataUjian] = useRecoilState(DataUjian);

  useEffect(() => {
    setShow(open);
    setId(jid);
    setDisabled(false);
  }, [open, jid]);

  const submit = async () => {
    setDisabled(true);
    try {
      const res = await axios.post('/ujian/tes', { id: id });
      setDataUjian(res.data);
      onSubmit();
    } catch (error) {
      onError(error?.response?.data?.message ? error.response.data.message : 'Tidak dapat melanjutkan ujian');
      onClose();
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
          {children}
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
