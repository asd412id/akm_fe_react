import { Button, Modal, Select } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil';
import { userDataAtom } from '../../recoil/atom/userAtom';
import html2pdf from 'html2pdf.js';
import printElement from 'print-html-element';
import excel from 'exceljs';
import { BsFileExcel, BsFilePdf, BsPrinter } from 'react-icons/bs';
import axios from 'axios';

export default function DaftarNilai({ jadwal, open, onClose }) {
  const [show, setShow] = useState(false);
  const [data, setData] = useState(null);
  const userData = useRecoilValue(userDataAtom);
  const [process, setProcess] = useState(false);
  const [ruangs, setRuangs] = useState([]);
  const [ruang, setRuang] = useState('');
  const [datas, setDatas] = useState([]);
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
  }, [open]);

  useEffect(() => {
    if (ruang !== '' && jadwal?.id) getPesertas();
  }, [ruang]);

  const getPesertas = async () => {
    setProcess(true);
    try {
      const res = await axios.get(`/nilais/${jadwal.id}/${ruang}`);
      setDatas(res.data);
      setProcess(false);
    } catch (error) {
      console.log(error?.response?.data?.message ?? error.message);
      setProcess(false);
    }
  }

  const downloadPdf = () => {
    setProcess(true);
    var opt = {
      margin: 10,
      filename: (('daftar nilai ' + data?.name + ' (' + ruang + ')').toUpperCase()) + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: [215, 330], orientation: 'portrait' }
    };
    html2pdf().set(opt).from(pdf.current).save().then(() => setProcess(false));
  }

  const downloadExcel = () => {
    setProcess(true);
    const filename = ('daftar nilai ' + data?.name + ' (' + ruang + ')').toUpperCase();
    const wb = new excel.Workbook();
    const sheet = wb.addWorksheet(ruang.toUpperCase());
    sheet.addRow(['NO', 'ID PESERTA', 'NAMA', 'RUANG/KELAS', 'NILAI', 'KETERANGAN']);

    sheet.getColumn('A').width = 5;
    sheet.getColumn('B').width = 20;
    sheet.getColumn('C').width = 30;
    sheet.getColumn('D').width = 20;
    sheet.getColumn('E').width = 10;
    sheet.getColumn('F').width = 20;

    sheet.getCell('A1').font = { bold: true };
    sheet.getCell('B1').font = { bold: true };
    sheet.getCell('C1').font = { bold: true };
    sheet.getCell('D1').font = { bold: true };
    sheet.getCell('E1').font = { bold: true };
    sheet.getCell('F1').font = { bold: true };

    sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCACACA' } };
    sheet.getCell('B1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCACACA' } };
    sheet.getCell('C1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCACACA' } };
    sheet.getCell('D1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCACACA' } };
    sheet.getCell('E1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCACACA' } };
    sheet.getCell('F1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCACACA' } };

    sheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    sheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    sheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    sheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    sheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    sheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    sheet.getColumn('A').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getCell('C1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getColumn('D').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getColumn('E').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getCell('F1').alignment = { vertical: 'middle', horizontal: 'center' };

    datas?.forEach((v, i) => {
      sheet.addRow([(i + 1), v.username, v.name, v.ruang, ((v.peserta_logins.length && v.peserta_logins[0].peserta_tests.length) ? parseFloat(v.peserta_logins[0]?.peserta_tests[0]?.nilai).toFixed(2) : 0), '']);
      sheet.getCell('A' + (i + 2)).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      sheet.getCell('B' + (i + 2)).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      sheet.getCell('C' + (i + 2)).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      sheet.getCell('D' + (i + 2)).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      sheet.getCell('E' + (i + 2)).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      sheet.getCell('F' + (i + 2)).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    wb.xlsx.writeBuffer().then(function (data) {
      const blob = new Blob([data],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${filename}.xlsx`;
      anchor.dispatchEvent(new MouseEvent('click'));
      window.URL.revokeObjectURL(url);
      setProcess(false);
    });
  }

  const printData = () => {
    const opts = {
      pageTitle: (('daftar nilai ' + data?.name + ' (' + ruang + ')').toUpperCase())
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
        Daftar Nilai {data?.name}{ruang ? ' (' + ruang + ')' : ''}
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
            <Button size='sm' onClick={() => downloadPdf()} disabled={process} className='flex items-center' color={'gray'}><BsFilePdf className='w-4 h-4 text-red-600 mr-1' /> Download PDF</Button>
            <Button size='sm' onClick={() => downloadExcel()} disabled={process} className='flex items-center' color={'gray'}><BsFileExcel className='w-4 h-4 text-green-600 mr-1' /> Download Excel</Button>
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
                        <td className='text-center font-bold pt-3'>DAFTAR NILAI PESERTA</td>
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
                        <th className={'border border-black ' + (process && 'pt-1 pb-5')}>NO.</th>
                        <th className={'border border-black p-2 ' + (process && 'pt-1 pb-5')}>ID PESERTA</th>
                        <th className={'border border-black p-2 ' + (process && 'pt-1 pb-5')}>NAMA</th>
                        <th className={'border border-black p-2 ' + (process && 'pt-1 pb-5')}>NILAI</th>
                        <th className={'border border-black p-2 ' + (process && 'pt-1 pb-5')}>KETERANGAN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datas.map((v, i) => {
                        return <tr key={i} className='break-inside-avoid-page'>
                          <td className={'border border-black p-2 px-1 max-w-0 text-center ' + (process && 'pt-1 pb-5')}>{i + 1}.</td>
                          <td className={'border border-black p-2 ' + (process && 'pt-1 pb-5')}>{v.username}</td>
                          <td className={'border border-black p-2 ' + (process && 'pt-1 pb-5')}>{v.name}</td>
                          <td className={'border border-black p-2 text-center ' + (process && 'pt-1 pb-5')}>{(v.peserta_logins.length && v.peserta_logins[0].peserta_tests.length) ? parseFloat(v.peserta_logins[0]?.peserta_tests[0]?.nilai).toFixed(2) : 0}</td>
                          <td className={'border border-black p-2 ' + (process && 'pt-1 pb-5')}></td>
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
                                <td align="left" className='pt-3'>Guru Mata Pelajaran,</td>
                              </tr>
                              <tr>
                                <td height="100"></td>
                              </tr>
                              <tr>
                                <td align="left">(....................................................................)</td>
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
