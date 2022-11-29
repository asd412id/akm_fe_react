import { Button, Table, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react'
import { TbCircleDot } from 'react-icons/tb';
import Editor from './Editor';
import { alphabetRange, generateColor } from '../utils/Helpers';
import Xarrow, { useXarrow } from "react-xarrows";
import md5 from 'md5';
import { useRecoilState } from 'recoil';
import { lInterval } from '../recoil/atom/Interval';

export default function JDInput({ options = [], corrects = [], relations = [], labels = ['', ''], onChange }) {
  const [opts, setOpts] = useState(options);
  const [crts, setCrts] = useState(corrects);
  const [rlts, setRlts] = useState(relations);
  const [lbls, setLbls] = useState(labels)
  const [ready, setReady] = useState(null);
  const [lint, setLint] = useRecoilState(lInterval);
  const updateXarrow = useXarrow();

  useEffect(() => {
    setOpts(options);
    setCrts(corrects);
    setRlts(relations);
    setLbls(labels.length ? labels : ['', '']);
  }, [JSON.stringify(options), JSON.stringify(corrects), JSON.stringify(labels), JSON.stringify(relations)]);

  useEffect(() => {
    if (lint) {
      clearInterval(lint);
      setLint(null);
    }
    setLint(setInterval(updateXarrow, 100));
  }, [crts])

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
                        Object.keys(crts).forEach(k => delete crts[k]);
                        opts.forEach((v, i) => {
                          opts[i].key = alphabetRange('A', 'Z')[i];
                          crts[v.key] = null;
                        });
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
                      <span id={`opt-${v.key}`} className={`cursor-pointer ` + (v.key === ready && 'ring-2 rounded-full ring-yellow-300 bg-yellow-200')} onClick={() => {
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
                        Object.keys(crts).forEach(k => delete crts[k]);
                        opts.forEach((v, i) => {
                          opts[i].key = alphabetRange('A', 'Z')[i];
                          crts[v.key] = null;
                        });
                        setRlts([...rlts]);
                        setCrts({ ...crts });
                        onChange(opts, rlts, crts, lbls);
                      }}>Hapus</Button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span id={`rel-${v.key}`} className='cursor-pointer' onClick={() => {
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
      {Object.keys(crts).map(k => {
        return crts[k] !== null && <Xarrow key={k} startAnchor='right' endAnchor='left' start={`opt-${k}`} end={`rel-${crts[k]}`} headShape='arrow1' headSize={3} showTail={true} tailShape='circle' tailSize={2} color={generateColor(`${md5('7' + k)}}`)} />
      })}
    </div>
  )
}
