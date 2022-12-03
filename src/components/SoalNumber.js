import { Button } from 'flowbite-react';
import React, { useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil';
import TestConfirmationModal from '../Pages/Ujian/TestConfirmationModal';
import { DataUjian } from '../recoil/atom/DataUjian'
import { Jawaban } from '../recoil/atom/Jawaban';
import { NomorSoal } from '../recoil/atom/nomorSoal';
import { StopUjian } from '../recoil/atom/StopUjian';

export default function SoalNumber() {
  const dataUjian = useRecoilValue(DataUjian);
  const [number, setNumber] = useRecoilState(NomorSoal);
  const jawaban = useRecoilValue(Jawaban);
  const [openDialog, setOpenDialog] = useState(false)
  const [stopUjian, setStopUjian] = useRecoilState(StopUjian);
  return (
    <>
      <TestConfirmationModal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={() => {
          setStopUjian(true);
        }}
      >
        <h5 className="text-lg font-semibold text-center mb-7" style={{ lineHeight: '1em' }}>Anda yakin ingin menghentikan ujian?</h5>
      </TestConfirmationModal>
      <div className="flex flex-col gap-3 text-center">
        <h3 className="font-semibold">{dataUjian.jadwal.name}</h3>
        <h3 className="text-lg font-semibold">Nomor Soal</h3>
        <div className="grid grid-cols-5 gap-2">
          {dataUjian.peserta_tests.length && dataUjian.peserta_tests.map((v, i) => {
            return <Button key={i} color={number === i ? 'info' : (jawaban[v.id]?.jawaban) ? 'success' : 'gray'} size={'sm'} onClick={() => {
              setNumber(i);
            }}>{i + 1}</Button>
          })}
        </div>
        <Button color={'failure'} className="mt-3 shadow-md shadow-gray-400 active:shadow-none" onClick={() => setOpenDialog(true)}>SELESAI UJIAN</Button>
      </div>
    </>
  )
}
