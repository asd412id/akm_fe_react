import axios from 'axios';
import { Alert, Badge, Dropdown, Select, Table, TextInput } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Auth from '../../layouts/Auth';
import dateFormat from 'dateformat';
import { HiCog } from 'react-icons/hi';
import { FiEdit } from 'react-icons/fi';
import InputNilai from './InputNilai';

export default function Penilaian() {
  const { jid, id } = useParams();
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('...');
  const [ruangs, setRuangs] = useState([]);
  const [ruang, setRuang] = useState('');
  const [pesertas, setPesertas] = useState([]);
  const [search, setSearch] = useState('');
  const [tm, setTm] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [confirm, setConfirm] = useState({
    show: false,
    text: '',
    url: ''
  });

  useEffect(() => {
    getJadwal();
    getRuangs();
  }, []);

  useEffect(() => {
    if (ruang) {
      getPesertas();
    }
  }, [ruang, searchValue]);

  const errorResponse = (message) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  }

  const successResponse = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  }

  const getJadwal = async () => {
    try {
      const res = await axios.get(`/jadwals/${jid}/${id}`);
      setTitle(res.data.name);
    } catch (error) {
      errorResponse('Tidak dapat memuat data');
    }
  }

  const getRuangs = async () => {
    try {
      const res = await axios.get(`/jadwals/${jid}/${id}/ruangs`);
      setRuangs(res.data);
      if (res.data.length) {
        setRuang(res.data[0]);
      }
    } catch (error) {
      errorResponse('Tidak dapat memuat data');
    }
  }

  const getPesertas = async () => {
    try {
      const res = await axios.get(`/jadwals/${jid}/${id}/ruangs/${ruang}?search=${search}`);
      setPesertas(res.data);
    } catch (error) {
      errorResponse('Tidak dapat memuat data');
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (tm) clearTimeout(tm);
    setTm(setTimeout(() => {
      setSearchValue(e.target.value);
    }, 500));
  }
  return (
    <Auth title={`Penilaian Ujian ${title}`} success={success} error={error}>
      <InputNilai
        open={confirm.show}
        id={confirm.id}
        onClose={() => {
          confirm.show = false;
          setConfirm({ ...confirm });
        }}
        onSubmit={(e) => {
          confirm.show = false;
          setConfirm({ ...confirm });
          successResponse(e.data.message);
          getPesertas();
        }}
      />

      <div className="flex flex-col gap-1">
        <div className="flex gap-1 flex-wrap md:justify-between justify-center items-center">
          <div className="flex items-center gap-1">
            <span>Ruang/Kelas:</span>
            <Select size={'sm'} value={ruang} onChange={e => setRuang(e.target.value)} className='w-40'>
              {ruangs.map((v, i) => {
                return <option key={i} value={v}>{v}</option>
              })}
            </Select>
          </div>
          <div className="flex gap-1">
            <TextInput type='search' placeholder='Cari data ...' size={`sm`} value={search} onChange={handleSearch} />
          </div>
        </div>
        {pesertas.length ?
          <div className="no-v-scroll">
            <Table hoverable={true}>
              <Table.Head>
                <Table.HeadCell>
                  No.
                </Table.HeadCell>
                <Table.HeadCell>
                  ID Peserta
                </Table.HeadCell>
                <Table.HeadCell>
                  Nama
                </Table.HeadCell>
                <Table.HeadCell>
                  Ruang
                </Table.HeadCell>
                <Table.HeadCell>
                  Waktu
                </Table.HeadCell>
                <Table.HeadCell>
                  Nilai
                </Table.HeadCell>
                <Table.HeadCell>
                  <span className="sr-only">
                    Aksi
                  </span>
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {pesertas?.map((v, i) => {
                  return <Table.Row className={"bg-white dark:border-gray-700 dark:bg-gray-800 " + ((v?.peserta_logins.length > 0 && v?.peserta_logins[0]?.checked) && '!bg-yellow-100')} key={v.id}>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {i + 1}.
                    </Table.Cell>
                    <Table.Cell>
                      {v.username}
                    </Table.Cell>
                    <Table.Cell>
                      {v.name}
                    </Table.Cell>
                    <Table.Cell>
                      {v.ruang}
                    </Table.Cell>
                    <Table.Cell>
                      {v?.peserta_logins.length ?
                        <div className="flex gap-1 flex-wrap">
                          {v?.peserta_logins[0].start && <Badge className='whitespace-nowrap' color={`success`}>{dateFormat(v.peserta_logins[0].start, 'dd-mmm-yyyy HH:MM')}</Badge>}
                          {v?.peserta_logins[0].end && <Badge className='whitespace-nowrap' color={`failure`}>{dateFormat(v.peserta_logins[0].end, 'dd-mmm-yyyy HH:MM')}</Badge>}
                        </div>
                        : <div className='flex'><Badge className='whitespace-nowrap' color={`purple`}>Standby</Badge></div>}
                    </Table.Cell>
                    <Table.Cell>
                      {v?.peserta_logins[0]?.peserta_tests[0]?.total_nilai ? parseFloat(v?.peserta_logins[0]?.peserta_tests[0]?.total_nilai).toFixed(2) : 0}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end whitespace-nowrap">
                        {(v?.peserta_logins.length > 0 && v?.peserta_logins[0].end) &&
                          <Dropdown
                            label={<HiCog className='w-4 h-4' />}
                            size='xs'
                            color={'gray'}
                            placement='bottom-end'
                          >
                            <Dropdown.Item icon={FiEdit} onClick={() => {
                              confirm.show = true;
                              confirm.id = v?.peserta_logins[0].id;
                              setConfirm({ ...confirm });
                            }}>
                              Input Nilai
                            </Dropdown.Item>
                          </Dropdown>
                        }
                      </div>
                    </Table.Cell>
                  </Table.Row>
                })}
              </Table.Body>
            </Table>
          </div>
          : <Alert>Data peserta ujian tidak tersedia</Alert>}
      </div>
    </Auth>
  )
}
