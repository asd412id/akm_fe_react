import { Button, Table, TextInput, ToggleSwitch } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import Editor from './Editor';

export default function BSInput({ options = [], corrects = [], labels = ['Pernyataan', 'Benar', 'Salah'], onChange }) {
  const [opts, setOpts] = useState(options);
  const [crts, setCrts] = useState(corrects);
  const [lbls, setLbls] = useState(labels)

  useEffect(() => {
    setOpts(options);
    setCrts(corrects);
    setLbls(labels.length ? labels : ['Pernyataan', 'Benar', 'Salah']);
  }, [JSON.stringify(options), JSON.stringify(corrects), JSON.stringify(labels)]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <Button size={`xs`} onClick={() => {
          opts.push('');
          setOpts([...opts]);
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
          <Table.HeadCell>
            <TextInput value={lbls[1]} onChange={e => {
              lbls[1] = e.target.value;
              setLbls({ ...lbls });
              onChange(opts, crts, lbls);
            }} placeholder='Label Benar' />
          </Table.HeadCell>
          <Table.HeadCell>
            <TextInput value={lbls[2]} onChange={e => {
              lbls[2] = e.target.value;
              setLbls({ ...lbls });
              onChange(opts, crts, lbls);
            }} placeholder='Label Salah' />
          </Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {opts.map((v, i) => {
            return <Table.Row key={i} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                <Editor value={v} onChange={v => {
                  opts[i] = v;
                  setOpts([...opts]);
                  onChange(opts, crts, lbls);
                }} />
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap  font-medium text-gray-900 dark:text-white">
                <div className="flex justify-center">
                  <ToggleSwitch checked={crts[i]} onChange={() => {
                    crts[i] = true;
                    setCrts([...crts]);
                    onChange(opts, crts, lbls);
                  }} />
                </div>
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                <div className="flex justify-center">
                  <ToggleSwitch checked={!crts[i]} onChange={() => {
                    crts[i] = false;
                    setCrts([...crts]);
                    onChange(opts, crts, lbls);
                  }} />
                </div>
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                <div className="flex justify-center">
                  <Button size={'xs'} color='failure' pill={true} onClick={() => {
                    opts.splice(i, 1);
                    crts.splice(i, 1);
                    setOpts([...opts]);
                    setCrts([...crts]);
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
