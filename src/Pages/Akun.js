import axios from 'axios'
import { Button, Label, Spinner, Textarea, TextInput } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil';
import Auth from '../layouts/Auth';
import { userDataAtom } from '../recoil/atom/userAtom';

export default function Akun() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true);
  const [notifSuccess, setNotifSuccess] = useState(null);
  const [loaded, setLoaded] = useState(false)
  const [_, setUserData] = useRecoilState(userDataAtom);

  useEffect(() => {
    axios.get('/check')
      .then(res => {
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
    let key, value;
    key = e.target.name;
    value = e.target.value;
    newData[key] = value;
    setData({ ...data, newData });
  }

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.put('/account', data)
      .then(res => {
        setNotifSuccess(res.data.message);
        setUserData(res.data.data);
        const resData = data;
        resData['password'] = '';
        resData['confirm_password'] = '';
        setData({ ...data, resData });
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
    <Auth title={`Pengaturan Akun`} success={notifSuccess} error={error}>
      {!loaded && <div className="flex inset-0 justify-center h-60 items-center">
        <Spinner size={`xl`} />
      </div>}
      {loaded && <form onSubmit={submit} className='flex flex-col gap-2 bg-white rounded-lg shadow p-5'>
        <div className="flex flex-col gap-1">
          <Label>Nama</Label>
          <TextInput type={`text`} value={data?.name} name='name' onChange={handleChange} disabled={loading} required />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Alamat Email</Label>
          <TextInput type={`email`} value={data?.email} name='email' onChange={handleChange} disabled={loading} required />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Password</Label>
          <TextInput type={`password`} value={data?.password} name='password' onChange={handleChange} disabled={loading} />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Ulang Password</Label>
          <TextInput type={`password`} value={data?.confirm_password} name='confirm_password' onChange={handleChange} disabled={loading} />
        </div>
        <div className="flex flex-col gap-1">
          <Button type='submit' disabled={loading}>{loading ? 'MEMPROSES ...' : 'SIMPAN'}</Button>
        </div>
      </form>}
    </Auth>
  )
}
