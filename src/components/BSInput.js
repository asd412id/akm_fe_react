import { Button, Table, TextInput, ToggleSwitch } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import { alphabetRange } from '../utils/Helpers';
import Editor from './Editor';

export default function BSInput({ options = [], corrects = [], labels = ['Pernyataan', 'Benar/Salah'], onChange }) {
  const [opts, setOpts] = useState(options);
  const [crts, setCrts] = useState(corrects);
  const [lbls, setLbls] = useState(labels)

  useEffect(() => {
    setOpts(options);
    setCrts(corrects);
    setLbls(labels.length ? labels : ['Pernyataan', 'Benar/Salah']);
  }, [JSON.stringify(options), JSON.stringify(corrects), JSON.stringify(labels)]);

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
          onChange(opts, crts, lbls);
        }}>Tambah Pilihan</Button>
      </div>
      <Table>
        <Table.Head>
          <Table.HeadCell>
            <TextInput value={lbls[0]} onChange={e => {
              lbls[0] = e.target.value;
              setLbls({ ...lbls });
              onChange(opts, crts, lbls);
            }} placeholder='Label Pernyataan' />
          </Table.HeadCell>
          <Table.HeadCell colSpan={2}>
            <TextInput value={lbls[1]} onChange={e => {
              lbls[1] = e.target.value;
              setLbls({ ...lbls });
              onChange(opts, crts, lbls);
            }} placeholder='Label Pernyataan Benar/Salah' />
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {opts.map((v, i) => {
            return <Table.Row key={v.key} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white w-6/12">
                <Editor value={v.text} onChange={e => {
                  opts[i].text = e;
                  setOpts([...opts]);
                  onChange(opts, crts, lbls);
                }} />
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                <div className="flex justify-center">
                  <ToggleSwitch label={crts[v.key] ? 'Benar' : 'Salah'} checked={crts[v.key]} onChange={e => {
                    crts[v.key] = e;
                    setCrts({ ...crts });
                    onChange(opts, crts, lbls);
                  }} />
                </div>
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                <div className="flex justify-center">
                  <Button size={'xs'} color='failure' pill={true} onClick={() => {
                    opts.splice(i, 1);
                    Object.keys(crts).forEach(k => delete crts[k]);
                    opts.forEach((v, i) => {
                      opts[i].key = alphabetRange('A', 'Z')[i];
                      crts[v.key] = false;
                    });
                    setOpts([...opts]);
                    setCrts({ ...crts });
                    onChange(opts, crts, lbls);
                  }}>Hapus</Button>
                </div>
              </Table.Cell>
            </Table.Row>
          })}
        </Table.Body>
      </Table>
    </div>
  )
}
