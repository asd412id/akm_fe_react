import axios from 'axios';
import { Alert, Button, Dropdown, Select, Spinner, Table, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react'
import { HiCloudDownload, HiCloudUpload, HiOutlineQuestionMarkCircle, HiPencil, HiTrash } from 'react-icons/hi';
import { FaIdCard } from 'react-icons/fa';
import InfiniteScroll from 'react-infinite-scroll-component';
import DeleteModal from '../../components/DeleteModal';
import Auth from '../../layouts/Auth';
import Form from './Form';
import Excel from 'exceljs';
import { BsFileSpreadsheet, BsTrash2 } from 'react-icons/bs';
import { DropdownItem } from 'flowbite-react/lib/esm/components/Dropdown/DropdownItem';
import KartuPeserta from './KartuPeserta';
import { AiOutlineLogout } from 'react-icons/ai';
import MonitorConfirm from '../Jadwal/MonitorConfirm';
import { handleDownload } from '../../utils/Helpers';
import ConfirmModal from '../../components/ConfirmModal';

export default function Index() {
  const [datas, setDatas] = useState(null);
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
  const [ruangs, setRuangs] = useState([]);
  const initForm = {
    id: null,
    name: '',
    username: '',
    password: '',
    jk: 'L',
    ruang: ''
  };
  const [form, setForm] = useState({
    show: false,
    title: 'Data Baru',
    data: initForm,
  });
  const [destroy, setDestroy] = useState({
    show: false,
    title: '',
    link: ''
  });
  const [destroyBatch, setDestroyBatch] = useState({
    show: false,
    ruang: '',
  })
  const uexcel = useRef(null);
  const [kartuPeserta, setkartuPeserta] = useState(false);
  const [confirm, setConfirm] = useState({
    show: false,
    text: '',
    url: ''
  })

  useEffect(() => {
    getDatas();
  }, [filters.page, filters.search]);

  useEffect(() => {
    getRuangs();
  }, [])

  const getRuangs = async () => {
    try {
      const res = await axios('/pesertas/ruangs');
      setRuangs(res.data);
    } catch (error) {
      errorResponse(error);
    }
  }

  const errorResponse = (err) => {
    status.error = err.response.data.message;
    form.show = false;
    destroy.show = false;
    setStatus({ ...status });
    setForm({ ...form });
    setDestroy({ ...destroy });
    setDestroyBatch({ ...destroyBatch.show = false });
    getRuangs();
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
    setDestroyBatch({ ...destroyBatch.show = false });
    datas['datas'] = [];
    filters.page = 0;
    setFilters({ ...filters });
    setDatas({ ...datas });
    getDatas();
    getRuangs();
    setTimeout(() => {
      status.success = null;
      setStatus({ ...status });
    }, 3000);
  }

  const getDatas = async () => {
    try {
      const res = await axios.get(`/pesertas?search=${filters.search}&page=${filters.page}&size=${filters.size}`);
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

  const importExcel = async (e) => {
    if (e.target.files[0] !== undefined) {
      status.loaded = false;
      setStatus({ ...status });
      const workbook = new Excel.Workbook();
      const reader = new FileReader();
      reader.readAsArrayBuffer(e.target.files[0]);
      reader.onload = async () => {
        const buffer = reader.result;
        try {
          const wb = await workbook.xlsx.load(buffer);
          const sheet = wb.getWorksheet('Peserta');
          const dp = [];
          for (let i = 1; i <= sheet.rowCount; i++) {
            if (i > 1) {
              const row = sheet.getRow(i);
              const val = {
                username: String(row.getCell('B').text),
                name: String(row.getCell('C').text),
                jk: String(row.getCell('D').text),
                password: String(row.getCell('E').text),
                ruang: String(row.getCell('F').text)
              };
              dp.push(val);
            }
          }
          uexcel.current.value = ''
          saveImported(dp);
        } catch (error) {
          uexcel.current.value = ''
          status.error = 'Format file excel tidak dikenali!';
          status.loaded = true;
          setStatus({ ...status });
          setTimeout(() => {
            status.error = null;
            setStatus({ ...status });
          }, 3000);
        }
      }
    }
  }

  const saveImported = async (data) => {
    try {
      const res = await axios.post('/pesertas/import', data, {
        timeout: 180000
      });
      status.loaded = true;
      setStatus({ ...status });
      successResponse(res);
    } catch (error) {
      status.loaded = true;
      setStatus({ ...status });
      errorResponse(error);
    }
  }

  const downloadKartu = () => {
    setkartuPeserta(true);
  }

  const destroyAll = async () => {
    try {
      const res = await axios.delete(`/pesertas/all?ruang=${destroyBatch.ruang}`);
      successResponse(res);
    } catch (error) {
      errorResponse(error);
    }
  }

  return (
    <Auth title={`Daftar Peserta`} success={status.success} error={status.error}>
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

      <ConfirmModal
        open={destroyBatch.show}
        accept='Ya, Saya Yakin'
        reject='Tidak'
        onClose={() => {
          destroyBatch.show = false;
          destroyBatch.ruang = '';
          setDestroyBatch({ ...destroyBatch });
        }}
        onSubmit={destroyAll}>
        <div className="mb-5">
          <HiOutlineQuestionMarkCircle className="mx-auto mb-4 h-14 w-14 text-red-600 dark:text-red-200" />
          <h3 className="mb-3 text-lg font-normal text-gray-500 dark:text-gray-400">
            Anda yakin ingin menghapus data peserta pada ruangan ini?
          </h3>
          <div className="flex justify-center">
            <Select value={destroyBatch?.ruang} className='w-auto' onChange={(e) => {
              destroyBatch.ruang = e.target.value;
              setDestroyBatch({ ...destroyBatch });
            }}>
              <option value="">Semua Ruang</option>
              {ruangs.map(v => {
                return <option value={v}>{v}</option>
              })}
            </Select>
          </div>
        </div>
      </ConfirmModal>

      <MonitorConfirm
        open={confirm.show}
        url={confirm.url}
        onError={errorResponse}
        onClose={() => {
          confirm.show = false;
          setConfirm({ ...confirm });
        }}
        onSubmit={(e) => {
          confirm.show = false;
          setConfirm({ ...confirm });
          successResponse(e);
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: confirm.text }}></div>
      </MonitorConfirm>

      <KartuPeserta
        open={kartuPeserta}
        onClose={() => setkartuPeserta(false)}
      />

      <div className="flex flex-col gap-1">
        <div className="flex gap-1 flex-wrap md:justify-between justify-center items-center">
          <div className="flex flex-col md:flex-row gap-1">
            <Button type='button' size={`sm`}
              onClick={() => {
                form.data = initForm;
                form.title = 'Data Baru';
                form.show = true;
                setForm({ ...form });
              }} disabled={!status.loaded}>Tambah Data</Button>
            {datas?.datas?.length > 0 &&
              <>
                <Button type='button' size={`sm`} color='purple' onClick={() => downloadKartu()} disabled={!status.loaded}><FaIdCard className='w-4 h-4 mr-1' /> Download Kartu</Button>
                <Button type='button' size={`sm`} color='failure' onClick={() => {
                  destroyBatch.show = true;
                  destroyBatch.ruang = '';
                  setDestroyBatch({ ...destroyBatch });
                }} disabled={!status.loaded}><BsTrash2 className='w-4 h-4 mr-1' /> Hapus Semua</Button>
                <Button type='button' size={`sm`} color='success' onClick={() => {
                  confirm.text = `Yakin ingin mereset login semua peserta?`;
                  confirm.url = `/pesertas/reset`
                  confirm.show = true;
                  setConfirm({ ...confirm });
                }} disabled={!status.loaded}><AiOutlineLogout className='w-4 h-4 mr-1' /> Reset Login</Button>
              </>
            }
            <Dropdown
              size={'sm'}
              color='gray'
              label={<div className='flex items-center text-green-600'><BsFileSpreadsheet className='w-4 h-4 mr-1' /> Excel</div>}
            >
              <DropdownItem icon={HiCloudDownload} onClick={e => handleDownload('/assets/template_peserta.xlsx', 'DATA PESERTA UJIAN.xlsx')}>
                Download Template Excel
              </DropdownItem>
              <DropdownItem icon={HiCloudUpload}
                onClick={() => {
                  uexcel.current.click();
                }} disabled={!status.loaded}>
                Impor Excel
              </DropdownItem>
            </Dropdown>
            <input type="file" ref={uexcel} className='hidden' accept='.xls,.xlsx,.ods' onChange={importExcel} />
          </div>
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
                    Nama
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Username
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Jenis Kelamin
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Ruang
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
                      <Table.Cell>
                        {i + 1}.
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        {v.name}
                      </Table.Cell>
                      <Table.Cell>
                        {v.username}
                      </Table.Cell>
                      <Table.Cell>
                        {v.jk === 'L' ? 'Laki-Laki' : 'Perempuan'}
                      </Table.Cell>
                      <Table.Cell>
                        {v.ruang}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-1 whitespace-nowrap">
                          {v.token !== null &&
                            <Button className='py-1 px-0' pill={true} size={`xs`} color='purple' title='Reset Login'
                              onClick={() => {
                                confirm.text = `Yakin ingin mereset login<br/><b>${v.name}</b>?<br/>Peserta akan logout dari perangkat!`;
                                confirm.url = `/pesertas/${v.id}/reset`
                                confirm.show = true;
                                setConfirm({ ...confirm });
                              }}><AiOutlineLogout className='w-3 h-3' /></Button>
                          }
                          <Button className='py-1 px-0' pill={true} size={`xs`} color='warning' title='Edit'
                            onClick={() => {
                              form.data = { ...initForm, ...v };
                              form.show = true;
                              form.title = `Ubah Data ${v.name}`;
                              setForm({ ...form });
                            }}><HiPencil className='w-3 h-3' /></Button>
                          <Button className='py-1 px-0' pill={true} size={`xs`} color='failure' title='Hapus'
                            onClick={() => {
                              destroy.link = `/pesertas/${v.id}`;
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
