import { Toast } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { HiCheck, HiInformationCircle } from 'react-icons/hi'

export default function Notifications({ message = '', type = 'success' }) {
  const [mType, setMType] = useState(type)
  const [msg, setMsg] = useState(message);

  useEffect(() => {
    setMsg(message);
    setMType(type);
  }, [message, type]);
  return (
    <>
      {mType === 'warning' ?
        <Toast className='fixed top-5 right-5 z-50'>
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-500 dark:bg-amber-800 dark:text-amber-200">
            <HiCheck className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">
            {msg}
          </div>
        </Toast>
        : type === 'error' ?
          <Toast className='fixed top-5 right-5 z-50'>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
              <HiInformationCircle className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">
              {msg}
            </div>
          </Toast>
          :
          <Toast className='fixed top-5 right-5 z-50'>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
              <HiInformationCircle className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">
              {msg}
            </div>
          </Toast>
      }
    </>
  )
}
