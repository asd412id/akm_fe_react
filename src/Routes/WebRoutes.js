import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Akun from '../Pages/Akun'
import PengaturanSekolah from '../Pages/PengaturanSekolah'
import Dashboard from '../Pages/Dashboard'
import IndexMapel from '../Pages/Mapel/Index'
import IndexPenilai from '../Pages/Penilai/Index'
import IndexPeserta from '../Pages/Peserta/Index'
import IndexSoalKategori from '../Pages/SoalKategori/Index'
import IndexSoal from '../Pages/Soal/Index'
import IndexSoalItem from '../Pages/SoalItem/Index'
import IndexJadwalKategori from '../Pages/JadwalKategori/Index'
import IndexJadwal from '../Pages/Jadwal/Index'

export default function WebRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Dashboard />} />

        <Route path='/akun' element={<Akun />} />
        <Route path='/sekolah' element={<PengaturanSekolah />} />
        <Route path='/mapel' element={<IndexMapel />} />
        <Route path='/penilai' element={<IndexPenilai />} />
        <Route path='/peserta' element={<IndexPeserta />} />
        <Route exact path='/soal' element={<IndexSoalKategori />} />
        <Route path='/soal/:katid' element={<IndexSoal />} />
        <Route path='/soal/:katid/:soalid' element={<IndexSoalItem />} />
        <Route exact path='/jadwal' element={<IndexJadwalKategori />} />
        <Route path='/jadwal/:jid' element={<IndexJadwal />} />
      </Routes>
    </BrowserRouter >
  )
}
