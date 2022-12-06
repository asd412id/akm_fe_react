import axios from 'axios';
import { Alert, Button, Label, Modal, Textarea, TextInput, ToggleSwitch } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil';
import DateTimePicker from '../../components/DateTimePicker';
import SelectSearch from '../../components/SelectSearch';
import { userDataAtom } from '../../recoil/atom/userAtom';

export default function Form({ open = false, data = {}, title = 'Data Baru', onSubmit, onClose }) {
  const dataUser = useRecoilValue(userDataAtom);
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
    const r = [];
    const rs = [];
    data.ruangs?.forEach((v) => {
      if (!r.includes(v.text)) {
        r.push(v.text);
        rs.push(v);
      }
    });
    data.ruangs = [...rs];
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
        res = await axios.put(`/jadwals/${form.jid}/${form.id}`, form);
      } else {
        res = await axios.post(`/jadwals/${form.jid}`, form);
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
      position='top-center'
      size='5xl'
    >
      <Modal.Header className='px-3 py-2'>
        {status.title}
      </Modal.Header>
      <form onSubmit={submit}>
        <Modal.Body className='flex flex-col gap-2'>
          {status.error && <Alert color={`failure`}>{status.error}</Alert>}
          <div className="flex flex-col md:flex-row gap-2 md:gap-5">
            <div className="flex w-full flex-col gap-2">
              <div className="flex flex-col">
                <Label htmlFor='name'>Nama Ujian</Label>
                <TextInput id='name' name='name' value={form.name} onChange={handleChange} disabled={status.disabled} />
              </div>
              <div className="flex flex-col">
                <Label htmlFor='desc'>Deskripsi</Label>
                <Textarea rows={3} id='desc' name='desc' value={form.desc} onChange={handleChange} disabled={status.disabled} />
              </div>
              <div className="flex flex-col">
                <Label htmlFor='start'>Mulai</Label>
                <DateTimePicker
                  id={'start'}
                  value={form.start}
                  onChange={v => {
                    form.start = v;
                    console.log(v);
                    setForm({ ...form });
                  }}
                  showTime={true}
                  disabled={status.disabled} />
              </div>
              <div className="flex flex-col">
                <Label htmlFor='end'>Selesai</Label>
                <DateTimePicker
                  id={'end'}
                  value={form.end}
                  onChange={v => {
                    form.end = v;
                    setForm({ ...form });
                  }}
                  showTime={true}
                  disabled={status.disabled} />
              </div>
              <div className="flex flex-col">
                <Label htmlFor='duration'>Durasi (Menit)</Label>
                <TextInput id='duration' type={'number'} name='duration' value={form.duration} onChange={handleChange} disabled={status.disabled} />
              </div>
            </div>
            <div className="flex w-full flex-col gap-2">
              <div className="flex flex-col">
                <Label htmlFor='soals'>Pilih Soal</Label>
                <SelectSearch value={form.soals} onSelect={e => {
                  form.soals = e;
                  setForm({ ...form });
                }} url={'/search/soal/' + form.jid} />
              </div>
              <div className="flex flex-col">
                <Label htmlFor='soal_count'>Jumlah Soal</Label>
                <TextInput id='soal_count' type={'number'} name='soal_count' value={form.soal_count} onChange={handleChange} disabled={status.disabled} />
              </div>
              <div className="flex flex-col">
                <Label htmlFor='ruangs'>Pilih Ruang</Label>
                <SelectSearch value={form.ruangs} onSelect={e => {
                  form.ruangs = e;
                  setForm({ ...form });
                }} url='/search/ruang' />
              </div>
              {dataUser.role === 'OPERATOR' &&
                <div className="flex flex-col">
                  <Label htmlFor='ruangs'>Pilih Penilai</Label>
                  <SelectSearch value={form.penilais} onSelect={e => {
                    form.penilais = e;
                    setForm({ ...form });
                  }} url='/search/penilai' />
                </div>
              }
              <ToggleSwitch name='shuffle' label='Acak  Soal' checked={form.shuffle} onChange={(e) => {
                form.shuffle = e;
                setForm({ ...form });
              }} />
              <ToggleSwitch name='show_score' label='Tampilkan Nilai' checked={form.show_score} onChange={(e) => {
                form.show_score = e;
                setForm({ ...form });
              }} />
              <ToggleSwitch name='active' label='Aktifkan Jadwal' checked={form.active} onChange={(e) => {
                form.active = e;
                setForm({ ...form });
              }} />
            </div>
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
