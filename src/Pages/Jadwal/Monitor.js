import axios from 'axios';
import { Alert, Badge, Dropdown, Select, Spinner, Table, TextInput } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Auth from '../../layouts/Auth';
import dateFormat from 'dateformat';
import { HiCog } from 'react-icons/hi';
import { BiReset } from 'react-icons/bi';
import { BsStopCircle } from 'react-icons/bs';
import { useRecoilState } from 'recoil';
import { MonitoringInterval } from '../../recoil/atom/MonitoringInterval';
import MonitorConfirm from './MonitorConfirm';
import { AiOutlineLogout } from 'react-icons/ai';
import Timer from '../../components/Timer';
import SearchSelect from '../../components/SearchSelect';

export default function Monitor() {
  const { jid, id } = useParams();
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('...');
  const [ruangs, setRuangs] = useState([]);
  const [ruang, setRuang] = useState('');
  const [pesertas, setPesertas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tm, setTm] = useState(null);
  const [queryPeserta, setQueryPeserta] = useRecoilState(MonitoringInterval);
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
      getPesertas(true);
    } else {
      setLoading(false);
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

  const getPesertas = async (indicator = false) => {
    setLoading(indicator);
    try {
      const res = await axios.get(`/jadwals/${jid}/${id}/ruangs/${ruang}?search=${search}`);
      setPesertas(res.data);
      if (queryPeserta) {
        clearTimeout(queryPeserta);
        setQueryPeserta(null);
      }
      setQueryPeserta(setTimeout(getPesertas, 10000));
      setLoading(false);
    } catch (error) {
      if (queryPeserta) {
        clearTimeout(queryPeserta);
        setQueryPeserta(null);
      }
      setLoading(false);
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
    <Auth title={`Monitoring Ujian ${title}${ruang ? ' (' + ruang + ')' : ''}`} success={success} error={error}>
      <MonitorConfirm
        open={confirm.show}
        url={confirm.url}
        onError={(e) => {
          errorResponse(e.response.data.message);
        }}
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
      >
        <div dangerouslySetInnerHTML={{ __html: confirm.text }}></div>
      </MonitorConfirm>

      <div className="flex flex-col gap-1">
        <div className={"flex gap-1 flex-wrap justify-center items-center " + (ruang ? 'md:justify-between' : 'md:justify-end')}>
          {ruang &&
            <div className="flex items-center gap-1">
              <span>Ruang/Kelas:</span>
              <div className="w-48">
                <SearchSelect value={ruang ? { id: ruang, text: ruang } : null} options={ruangs.map(v => { return { id: v, text: v } })} placeholder='Pilih Ruang' onChange={e => {
                  setRuang(e.id);
                }} />
              </div>
            </div>
          }
          <div className="flex gap-1">
            <TextInput type='search' placeholder='Cari data ...' size={`sm`} value={search} onChange={handleSearch} />
          </div>
        </div>
        {loading ? <div className="flex w-full justify-center py-5"><Spinner className='w-9 h-9' /></div> : pesertas.length ?
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
                  Waktu
                </Table.HeadCell>
                <Table.HeadCell>
                  Soal
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
                  return <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={v.id}>
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
                      {v?.peserta_logins.length ?
                        <div className="flex gap-1 flex-wrap">
                          {
                            v?.peserta_logins[0].end !== null ?
                              <>
                                {v?.peserta_logins[0].start && <Badge className='whitespace-nowrap' color={`success`}>{dateFormat(v.peserta_logins[0].start, 'dd-mmm-yyyy HH:MM')}</Badge>}
                                {v?.peserta_logins[0].end && <Badge className='whitespace-nowrap' color={`failure`}>{dateFormat(v.peserta_logins[0].end, 'dd-mmm-yyyy HH:MM')}</Badge>}
                              </> :
                              <div className="text-emerald-700 font-semibold">
                                <Timer key={v.id} now={new Date(v.peserta_logins[0].start)} end={new Date((new Date(v.peserta_logins[0].start)).getTime() + (v.jadwals[0]?.duration * 60 * 1000))} />
                              </div>
                          }
                        </div>
                        : <div className='flex'><Badge className='whitespace-nowrap' color={`purple`}>Standby</Badge></div>}
                    </Table.Cell>
                    <Table.Cell>
                      {v?.peserta_logins.length > 0 &&
                        <div className="flex gap-1 flex-wrap">
                          <Badge color={(v?.peserta_logins[0]?.peserta_tests[0]?.dikerja === v?.peserta_logins[0]?.peserta_tests[0]?.total_soal) ? 'info' : 'warning'}>{v?.peserta_logins[0]?.peserta_tests[0]?.dikerja ?? 0}/{v?.peserta_logins[0]?.peserta_tests[0]?.total_soal ?? 0}</Badge>
                        </div>
                      }
                    </Table.Cell>
                    <Table.Cell>
                      {v?.peserta_logins[0]?.peserta_tests[0]?.total_nilai ? parseFloat(v?.peserta_logins[0]?.peserta_tests[0]?.total_nilai).toFixed(2) : 0}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end whitespace-nowrap">
                        {(v?.peserta_logins.length > 0 || v.token) &&
                          <Dropdown
                            label={<HiCog className='w-4 h-4' />}
                            size='xs'
                            color={'gray'}
                            placement='bottom-end'
                          >
                            {v.token &&
                              <Dropdown.Item icon={AiOutlineLogout} onClick={() => {
                                confirm.text = `Yakin ingin mereset login<br/><b>${v.name}</b>?<br/>Peserta akan logout dari perangkat!`;
                                confirm.url = `/pesertas/${v.id}/reset`
                                confirm.show = true;
                                setConfirm({ ...confirm });
                              }}>
                                Reset Login
                              </Dropdown.Item>
                            }
                            {v?.peserta_logins.length > 0 &&
                              <>
                                {v?.peserta_logins[0].end === null &&
                                  <Dropdown.Item icon={BsStopCircle} onClick={() => {
                                    confirm.text = `Yakin ingin menghentikan ujian<br/><b>${v.name}</b>?`;
                                    confirm.url = `/jadwals/${jid}/${id}/stop/${v?.peserta_logins[0].id}`
                                    confirm.show = true;
                                    setConfirm({ ...confirm });
                                  }}>
                                    Hentikan Ujian
                                  </Dropdown.Item>
                                }
                                <Dropdown.Item icon={BiReset} onClick={() => {
                                  confirm.text = `Yakin ingin mereset ujian<br/><b>${v.name}</b>?<br/>Ujian yang telah dikerjakan pada jadwal ini akan dihapus!`;
                                  confirm.url = `/jadwals/${jid}/${id}/reset/${v?.peserta_logins[0].id}`
                                  confirm.show = true;
                                  setConfirm({ ...confirm });
                                }}>
                                  Reset Ujian
                                </Dropdown.Item>
                              </>
                            }
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
