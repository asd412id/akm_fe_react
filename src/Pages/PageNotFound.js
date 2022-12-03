import { Button } from 'flowbite-react'
import React from 'react'
import { FaHome } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export default function PageNotFound() {
  document.title = "Halaman Tidak Ditemukan"
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-blue-700 dark:text-blue-500">404</h1>
          <p className="mb-4 text-3xl tracking-tight font-bold text-rose-600 md:text-4xl dark:text-white">Halaman tidak ditemukan.</p>
          <p className="mb-4 text-lg text-gray-500 dark:text-gray-700">Maaf, kami tidak dapat menemukan halaman yang Anda cari!</p>
          <div className="flex justify-center">
            <Link to="/">
              <Button className='flex items-center shadow-lg shadow-gray-500 hover:shadow-md transition-shadow duration-200 rounded-3xl'><FaHome className='w-6 h-6 mr-2' /><span className='text-2xl'>KEMBALI</span></Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
