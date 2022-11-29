import axios from 'axios';
import { Alert, Badge, Button, Spinner, Table, TextInput } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import { MdMonitor } from 'react-icons/md';
import { HiPencil, HiTrash } from 'react-icons/hi';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useParams } from 'react-router-dom';
import DeleteModal from '../../components/DeleteModal';
import dateFormat from 'dateformat';
import Auth from '../../layouts/Auth';
import Form from './Form';
import { useRecoilValue } from 'recoil';
import { userDataAtom } from '../../recoil/atom/userAtom';

export default function Index() {
  const userData = useRecoilValue(userDataAtom);
  const { jid } = useParams();
  const [datas, setDatas] = useState(null);
  const [title, setTitle] = useState('...');
  const [status, setStatus] = useState({
    loaded: false,
    success: null,
    error: null,
  })
  const [tm, setTm] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    page: 0,
    size: 20
  })
  const initForm = {
    id: null,
    name: '',
    desc: '',
    start: new Date(),
    end: new Date((new Date()).setMinutes((new Date()).getMinutes() + 60)),
    duration: 60,
    soals: [],
    ruangs: [],
    penilais: [],
    soal_count: 1,
    shuffle: false,
    show_score: false,
    active: true,
    jid: jid
  };
  const [form, setForm] = useState({
    show: false,
    title: 'Data Baru',
    data: initForm,
  });
  const [destroy, setDestroy] = useState({
    show: false,
    title: '',
    link: null
  });

  useEffect(() => {
    const kategori = async () => {
      try {
        const res = await axios.get(`/jadwal-kategories/${jid}`);
        setTitle(res.data.name);
      } catch (error) {
        errorResponse('Tidak dapat memuat data: ' + error.response.data.message);
      }
    }

    kategori();
  }, [title]);

  useEffect(() => {
    getDatas();
  }, [filters.page, filters.search]);

  const errorResponse = (err) => {
    status.error = err.response.data.message;
    form.show = false;
    destroy.show = false;
    setStatus({ ...status });
    setForm({ ...form });
    setDestroy({ ...destroy });
    setTimeout(() => {
      status.error = null;
      setStatus({ ...status });
    }, 3000);
  }

  const successResponse = (res) => {
    status.success = res.data.message;
    form.show = false;
    destroy.show = false;
    setStatus({ ...status });
    setForm({ ...form });
    setDestroy({ ...destroy });
    datas['datas'] = [];
    setDatas({ ...datas });
    getDatas();
    setTimeout(() => {
      status.success = null;
      setStatus({ ...status });
    }, 3000);
  }

  const getDatas = async () => {
    try {
      const res = await axios.get(`/jadwals/${jid}?search=${filters.search}&page=${filters.page}&size=${filters.size}`);
      const oldDatas = datas?.datas ?? [];
      const newDatas = res.data;
      newDatas['datas'] = [...oldDatas, ...newDatas.datas];
      setDatas({ ...datas, ...newDatas });
    } catch (err) {
      status.error = err.response.data.message;
    }
    status.loaded = true;
    setStatus({ ...status });
  }

  const fetchMore = () => {
    filters.page = datas.currentPage + 1;
    setFilters({ ...filters });
  };

  const searchData = (e) => {
    if (tm) {
      clearTimeout(tm);
    }
    if (e.target.value !== filters.search) {
      setTm(setTimeout(() => {
        filters.search = e.target.value;
        filters.page = 0;
        setFilters({ ...filters });
        status.loaded = false;
        setStatus({ ...status });
        setDatas(null);
      }, 1000));
    }
  };

  return (
    <Auth title={`Jadwal Ujian ${title}`} success={status.success} error={status.error}>
      <Form
        open={form.show}
        onClose={() => {
          form.show = false;
          datas['datas'] = [];
          setDatas({ ...datas });
          getDatas();
          setForm({ ...form });
        }}
        data={form.data}
        onSubmit={successResponse}
        title={form.title} />

      <DeleteModal
        open={destroy.show}
        onClose={() => {
          destroy.show = false;
          setDestroy({ ...destroy });
        }}
        onSubmit={successResponse}
        onError={errorResponse}
        text={destroy.title}
        url={destroy.link} />

      <div className="flex flex-col gap-1">
        <div className="flex gap-1 flex-wrap md:justify-between justify-center items-center">
          <Button type='button' size={`sm`}
            onClick={() => {
              form.data = initForm;
              if (userData.role !== 'OPERATOR') {
                form.data.penilais = [
                  { id: userData.id, text: userData.name }
                ];
              }
              form.title = 'Data Baru';
              form.show = true;
              setForm({ ...form });
            }}>Tambah Data</Button>
          <div className="flex gap-1">
            <TextInput type='search' placeholder='Cari data ...' size={`sm`} onChange={searchData}
            />
          </div>
        </div>
        <div className="relative">
          {!status.loaded && <div className="flex backdrop-blur-sm absolute justify-center items-center inset-0 gap-2"><Spinner /><span>Memuat data ...</span></div>}
          {datas?.datas.length ?
            <InfiniteScroll
              dataLength={datas?.datas.length}
              next={fetchMore}
              hasMore={datas.currentPage < (datas.totalPages - 1)}
              className='w-full'
              loader={<div className='flex justify-center p-2'><Spinner /></div>}
            >
              <Table hoverable={true}>
                <Table.Head>
                  <Table.HeadCell>
                    Nama Jadwal
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Peserta
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Soal
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Waktu
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Durasi
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Status
                  </Table.HeadCell>
                  <Table.HeadCell>
                    <span className="sr-only">
                      Edit
                    </span>
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {datas?.datas.length && datas?.datas.map((v) => {
                    return <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={v.id}>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {v.name}
                      </Table.Cell>
                      <Table.Cell>
                        {v.pesertas.length}
                      </Table.Cell>
                      <Table.Cell>
                        {v.soal_count}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-1 flex-wrap">
                          <Badge className='whitespace-nowrap' color={`success`}>{dateFormat(v.start, 'dd-mmm-yyyy HH:MM')}</Badge>
                          <Badge className='whitespace-nowrap' color={`failure`}>{dateFormat(v.end, 'dd-mmm-yyyy HH:MM')}</Badge>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {v.duration}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex">
                          {v.active ? <Badge className='whitespace-nowrap' color={`success`}>Aktif</Badge> : <Badge className='whitespace-nowrap' color={`failure`}>Tidak Aktif</Badge>}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-1 whitespace-nowrap">
                          <Link to={`/jadwal/${jid}/${v.id}/monitor`}>
                            <Button className='py-1 px-0 rounded-full' size={`xs`} color='info' title='Monitor Peserta'><MdMonitor className='w-3 h-3' /></Button>
                          </Link>
                          <Button className='py-1 px-0 rounded-full' size={`xs`} color='warning' title='Edit'
                            onClick={() => {
                              form.data = { ...initForm, ...v };
                              form.data.start = new Date(v.start);
                              form.data.end = new Date(v.end);
                              form.data.ruangs = v.pesertas;
                              form.data.penilais = v.users;
                              form.show = true;
                              form.title = `Ubah Data ${v.name}`;
                              setForm({ ...form });
                            }}><HiPencil className='w-3 h-3' /></Button>
                          <Button className='py-1 px-0 rounded-full' size={`xs`} color='failure' title='Hapus'
                            onClick={() => {
                              destroy.link = `/jadwals/${jid}/${v.id}`;
                              destroy.title = v.name;
                              destroy.show = true;
                              setDestroy({ ...destroy });
                            }}><HiTrash className='w-3 h-3' /></Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  })}
                </Table.Body>
              </Table>
            </InfiniteScroll>
            : <Alert>Data tidak tersedia</Alert>}
        </div>
      </div>
    </Auth>
  )
}