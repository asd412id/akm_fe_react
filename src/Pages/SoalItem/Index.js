import axios from 'axios';
import { Alert, Button, Spinner, Table, TextInput } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import { FcViewDetails } from 'react-icons/fc';
import { HiPencil, HiTrash } from 'react-icons/hi';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useParams } from 'react-router-dom';
import striptags from 'striptags';
import { shortText } from "limit-text-js";
import DeleteModal from '../../components/DeleteModal';
import Auth from '../../layouts/Auth';
import Form from './Form';
import View from './View';

export default function Index() {
  const { katid, soalid } = useParams();
  const [datas, setDatas] = useState(null);
  const [title, setTitle] = useState('...');
  const [status, setStatus] = useState({
    loaded: false,
    success: null,
    error: null,
  })
  const [view, setView] = useState({
    show: false,
    data: {},
  })
  const [tm, setTm] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    page: 0,
    size: 20
  })
  const initForm = {
    id: null,
    type: 'PG',
    num: 1,
    text: '',
    bobot: 0,
    labels: [],
    options: [],
    relations: [],
    corrects: {},
    answer: '',
    assets: [],
    shuffle: false,
    soalId: soalid
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
    const soal = async () => {
      try {
        const res = await axios.get(`/soals/${katid}/${soalid}`);
        setTitle(`${res.data.name} ${res.data.desc && ' (' + res.data.desc + ')'}`);
      } catch (error) {
        errorResponse('Tidak dapat memuat data: ' + error.response.data.message);
      }
    }

    soal();
  }, [title]);

  useEffect(() => {
    getDatas();
  }, [filters.page, filters.search]);

  const errorResponse = (err) => {
    status.error = err.response.data.message;
    form.show = false;
    destroy.show = false;
    form.data = initForm;
    setStatus({ ...status });
    setForm({ ...form });
    setDestroy({ ...destroy });
    datas['datas'] = [];
    setDatas({ ...datas });
    getDatas();
    setTimeout(() => {
      status.error = null;
      setStatus({ ...status });
    }, 3000);
  }

  const successResponse = (res) => {
    status.success = res.data.message;
    form.show = false;
    destroy.show = false;
    form.data = initForm;
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
      const res = await axios.get(`/soal-items/${soalid}?search=${filters.search}&page=${filters.page}&size=${filters.size}`);
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
    <Auth title={`Soal ${title}`} success={status.success} error={status.error}>
      <Form
        open={form.show}
        onClose={() => {
          form.show = false;
          form.data = initForm;
          datas['datas'] = [];
          setForm({ ...form });
          setDatas({ ...datas });
          getDatas();
        }}
        data={form.data}
        onSubmit={successResponse}
        title={form.title} />

      <View
        open={view.show}
        data={view.data}
        onClose={() => {
          view.show = false;
          view.data = {};
          setView({ ...view });
        }}
      />

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
              form.data.num = (datas?.datas.length ?? 0) + 1;
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
                  <Table.HeadCell className='whitespace-nowrap'>
                    Tipe Soal
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Bobot
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
                        {v.num}
                      </Table.Cell>
                      <Table.Cell dangerouslySetInnerHTML={{ __html: shortText(striptags(v.text, ['sup', 'sub']), 95, '...') }}></Table.Cell>
                      <Table.Cell>
                        {v.type}
                      </Table.Cell>
                      <Table.Cell>
                        {v.bobot}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-1 whitespace-nowrap">
                          <Button className='py-1 px-0 rounded-full' size={`xs`} color='info' title='Tampilkan Soal' onClick={() => {
                            view.show = true;
                            view.data = v;
                            setView({ ...view });
                          }}><FcViewDetails className='w-3 h-3' /></Button>
                          <Button className='py-1 px-0 rounded-full' size={`xs`} color='warning' title='Edit'
                            onClick={() => {
                              form.data = { ...v };
                              form.show = true;
                              form.title = `Ubah Data Soal Nomor ${v.num}`;
                              setForm({ ...form });
                            }}><HiPencil className='w-3 h-3' /></Button>
                          <Button className='py-1 px-0 rounded-full' size={`xs`} color='failure' title='Hapus'
                            onClick={() => {
                              destroy.link = `/soal-items/${soalid}/${v.id}`;
                              destroy.title = `Soal Nomor ${v.num}`;
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
