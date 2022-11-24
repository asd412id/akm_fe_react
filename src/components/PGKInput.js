import { Button, Label, ToggleSwitch } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
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
          opts.push('');
          setOpts([...opts]);
        }}>Tambah Pilihan</Button>
      </div>
      <div className="grid grid-flow-row md:grid-cols-2 gap-4">
        {opts.map((v, i) => {
          return <div key={i} className='flex flex-col w-full gap-1'>
            <div className="flex justify-between">
              <Label className="flex gap-2 items-center">
                <ToggleSwitch checked={crts[i]} onChange={v => {
                  crts[i] = v;
                  setCrts([...crts]);
                  onChange(opts, crts);
                }} />
                Pilihan Benar
              </Label>
              <Button size={'xs'} color='failure' pill={true} onClick={() => {
                opts.splice(i, 1);
                crts.splice(i, 1);
                setOpts([...opts]);
                setCrts([...crts]);
                onChange(opts, crts);
              }}>Hapus</Button>
            </div>
            <Editor value={v} onChange={v => {
              opts[i] = v;
              setOpts([...opts]);
              onChange(opts, crts);
            }} />
          </div>
        })}
      </div>
    </div>
  )
}
