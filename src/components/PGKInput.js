import { Button, Label, ToggleSwitch } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import { alphabetRange } from '../utils/Helpers';
import Editor from './Editor';

export default function PGKInput({ options = [], corrects = [], onChange }) {
  const [opts, setOpts] = useState(options);
  const [crts, setCrts] = useState(corrects);
  const [hideElement, setHideElement] = useState([]);

  useEffect(() => {
    setOpts(options);
    setCrts(corrects);
    setHideElement([]);
    options.forEach((v, i) => {
      hideElement[i] = { hide: hideElement[i]?.hide ?? true };
      setHideElement([...hideElement]);
    });
  }, [JSON.stringify(options), JSON.stringify(corrects)]);

  const showElement = (i) => {
    hideElement[i] = { hide: !hideElement[i]?.hide };
    setHideElement([...hideElement]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <Button size={`xs`} onClick={() => {
          const k = alphabetRange('A', 'Z')[opts.length];
          opts.push({
            key: k,
            text: null
          });
          crts[k] = false;
          setCrts({ ...crts });
          setOpts([...opts]);
          onChange(opts, crts);
        }}>Tambah Pilihan</Button>
      </div>
      <div className="grid grid-flow-row md:grid-cols-2 gap-4">
        {opts.map((v, i) => {
          return <div key={v.key} className='flex flex-col w-full gap-1'>
            <div className="flex justify-between">
              <Label className="flex gap-2 items-center">
                <ToggleSwitch checked={crts[v.key]} onChange={e => {
                  crts[v.key] = e;
                  setCrts({ ...crts });
                  onChange(opts, crts);
                }} />
                Pilihan Benar
              </Label>
              <div className="flex gap-1">
                <Button size={'xs'} color='dark' pill={true} onClick={() => showElement(i)}>{hideElement[i]?.hide ? 'Edit' : 'Selesai'}</Button>
                <Button size={'xs'} color='failure' pill={true} onClick={() => {
                  opts.splice(i, 1);
                  Object.keys(crts).forEach(k => delete crts[k]);
                  opts.forEach((v, i) => {
                    opts[i].key = alphabetRange('A', 'Z')[i];
                    crts[v.key] = false;
                  });
                  hideElement.splice(i, 1);
                  setHideElement([...hideElement]);
                  setOpts([...opts]);
                  setCrts({ ...crts });
                  onChange(opts, crts);
                }}>Hapus</Button>
              </div>
            </div>
            {(hideElement.length > 0 && hideElement[i]?.hide === true) || hideElement[i] === undefined ?
              <div onDoubleClick={() => showElement(i)} className='p-3 w-full border-2 border-dashed rounded border-gray-300' dangerouslySetInnerHTML={{ __html: v.text ?? '<p><i>Pilihan belum diisi</i></p>' }}></div>
              :
              <Editor value={v.text} onChange={e => {
                opts[i].text = e;
                setOpts([...opts]);
                onChange(opts, crts);
              }} />
            }
          </div>
        })}
      </div>
    </div>
  )
}
