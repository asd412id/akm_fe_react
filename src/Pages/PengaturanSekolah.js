import axios from 'axios'
import { Button, Label, Spinner, Textarea, TextInput } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { MdCloudUpload } from 'react-icons/md';
import Auth from '../layouts/Auth'

export default function PengaturanSekolah() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true);
  const [notifSuccess, setNotifSuccess] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [kopPreview, setKopPreview] = useState(null);
  const [file, setFile] = useState(null);
  const inputFile = useRef(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get('/sekolah');
        setData(res.data);
        setKopPreview(res.data?.opt?.kop);
        setLoading(false);
        setLoaded(true);
      } catch (error) {
        setError(error.response.data.message)
        setLoading(false);
      }

    }
    getData();
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

  const handleImage = (e) => {
    if (e.target.files.length) {
      const img = e.target.files[0];
      if (img.size <= 2 * 1024 * 1024) {
        setKopPreview(URL.createObjectURL(img));
        setFile(img);
      } else {
        setError('Ukuran file kop tidak boleh lebih dari 2MB');
        setTimeout(() => {
          setError(null);
        }, 3000);
        setFile(null);
      }
    }
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    Object.keys(data).forEach(k => {
      let dta = data[k];
      if (k === 'opt') {
        dta = JSON.stringify(dta);
      }
      formData.append(k, dta);
    });
    formData.append('kop', file);
    try {
      const res = await axios.post('/sekolah', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setNotifSuccess(res.data.message);
      setTimeout(() => {
        setNotifSuccess(null);
      }, 3000);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.message)
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
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
          <Label>KOP Sekolah</Label>
          <div>
            <Button type='button' size={'sm'} color='success' onClick={() => inputFile.current.click()}><MdCloudUpload className='h-5 w-5 mr-2' />Upload KOP</Button>
          </div>
          {kopPreview &&
            <div>
              <img src={kopPreview} alt="" className='w-full max-w-xl my-1' />
            </div>
          }
          <input type="file" ref={inputFile} className='hidden' onChange={handleImage} accept='.jpg,.jpeg,.png' />
        </div>
        <div className="flex gap-1 justify-end">
          <Button type='submit' disabled={loading}>{loading ? 'MEMPROSES ...' : 'SIMPAN PENGATURAN'}</Button>
        </div>
      </form>}
    </Auth>
  )
}
