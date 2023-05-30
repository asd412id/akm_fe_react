import axios from 'axios';
import { Alert, Button, Label, Modal, Select, TextInput } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil';
import { userDataAtom } from '../../recoil/atom/userAtom';
import SearchSelect from '../../components/SearchSelect';

export default function Form({ open = false, data = {}, title = 'Data Baru', onSubmit, onClose }) {
  const dataUser = useRecoilValue(userDataAtom);
  const [form, setForm] = useState(data);
  const [mapels, setMapels] = useState([]);
  const [penilais, setPenilais] = useState([]);
  const [status, setStatus] = useState({
    show: open,
    title: title,
    disabled: false,
    error: false
  })

  useEffect(() => {
    const getMapels = async () => {
      try {
        const res = await axios.get(`/mapels?search=&page=0&size=1000`);
        setMapels(res.data.datas);
      } catch (error) {
        console.log(error.response.data.message);
      }
    }
    getMapels();

    const getPenilais = async () => {
      try {
        const res = await axios.get(`/penilais?search=&page=0&size=1000`);
        setPenilais(res.data.datas);
      } catch (error) {
        console.log(error.response.data.message);
      }
    }
    if (dataUser?.role === 'OPERATOR') {
      getPenilais();
    }
  }, [open]);

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
        res = await axios.put(`/soals/${form.katid}/${form.id}`, form);
      } else {
        res = await axios.post(`/soals/${form.katid}`, form);
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
            <Label>Mata Pelajaran</Label>
            <SearchSelect value={form?.mapelId ? { id: form?.mapelId, name: mapels.filter(v => v.id === form?.mapelId).map(v => v.name) } : null} labelText='name' options={mapels} labelValue='id' placeholder='Pilih Mata Pelajaran' onChange={e => {
              form.mapelId = e.id;
              setForm({ ...form });
            }} />
          </div>
          <div className="flex flex-col">
            <Label>Nama Soal</Label>
            <TextInput name='name' value={form?.name} onChange={handleChange} disabled={status.disabled} required />
          </div>
          <div className="flex flex-col">
            <Label>Deskripsi</Label>
            <TextInput name='desc' value={form?.desc} onChange={handleChange} disabled={status.disabled} />
          </div>
          {dataUser.role === 'OPERATOR' &&
            <div className="flex flex-col">
              <Label htmlFor='ruangs'>Penilai</Label>
              <SearchSelect value={form?.userId ? { id: form?.userId, name: penilais.filter(v => v.id === form?.userId).map(v => v.name) } : null} labelText='name' options={penilais} labelValue='id' placeholder='Pilih Penilai' onChange={e => {
                form.userId = e.id;
                setForm({ ...form });
              }} />
            </div>
          }
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
