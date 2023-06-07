import axios from 'axios';
import ExcelJS from 'exceljs';
import { Alert, Button, Dropdown, Spinner, Table, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react'
import { FcViewDetails } from 'react-icons/fc';
import { HiCloudDownload, HiCloudUpload, HiPencil, HiTrash } from 'react-icons/hi';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useParams } from 'react-router-dom';
import striptags from 'striptags';
import { shortText } from "limit-text-js";
import DeleteModal from '../../components/DeleteModal';
import Auth from '../../layouts/Auth';
import Form from './Form';
import View from './View';
import { BsFileSpreadsheet } from 'react-icons/bs';
import { DropdownItem } from 'flowbite-react/lib/esm/components/Dropdown/DropdownItem';
import { alphabetRange, excelRichTexttoHtml, extractImageFromExcel, handleDownload, handleImages, sprintf } from '../../utils/Helpers';
import md5 from 'md5';

export default function Index() {
  const { katid, soalid } = useParams();
  const [datas, setDatas] = useState(null);
  const [title, setTitle] = useState('...');
  const [status, setStatus] = useState({
    loaded: false,
    success: null,
    error: null,
  })
  const [view, setView] = useState({
    show: false,
    data: {},
  })
  const [tm, setTm] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    page: 0,
    size: 20
  })
  const initForm = {
    id: null,
    type: 'PG',
    num: 1,
    text: '',
    bobot: 0,
    labels: [],
    options: [],
    relations: [],
    corrects: {},
    answer: '',
    assets: [],
    shuffle: false,
    soalId: soalid
  };
  const [form, setForm] = useState({
    show: false,
    title: 'Data Baru',
    data: initForm,
  });
  const [destroy, setDestroy] = useState({
    show: false,
    title: '',
    link: null
  });
  const uexcel = useRef(null);

  useEffect(() => {
    const soal = async () => {
      try {
        const res = await axios.get(`/soals/${katid}/${soalid}`);
        setTitle(`${res.data.name}${res.data.desc && ' (' + res.data.desc + ')'}`);
      } catch (error) {
        errorResponse('Tidak dapat memuat data: ' + error.response.data.message);
      }
    }

    soal();
  }, [title]);

  useEffect(() => {
    getDatas();
  }, [filters.page, filters.search]);

  const errorResponse = (err) => {
    status.error = err.response.data.message;
    form.show = false;
    destroy.show = false;
    form.data = initForm;
    setForm({ ...form });
    setDestroy({ ...destroy });
    setStatus({ ...status });
    datas['datas'] = [];
    filters.page = 0;
    setFilters({ ...filters });
    setDatas({ ...datas });
    getDatas();
    setTimeout(() => {
      status.error = null;
      setStatus({ ...status });
    }, 3000);
  }

  const successResponse = (res) => {
    status.success = res.data.message;
    status.disabled = false;
    form.show = false;
    destroy.show = false;
    form.data = initForm;
    setForm({ ...form });
    setDestroy({ ...destroy });
    setStatus({ ...status });
    datas['datas'] = [];
    filters.page = 0;
    setFilters({ ...filters });
    setDatas({ ...datas });
    getDatas();
    setTimeout(() => {
      status.success = null;
      setStatus({ ...status });
    }, 3000);
  }

  const getDatas = async () => {
    try {
      const res = await axios.get(`/soal-items/${soalid}?search=${filters.search}&page=${filters.page}&size=${filters.size}`);
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

  const importExcel = (e) => {
    if (e.target.files[0] !== undefined) {
      status.disabled = true;
      status.error = null;
      setStatus({ ...status });
      const time = Date.now();
      const workbook = new ExcelJS.Workbook();
      const reader = new FileReader();
      reader.readAsArrayBuffer(e.target.files[0]);
      reader.onload = async () => {
        const buffer = reader.result;
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.getWorksheet('Soal');
        const soals = [];

        for (let i = 1; i <= worksheet.rowCount; i++) {
          if (i > 1) {
            const row = worksheet.getRow(i);
            const num = row.getCell(1).text.trim();
            if (!num || isNaN(num)) {
              continue;
            }

            const type = row.getCell(3).text.trim().toUpperCase();
            if (!['pg', 'pgk', 'bs', 'jd', 'u', 'is'].includes(type.toLowerCase())) {
              continue;
            }

            const opsi_count = row.getCell(7).text.trim().split(";").map(v => { return v.trim() });

            const bobot = row.getCell(6).text.trim();
            if (!bobot || isNaN(bobot)) {
              continue;
            }

            const shuffle = row.getCell(5).text.trim().toLocaleLowerCase() === 'ya' ? true : false;

            let soal = row.getCell(2);
            const richText = soal.value?.richText;
            if (richText) {
              soal = excelRichTexttoHtml(richText);
            } else {
              soal = soal.text;
            }

            const img = extractImageFromExcel(workbook, worksheet);
            img.sort((a, b) => a.range.tl.nativeRowOff - b.range.tl.nativeRowOff);

            const assets = [];
            if (img.length) {
              const inserted = [];
              for (let j = 0; j < img.length; j++) {
                const v = img[j];

                if (v.range.tl.nativeRow === (i - 1) && v.range.tl.nativeCol === 1) {
                  const fileName = `/assets/${soalid}/${md5(v.name + time)}.${v.extension}`;
                  const src = sprintf('<p><img src="%s" alt=""></p>', fileName);
                  assets.push({
                    filename: fileName,
                    base64Data: v.base64Data
                  });

                  if (v.range.tl.nativeRowOff === 0) {
                    soal = src + soal;
                  } else if (v.range.br.nativeRowOff === 0) {
                    soal = soal + src;
                  } else {
                    const _break = soal.split("\n\n");
                    if (_break.length > 0) {
                      soal = '';
                      for (let k = 0; k < _break.length; k++) {
                        soal += _break[k];
                        if (!inserted.includes(j)) {
                          inserted.push(j);
                          soal += src;
                        } else {
                          if (k < _break.length - 1) {
                            soal += "\n\n";
                          }
                        }
                      }
                    }
                  }
                }
              }
            }

            const options = [];
            const corrects = {};
            const relations = [];
            const color1 = [];
            const color2 = [];
            let answer = null;
            const labels = row.getCell(4).text.split(";").map(v => { return v.trim() });
            const totalOpsi = opsi_count.reduce((a, b) => parseInt(a) + parseInt(b), 0);

            let ij = 0;
            for (let j = 0; j < totalOpsi; j++) {
              const k = j + 8;

              let val = row.getCell(k);

              const richText = val.value?.richText;
              if (richText) {
                val = excelRichTexttoHtml(richText);
              } else {
                val = val.text;
              }

              if (img.length) {
                const inserted = [];
                for (let l = 0; l < img.length; l++) {
                  const v = img[l];

                  if (v.range.tl.nativeRow === (i - 1) && v.range.tl.nativeCol === (k - 1)) {
                    const fileName = `/assets/${soalid}/${md5(v.name + time)}.${v.extension}`;
                    const src = sprintf('<p><img src="%s" alt=""></p>', fileName);
                    assets.push({
                      filename: fileName,
                      base64Data: v.base64Data
                    });

                    if (v.range.tl.nativeRowOff === 0) {
                      val = src + val;
                    } else if (v.range.br.nativeRowOff === 0) {
                      val = val + src;
                    } else {
                      const _break = val.split("\n\n");
                      if (_break.length > 0) {
                        val = '';
                        for (let m = 0; m < _break.length; m++) {
                          val += _break[m];
                          if (!inserted.includes(l)) {
                            inserted.push(l);
                            val += src;
                          } else {
                            if (l < _break.length - 1) {
                              val += "\n\n";
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }

              if (type.toLowerCase() == 'is' || type.toLowerCase() == 'u') {
                answer = val.trim();
              } else if (['pg', 'pgk', 'bs'].includes(type.toLowerCase())) {
                options.push({
                  key: alphabetRange('A', 'Z')[j],
                  text: val.trim()
                });
                corrects[alphabetRange('A', 'Z')[j]] = row.getCell(k)?.style?.fill?.pattern !== 'none';
              } else {
                if (opsi_count.length !== 2) {
                  continue;
                }
                if (j < Number(opsi_count[0])) {
                  color1[j] = md5(String(JSON.stringify(row.getCell(k)?.style?.fill?.fgColor)));
                  options.push({
                    key: alphabetRange('A', 'Z')[j],
                    text: val.trim()
                  });
                } else {
                  color2[ij] = md5(String(JSON.stringify(row.getCell(k)?.style?.fill?.fgColor)));
                  relations.push({
                    key: alphabetRange('A', 'Z')[ij],
                    text: val.trim()
                  });
                  ij++;
                }
              }

            }

            if (type.toLowerCase() === 'jd') {
              color1.forEach((v, i) => {
                color2.forEach((vv, ii) => {
                  if (v === vv) {
                    corrects[alphabetRange('A', 'Z')[i]] = alphabetRange('A', 'Z')[ii];
                  }
                })
              })
            }

            soals.push({
              num: num,
              type: type,
              text: soal,
              bobot: bobot,
              options: options,
              corrects: corrects,
              relations: relations,
              answer: answer,
              shuffle: shuffle,
              labels: labels,
              assets: assets,
            });

          }
        }

        try {
          const res = await axios.post(`/soal-items/${soalid}/import`, soals);
          successResponse(res);
        } catch (error) {
          status.disabled = false;
          setStatus({ ...status });
          errorResponse(error.response.data.message);
        }
        uexcel.current.value = '';
      }
    }
  }

  return (
    <Auth title={`Soal ${title}`} success={status.success} error={status.error}>
      <Form
        open={form.show}
        onClose={() => {
          form.show = false;
          form.data = initForm;
          datas['datas'] = [];
          filters.page = 0;
          setFilters({ ...filters });
          setForm({ ...form });
          setDatas({ ...datas });
          getDatas();
        }}
        data={form.data}
        onSubmit={successResponse}
        title={form.title} />

      <View
        open={view.show}
        data={view.data}
        onClose={() => {
          view.show = false;
          view.data = {};
          setView({ ...view });
        }}
      />

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

      <div className="flex flex-col gap-1">
        <div className="flex gap-1 flex-wrap md:justify-between justify-center items-center">
          <div className="flex gap-1 items-center">
            <Button type='button' size={`sm`}
              onClick={() => {
                form.data = initForm;
                form.data.num = (datas?.datas.length ?? 0) + 1;
                form.title = 'Data Baru';
                form.show = true;
                setForm({ ...form });
              }} disabled={status.disabled}>Tambah Data</Button>
            <Dropdown
              size={'sm'}
              color='gray'
              label={<div className='flex items-center text-green-600'><BsFileSpreadsheet className='w-4 h-4 mr-1' /> Excel</div>}
            >
              <DropdownItem icon={HiCloudDownload} onClick={e => handleDownload('/assets/format_soal.xlsx', `SOAL ${title.toUpperCase()}.xlsx`)}>
                Download Template Excel
              </DropdownItem>
              <DropdownItem icon={HiCloudUpload}
                onClick={() => {
                  uexcel.current.click();
                }} disabled={status.disabled}>
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
                    Soal
                  </Table.HeadCell>
                  <Table.HeadCell className='whitespace-nowrap'>
                    Tipe Soal
                  </Table.HeadCell>
                  <Table.HeadCell>
                    Nilai
                  </Table.HeadCell>
                  <Table.HeadCell>
                    <span className="sr-only">
                      Edit
                    </span>
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {datas?.datas.length && datas?.datas.map((v) => {
                    return <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={v.id}>
                      <Table.Cell>
                        {v.num}
                      </Table.Cell>
                      <Table.Cell dangerouslySetInnerHTML={{ __html: shortText(striptags(v.text, ['sup', 'sub']), 95, '...') }}></Table.Cell>
                      <Table.Cell>
                        {v.type}
                      </Table.Cell>
                      <Table.Cell>
                        {v.bobot}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-1 whitespace-nowrap">
                          <Button className='py-1 px-0' pill={true} size={`xs`} color='info' title='Tampilkan Soal' onClick={() => {
                            view.show = true;
                            view.data = v;
                            setView({ ...view });
                          }}><FcViewDetails className='w-3 h-3' /></Button>
                          <Button className='py-1 px-0' pill={true} size={`xs`} color='warning' title='Edit'
                            onClick={() => {
                              form.data = { ...v };
                              form.show = true;
                              form.title = `Ubah Data Soal Nomor ${v.num}`;
                              setForm({ ...form });
                            }}><HiPencil className='w-3 h-3' /></Button>
                          <Button className='py-1 px-0' pill={true} size={`xs`} color='failure' title='Hapus'
                            onClick={() => {
                              destroy.link = `/soal-items/${soalid}/${v.id}`;
                              destroy.title = `Soal Nomor ${v.num}`;
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
