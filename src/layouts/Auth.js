import React, { useEffect, useState } from 'react'
import Notifications from '../components/Notifications';
import NavbarMenu from './NavbarMenu';
import SidebarMenu from './SidebarMenu';
export default function Auth({ title, children, success = null, error = null }) {
  const [notifSuccess, setNotifSuccess] = useState(null);
  const [notifError, setNotifError] = useState(null);
  document.title = (title || 'Selamat Datang') + ' - ' + (process.env.REACT_APP_APPNAME || 'UjianQ');

  useEffect(() => {
    setNotifSuccess(success);
  }, [success]);

  useEffect(() => {
    setNotifError(error);
  }, [error]);
  return (
    <>
      {notifSuccess && <Notifications message={notifSuccess} />}
      {notifError && <Notifications message={notifError} type='error' />}
      <NavbarMenu />
      <div className='flex bg-gray-100 text-gray-700'>
        <SidebarMenu />
        <div className='px-10 py-5 flex flex-col gap-7 min-h-screen w-full pl-72 -ml-3 pt-20'>
          <h2 className='font-bold text-2xl'>{title}</h2>
          <div className="relative">{children}</div>
        </div>
      </div>
    </>
  )
}
