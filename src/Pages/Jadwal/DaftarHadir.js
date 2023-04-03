import { Button, Modal, Select } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil';
import { userDataAtom } from '../../recoil/atom/userAtom';
import html2pdf from 'html2pdf.js';
import printElement from 'print-html-element';
import { BsFilePdf, BsPrinter } from 'react-icons/bs';

export default function DaftarHadir({ jadwal, open, onClose }) {
  const [show, setShow] = useState(false);
  const [data, setData] = useState(null);
  const userData = useRecoilValue(userDataAtom);
  const [process, setProcess] = useState(false);
  const [ruangs, setRuangs] = useState([]);
  const [ruang, setRuang] = useState('');
  const [pengawas, setPengawas] = useState(1);
  const [countPengawas, setCountPengawas] = useState([]);
  const pdf = useRef(null);

  useEffect(() => {
    setShow(open);
    setData(jadwal);
    const r = [];
    jadwal.pesertas?.forEach((v) => {
      if (!r.includes(v.text)) {
        r.push(v.text);
      }
    });
    setRuangs([...r]);
    if (r.length) {
      setRuang(r[0]);
    }
    setPengawas(1);
    setCountPengawas([1]);
  }, [open]);

  const downloadPdf = () => {
    setProcess(true);
    var opt = {
      margin: 10,
      filename: (('daftar hadir ' + data?.name + ' (' + ruang + ')').toUpperCase()) + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: [215, 330], orientation: 'portrait' }
    };
    html2pdf().set(opt).from(pdf.current).save().then(() => setProcess(false));
  }

  const printData = () => {
    const opts = {
      pageTitle: (('daftar hadir ' + data?.name + ' (' + ruang + ')').toUpperCase())
    };
    printElement.printElement(pdf.current, opts);
  }

  return (
    <Modal
      show={show}
      size={'4xl'}
      position='top-center'
      onClose={onClose}
    >
      <Modal.Header className='px-3 py-2'>
        Daftar Hadir {data?.name}{ruang ? ' (' + ruang + ')' : ''}
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-5">
          <div className="flex justify-center gap-2 items-center">
            <Select value={ruang} className='w-32' disabled={process} onChange={e => {
              setRuang(e.target.value);
            }}>
              {ruangs?.map((v, i) => {
                return <option key={i} value={v}>{v}</option>
              })}
            </Select>
            <Select value={pengawas} className='w-32' disabled={process} onChange={e => {
              setPengawas(e.target.value);
              let cp = [];
              for (let i = 0; i < e.target.value; i++) {
                cp.push(i + 1);
              }
              setCountPengawas(cp);
            }}>
              {[1, 2, 3, 4, 5, 6].map((v, i) => {
                return <option key={i} value={v}>{`${v} Pengawas`}</option>
              })}
            </Select>
            <Button size='sm' onClick={() => downloadPdf()} disabled={process} className='flex items-center' color={'gray'}><BsFilePdf className='w-4 h-4 text-red-600 mr-1' /> Download PDF</Button>
            <Button size='sm' onClick={() => printData()} disabled={process} className='flex items-center' color={'gray'}><BsPrinter className='w-4 h-4 text-purple-600 mr-1' /> Print</Button>
          </div>
          <table ref={pdf} className='w-full' style={{ lineHeight: '0.95em' }}>
            <tbody>
              {userData.sekolah?.opt?.kop &&
                <tr>
                  <td colSpan={2}>
                    <img src={userData.sekolah?.opt?.kop} alt="" className='mx-auto' />
                  </td>
                </tr>
              }
              <tr>
                <td colSpan={2}>
                  <table className='w-full'>
                    <tbody>
                      <tr>
                        <td className='text-center font-bold pt-3'>DAFTAR HADIR</td>
                      </tr>
                      <tr>
                        <td className='text-center font-bold uppercase'>{data?.jadwal_kategory?.name}</td>
                      </tr>
                      <tr>
                        <td className='text-center font-bold uppercase'>{data?.jadwal_kategory?.desc}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td valign='top' className='pt-3'>
                  <table>
                    <tbody>
                      <tr>
                        <td>Soal</td>
                        <td className='pl-2'>:</td>
                        <td>{data?.name}</td>
                      </tr>
                      <tr>
                        <td>Kelas/Ruang</td>
                        <td className='pl-2'>:</td>
                        <td>{ruang}</td>
                      </tr>
                      <tr>
                        <td>Jumlah Peserta</td>
                        <td className='pl-2'>:</td>
                        <td>{data?.pesertas?.filter(e => { return e.text === ruang }).length ?? 0} Orang</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td valign='top' align="right">
                  <table>
                    <tbody>
                      <tr>
                        <td align="left">Jumlah Soal</td>
                        <td className='pl-2'>:</td>
                        <td align="left">{data?.soal_count} Nomor</td>
                      </tr>
                      <tr>
                        <td align="left">Durasi</td>
                        <td className='pl-2'>:</td>
                        <td align="left">{data?.duration} Menit</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td colSpan={2} className={'pt-1 ' + (process && 'pt-4')}>
                  <table className='w-full'>
                    <thead>
                      <tr className='bg-gray-100'>
                        <th className={'border border-gray-600 ' + (process && 'border-black pt-1 pb-5')}>NO.</th>
                        <th className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}>ID PESERTA</th>
                        <th className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}>NAMA</th>
                        <th className={'border border-gray-600 p-2 w-3/12 ' + (process && 'border-black pt-1 pb-5')} colSpan={2}>TTD</th>
                        <th className={'border border-gray-600 p-2 w-1/12 ' + (process && 'border-black pt-1 pb-5')}>KETERANGAN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.pesertas?.filter(e => { return e.text === ruang }).map((v, i) => {
                        return <tr key={i} className='break-inside-avoid-page'>
                          <td className={'border border-gray-600 p-2 px-1 max-w-0 text-center ' + (process && 'border-black pt-1 pb-5')}>{i + 1}.</td>
                          <td className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}>{v.username}</td>
                          <td className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}>{v.name}</td>
                          <td className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}>{(i + 1) % 2 !== 0 ? (i + 1) + '.' : ''}</td>
                          <td className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}>{(i + 1) % 2 === 0 ? (i + 1) + '.' : ''}</td>
                          <td className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}></td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td colSpan={2} className='pb-10'>
                  <table className="w-full break-inside-avoid-page">
                    <tbody>
                      <tr>
                        <td align="right">
                          <table>
                            <tbody>
                              <tr>
                                <td className="pt-5">......................, ................................... {new Date(data?.start).getFullYear()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="right">
                          <div className={"flex flex-wrap gap-3 " + (countPengawas.length === 1 ? 'justify-end' : 'justify-between')}>
                            {countPengawas.map((v, i) => {
                              return <table key={i} className={i > 2 ? 'mt-5' : ''}>
                                <tbody>
                                  <tr>
                                    <td align="left">Pengawas Ujian{countPengawas.length > 1 ? ' ' + v : ''},</td>
                                  </tr>
                                  <tr>
                                    <td height="85"></td>
                                  </tr>
                                  <tr>
                                    <td align="left">(....................................................................)</td>
                                  </tr>
                                </tbody>
                              </table>
                            })}
                          </div>
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
