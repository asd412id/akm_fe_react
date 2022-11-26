import { Button, Label, ToggleSwitch } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import { alphabetRange } from '../utils/Helpers';
import Editor from './Editor';

export default function PGKInput({ options = [], corrects = [], onChange }) {
  const [opts, setOpts] = useState(options);
  const [crts, setCrts] = useState(corrects);

  useEffect(() => {
    setOpts(options);
    setCrts(corrects);
  }, [JSON.stringify(options), JSON.stringify(corrects)]);

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
              <Button size={'xs'} color='failure' pill={true} onClick={() => {
                opts.splice(i, 1);
                Object.keys(crts).forEach(k => delete crts[k]);
                opts.forEach((v, i) => {
                  opts[i].key = alphabetRange('A', 'Z')[i];
                  crts[v.key] = false;
                });
                setOpts([...opts]);
                setCrts({ ...crts });
                onChange(opts, crts);
              }}>Hapus</Button>
            </div>
            <Editor value={v.text} onChange={e => {
              opts[i].text = e;
              setOpts([...opts]);
              onChange(opts, crts);
            }} />
          </div>
        })}
      </div>
    </div>
  )
}
