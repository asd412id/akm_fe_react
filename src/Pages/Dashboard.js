import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { GiGraduateCap } from 'react-icons/gi'
import { HiUserGroup } from 'react-icons/hi'
import { ImBooks } from 'react-icons/im'
import { MdLibraryBooks, MdSchedule } from 'react-icons/md'
import Auth from '../layouts/Auth'

export default function Dashboard() {
  const [error, setError] = useState(null)
  const [status, setStatus] = useState({
    mapel: '...',
    penilai: '...',
    peserta: '...',
    soal: '...',
    jadwal: '...'
  });

  useEffect(() => {
    getStatus();
  }, []);

  const getStatus = async () => {
    try {
      const res = await axios.get('/sekolah/status');
      setStatus({ ...res.data });
    } catch (error) {
      setError(error.response?.data.message ?? 'Tidak dapat memuat status');
    }
  }

  return (
    <Auth title='Beranda' error={error}>
      <div class="grid grid-flow-row md:grid-cols-4 gap-3">
        <div>
          <div class="inline-flex mb-4 overflow-hidden bg-white rounded-lg shadow-md w-full">
            <div className="flex items-center justify-center w-20 bg-green-500">
              <ImBooks className='w-16 h-16 fill-white' />
            </div>

            <div class="p-4 -mx-3">
              <div class="mx-3">
                <span className="font-semibold text-gray-700 text-4xl">{status.mapel}</span>
                <p class="text-gray-700 text-md">MATA PELAJARAN</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="inline-flex mb-4 overflow-hidden bg-white rounded-lg shadow-md w-full">
            <div className="flex items-center justify-center w-20 bg-purple-500">
              <GiGraduateCap className='w-16 h-16 fill-white' />
            </div>

            <div class="p-4 -mx-3">
              <div class="mx-3">
                <span className="font-semibold text-gray-700 text-4xl">{status.penilai}</span>
                <p class="text-gray-700 text-md">PENILAI</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="inline-flex mb-4 overflow-hidden bg-white rounded-lg shadow-md w-full">
            <div className="flex items-center justify-center w-20 bg-amber-500">
              <HiUserGroup className='w-16 h-16 fill-white' />
            </div>

            <div class="p-4 -mx-3">
              <div class="mx-3">
                <span className="font-semibold text-gray-700 text-4xl">{status.peserta}</span>
                <p class="text-gray-700 text-md">PESERTA UJIAN</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="inline-flex mb-4 overflow-hidden bg-white rounded-lg shadow-md w-full">
            <div className="flex items-center justify-center w-20 bg-fuchsia-500">
              <MdLibraryBooks className='w-16 h-16 fill-white' />
            </div>

            <div class="p-4 -mx-3">
              <div class="mx-3">
                <span className="font-semibold text-gray-700 text-4xl">{status.soal}</span>
                <p class="text-gray-700 text-md">SOAL</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="inline-flex mb-4 overflow-hidden bg-white rounded-lg shadow-md w-full">
            <div className="flex items-center justify-center w-20 bg-rose-500">
              <MdSchedule className='w-16 h-16 fill-white' />
            </div>

            <div class="p-4 -mx-3">
              <div class="mx-3">
                <span className="font-semibold text-gray-700 text-4xl">{status.jadwal}</span>
                <p class="text-gray-700 text-md">JADWAL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Auth>
  )
}
