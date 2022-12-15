import { Badge, Button, Modal, Select, Table } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataAtom } from '../../recoil/atom/userAtom';
import html2pdf from 'html2pdf.js';
import printElement from 'print-html-element';
import { BsFilePdf, BsPrinter } from 'react-icons/bs';
import axios from 'axios';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { TbCircleDot } from 'react-icons/tb';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import { generateColor } from '../../utils/Helpers';
import md5 from 'md5';
import { lID, lInterval } from '../../recoil/atom/LineHelper';

export default function DaftarSoal({ data, open, onClose }) {
  const [show, setShow] = useState(false);
  const [soal, setSoal] = useState(null);
  const [lint, setLint] = useRecoilState(lInterval)
  const [lineId, setLineId] = useRecoilState(lID);
  const userData = useRecoilValue(userDataAtom);
  const [process, setProcess] = useState(false);
  const [print, setPrint] = useState(false);
  const pdf = useRef(null);
  const updateXarrow = useXarrow();

  useEffect(() => {
    setShow(open);
  }, [open, data]);

  useEffect(() => {
    if (data !== null) {
      getSoal();
    }
  }, [data]);

  useEffect(() => {
    if (!process) {
      if (soal?.soal_items?.filter(v => v.type === 'JD').length > 0) {
        if (lint) {
          clearInterval(lint);
          setLint(null);
          setLineId(null);
        }
        setLineId('line');
        setLint(setInterval(updateXarrow, 100));
      }
    } else {
      if (lint) {
        clearInterval(lint);
        setLint(null);
        setLineId(null);
      }
    }
  }, [soal, process]);

  const getSoal = async () => {
    try {
      const res = await axios.get(`/soals/${data.soalKategoryId}/${data.id}`);
      setSoal(res.data);
    } catch (error) {
      console.log(error.response.data.message);
    }
  }

  const downloadPdf = () => {
    setProcess(true);
    var opt = {
      margin: 10,
      filename: (('soal ' + data?.name + (data?.desc ? ' (' + data?.desc + ')' : '')).toUpperCase()) + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: [215, 330], orientation: 'portrait' }
    };
    setTimeout(() => {
      html2pdf().set(opt).from(pdf.current).save().then(() => setProcess(false));
    }, 10);
  }

  const printData = () => {
    setPrint(true);
    const opts = {
      pageTitle: (('soal ' + data?.name + (data?.desc ? ' (' + data?.desc + ')' : '')).toUpperCase())
    };
    setTimeout(() => {
      printElement.printElement(pdf.current, opts);
      setPrint(false);
    }, 10);
  }

  return (
    <Modal
      show={show}
      size={'5xl'}
      position='top-center'
      onClose={onClose}
    >
      <Modal.Header className='px-3 py-2'>
        Soal {data?.name + (data?.desc ? ' (' + data?.desc + ')' : '')}
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-5 !w-full">
          <div className="flex justify-center gap-2 items-center">
            <Button size='sm' onClick={() => downloadPdf()} disabled={process} className='flex items-center' color={'gray'}><BsFilePdf className='w-4 h-4 text-red-600 mr-1' /> Download PDF</Button>
            <Button size='sm' onClick={() => printData()} disabled={process} className='flex items-center' color={'gray'}><BsPrinter className='w-4 h-4 text-purple-600 mr-1' /> Print</Button>
          </div>
          <table ref={pdf} className='!w-12/12' style={{ lineHeight: '0.95em' }}>
            <tbody>
              {userData.sekolah?.opt?.kop &&
                <tr>
                  <td colSpan={2}>
                    <img src={userData.sekolah?.opt?.kop} alt="" />
                  </td>
                </tr>
              }
              <tr>
                <td colSpan={2}>
                  <table className='w-full'>
                    <tbody>
                      <tr>
                        <td className='text-center font-bold uppercase pt-3'>DAFTAR SOAL</td>
                      </tr>
                      <tr>
                        <td className='text-center font-bold uppercase'>{(soal?.soal_kategory?.name)?.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td className='text-center font-bold uppercase'>{(soal?.soal_kategory?.desc)?.toUpperCase()}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td valign='top' className='pt-5 pb-3 font-bold'>
                  <table>
                    <tbody>
                      <tr>
                        <td>SOAL</td>
                        <td className='pl-2'>:</td>
                        <td>{(data?.name + (data?.desc !== '' ? ' (' + data?.desc + ')' : ''))?.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td>MATA PELAJARAN</td>
                        <td className='pl-2'>:</td>
                        <td>{data?.mapel?.name?.toUpperCase()}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td valign='top' align="right" className='pt-5 pb-3 font-bold'>
                  <table>
                    <tbody>
                      <tr>
                        <td align="left">JUMLAH SOAL</td>
                        <td className='pl-2'>:</td>
                        <td align="left">{soal?.soal_items.length} NOMOR</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td colSpan={2} className={'pt-1 w-full ' + (process && 'pt-4')}>
                  {soal?.soal_items.length > 0 &&
                    <div className="flex flex-col gap-5">
                      {soal?.soal_items.map((s, i) => {
                        return <div key={i} className="flex gap-2 items-start !break-inside-avoid !leading-snug">
                          <span>{s.num}</span>
                          <div className='flex flex-col gap-2'>
                            <div dangerouslySetInnerHTML={{ __html: s.text }}></div>
                            {s.type === 'U' ?
                              <div className="flex flex-col">
                                <div className="italic">Jawaban:</div>
                                <div dangerouslySetInnerHTML={{ __html: s.answer }}></div>
                              </div>
                              : s.type === 'IS' ?
                                <div className="flex flex-col">
                                  <div className="italic">Jawaban: {s.answer}</div>
                                </div>
                                : s.type === 'PG' ?
                                  <div className="flex flex-col gap-1">
                                    {s.options.map(v => {
                                      return <div key={v.key} className={`flex gap-2 ${s.corrects[v.key] && 'font-bold'}`}>
                                        <span>{v.key}.</span>
                                        <div dangerouslySetInnerHTML={{ __html: v.text }}></div>
                                      </div>
                                    })}
                                  </div>
                                  : s.type === 'PGK' ?
                                    <div className="flex flex-col gap-1">
                                      {s.options.map(v => {
                                        return <div key={v.key} className={`flex gap-2 ${s.corrects[v.key] ? 'text-green-600' : 'text-red-600'}`}>
                                          <span className={(s.corrects[v.key] ? 'pt-1 ' : 'pt-1 ') + (process && '!pt-3')}>{s.corrects[v.key] ? <FaCheck className='w-4 h-4' /> : <FaTimes className='w-4 h-4' />}</span>
                                          <div dangerouslySetInnerHTML={{ __html: v.text }}></div>
                                        </div>
                                      })}
                                    </div>
                                    : s.type === 'BS' ?
                                      <Table className='w-full !break-inside-avoid'>
                                        <Table.Head>
                                          <Table.HeadCell>{s.labels[0]}</Table.HeadCell>
                                          <Table.HeadCell colSpan={2} className='text-center'>{s.labels[1]}</Table.HeadCell>
                                        </Table.Head>
                                        <Table.Body className='divide-y'>
                                          {s.options.map(v => {
                                            return <Table.Row key={v.key}>
                                              <Table.Cell dangerouslySetInnerHTML={{ __html: v.text }} />
                                              <Table.Cell>
                                                <div className="flex justify-center">
                                                  <Badge color={s.corrects[v.key] ? 'success' : 'failure'} className={process && 'pt-0 pb-4'}>
                                                    {s.corrects[v.key] ? 'Benar' : 'Salah'}
                                                  </Badge>
                                                </div>
                                              </Table.Cell>
                                            </Table.Row>
                                          })}
                                        </Table.Body>
                                      </Table>
                                      : s.type === 'JD' ?
                                        <>
                                          <Table className='w-full !break-inside-avoid'>
                                            <Table.Head>
                                              <Table.HeadCell className='text-center'>{s.labels[0]}</Table.HeadCell>
                                              <Table.HeadCell className='text-center'>{s.labels[1]}</Table.HeadCell>
                                            </Table.Head>
                                            <Table.Body>
                                              <Table.Row>
                                                <Table.Cell className='align-top w-6/12'>
                                                  <div className='flex flex-col gap-5'>
                                                    {s.options.map(v => {
                                                      return <div key={v.key} className="flex justify-center gap-2 items-center">
                                                        <div className={"bg-blue-50 p-2 rounded shadow " + (process && 'pt-0 pb-4')} dangerouslySetInnerHTML={{ __html: v.text }}></div>
                                                        <span id={`opt-${s.num}-${v.key}`}>
                                                          <TbCircleDot className='w-7 h-7 text-blue-700' />
                                                        </span>
                                                      </div>
                                                    })}
                                                  </div>
                                                </Table.Cell>
                                                <Table.Cell className='align-top w-6/12'>
                                                  <div className='flex flex-col gap-5'>
                                                    {s.relations.map(v => {
                                                      return <div key={v.key} className="flex justify-center gap-2 items-center">
                                                        <span id={`rel-${s.num}-${v.key}`}>
                                                          <TbCircleDot className='w-7 h-7 text-red-700' />
                                                        </span>
                                                        <div className={"flex bg-red-50 p-2 rounded shadow " + (process && 'pt-0 pb-4')} dangerouslySetInnerHTML={{ __html: v.text }}></div>
                                                      </div>
                                                    })}
                                                  </div>
                                                </Table.Cell>
                                              </Table.Row>
                                            </Table.Body>
                                          </Table>
                                          {(!process && !print) &&
                                            <Xwrapper>
                                              {Object.keys(s.corrects).map(k => {
                                                return s.corrects[k] !== null && <Xarrow key={k + lineId} startAnchor='right' endAnchor='left' start={`opt-${s.num}-${k}`} end={`rel-${s.num}-${s.corrects[k]}`} headShape='arrow1' headSize={3} showTail={true} tailShape='circle' tailSize={2} color={generateColor(`${md5('7' + k)}}`)} />
                                              })}
                                            </Xwrapper>
                                          }
                                        </>
                                        : null
                            }
                          </div>
                        </div>
                      })}
                    </div>
                  }
                </td>
              </tr>
              <tr>
                <td colSpan={2} className='pb-10'>
                  <table className="w-full !break-inside-avoid">
                    <tbody>
                      <tr>
                        <td align="right">
                          <table>
                            <tbody>
                              <tr>
                                <td className="pt-5">......................, ................................... {(new Date()).getFullYear()}</td>
                              </tr>
                              <tr>
                                <td align="left">Guru Mata Pelajaran,</td>
                              </tr>
                              <tr>
                                <td height="100"></td>
                              </tr>
                              <tr>
                                <td align="left">(........................................................)</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal.Body>
    </Modal>
  )
}
