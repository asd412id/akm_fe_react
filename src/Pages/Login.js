import axios from 'axios';
import { Alert, Button, Label, TextInput } from 'flowbite-react'
import React, { useState } from 'react'

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  document.title = 'Selamat Datang - ' + (process.env.REACT_APP_APPNAME || 'UjianQ');;

  const handleChange = (e) => {
    formData[e.target.name] = e.target.value;
    setFormData({ ...formData });
  }

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post('/login', formData)
      .then(res => {
        window.location.reload();
      })
      .catch(err => {
        setError(err.response.data.message);
        setLoading(false);
      })
  }

  return (
    <div className="flex w-full min-h-screen justify-center items-center bg-gray-100">
      <form onSubmit={submit} className="flex flex-col gap-4 w-full max-w-md bg-white rounded-md shadow p-5">
        {error && <Alert color={`failure`}>{error}</Alert>}
        <div>
          <div className="mb-2 block">
            <Label
              htmlFor="username"
              value="Alamat Email/ID Peserta"
            />
          </div>
          <TextInput
            id="username"
            type="text"
            name='username'
            value={formData.username}
            placeholder="Masukkan alamat email atau ID Peserta"
            required={true}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label
              htmlFor="password1"
              value="Password"
            />
          </div>
          <TextInput
            id="password1"
            type="password"
            name='password'
            placeholder='******************'
            value={formData.password}
            required={true}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          Masuk
        </Button>
      </form>
    </div>
  )
}
