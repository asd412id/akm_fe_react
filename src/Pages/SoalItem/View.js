import { Badge, Modal, Table } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { TbCircleDot } from 'react-icons/tb';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { generateColor } from '../../utils/Helpers';
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import md5 from 'md5';
import { useRecoilState } from 'recoil';
import { lID, lInterval } from '../../recoil/atom/LineHelper';

export default function View({ open = false, data = {}, onClose }) {
  const [dta, setDta] = useState(data);
  const [show, setShow] = useState(open);
  const [lint, setLint] = useRecoilState(lInterval)
  const [lineId, setLineId] = useRecoilState(lID);
  const updateXarrow = useXarrow();

  useEffect(() => {
    setShow(open);
    setDta(data);
  }, [open, data]);

  useEffect(() => {
    if (dta.type === 'JD') {
      if (lint) {
        clearInterval(lint);
        setLint(null);
        setLineId(null);
      }
      setLineId('line');
      setLint(setInterval(updateXarrow, 100));
    }
  }, [dta.id, dta.type])

  return (
    <Modal
      show={show}
      onClose={() => {
        if (lint) {
          clearInterval(lint);
          setLint(null);
        }
        setLineId(null);
        onClose();
      }}
      size='4xl'
      position={'top-center'}
    >
      <Modal.Header className='px-3 py-2'>
        Soal Nomor {dta.num}
      </Modal.Header>
      <Modal.Body>
        <div className="flex gap-2 ck-content">
          <div className="flex">{dta.num}.</div>
          <div className="flex flex-col gap-3 w-full">
            <div className='relative' dangerouslySetInnerHTML={{ __html: dta.text }}></div>
            {dta.type === 'U' ?
              <div className="flex flex-col">
                <div className="italic">Jawaban:</div>
                <div dangerouslySetInnerHTML={{ __html: dta.answer }}></div>
              </div>
              : dta.type === 'IS' ?
                <div className="flex flex-col">
                  <div className="italic">Jawaban: {dta.answer}</div>
                </div>
                : dta.type === 'PG' ?
                  <div className="flex flex-col gap-1">
                    {dta.options.map(v => {
                      return <div key={v.key} className={`flex gap-2 ${dta.corrects[v.key] && 'font-bold'}`}>
                        <span>{v.key}.</span>
                        <div dangerouslySetInnerHTML={{ __html: v.text }}></div>
                      </div>
                    })}
                  </div>
                  : dta.type === 'PGK' ?
                    <div className="flex flex-col gap-1">
                      {dta.options.map(v => {
                        return <div key={v.key} className={`flex gap-2 ${dta.corrects[v.key] ? 'text-green-600' : 'text-red-600'}`}>
                          <span className={dta.corrects[v.key] ? 'pt-1' : 'pt-1.5'}>{dta.corrects[v.key] ? <FaCheck className='w-4 h-4' /> : <FaTimes className='w-4 h-4' />}</span>
                          <div dangerouslySetInnerHTML={{ __html: v.text }}></div>
                        </div>
                      })}
                    </div>
                    : dta.type === 'BS' ?
                      <Table className='w-full !text-base'>
                        <Table.Head>
                          <Table.HeadCell>{dta.labels[0]}</Table.HeadCell>
                          <Table.HeadCell colSpan={2} className='text-center'>{dta.labels[1]}</Table.HeadCell>
                        </Table.Head>
                        <Table.Body className='divide-y'>
                          {dta.options.map(v => {
                            return <Table.Row key={v.key}>
                              <Table.Cell dangerouslySetInnerHTML={{ __html: v.text }} />
                              <Table.Cell>
                                <div className="flex justify-center">
                                  <Badge color={dta.corrects[v.key] ? 'success' : 'failure'}>
                                    {dta.corrects[v.key] ? 'Benar' : 'Salah'}
                                  </Badge>
                                </div>
                              </Table.Cell>
                            </Table.Row>
                          })}
                        </Table.Body>
                      </Table>
                      : dta.type === 'JD' ?
                        <>
                          <Table className='w-full !text-base'>
                            <Table.Head>
                              <Table.HeadCell className='text-center'>{dta.labels[0]}</Table.HeadCell>
                              <Table.HeadCell className='text-center'>{dta.labels[1]}</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                              <Table.Row>
                                <Table.Cell className='align-top w-6/12'>
                                  <div className='flex flex-col gap-5'>
                                    {dta.options.map(v => {
                                      return <div key={v.key} className="flex justify-center gap-2 items-center">
                                        <div className="bg-blue-50 p-2 rounded shadow"><div dangerouslySetInnerHTML={{ __html: v.text }}></div></div>
                                        <span id={`opt-${v.key}`}>
                                          <TbCircleDot className='w-7 h-7 text-blue-700' />
                                        </span>
                                      </div>
                                    })}
                                  </div>
                                </Table.Cell>
                                <Table.Cell className='align-top w-6/12'>
                                  <div className='flex flex-col gap-5'>
                                    {dta.relations.map(v => {
                                      return <div key={v.key} className="flex justify-center gap-2 items-center">
                                        <span id={`rel-${v.key}`}>
                                          <TbCircleDot className='w-7 h-7 text-red-700' />
                                        </span>
                                        <div className="flex bg-red-50 p-2 rounded shadow"><div dangerouslySetInnerHTML={{ __html: v.text }}></div></div>
                                      </div>
                                    })}
                                  </div>
                                </Table.Cell>
                              </Table.Row>
                            </Table.Body>
                          </Table>
                          <Xwrapper>
                            {Object.keys(dta.corrects).map(k => {
                              return dta.corrects[k] !== null && <Xarrow key={k + lineId} startAnchor='right' endAnchor='left' start={`opt-${k}`} end={`rel-${dta.corrects[k]}`} headShape='arrow1' headSize={3} showTail={true} tailShape='circle' tailSize={2} color={generateColor(`${md5('7' + k)}}`)} />
                            })}
                          </Xwrapper>
                        </>
                        : null
            }
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
