import { Alert, Button, Modal, Select } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil';
import { userDataAtom } from '../../recoil/atom/userAtom';
import html2pdf from 'html2pdf.js';
import printElement from 'print-html-element';
import { BsFilePdf, BsPrinter } from 'react-icons/bs';
import axios from 'axios';
import dateFormat from 'dateformat';
import { i18n } from 'dateformat';
i18n.monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function KartuPeserta({ open, onClose }) {
  const [show, setShow] = useState(false);
  const [data, setData] = useState(null);
  const userData = useRecoilValue(userDataAtom);
  const [process, setProcess] = useState(false);
  const [ruangs, setRuangs] = useState([]);
  const [ruang, setRuang] = useState('');
  const pdf = useRef(null);

  useEffect(() => {
    setShow(open);
    if (open) {
      fetchRuang();
    }
  }, [open]);

  useEffect(() => {
    if (ruang !== '') {
      fetchPeserta();
    }
  }, [ruang]);

  const fetchRuang = async () => {
    try {
      const res = await axios.get('/pesertas/ruangs');
      setRuangs(res.data);
      if (res.data.length) {
        setRuang(res.data[0]);
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  const fetchPeserta = async () => {
    try {
      const res = await axios.get('/pesertas/ruangs/' + ruang);
      setData(res.data);
    } catch (error) {
      console.log(error.message);
    }
  }

  const downloadPdf = () => {
    setProcess(true);
    var opt = {
      margin: 3,
      filename: (('Kartu Peserta (' + ruang + ')').toUpperCase()) + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: [215, 330], orientation: 'portrait' }
    };
    html2pdf().set(opt).from(pdf.current).save().then(() => setProcess(false));
  }

  const printData = () => {
    const opts = {
      pageTitle: (('Kartu Peserta (' + ruang + ')').toUpperCase())
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
        Kartu Peserta Ujian {ruang ?? '...'}
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-5">
          <div className="flex justify-center gap-2 items-center">
            <Select value={ruang} className='w-40' onChange={e => {
              setRuang(e.target.value);
            }}>
              {ruangs.length ?
                ruangs?.map((v, i) => {
                  return <option key={i} value={v}>{v}</option>
                }) : <option value={''}>Ruang tidak tersedia</option>
              }
            </Select>
            <Button size='sm' onClick={() => downloadPdf()} disabled={process} className='flex items-center' color={'gray'}><BsFilePdf className='w-4 h-4 text-red-600 mr-1' /> Download PDF</Button>
            <Button size='sm' onClick={() => printData()} disabled={process} className='flex items-center' color={'gray'}><BsPrinter className='w-4 h-4 text-purple-600 mr-1' /> Print</Button>
          </div>
          <div className={"w-full gap-1 " + (data?.length ? 'grid grid-cols-2' : '')} ref={pdf}>
            {data?.length ? data?.map((v, i) => {
              return <div>
                <div className={'border border-black px-3 py-2 break-inside-avoid-page ' + ((i + 1) % 10 === 0 && 'break-after-page')}>
                  <table className="card w-full">
                    <tbody>
                      <tr>
                        <td colSpan={3} className='w-full'>
                          <table className="w-full">
                            <tbody>
                              <tr>
                                <td colSpan={3} className={"text-center font-bold " + (process && 'pt-0 pb-2')}>
                                  KARTU PESERTA UJIAN
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={3} className="border-t-2 border-black pb-2"></td>
                              </tr>
                              <tr className="text-sm">
                                <td>ID PESERTA</td>
                                <td>:</td>
                                <td className='font-semibold'>{v?.username}</td>
                              </tr>
                              <tr className="text-sm">
                                <td>NAMA</td>
                                <td>:</td>
                                <td className='font-semibold'>{v?.name?.toUpperCase()}</td>
                              </tr>
                              <tr className="text-sm">
                                <td>KELAS/RUANG</td>
                                <td>:</td>
                                <td className='font-semibold'>{v?.ruang?.toUpperCase()}</td>
                              </tr>
                              <tr className='text-sm'>
                                <td>PASSWORD</td>
                                <td>:</td>
                                <td className='font-semibold'>{v?.password_raw}</td>
                              </tr>
                              <tr className='text-sm'>
                                <td className="text-right pt-2" colSpan={3}>
                                  {dateFormat(new Date(), 'dd mmmm yyyy')}
                                  <br />
                                  <br />
                                  <br />
                                  Panitia Ujian
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            }) : <Alert>Data tidak tersedia</Alert>}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
