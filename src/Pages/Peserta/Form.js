import axios from 'axios';
import { Alert, Button, Label, Modal, Select, TextInput } from 'flowbite-react'
import React, { useEffect, useState } from 'react'

export default function Form({ open = false, data = {}, title = 'Data Baru', onSubmit, onClose }) {
  const [form, setForm] = useState(data);
  const [status, setStatus] = useState({
    show: open,
    title: title,
    disabled: false,
    error: false
  })

  useEffect(() => {
    status.show = open;
    status.title = title;
    status.disabled = false;
    status.error = false;
    setStatus({ ...status });
    setForm(data);
  }, [open, title, data]);

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    form[name] = value;
    setForm({ ...form });
  }

  const submit = async (e) => {
    e.preventDefault();
    status.disabled = true;
    status.error = null;
    setStatus({ ...status });
    try {
      let res;
      if (form.id) {
        res = await axios.put(`/pesertas/${form.id}`, form);
      } else {
        res = await axios.post(`/pesertas`, form);
      }
      onSubmit(res);
    } catch (error) {
      status.error = error.response.data.message;
      status.disabled = false;
      setStatus({ ...status });
    }
  }
  return (
    <Modal
      show={status.show}
      onClose={onClose}
      size='md'
    >
      <Modal.Header className='px-3 py-2'>
        {status.title}
      </Modal.Header>
      <form onSubmit={submit}>
        <Modal.Body className='flex flex-col gap-2'>
          {status.error && <Alert color={`failure`}>{status.error}</Alert>}
          <div className="flex flex-col">
            <Label>Nama</Label>
            <TextInput name='name' value={form?.name} onChange={handleChange} disabled={status.disabled} required />
          </div>
          <div className="flex flex-col">
            <Label>Username</Label>
            <TextInput type='text' name='username' value={form?.username} onChange={handleChange} disabled={status.disabled} required />
          </div>
          <div className="flex flex-col">
            <Label>Password</Label>
            <TextInput type='password' name='password' value={form?.password} onChange={handleChange} disabled={status.disabled} required={form?.id === null} />
          </div>
          <div className="flex flex-col">
            <Label>Jenis Kelamin</Label>
            <Select name='jk' value={form?.jk} onChange={handleChange} disabled={status.disabled}>
              <option value="L">Laki-Laki</option>
              <option value="P">Perempuan</option>
            </Select>
          </div>
          <div className="flex flex-col">
            <Label>Ruang</Label>
            <TextInput type='text' name='ruang' value={form?.ruang} onChange={handleChange} disabled={status.disabled} />
          </div>
        </Modal.Body>
        <Modal.Footer className='flex justify-end px-3 py-2'>
          <Button
            type='submit' disabled={status.disabled}>
            SIMPAN
          </Button>
          <Button
            color="gray"
            type='button'
            onClick={onClose}
            disabled={status.disabled}
          >
            BATAL
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
