import axios from 'axios';
import { Button, Card, Checkbox, Radio, Textarea, TextInput, ToggleSwitch } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import AuthPeserta from '../../layouts/AuthPeserta'
import { useNavigate } from 'react-router-dom';
import { DataUjian } from '../../recoil/atom/DataUjian';
import { NomorSoal } from '../../recoil/atom/nomorSoal';
import { Jawaban } from '../../recoil/atom/Jawaban';
import { TbCircleDot } from 'react-icons/tb';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';
import md5 from 'md5';
import { generateColor } from '../../utils/Helpers';
import { lID, lInterval } from '../../recoil/atom/LineHelper';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import { StopUjian } from '../../recoil/atom/StopUjian';

export default function Tes() {
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [dataUjian, setDataUjian] = useRecoilState(DataUjian);
  const [number, setNumber] = useRecoilState(NomorSoal);
  const [soal, setSoal] = useState({});
  const [jawaban, setJawaban] = useRecoilState(Jawaban);
  const [crts, setCrts] = useState({});
  const navigate = useNavigate();
  const [lint, setLint] = useRecoilState(lInterval)
  const [lineId, setLineId] = useRecoilState(lID);
  const [stopUjian, setStopUjian] = useRecoilState(StopUjian);
  const [ready, setReady] = useState(null);
  const updateXarrow = useXarrow();
  const [autoSave, setAutoSave] = useState(null);

  useEffect(() => {
    getUjian();
  }, []);

  const getUjian = async () => {
    try {
      const res = await axios.get('/ujian');
      if (Array.isArray(res.data?.datas)) {
        navigate('/ujian');
      } else {
        setDataUjian(res.data);
        const jawab = {};
        res.data.peserta_tests.forEach(v => {
          jawab[v.id] = {
            num: v.num,
            type: v.type,
            jawaban: v.jawaban,
            sent: true
          };
        });
        setJawaban({ ...jawab });
        setNumber(res.data.current_number);
        setIsLogin(true);
      }
    } catch (error) {
      setError(error?.response?.data.message ? error.response.data.message : 'Gagal mengambil data ujian');
      setTimeout(() => {
        setError(null);
      }, 3000);
      setIsLogin(false);
      setDataUjian(null);
      navigate('/ujian');
    }
  }

  useEffect(() => {
    if (dataUjian) {
      setSoal(dataUjian.peserta_tests[number]);
    }
  }, [number, dataUjian]);

  const updateAnswer = async () => {
    if (autoSave) {
      clearTimeout(autoSave);
      setAutoSave(null);
    }
    let filter = Object.entries(jawaban).filter(([i, v]) => v.sent === false);
    filter = Object.fromEntries(filter);
    try {
      if (Object.keys(filter).length > 0) {
        await axios.put('/ujian/' + dataUjian.id, filter);
        const f = {};
        Object.keys(filter).forEach(k => {
          f[k] = {
            num: filter[k].num,
            type: filter[k].type,
            jawaban: filter[k].jawaban,
            sent: true
          }
        });
        setJawaban({ ...jawaban, ...f });
      }
    } catch (error) {
      if (error.response.status === 401) {
        window.location.reload();
      } else if (error.response.status === 406) {
        navigate('/ujian');
      } else {
        console.log(error.message);
        setAutoSave(setTimeout(updateAnswer, 15000));
      }
    }
  }

  useEffect(() => {
    if (soal.type === 'PG' || soal.type === 'PGK' || soal.type === 'BS') {
      const opt = {};
      soal.options.forEach(v => {
        opt[v.key] = Boolean(jawaban[soal.id]?.jawaban?.corrects[v.key]);
      });
      setCrts(opt);
    } else if (soal.type === 'JD') {
      const opt = {};
      soal.options.forEach(v => {
        opt[v.key] = jawaban[soal.id]?.jawaban?.corrects[v.key] ?? null;
      });
      setCrts(opt);
    }
    updateAnswer();
  }, [soal]);

  useEffect(() => {
    if (soal.type === 'JD') {
      if (lint) {
        clearInterval(lint);
        setLint(null);
        setLineId(null);
      }
      setLineId('line');
      setLint(setInterval(updateXarrow, 100));
    }
  }, [crts]);

  useEffect(() => {
    if (stopUjian) {
      updateAnswer();
      axios.patch('/ujian/' + dataUjian.id)
        .then(() => {
          setStopUjian(false);
          navigate('/ujian');
        }).catch(err => {
          setError('Gagal menghentikan ujian');
        })
    }
  }, [stopUjian]);

  useEffect(() => {
    if (autoSave) {
      clearTimeout(autoSave);
      setAutoSave(null);
    }
    setAutoSave(setTimeout(updateAnswer, 15000));
  }, [jawaban])

  if (isLogin) {
    return (
      <AuthPeserta title={'Mengerjakan Soal: ' + (dataUjian ? dataUjian?.jadwal?.name : '...')} error={error}>
        <div className="flex-w-full flex-col gap-3">
          <Card>
            <div className="flex flex-col items-start">
              <span className='font-bold italic'>#SOAL {number + 1}</span>
              <div className="w-full flex flex-col gap-5">
                <div dangerouslySetInnerHTML={{ __html: soal.text }}></div>
                {soal.type === 'IS' ?
                  <TextInput key={soal.id} placeholder='Masukkan jawaban disini' value={jawaban[soal.id].jawaban?.answer} onChange={(e) => {
                    const jawab = {};
                    jawab[soal.id] = {
                      num: number,
                      type: soal.type,
                      sent: false,
                      jawaban: {
                        answer: e.target.value
                      }
                    };
                    setJawaban({ ...jawaban, ...jawab });
                  }} />
                  : soal.type === 'U' ?
                    <Textarea key={soal.id} rows={5} placeholder='Masukkan jawaban disini' value={jawaban[soal.id].jawaban?.answer} onChange={(e) => {
                      const jawab = {};
                      jawab[soal.id] = {
                        num: number,
                        type: soal.type,
                        sent: false,
                        jawaban: {
                          answer: e.target.value
                        }
                      };
                      setJawaban({ ...jawaban, ...jawab });
                    }} />
                    : soal.type === 'PG' ?
                      <div className="flex flex-col gap-1">
                        {soal.options.map(v => {
                          return <label key={v.key} className={`flex gap-2 items-start`}>
                            <Radio name='jawaban' className='mt-1' checked={jawaban[soal.id].jawaban?.corrects[v.key]} onChange={e => {
                              const jawab = {};
                              const crts = {};
                              soal.options.forEach(vv => {
                                crts[vv.key] = v.key === vv.key;
                              });
                              jawab[soal.id] = {
                                num: number,
                                type: soal.type,
                                sent: false,
                                jawaban: {
                                  corrects: crts
                                }
                              };
                              setJawaban({ ...jawaban, ...jawab });
                            }} />
                            <span>{v.key}.</span>
                            <div dangerouslySetInnerHTML={{ __html: v.text }}></div>
                          </label>
                        })}
                      </div> : soal.type === 'PGK' ?
                        <div className="flex flex-col gap-1">
                          {soal.options.map(v => {
                            return <label key={v.key} className={`flex gap-2 items-start`}>
                              <Checkbox className='mt-1' checked={jawaban[soal.id].jawaban?.corrects[v.key]} onChange={e => {
                                const jawab = {};
                                crts[v.key] = e.target.checked;
                                setCrts({ ...crts });
                                jawab[soal.id] = {
                                  num: number,
                                  type: soal.type,
                                  sent: false,
                                  jawaban: {
                                    corrects: crts
                                  }
                                };
                                setJawaban({ ...jawaban, ...jawab });
                              }} />
                              <div dangerouslySetInnerHTML={{ __html: v.text }}></div>
                            </label>
                          })}
                        </div> : soal.type === 'BS' ?
                          <div className="w-full overflow-x-auto">
                            <table className='w-full border-collapse'>
                              <thead className='text-center bg-blue-50'>
                                <tr>
                                  <th className='p-2 border border-gray-400'>{soal.labels[0] ?? 'Pernyataan'}</th>
                                  <th colSpan={2} className='border border-gray-400 p-2'>{soal.labels[1] ?? 'Benar/Salah'}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {soal.options.map(v => {
                                  return <tr key={v.key} className='hover:bg-gray-100'>
                                    <td className='p-2 border border-gray-400' dangerouslySetInnerHTML={{ __html: v.text }} />
                                    <td className='p-2 border border-gray-400'>
                                      <div className="flex justify-center">
                                        <ToggleSwitch label={jawaban[soal.id].jawaban?.corrects[v.key] ? 'Benar' : 'Salah'} checked={jawaban[soal.id].jawaban?.corrects[v.key]} onChange={e => {
                                          const jawab = {};
                                          crts[v.key] = e;
                                          setCrts({ ...crts });
                                          jawab[soal.id] = {
                                            num: number,
                                            type: soal.type,
                                            sent: false,
                                            jawaban: {
                                              corrects: crts
                                            }
                                          };
                                          setJawaban({ ...jawaban, ...jawab });
                                        }} />
                                      </div>
                                    </td>
                                  </tr>
                                })}
                              </tbody>
                            </table>
                          </div> : soal.type === 'JD' ?
                            <div className='w-full overflow-x-auto'>
                              <table className='w-full border-collapse'>
                                <thead className='text-center bg-emerald-50'>
                                  <tr>
                                    <th className='p-2 border border-r-0 border-gray-400'>{soal.labels[0]}</th>
                                    <th className='p-2 border border-l-0 border-gray-400'>{soal.labels[1]}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className='align-top px-2 md:w-6/12 md:pr-10 pr-5 py-4 border border-r-0 border-gray-400'>
                                      <div className='flex flex-col gap-5'>
                                        {soal.options.map(v => {
                                          return <div key={v.key} className="flex justify-center gap-2 items-center">
                                            <div className="bg-blue-50 p-2 rounded shadow" dangerouslySetInnerHTML={{ __html: v.text }}></div>
                                            <span id={`opt-${v.key}`} className={`cursor-pointer ` + (v.key === ready && 'ring-2 rounded-full ring-yellow-300 bg-yellow-200')} onClick={() => {
                                              const jawab = {};
                                              crts[v.key] = null;
                                              setCrts({ ...crts });
                                              setReady(v.key);
                                              jawab[soal.id] = {
                                                num: number,
                                                type: soal.type,
                                                sent: false,
                                                jawaban: {
                                                  corrects: crts
                                                }
                                              };
                                              setJawaban({ ...jawaban, ...jawab });
                                            }}>
                                              <TbCircleDot className='w-7 h-7 text-blue-700' />
                                            </span>
                                          </div>
                                        })}
                                      </div>
                                    </td>
                                    <td className='align-top px-2 md:w-6/12 pl-5 md:pl-10 py-4 border border-l-0 border-gray-400'>
                                      <div className='flex flex-col gap-5'>
                                        {soal.relations.map(v => {
                                          return <div key={v.key} className="flex justify-center gap-2 items-center">
                                            <span id={`rel-${v.key}`} className='cursor-pointer' onClick={() => {
                                              if (ready !== null) {
                                                const jawab = {};
                                                crts[ready] = v.key;
                                                setCrts({ ...crts });
                                                setReady(null);
                                                jawab[soal.id] = {
                                                  num: number,
                                                  type: soal.type,
                                                  sent: false,
                                                  jawaban: {
                                                    corrects: crts
                                                  }
                                                };
                                                setJawaban({ ...jawaban, ...jawab });
                                              }
                                            }}>
                                              <TbCircleDot className='w-7 h-7 text-red-700' />
                                            </span>
                                            <div className="flex bg-red-50 p-2 rounded shadow" dangerouslySetInnerHTML={{ __html: v.text }}></div>
                                          </div>
                                        })}
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <Xwrapper>
                                {jawaban[soal.id]?.jawaban?.corrects !== undefined && Object.keys(jawaban[soal.id]?.jawaban?.corrects).map(k => {
                                  return jawaban[soal.id]?.jawaban?.corrects[k] !== null && <Xarrow key={k + lineId} startAnchor='right' endAnchor='left' start={`opt-${k}`} end={`rel-${jawaban[soal.id]?.jawaban?.corrects[k]}`} headShape='arrow1' headSize={3} showTail={true} tailShape='circle' tailSize={2} color={generateColor(`${md5('7' + k)}}`)} />
                                })}
                              </Xwrapper>
                            </div>
                            : null}
              </div>
            </div>

          </Card>
          <div className="flex justify-between md:justify-center gap-3 mt-5">
            <Button className='flex items-center rounded-full shadow-md shadow-gray-400' onClick={() => {
              if (number > 0) {
                setNumber(number - 1);
              }
            }} disabled={number === 0}><MdArrowBack className='w-5 h-5 mr-2' /> Sebelumnya</Button>
            <Button className='rounded-full shadow-md shadow-gray-400 flex items-center' onClick={() => {
              if (number < dataUjian.peserta_tests.length - 1) {
                setNumber(number + 1);
              }
            }} disabled={number === dataUjian.peserta_tests.length - 1}>Berikutnya <MdArrowForward className='w-5 h-5 ml-2' /></Button>
          </div>
        </div>
      </AuthPeserta>
    )
  }
}
