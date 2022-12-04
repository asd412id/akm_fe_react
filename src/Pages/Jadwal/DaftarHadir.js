import { Button, Modal, Select } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil';
import { userDataAtom } from '../../recoil/atom/userAtom';
import html2pdf from 'html2pdf.js';
import { BsFilePdf } from 'react-icons/bs';

export default function DaftarHadir({ jadwal, open, onClose }) {
  const [show, setShow] = useState(false);
  const [data, setData] = useState(null);
  const userData = useRecoilValue(userDataAtom);
  const [process, setProcess] = useState(false);
  const [ruangs, setRuangs] = useState([]);
  const [ruang, setRuang] = useState(null);
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
    setRuang(r[0]);
  }, [open]);

  const printPdf = () => {
    setProcess(true);
    var opt = {
      margin: 10,
      filename: (('daftar hadir ' + jadwal?.name + '(' + ruang + ')').toUpperCase()) + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: [215, 330], orientation: 'portrait' }
    };
    html2pdf().set(opt).from(pdf.current).save().then(() => setProcess(false));
  }

  return (
    <Modal
      show={show}
      size={'4xl'}
      position='top-center'
      onClose={onClose}
    >
      <Modal.Header className='px-3 py-2'>
        Daftar Hadir {data?.name}
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-5">
          <div className="flex justify-center gap-2 items-center">
            <Select value={ruang} className='w-32' onChange={e => {
              setRuang(e.target.value);
            }}>
              {ruangs?.map((v, i) => {
                return <option key={i} value={v}>{v}</option>
              })}
            </Select>
            <Button size='sm' onClick={() => printPdf()} disabled={process} className='flex items-center' color={'gray'}><BsFilePdf className='w-4 h-4 text-red-600 mr-1' /> Download PDF</Button>
          </div>
          <table ref={pdf} className='w-full' style={{ lineHeight: '0.95em' }}>
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
                <td colSpan={2} className={'pt-1 ' + (process && 'pt-3')}>
                  <table className='w-full'>
                    <thead>
                      <tr className='bg-gray-100'>
                        <th className={'border border-gray-600 p-2 max-w-0 ' + (process && 'border-black pt-1 pb-5')}>NO.</th>
                        <th className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}>ID PESERTA</th>
                        <th className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}>NAMA</th>
                        <th className={'border border-gray-600 p-2 w-3/12 ' + (process && 'border-black pt-1 pb-5')} colSpan={2}>TTD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.pesertas?.filter(e => { return e.text === ruang }).map((v, i) => {
                        return <tr key={i} className='break-inside-avoid-page'>
                          <td className={'border border-gray-600 p-2 text-center ' + (process && 'border-black pt-1 pb-5')}>{i + 1}.</td>
                          <td className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}>{v.username}</td>
                          <td className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}>{v.name}</td>
                          <td className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}>{(i + 1) % 2 !== 0 ? (i + 1) + '.' : ''}</td>
                          <td className={'border border-gray-600 p-2 ' + (process && 'border-black pt-1 pb-5')}>{(i + 1) % 2 === 0 ? (i + 1) + '.' : ''}</td>
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
                              <tr>
                                <td align="left">Pengawas Ujian,</td>
                              </tr>
                              <tr>
                                <td height="100"></td>
                              </tr>
                              <tr>
                                <td align="left">(..............................................)</td>
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
