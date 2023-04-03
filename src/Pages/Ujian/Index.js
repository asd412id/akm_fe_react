import axios from 'axios';
import { Alert, Card, Spinner } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import AuthPeserta from '../../layouts/AuthPeserta'
import { userDataAtom } from '../../recoil/atom/userAtom'
import dateFormat from 'dateformat';
import TestConfirmationModal from './TestConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { DataUjian } from '../../recoil/atom/DataUjian';
import InfiniteScroll from 'react-infinite-scroll-component';
import { MonitoringInterval } from '../../recoil/atom/MonitoringInterval';

export default function Index() {
  const userData = useRecoilValue(userDataAtom);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [jadwal, setJadwal] = useState({});
  const [dataLogin, setDataLogin] = useState(null);
  const [page, setPage] = useState(0);
  const [ujians, setUjians] = useState({
    loading: false,
    datas: []
  });
  const [isLogin, setIsLogin] = useState(true);
  const [dataUjian, setDataUjian] = useRecoilState(DataUjian);
  const [tm, setTm] = useRecoilState(MonitoringInterval);
  const navigate = useNavigate();

  useEffect(() => {
    getUjian();
  }, []);

  const getUjian = async () => {
    try {
      ujians.loading = true;
      const res = await axios.get('/ujian');
      if (Array.isArray(res.data?.datas)) {
        ujians.datas = [...res.data.datas];
        ujians.loading = false;
        setUjians({ ...ujians });
        setIsLogin(false);
        setDataUjian(null);
        if (tm) clearTimeout(tm);
        setTm(setTimeout(getUjian, 60000));
      } else {
        if (tm) {
          clearTimeout(tm);
          setTm(null);
        }
        navigate('/ujian/tes');
      }
    } catch (error) {
      if (error.response.status === 401) {
        window.location.reload();
      } else {
        ujians.loading = false;
        setUjians({ ...ujians });
        setError(error?.response?.data.message ? error.response.data.message : 'Gagal mengambil data ujian');
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    }
  }

  useEffect(() => {
    getLogin();
    if (tm) clearTimeout(tm);
    setTm(setTimeout(getUjian, 60000));
  }, [page]);

  const getLogin = async () => {
    try {
      const res = await axios.get(`/ujian/selesai?page=${page}&size=20`);
      const newDatas = res.data;
      setDataLogin({ ...dataLogin, ...newDatas });
    } catch (err) {
      setError('Tidak dapat memuat hasil ujian');
    }
  }

  const fetchMore = () => {
    setPage(page + 1);
  };

  if (!isLogin) {
    return (
      <AuthPeserta title={'Data Peserta Ujian'} error={error}>
        <TestConfirmationModal
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          jid={jadwal.id}
          onError={(e) => {
            setError(e);
            setTimeout(() => {
              setError(null);
            }, 3000);
          }}
          onSubmit={() => {
            navigate('/ujian/tes');
          }}
        >
          <h5 className="text-lg font-semibold text-center" style={{ lineHeight: '1em' }}>{jadwal.name}</h5>
          <p className='text-center' style={{ lineHeight: '1em' }}>{jadwal.desc}</p>
          <p className="text-center font-semibold my-4" style={{ lineHeight: '1.2em' }}>{`Timer ${jadwal.duration} menit akan mulai berjalan! Yakin ingin memulai ujian?`}</p>
        </TestConfirmationModal>

        <div className="flex flex-col md:flex-row gap-3 md:gap-5">
          <div className="md:w-8/12 w-full flex flex-col gap-3">
            <div className="w-full p-5 border rounded-lg shadow-md bg-emerald-50 border-emerald-100 text-emerald-600">
              <div className="-mb-1 italic text-lg">Selamat Datang,</div>
              <div className="text-3xl font-bold">{userData.name}</div>
              <table className="w-full mt-3">
                <tbody>
                  <tr>
                    <td className="py-1 pr-2 align-top">ID Peserta</td>
                    <td className="py-1 pr-2 align-top">:</td>
                    <th className="py-1 pl-2 text-left align-top">{userData.username}</th>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2 align-top">Nama Lengkap</td>
                    <td className="py-1 pr-2 align-top">:</td>
                    <th className="py-1 pl-2 text-left align-top">{userData.name}</th>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2 align-top">Jenis Kelamin</td>
                    <td className="py-1 pr-2 align-top">:</td>
                    <th className="py-1 pl-2 text-left align-top">{userData.jk === 'L' ? 'Laki-Laki' : 'Perempuan'}</th>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2 align-top">Ruang</td>
                    <td className="py-1 pr-2 align-top">:</td>
                    <th className="py-1 pl-2 text-left align-top">{userData.ruang ?? '-'}</th>
                  </tr>
                </tbody>
              </table>
            </div>
            {ujians.datas.length === 0 &&
              <InfiniteScroll
                dataLength={dataLogin?.datas?.length ?? 0}
                next={fetchMore}
                hasMore={dataLogin?.currentPage < (dataLogin?.totalPages - 1)}
                className='w-full grid md:grid-cols-2 gap-2 grid-flow-row pb-3'
                loader={<div className='flex justify-center p-2'><Spinner /></div>}
              >
                {dataLogin?.datas.length ? dataLogin.datas.map((v, i) => {
                  return <Card key={i} className='bg-amber-100 text-amber-700 rounded-lg'>
                    <div>
                      <div style={{ lineHeight: '1.1em' }} className="italic font-semibold text-sm">{v.jadwal.jadwal_kategory.name + (v.jadwal.jadwal_kategory.desc ? ' (' + v.jadwal.jadwal_kategory.desc + ')' : '')}</div>
                      <h5 style={{ lineHeight: '1em' }} className="text-lg font-semibold">{v.jadwal.name}</h5>
                      <span style={{ lineHeight: '1em' }} className="italic text-sm whitespace-normal">{v.jadwal.desc}</span>
                    </div>
                    <div className='flex flex-col -mt-2'>
                      <div className="flex gap-1 items-start">
                        <div style={{ lineHeight: '1.3em' }} className="flex">Jumlah Soal</div>
                        <div style={{ lineHeight: '1.3em' }} className="flex font-semibold">: {v.jadwal.soal_count} Nomor</div>
                      </div>
                      <div style={{ lineHeight: '1.3em' }} className="flex gap-1 items-start">
                        <div style={{ lineHeight: '1.3em' }} className="flex">Durasi</div>
                        <div style={{ lineHeight: '1.3em' }} className="flex font-semibold">: {v.jadwal.duration} Menit</div>
                      </div>
                      <div style={{ lineHeight: '1.3em' }} className="flex gap-1 items-start">
                        <div style={{ lineHeight: '1.3em' }} className="flex">Mulai</div>
                        <div style={{ lineHeight: '1.3em' }} className="flex font-semibold">: {dateFormat(new Date(v.start), 'dd/mm/yyyy HH:MM')}</div>
                      </div>
                      <div style={{ lineHeight: '1.3em' }} className="flex gap-1 items-start">
                        <div style={{ lineHeight: '1.3em' }} className="flex">Selesai</div>
                        <div style={{ lineHeight: '1.3em' }} className="flex font-semibold">: {dateFormat(new Date(v.end), 'dd/mm/yyyy HH:MM')}</div>
                      </div>
                    </div>
                    <div style={{ lineHeight: '1.3em' }} className='-mt-2'>
                      {v.jadwal.show_score && <div className="font-bold italic">#NILAI: {parseFloat(v.nilai).toFixed(2)}</div>}
                    </div>
                  </Card>
                }) : <Alert className='text-lg shadow-md shadow-gray-300'>Anda belum mengerjakan ujian</Alert>}
              </InfiniteScroll>
            }
          </div>
          <div className="w-full md:w-4/12 relative flex flex-col gap-2">
            {ujians.loading ?
              <div className="flex absolute justify-center inset-0 bg-white backdrop-blur-md items-center"><Spinner size={'xl'} color={'success'} /></div>
              : ujians.datas.length ? ujians.datas.map((v, i) => {
                return <Card key={i} className='bg-sky-100 text-sky-700 hover:bg-sky-200 transition-all duration-200 cursor-pointer' onClick={() => {
                  setJadwal(v);
                  setOpenDialog(true);
                }}>
                  <div>
                    <div style={{ lineHeight: '1.1em' }} className="italic font-semibold text-sm whitespace-normal">{v.jadwal_kategory.name + (v.jadwal_kategory.desc ? ' (' + v.jadwal_kategory.desc + ')' : '')}</div>
                    <h5 style={{ lineHeight: '1em' }} className="text-lg font-semibold">{v.name}</h5>
                    <span style={{ lineHeight: '1em' }} className="italic text-sm whitespace-normal">{v.desc}</span>
                  </div>
                  <div className='flex flex-col -mt-2'>
                    <div className="flex gap-1 items-start">
                      <div style={{ lineHeight: '1.3em' }} className="flex">Jumlah Soal</div>
                      <div style={{ lineHeight: '1.3em' }} className="flex font-semibold">: {v.soal_count} Nomor</div>
                    </div>
                    <div style={{ lineHeight: '1.3em' }} className="flex gap-1 items-start">
                      <div style={{ lineHeight: '1.3em' }} className="flex">Durasi</div>
                      <div style={{ lineHeight: '1.3em' }} className="flex font-semibold">: {v.duration} Menit</div>
                    </div>
                    <div style={{ lineHeight: '1.3em' }} className="flex gap-1 items-start">
                      <div style={{ lineHeight: '1.3em' }} className="flex">Mulai</div>
                      <div style={{ lineHeight: '1.3em' }} className="flex font-semibold">: {dateFormat(new Date(v.start), 'dd/mm/yyyy HH:MM')}</div>
                    </div>
                    <div style={{ lineHeight: '1.3em' }} className="flex gap-1 items-start">
                      <div style={{ lineHeight: '1.3em' }} className="flex">Selesai</div>
                      <div style={{ lineHeight: '1.3em' }} className="flex font-semibold">: {dateFormat(new Date(v.end), 'dd/mm/yyyy HH:MM')}</div>
                    </div>
                  </div>
                </Card>
              }) : <Alert className='text-lg shadow-md shadow-gray-300'>Tidak ada ujian saat ini</Alert>
            }
          </div>
        </div>
      </AuthPeserta>
    )
  }
}
