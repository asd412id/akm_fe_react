import axios from 'axios';
import { Alert, Button, Label, Modal, Select, TextInput, ToggleSwitch } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import Editor from '../../components/Editor';
import { base64Extension, getBuffer, imgSrcs } from '../../utils/Helpers';
import md5 from 'md5';
import isBase64 from 'is-base64';
import PGInput from '../../components/PGInput';
import PGKInput from '../../components/PGKInput';
import BSInput from '../../components/BSInput';
import JDInput from '../../components/JDInput';
import { useRecoilState } from 'recoil';
import { lID, lInterval } from '../../recoil/atom/LineHelper';

export default function Form({ open = false, data = {}, title = 'Data Baru', onSubmit, onClose }) {
  const [form, setForm] = useState(data);
  const [ftemp, setFtemp] = useState(data);
  const [status, setStatus] = useState({
    show: open,
    title: title,
    disabled: false,
    error: false
  });
  const [lint, setLint] = useRecoilState(lInterval);
  const [lineID, setLineId] = useRecoilState(lID);
  const [hideElementA, setHideElementA] = useState(true);
  const [hideElementB, setHideElementB] = useState(true);

  useEffect(() => {
    status.show = open;
    status.title = title;
    status.disabled = false;
    status.error = false;
    setStatus({ ...status });
    setForm(data);
    setFtemp(data);
    setHideElementA(true);
    setHideElementB(true);
  }, [open, title, data]);

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    ftemp[name] = value;
    setFtemp({ ...ftemp });
  }

  const submit = async (e) => {
    e.preventDefault();
    status.disabled = true;
    status.error = null;
    setStatus({ ...status });

    if (!ftemp.type || !ftemp.num || !ftemp.text) {
      status.error = "Data soal belum lengkap!";
      status.disabled = false;
      setStatus({ ...status });
      return;
    }

    form.type = ftemp.type;
    form.bobot = ftemp.bobot;
    form.corrects = ftemp.corrects;
    form.options = ftemp.options;
    form.relations = ftemp.relations;
    form.labels = ftemp.labels;
    form.num = ftemp.num;
    form.assets = [];

    const { text, assets } = handleImages(ftemp.text);
    form.text = text;
    if (assets.length) {
      form.assets = [...assets, ...form.assets];
    }

    if (ftemp.type === 'U') {
      const asst = handleImages(ftemp.answer);
      form.answer = asst.text;
      if (asst.assets.length) {
        form.assets = [...form.assets, ...asst.assets];
      }
    }

    if (ftemp.type === 'IS') {
      form.answer = ftemp.answer;
    }

    if (ftemp.type !== 'IS' && ftemp.type !== 'U') {
      form.answer = '';
    }

    if (ftemp.type === 'PG' || ftemp.type === 'PGK' || ftemp.type === 'BS' || ftemp.type === 'JD') {
      form.shuffle = ftemp.shuffle;
      ftemp.options.forEach((v, i) => {
        const { text, assets } = handleImages(v.text);
        form.options[i].text = text;
        if (assets.length) {
          form.assets = [...assets, ...form.assets];
        }
      });
    } else {
      form.options = [];
      form.corrects = [];
      form.shuffle = false;
    }

    if (ftemp.type === 'BS' || ftemp.type === 'JD') {
      form.labels = ftemp.labels;
    } else {
      form.labels = [];
    }

    if (ftemp.type === 'JD') {
      ftemp.relations.forEach((v, i) => {
        const { text, assets } = handleImages(v.text);
        form.relations[i].text = text;
        if (assets.length) {
          form.assets = [...assets, ...form.assets];
        }
      });
    } else {
      form.relations = [];
    }

    try {
      let res;
      if (form.id) {
        res = await axios.put(`/soal-items/${form.soalId}/${form.id}`, form);
      } else {
        res = await axios.post(`/soal-items/${form.soalId}`, form);
      }
      if (lint) {
        clearInterval(lint);
        setLint(null);
      }
      setLineId(null);
      onSubmit(res);
    } catch (error) {
      status.error = error.response.data.message;
      status.disabled = false;
      setStatus({ ...status });
    }
  }

  const handleImages = (val) => {
    let text = val;
    const assets = [];
    const imgs = imgSrcs(val);

    imgs?.forEach(v => {
      if (isBase64(v, { allowMime: true })) {
        const fileName = `/assets/${form.soalId}/${md5(v + Date.now())}.${base64Extension(v)}`;
        assets.push({
          filename: fileName,
          base64Data: getBuffer(v)
        });
        text = text.replace(v, fileName);
      } else {
        assets.push({
          filename: v
        });
      }
    });

    return { text, assets };
  }

  const closeForm = () => {
    if (lint) {
      clearInterval(lint);
      setLint(null);
    }
    setLineId(null);
    onClose();
  }

  return (
    <Modal
      show={status.show}
      onClose={closeForm}
      size='6xl'
      position={'top-center'}
    >
      <Modal.Header className='px-3 py-2'>
        {status.title}
      </Modal.Header>
      <form onSubmit={submit}>
        <Modal.Body className='flex flex-col gap-2 relative'>
          {status.error && <Alert color={`failure`}>{status.error}</Alert>}
          <div className="flex gap-3">
            <div className="flex flex-col">
              <Label>Nomor Soal</Label>
              <div className="flex">
                <TextInput type={`number`} name='num' value={ftemp?.num} onChange={handleChange} disabled={status.disabled} required />
              </div>
            </div>
            <div className="flex flex-col">
              <Label>Tipe Soal</Label>
              <div className='flex'>
                <Select name='type' value={ftemp?.type} onChange={handleChange} disabled={status.disabled} required>
                  <option value="PG">Pilihan Ganda</option>
                  <option value="PGK">Pilihan Ganda Kompleks</option>
                  <option value="IS">Isian Singkat</option>
                  <option value="BS">Benar/Salah</option>
                  <option value="JD">Menjodohkan</option>
                  <option value="U">Uraian</option>
                </Select>
              </div>
            </div>
            <div className="flex flex-col">
              <Label>Skor Soal</Label>
              <div className="flex gap-3 items-center">
                <TextInput type={`number`} name='bobot' value={ftemp?.bobot} onChange={handleChange} disabled={status.disabled} required />
                {(ftemp.type !== 'U' && ftemp.type !== 'IS') && <ToggleSwitch checked={ftemp?.shuffle} onChange={e => {
                  ftemp.shuffle = e;
                  setFtemp({ ...ftemp });
                }} label={ftemp.shuffle ? 'Acak Pilihan' : 'Pilihan Tidak Diacak'} />}
              </div>
            </div>
          </div>
          <div className="flex flex-col mb-4">
            <div className="flex gap-1 items-center justify-between mb-1">
              <Label>Teks Soal</Label>
              <Button size={'xs'} color='dark' pill={true} onClick={() => setHideElementA(!hideElementA)}>{hideElementA ? 'Edit' : 'Selesai'}</Button>
            </div>
            {hideElementA === true ?
              <div onDoubleClick={() => setHideElementA(!hideElementA)} className='p-3 w-full border-2 border-dashed rounded border-gray-300' dangerouslySetInnerHTML={{ __html: ftemp?.text ? ftemp?.text : '<p><i>Belum ada teks soal</i></p>' }}></div>
              :
              <Editor
                theme='snow'
                value={ftemp?.text}
                disabled={status.disabled}
                onChange={e => {
                  ftemp.text = e;
                  setFtemp({ ...ftemp });
                }}
              />
            }
          </div>
          {ftemp.type === 'JD' ?
            <div className="flex flex-col">
              <Label>Pilihan</Label>
              <JDInput options={ftemp.options} id={form.id} corrects={ftemp.corrects} labels={ftemp.labels} relations={ftemp.relations} onChange={(options, relations, corrects, labels) => {
                ftemp.options = options;
                ftemp.corrects = corrects;
                ftemp.labels = labels;
                ftemp.relations = relations;
                setFtemp({ ...ftemp });
              }} />
            </div>
            : ftemp.type === 'U' ?
              <div className="flex flex-col">
                <div className="flex gap-1 items-center justify-between mb-1">
                  <Label>Jawaban</Label>
                  <Button size={'xs'} color='dark' pill={true} onClick={() => setHideElementB(!hideElementB)}>{hideElementB ? 'Edit' : 'Selesai'}</Button>
                </div>
                {hideElementB === true ?
                  <div onDoubleClick={() => setHideElementB(!hideElementB)} className='p-3 w-full border-2 border-dashed rounded border-gray-300' dangerouslySetInnerHTML={{ __html: ftemp?.answer ? ftemp?.answer : '<p><i>Jawaban belum diisi</i></p>' }}></div>
                  :
                  <Editor value={ftemp?.answer} onChange={e => {
                    ftemp.answer = e;
                    setFtemp({ ...ftemp });
                  }} />
                }
              </div>
              : ftemp.type === 'PG' ?
                <div className="flex flex-col">
                  <Label>Pilihan</Label>
                  <PGInput options={ftemp.options} corrects={ftemp.corrects} onChange={(options, corrects) => {
                    ftemp.options = options;
                    ftemp.corrects = corrects;
                    setFtemp({ ...ftemp });
                  }} />
                </div>
                : ftemp.type === 'PGK' ?
                  <div className="flex flex-col">
                    <Label>Pilihan</Label>
                    <PGKInput options={ftemp.options} corrects={ftemp.corrects} onChange={(options, corrects) => {
                      ftemp.options = options;
                      ftemp.corrects = corrects;
                      setFtemp({ ...ftemp });
                    }} />
                  </div>
                  : ftemp.type === 'BS' ?
                    <div className="flex flex-col">
                      <Label>Pilihan</Label>
                      <BSInput options={ftemp.options} corrects={ftemp.corrects} labels={ftemp.labels} onChange={(options, corrects, labels) => {
                        ftemp.options = options;
                        ftemp.corrects = corrects;
                        ftemp.labels = labels;
                        setFtemp({ ...ftemp });
                      }} />
                    </div>
                    : <div className="flex flex-col">
                      <Label>Jawaban</Label>
                      <TextInput name='answer' value={ftemp?.answer} onChange={handleChange} disabled={status.disabled} />
                    </div>}
        </Modal.Body>
        <Modal.Footer className='flex justify-end px-3 py-2'>
          <Button
            type='submit' disabled={status.disabled}>
            SIMPAN
          </Button>
          <Button
            color="gray"
            type='button'
            onClick={closeForm}
            disabled={status.disabled}
          >
            BATAL
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
