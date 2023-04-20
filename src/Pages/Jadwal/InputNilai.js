import axios from 'axios';
import { Alert, Badge, Button, Modal, Spinner, Table, TextInput } from 'flowbite-react'
import md5 from 'md5';
import React, { useEffect, useState } from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa';
import { TbCircleDot } from 'react-icons/tb';
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import { useRecoilState } from 'recoil';
import { lID, lInterval } from '../../recoil/atom/LineHelper';
import { generateColor, parseNumber } from '../../utils/Helpers';

export default function InputNilai({ open, id, onSubmit, onClose }) {
  const [show, setShow] = useState(false);
  const [lId, setLId] = useState(id);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [nilais, setNilais] = useState([]);
  const [title, setTitle] = useState('...');
  const [total, setTotal] = useState(0);
  const [nSoal, setNSoal] = useState({});
  const [lint, setLint] = useRecoilState(lInterval)
  const [lineId, setLineId] = useRecoilState(lID);
  const [disabled, setDisabled] = useState(false);
  const updateXarrow = useXarrow();

  useEffect(() => {
    setShow(open);
    if (open) {
      setLId(id);
    }
    setError(null);
    setLoaded(false);
    setDisabled(false);
    setNSoal({});
    setTotal(0);
  }, [open, id]);

  useEffect(() => {
    if (lId) {
      getLogin();
    }
  }, [lId]);

  useEffect(() => {
    if (nilais?.peserta_tests?.length) {
      const tn = nilais?.peserta_tests?.map(e => {
        nSoal[e.id] = e.nilai
        setNSoal({ ...nSoal });
        return e.nilai;
      }).reduce((a, b) => a + b);
      setTotal(tn);
      if (nilais?.peserta_tests?.filter(v => v.type === 'JD').length > 0) {
        if (lint) {
          clearInterval(lint);
          setLint(null);
          setLineId(null);
        }
        setLineId('line');
        setLint(setInterval(updateXarrow, 100));
      }
    }
  }, [nilais]);

  useEffect(() => {
    if (Object.keys(nSoal).length) {
      setTotal(Object.keys(nSoal).map(k => nSoal[k]).reduce((a, b) => (isNaN(parseFloat(a)) ? 0 : parseFloat(a)) + (isNaN(parseFloat(b)) ? 0 : parseFloat(b))));
    }
  }, [nSoal]);

  const getLogin = async () => {
    try {
      const res = await axios.get(`/nilais/${lId}`);
      setNilais(res.data);
      setTitle(`${res.data?.peserta?.name} (${res.data?.peserta?.ruang}) - ${res.data?.jadwal?.name}`);
      setLoaded(true);
    } catch (error) {
      setError(error.response.data.message);
    }
  }

  const handleChange = (e) => {
    nSoal[e.target.id] = parseNumber(e.target.value);
    setNSoal({ ...nSoal });
  }

  const handleBlur = (e) => {
    nSoal[e.target.id] = parseFloat(nSoal[e.target.id]);
    setNSoal({ ...nSoal });
  }

  const simpanNilai = async (e) => {
    e.preventDefault();
    setDisabled(true);
    try {
      const res = await axios.patch(`/nilais/${lId}`, nSoal);
      setLId(null);
      setNilais([]);
      setLoaded(false);
      setDisabled(false);
      onSubmit(res);
    } catch (error) {
      setError('Tidak dapat menyimpan nilai');
      setDisabled(false);
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  }

  return (
    <Modal
      show={show}
      position='top-center'
      size={'screen-xl'}
      onClose={() => {
        setLId(null);
        setNilais([]);
        setLoaded(false);
        onClose();
      }}
    >
      <Modal.Header className='px-3 py-2'>
        Periksa Nilai {title}
      </Modal.Header>
      <Modal.Body className='ck-content'>
        {loaded ?
          nilais?.peserta_tests.length > 0 ?
            <div className="flex flex-col gap-3">
              {error !== null &&
                <div className="flex justify-center">
                  <Alert color={'failure'}>{error}</Alert>
                </div>
              }
              <Table striped={true} cellPadding={0} cellSpacing={0}>
                <Table.Head>
                  <Table.HeadCell className='px-1 text-center'>NO.</Table.HeadCell>
                  <Table.HeadCell className='px-1'>TEKS</Table.HeadCell>
                  <Table.HeadCell className='px-1'>JENIS</Table.HeadCell>
                  <Table.HeadCell className='px-1'>JAWABAN</Table.HeadCell>
                  <Table.HeadCell className='px-1'>JAWABAN PESERTA</Table.HeadCell>
                  <Table.HeadCell className='px-1 text-center'>NILAI BENAR</Table.HeadCell>
                  <Table.HeadCell className='px-1'>NILAI</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {nilais?.peserta_tests.map((v, i) => {
                    return <Table.Row key={i} valign='top'>
                      <Table.Cell className='px-1 text-center'>{v.num}.</Table.Cell>
                      <Table.Cell className='px-1' dangerouslySetInnerHTML={{ __html: v.text }}></Table.Cell>
                      <Table.Cell className='px-1'>{v.type}</Table.Cell>
                      <Table.Cell className='px-1'>
                        {v.type === 'IS' ?
                          <>{v.answer}</>
                          : v.type === 'U' ?
                            <div dangerouslySetInnerHTML={{ __html: v.answer }}></div>
                            : v.type === 'PG' ?
                              <div className="flex flex-col gap-1">
                                {
                                  v.soal_item.options?.map(e => {
                                    return <div key={e.key} className={`flex gap-2 ${v.soal_item.corrects[e.key] && 'font-bold'}`}>
                                      <span>{e.key}.</span>
                                      <div dangerouslySetInnerHTML={{ __html: e.text }}></div>
                                    </div>
                                  })
                                }
                              </div>
                              : v.type === 'PGK' ?
                                <div className="flex flex-col gap-1">
                                  {
                                    v.soal_item.options?.map(e => {
                                      return <div key={e.key} className={`flex gap-2 ${v.soal_item.corrects[e.key] ? 'text-green-600' : 'text-red-600'}`}>
                                        <span className={'pt-1'}>{v.soal_item.corrects[e.key] ? <FaCheck className='w-4 h-4' /> : <FaTimes className='w-4 h-4' />}</span>
                                        <div dangerouslySetInnerHTML={{ __html: e.text }}></div>
                                      </div>
                                    })
                                  }
                                </div>
                                : v.type === 'BS' ?
                                  <Table className='w-full'>
                                    <Table.Head>
                                      <Table.HeadCell>{v.soal_item.labels[0]}</Table.HeadCell>
                                      <Table.HeadCell colSpan={2} className='text-center'>{v.soal_item.labels[1]}</Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body>
                                      {v.soal_item.options.map(e => {
                                        return <Table.Row key={e.key}>
                                          <Table.Cell className='px-1' dangerouslySetInnerHTML={{ __html: e.text }} />
                                          <Table.Cell className='px-1'>
                                            <div className="flex justify-center">
                                              <Badge color={v.soal_item.corrects[e.key] ? 'success' : 'failure'}>
                                                {v.soal_item.corrects[e.key] ? 'Benar' : 'Salah'}
                                              </Badge>
                                            </div>
                                          </Table.Cell>
                                        </Table.Row>
                                      })}
                                    </Table.Body>
                                  </Table>
                                  : v.type === 'JD' ?
                                    <>
                                      <Table className='w-full'>
                                        <Table.Head>
                                          <Table.HeadCell className='text-center'>{v.soal_item.labels[0]}</Table.HeadCell>
                                          <Table.HeadCell className='text-center'>{v.soal_item.labels[1]}</Table.HeadCell>
                                        </Table.Head>
                                        <Table.Body>
                                          <Table.Row>
                                            <Table.Cell className='align-top w-6/12'>
                                              <div className='flex flex-col gap-5'>
                                                {v.soal_item.options.map(e => {
                                                  return <div key={e.key} className="flex justify-center gap-2 items-center">
                                                    <div className="bg-blue-50 p-2 rounded shadow"><div dangerouslySetInnerHTML={{ __html: e.text }}></div></div>
                                                    <span id={`jopt-${v.id}-${e.key}`}>
                                                      <TbCircleDot className='w-7 h-7 text-blue-700' />
                                                    </span>
                                                  </div>
                                                })}
                                              </div>
                                            </Table.Cell>
                                            <Table.Cell className='align-top w-6/12'>
                                              <div className='flex flex-col gap-5'>
                                                {v.soal_item.relations.map(e => {
                                                  return <div key={e.key} className="flex justify-center gap-2 items-center">
                                                    <span id={`jrel-${v.id}-${e.key}`}>
                                                      <TbCircleDot className='w-7 h-7 text-red-700' />
                                                    </span>
                                                    <div className="flex bg-red-50 p-2 rounded shadow"><div dangerouslySetInnerHTML={{ __html: e.text }}></div></div>
                                                  </div>
                                                })}
                                              </div>
                                            </Table.Cell>
                                          </Table.Row>
                                        </Table.Body>
                                      </Table>
                                      <Xwrapper>
                                        {v.soal_item?.corrects !== null && Object.keys(v.soal_item.corrects).map(k => {
                                          return v.soal_item.corrects[k] !== null && <Xarrow key={k + lineId} startAnchor='right' endAnchor='left' start={`jopt-${v.id}-${k}`} end={`jrel-${v.id}-${v.soal_item.corrects[k]}`} headShape='arrow1' headSize={3} showTail={true} tailShape='circle' tailSize={2} color={generateColor(`${md5('7' + k)}}`)} />
                                        })}
                                      </Xwrapper>
                                    </>
                                    : null}
                      </Table.Cell>
                      <Table.Cell className='px-1'>
                        {v.type === 'IS' ?
                          v.jawaban !== null ?
                            <>{v.jawaban?.answer}</>
                            : <div className="flex"><Badge color={'failure'}>SOAL TIDAK DIJAWAB</Badge></div>
                          : v.type === 'U' ?
                            v.jawaban !== null ?
                              <div dangerouslySetInnerHTML={{ __html: v.jawaban?.answer }}></div>
                              : <div className="flex"><Badge color={'failure'}>SOAL TIDAK DIJAWAB</Badge></div>
                            : v.type === 'PG' ?
                              v.jawaban !== null ?
                                <div className="flex flex-col gap-1">
                                  {
                                    v.soal_item.options?.map(e => {
                                      return <div key={e.key} className={`flex gap-2 ${v.jawaban?.corrects[e.key] && 'font-bold'}`}>
                                        <span>{e.key}.</span>
                                        <div dangerouslySetInnerHTML={{ __html: e.text }}></div>
                                      </div>
                                    })
                                  }
                                </div> : <div className="flex"><Badge color={'failure'}>SOAL TIDAK DIJAWAB</Badge></div>
                              : v.type === 'PGK' ?
                                v.jawaban !== null ?
                                  <div className="flex flex-col gap-1">
                                    {
                                      v.soal_item.options?.map(e => {
                                        return <div key={e.key} className={`flex gap-2 ${v.jawaban?.corrects[e.key] ? 'text-green-600' : 'text-red-600'}`}>
                                          <span className={'pt-1'}>{v.jawaban?.corrects[e.key] ? <FaCheck className='w-4 h-4' /> : <FaTimes className='w-4 h-4' />}</span>
                                          <div dangerouslySetInnerHTML={{ __html: e.text }}></div>
                                        </div>
                                      })
                                    }
                                  </div> : <div className="flex"><Badge color={'failure'}>SOAL TIDAK DIJAWAB</Badge></div>
                                : v.type === 'BS' ?
                                  v.jawaban !== null ?
                                    <Table className='w-full'>
                                      <Table.Head>
                                        <Table.HeadCell>{v.soal_item.labels[0]}</Table.HeadCell>
                                        <Table.HeadCell colSpan={2} className='text-center'>{v.soal_item.labels[1]}</Table.HeadCell>
                                      </Table.Head>
                                      <Table.Body>
                                        {v.soal_item.options.map(e => {
                                          return <Table.Row key={e.key}>
                                            <Table.Cell className='px-1' dangerouslySetInnerHTML={{ __html: e.text }} />
                                            <Table.Cell className='px-1'>
                                              <div className="flex justify-center">
                                                <Badge color={v.jawaban?.corrects[e.key] ? 'success' : 'failure'}>
                                                  {v.jawaban?.corrects[e.key] ? 'Benar' : 'Salah'}
                                                </Badge>
                                              </div>
                                            </Table.Cell>
                                          </Table.Row>
                                        })}
                                      </Table.Body>
                                    </Table> : <div className="flex"><Badge color={'failure'}>SOAL TIDAK DIJAWAB</Badge></div>
                                  : v.type === 'JD' ?
                                    v.jawaban !== null ?
                                      <>
                                        <Table className='w-full'>
                                          <Table.Head>
                                            <Table.HeadCell className='text-center'>{v.soal_item.labels[0]}</Table.HeadCell>
                                            <Table.HeadCell className='text-center'>{v.soal_item.labels[1]}</Table.HeadCell>
                                          </Table.Head>
                                          <Table.Body>
                                            <Table.Row>
                                              <Table.Cell className='align-top w-6/12'>
                                                <div className='flex flex-col gap-5'>
                                                  {v.soal_item.options.map(e => {
                                                    return <div key={e.key} className="flex justify-center gap-2 items-center">
                                                      <div className="bg-blue-50 p-2 rounded shadow" dangerouslySetInnerHTML={{ __html: e.text }}></div>
                                                      <span id={`popt-${v.id}-${e.key}`}>
                                                        <TbCircleDot className='w-7 h-7 text-blue-700' />
                                                      </span>
                                                    </div>
                                                  })}
                                                </div>
                                              </Table.Cell>
                                              <Table.Cell className='align-top w-6/12'>
                                                <div className='flex flex-col gap-5'>
                                                  {v.soal_item.relations.map(e => {
                                                    return <div key={e.key} className="flex justify-center gap-2 items-center">
                                                      <span id={`prel-${v.id}-${e.key}`}>
                                                        <TbCircleDot className='w-7 h-7 text-red-700' />
                                                      </span>
                                                      <div className="flex bg-red-50 p-2 rounded shadow" dangerouslySetInnerHTML={{ __html: e.text }}></div>
                                                    </div>
                                                  })}
                                                </div>
                                              </Table.Cell>
                                            </Table.Row>
                                          </Table.Body>
                                        </Table>
                                        <Xwrapper>
                                          {v.jawaban !== null && Object.keys(v.jawaban?.corrects).map(k => {
                                            return v.jawaban?.corrects[k] !== null && <Xarrow key={k + lineId} startAnchor='right' endAnchor='left' start={`popt-${v.id}-${k}`} end={`prel-${v.id}-${v.jawaban?.corrects[k]}`} headShape='arrow1' headSize={3} showTail={true} tailShape='circle' tailSize={2} color={generateColor(`${md5('7' + k)}}`)} />
                                          })}
                                        </Xwrapper>
                                      </> : <div className="flex"><Badge color={'failure'}>SOAL TIDAK DIJAWAB</Badge></div>
                                    : null}
                      </Table.Cell>
                      <Table.Cell className='px-1 text-center'>
                        {v.bobot}
                      </Table.Cell>
                      <Table.Cell className='px-1'>
                        <TextInput type={'text'} onWheel={(e) => e.target.blur()} id={v.id} value={nSoal[v.id]} onChange={handleChange} onBlur={handleBlur} className='w-16' />
                      </Table.Cell>
                    </Table.Row>
                  })}
                  <Table.Row className='text-lg font-bold'>
                    <Table.HeadCell colSpan={6} align='right'>TOTAL NILAI</Table.HeadCell>
                    <Table.HeadCell>{total.toFixed(2)}</Table.HeadCell>
                  </Table.Row>
                </Table.Body>
              </Table>
              <div className="flex justify-end">
                <Button type='button' disabled={disabled} onClick={simpanNilai}>SIMPAN NILAI</Button>
              </div>
            </div>
            : <Alert>Data tidak tersedia</Alert>
          : <div className='flex justify-center'><Spinner size={'xl'} /></div>}
      </Modal.Body>
    </Modal>
  )
}
