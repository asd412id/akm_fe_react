import { Badge } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import axios from 'axios';

export default function SelectSearch({ url, value, labelValue = 'id', labelText = 'text', onSelect }) {
  const input = useRef(null);
  const [inputText, setInputText] = useState('');
  const [val, setVal] = useState([]);
  const [results, setResults] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [tm, setTm] = useState(null)

  useEffect(() => {
    setVal(value);
  }, [value]);

  useEffect(() => {
    if (inputText !== '') {
      if (tm) {
        clearTimeout(tm);
      }
      setFetching(true);
      setTm(setTimeout(() => {
        const getData = async () => {
          try {
            const res = await axios.get(url + `?search=${inputText}`);
            setFetching(false);
            res.data.forEach((v, i) => {
              val.forEach(vv => {
                if (v[labelValue] === vv[labelValue]) {
                  res.data.splice(i, 1);
                }
              })
            });
            setResults(res.data);
          } catch (error) {
            setFetching(false);
            setResults([]);
          }
        }

        getData();
      }, 300));
    } else {
      setResults([]);
      setFetching(false);
    }
  }, [inputText]);

  return (
    <div className='block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 cursor-text dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm relative' onClick={() => {
      input.current.focus();
    }}>
      <div className="flex gap-1 flex-wrap">
        {val.map((v, i) => {
          return <Badge key={i}>
            <div className="flex gap-1 whitespace-nowrap items-center">
              <span>{v[labelText]}</span>
              <FaTimes className='cursor-pointer' onClick={() => {
                val.splice(i, 1);
                setVal([...val]);
                onSelect(val);
              }} />
            </div>
          </Badge>
        })}
        <input ref={input} type="text" value={inputText} onChange={e => setInputText(e.target.value)} className='!border-0 text-sm p-0 !outline-none bg-inherit outline-0 !ring-0 min-w-fit' />
      </div>
      {!fetching ?
        (results.length ?
          <div className="border border-gray-300 rounded-lg shadow absolute top-full mt-1 left-0 w-full z-10 bg-white">
            {results.map(v => {
              return <div key={v[labelValue]} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                setInputText('');
                val.push(v);
                setVal([...val]);
                onSelect(val);
              }}>{v[labelText]}</div>
            })}
          </div> : inputText !== '' &&
          <div className="border border-gray-300 rounded-lg shadow absolute top-full mt-1 left-0 w-full z-10 bg-white">
            <div className="p-2">Data tidak ditemukan</div>
          </div>
        )
        : <div className="border border-gray-300 rounded-lg shadow absolute top-full mt-1 left-0 w-full z-10 bg-white">
          <div className="p-2">Mencari data ...</div>
        </div>
      }
    </div>
  )
}
