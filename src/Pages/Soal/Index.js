import axios from 'axios';
import { Alert, Button, Spinner, Table, TextInput } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { GiNotebook } from 'react-icons/gi';
import { HiPencil, HiTrash } from 'react-icons/hi';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useParams } from 'react-router-dom';
import DeleteModal from '../../components/DeleteModal';
import Auth from '../../layouts/Auth';
import DaftarSoal from './DaftarSoal';
import Form from './Form';

export default function Index() {
  const { katid } = useParams();
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
    mapelId: '',
    katid: katid,
    userId: ''
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
  const [daftarSoal, setDaftarSoal] = useState({
    show: false,
    data: null
  })

  useEffect(() => {
    const kategori = async () => {
      try {
        const res = await axios.get(`/soal-kategories/${katid}`);
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
    filters.page = 0;
    setFilters({ ...filters });
    setDatas({ ...datas });
    getDatas();
    setTimeout(() => {
      status.success = null;
      setStatus({ ...status });
    }, 3000);
  }

  const getDatas = async () => {
    try {
      const res = await axios.get(`/soals/${katid}?search=${filters.search}&page=${filters.page}&size=${filters.size}`);
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
    <Auth title={`Bank Soal ${title}`} success={status.success} error={status.error}>
      <Form
        open={form.show}
        onClose={() => {
          form.show = false;
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

      <DaftarSoal
        open={daftarSoal.show}
        data={daftarSoal.data}
        onClose={() => {
          daftarSoal.show = false;
          daftarSoal.data = null;
          setDaftarSoal({ ...daftarSoal });
        }}
      />

      <div className="flex flex-col gap-1">
        <div className="flex gap-1 flex-wrap md:justify-between justify-center items-center">
          <Button type='button' size={`sm`}
            onClick={() => {
              form.data = initForm;
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
                    No.
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Soal
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Deskripsi
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Mata Pelajaran
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Jumlah Soal
                  </Table.HeadCell>
                  <Table.HeadCell>
                    <span className="sr-only">
                      Edit
                    </span>
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {datas?.datas.length && datas?.datas.map((v, i) => {
                    return <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={v.id}>
                      <Table.Cell className="whitespace-nowrap">
                        {i + 1}.
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        {v.name}
                      </Table.Cell>
                      <Table.Cell>
                        {v.desc}
                      </Table.Cell>
                      <Table.Cell>
                        {v.mapel?.name}
                      </Table.Cell>
                      <Table.Cell>
                        {v.soal_count}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-1 whitespace-nowrap">
                          <Link to={`/soal/${katid}/${v.id}`}>
                            <Button className='py-1 px-0' pill={true} size={`xs`} color='info' title='Daftar Soal'><GiNotebook className='w-3 h-3' /></Button>
                          </Link>
                          <Button className='py-1 px-0' pill={true} size={`xs`} color='success' title='Download Soal' onClick={() => {
                            daftarSoal.show = true;
                            daftarSoal.data = v;
                            setDaftarSoal({ ...daftarSoal });
                          }}><FaCloudDownloadAlt className='w-3 h-3' /></Button>
                          <Button className='py-1 px-0' pill={true} size={`xs`} color='warning' title='Edit'
                            onClick={() => {
                              v.userId = v.userId === null ? '' : v.userId;
                              form.data = { ...initForm, ...v };
                              form.show = true;
                              form.title = `Ubah Data ${v.name}`;
                              setForm({ ...form });
                            }}><HiPencil className='w-3 h-3' /></Button>
                          <Button className='py-1 px-0' pill={true} size={`xs`} color='failure' title='Hapus'
                            onClick={() => {
                              destroy.link = `/soals/${katid}/${v.id}`;
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
