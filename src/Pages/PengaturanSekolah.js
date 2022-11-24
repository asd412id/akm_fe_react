import axios from 'axios'
import { Button, Label, Spinner, Textarea, TextInput } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import Auth from '../layouts/Auth'

export default function PengaturanSekolah() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true);
  const [notifSuccess, setNotifSuccess] = useState(null);
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    axios.get('/sekolah')
      .then(res => {
        res.data.opt = JSON.parse(res.data.opt);
        setData(res.data);
        setLoading(false);
        setLoaded(true);
      })
      .catch(err => {
        setError(err.response.data.message)
        setLoading(false);
      })
  }, [])

  const handleChange = (e) => {
    const newData = data;
    let key, value, akey;

    if (e.target.name.startsWith('opt.')) {
      key = 'opt';
      akey = e.target.name.split('.')[1];
      value = {};
      value[akey] = e.target.value;
    } else {
      key = e.target.name;
      value = e.target.value;
    }
    newData[key] = value;
    setData({ ...data, ...newData });
  }

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.put('/sekolah', data)
      .then(res => {
        setNotifSuccess(res.data.message);
        setTimeout(() => {
          setNotifSuccess(null);
        }, 3000);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setError(err.response.data.message)
        setTimeout(() => {
          setError(null);
        }, 3000);
      })
  }

  return (
    <Auth title={`Pengaturan Sekolah`} success={notifSuccess} error={error}>
      {!loaded && <div className="flex inset-0 justify-center h-60 items-center">
        <Spinner size={`xl`} />
      </div>}
      {loaded && <form onSubmit={submit} className='flex flex-col gap-2 bg-white rounded-lg shadow p-5'>
        <div className="flex flex-col gap-1">
          <Label>Nama Sekolah</Label>
          <TextInput type={`text`} value={data?.name} name='name' onChange={handleChange} disabled={loading} />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Alamat</Label>
          <Textarea rows={5} value={data?.opt?.address} name='opt.address' onChange={handleChange} disabled={loading} />
        </div>
        <div className="flex flex-col gap-1">
          <Button type='submit' disabled={loading}>{loading ? 'MEMPROSES ...' : 'SIMPAN'}</Button>
        </div>
      </form>}
    </Auth>
  )
}
