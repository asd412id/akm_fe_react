import { Button, Table, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react'
import { TbCircleDot } from 'react-icons/tb';
import Editor from './Editor';
import LeaderLine from 'react-leader-line';
import { generateColor } from '../utils/Helpers';
import md5 from 'md5';

export default function JDInput({ options = [], corrects = [], relations = [], labels = ['Pernyataan', 'Benar', 'Salah'], onChange }) {
  const [opts, setOpts] = useState(options);
  const [crts, setCrts] = useState(corrects);
  const [rlts, setRlts] = useState(relations);
  const [lbls, setLbls] = useState(labels)
  const [linterval, setLinterval] = useState([]);
  const [lines, setLines] = useState([]);
  const [ready, setReady] = useState(null);
  const optReff = useRef([]);
  const relReff = useRef([]);

  useEffect(() => {
    setOpts(options);
    setCrts(corrects);
    setRlts(relations);
    setLbls(labels);
  }, [JSON.stringify(options), JSON.stringify(corrects), JSON.stringify(labels), JSON.stringify(relations)]);

  const generateLine = (start, end, id = 'color') => {
    const line = new LeaderLine(start, end, {
      startPlug: 'disc',
      endPlug: 'disc',
      color: generateColor('coloravocado' + md5(id).toString()),
      startSocket: 'right',
      endSocket: 'left'
    });

    if (linterval[id] !== undefined) {
      clearInterval(linterval[id]);
      linterval.splice(id, 1);
    }

    linterval[id] = setInterval(() => {
      try {
        line.position();
      } catch {
        try {
          removeLine(line, id);
        } catch { }
      };
    }, 10)
    setLinterval([...linterval]);

    return line;
  }

  const removeLine = (line, id = 'color') => {
    if (line !== undefined) {
      if (linterval[id] !== undefined) {
        clearInterval(linterval[id]);
        linterval.splice(id, 1);
      }
      line.remove();
    }
    setLinterval([...linterval]);
    return null;
  }

  const getRelate = (type, index) => {
    if (type === 'option') {
      crts[index] = null;
      try {
        removeLine(lines[index], index);
      } catch { }
      setReady(index);
    } else {
      if (ready !== null) {
        crts[ready] = index;
        lines[ready] = generateLine(optReff.current[ready], relReff.current[index], ready);
        setReady(null);
      }
    }
    setLines([...lines]);
    setCrts([...crts]);
    onChange(opts, rlts, crts, lbls);
  }

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
            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white md:pr-20 pr-5  items-start align-top">
              <div className="flex flex-col gap-4">
                <div className="flex">
                  <div className="flex">
                    <Button size={`xs`} onClick={() => {
                      opts.push('');
                      crts.push(null);
                      setOpts([...opts]);
                    }}>Tambah Pilihan</Button>
                  </div>
                </div>
                {opts.map((v, i) => {
                  return <div key={i} className='flex flex-col w-full gap-1'>
                    <div className="flex">
                      <Button size={'xs'} color='failure' pill={true} onClick={() => {
                        crts.forEach((vv, ii) => {
                          removeLine(lines[ii], ii);
                          crts[ii] = null;
                        });
                        lines.splice(i, 1);
                        opts.splice(i, 1);
                        setOpts([...opts]);
                        setCrts([...crts]);
                        onChange(opts, rlts, crts, lbls);
                      }}>Hapus</Button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Editor value={v} onChange={v => {
                        opts[i] = v;
                        setCrts([...crts]);
                        setOpts([...opts]);
                        onChange(opts, rlts, crts, lbls);
                      }} />
                      <span ref={e => optReff.current[i] = e} className=' cursor-pointer' onClick={e => getRelate('option', i, e)}>
                        <TbCircleDot className='w-10 h-10 text-blue-700' />
                      </span>
                    </div>
                  </div>
                })}
              </div>
            </Table.Cell>
            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white md:pl-20 pl-5  items-start align-top">
              <div className="flex flex-col gap-4">
                <div className="flex">
                  <div className="flex">
                    <Button size={`xs`} onClick={() => {
                      rlts.push('');
                      setRlts([...rlts]);
                    }}>Tambah Pilihan</Button>
                  </div>
                </div>
                {rlts.map((v, i) => {
                  return <div key={i} className='flex flex-col w-full gap-1'>
                    <div className="flex justify-end">
                      <Button size={'xs'} color='failure' pill={true} onClick={() => {
                        crts.forEach((vv, ii) => {
                          removeLine(lines[ii], ii);
                          crts[ii] = null;
                        });
                        lines.splice(i, 1);
                        rlts.splice(i, 1);
                        setRlts([...rlts]);
                        setCrts([...crts]);
                        onChange(opts, rlts, crts, lbls);
                      }}>Hapus</Button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span ref={e => relReff.current[i] = e} className='cursor-pointer' onClick={e => getRelate('relation', i)}>
                        <TbCircleDot className='w-10 h-10 text-red-700' />
                      </span>
                      <Editor value={v} onChange={v => {
                        rlts[i] = v;
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
