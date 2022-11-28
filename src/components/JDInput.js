import { Button, Table, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react'
import { TbCircleDot } from 'react-icons/tb';
import Editor from './Editor';
import { alphabetRange, generateLine, removeLine } from '../utils/Helpers';

export default function JDInput({ options = [], corrects = [], relations = [], labels = ['', ''], onChange }) {
  const [opts, setOpts] = useState(options);
  const [crts, setCrts] = useState(corrects);
  const [rlts, setRlts] = useState(relations);
  const [lbls, setLbls] = useState(labels)
  const [lines, setLines] = useState([]);
  const [ready, setReady] = useState(null);
  const optReff = useRef([]);
  const relReff = useRef([]);

  useEffect(() => {
    setOpts(options);
    setCrts(corrects);
    setRlts(relations);
    setLbls(labels.length ? labels : ['', '']);
  }, [JSON.stringify(options), JSON.stringify(corrects), JSON.stringify(labels), JSON.stringify(relations)]);

  useEffect(() => {
    Object.keys(crts).forEach(k => {
      if (crts[k] !== null) {
        if (lines[k] === undefined) {
          try {
            lines[k] = generateLine(optReff.current[k], relReff.current[crts[k]], k);
          } catch { }
        }
      } else {
        try {
          removeLine(lines[k], k);
          delete lines[k];
        } catch { }
      }
    });
    setLines(lines);
    onChange(opts, rlts, crts, lbls);
  }, [ready, JSON.stringify(corrects)]);

  return (
    <div className="flex flex-col gap-2">
      <Table>
        <Table.Head>
          <Table.HeadCell className='w-6/12'>
            <TextInput value={lbls[0]} onChange={e => {
              lbls[0] = e.target.value;
              setLbls({ ...lbls });
              onChange(opts, rlts, crts, lbls);
            }} placeholder='Label Pernyataan Pilihan Kiri' />
          </Table.HeadCell>
          <Table.HeadCell className='w-6/12'>
            <TextInput value={lbls[1]} onChange={e => {
              lbls[1] = e.target.value;
              setLbls({ ...lbls });
              onChange(opts, rlts, crts, lbls);
            }} placeholder='Label Pernyataan Pilihan Kanan' />
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell className="font-medium text-gray-900 dark:text-white md:pr-16 pr-5  items-start align-top">
              <div className="flex flex-col gap-4">
                <div className="flex">
                  <div className="flex">
                    <Button size={`xs`} onClick={() => {
                      const k = alphabetRange('A', 'Z')[opts.length];
                      opts.push({
                        key: k,
                        text: null
                      });
                      crts[k] = null;
                      setCrts({ ...crts });
                      setOpts([...opts]);
                      onChange(opts, rlts, crts, lbls);
                    }}>Tambah Pilihan</Button>
                  </div>
                </div>
                {opts.map((v, i) => {
                  return <div key={i} className='flex flex-col w-full gap-1'>
                    <div className="flex">
                      <Button size={'xs'} color='failure' pill={true} onClick={() => {
                        opts.splice(i, 1);
                        Object.keys(crts).forEach(k => {
                          try {
                            removeLine(lines[k], k);
                          } catch { }
                          delete lines[k];
                          delete crts[k];
                        });
                        opts.forEach((v, i) => {
                          opts[i].key = alphabetRange('A', 'Z')[i];
                          crts[v.key] = null;
                        });
                        setLines(lines);
                        setOpts([...opts]);
                        setCrts({ ...crts });
                        onChange(opts, rlts, crts, lbls);
                      }}>Hapus</Button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Editor value={v.text} onChange={e => {
                        opts[i].text = e;
                        setCrts({ ...crts });
                        setOpts([...opts]);
                        onChange(opts, rlts, crts, lbls);
                      }} />
                      <span ref={e => optReff.current[v.key] = e} className={`cursor-pointer ` + (v.key === ready && 'ring-2 rounded-full ring-yellow-300 bg-yellow-200')} onClick={() => {
                        crts[v.key] = null;
                        setCrts({ ...crts });
                        setReady(v.key);
                      }}>
                        <TbCircleDot className='w-7 h-7 text-blue-700' />
                      </span>
                    </div>
                  </div>
                })}
              </div>
            </Table.Cell>
            <Table.Cell className="font-medium text-gray-900 dark:text-white md:pl-16 pl-5  items-start align-top">
              <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                  <div className="flex">
                    <Button size={`xs`} onClick={() => {
                      const k = alphabetRange('A', 'Z')[rlts.length];
                      rlts.push({
                        key: k,
                        text: null
                      });
                      setRlts([...rlts]);
                      onChange(opts, rlts, crts, lbls);
                    }}>Tambah Pilihan</Button>
                  </div>
                </div>
                {rlts.map((v, i) => {
                  return <div key={i} className='flex flex-col w-full gap-1'>
                    <div className="flex justify-end">
                      <Button size={'xs'} color='failure' pill={true} onClick={() => {
                        rlts.splice(i, 1);
                        Object.keys(crts).forEach(k => {
                          try {
                            removeLine(lines[k], k);
                          } catch { }
                          delete lines[k];
                          delete crts[k];
                        });
                        opts.forEach((v, i) => {
                          opts[i].key = alphabetRange('A', 'Z')[i];
                          crts[v.key] = null;
                        });
                        setLines(lines);
                        setRlts([...rlts]);
                        setCrts({ ...crts });
                        onChange(opts, rlts, crts, lbls);
                      }}>Hapus</Button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span ref={e => relReff.current[v.key] = e} className='cursor-pointer' onClick={() => {
                        if (ready !== null) {
                          crts[ready] = v.key;
                          setCrts({ ...crts });
                          setReady(null);
                        }
                      }}>
                        <TbCircleDot className='w-7 h-7 text-red-700' />
                      </span>
                      <Editor value={v.text} onChange={e => {
                        rlts[i].text = e;
                        setRlts([...rlts]);
                        onChange(opts, rlts, crts, lbls);
                      }} />
                    </div>
                  </div>
                })}
              </div>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  )
}
