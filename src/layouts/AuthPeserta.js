import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import Notifications from '../components/Notifications';
import { expandSidebar } from '../recoil/atom/navigation';
import { userDataAtom } from '../recoil/atom/userAtom';
import NavbarMenu from './NavbarMenu';
import SidebarMenu from './SidebarMenu';
export default function AuthPeserta({ title, children, success = null, error = null }) {
  const [notifSuccess, setNotifSuccess] = useState(null);
  const [notifError, setNotifError] = useState(null);
  const [sidebarToggle, setSidebarToggle] = useRecoilState(expandSidebar);
  const userData = useRecoilValue(userDataAtom);
  const navigate = useNavigate();
  document.title = (title || 'Selamat Datang') + ' - ' + (process.env.REACT_APP_APPNAME || 'UjianQ');

  useEffect(() => {
    setNotifSuccess(success);
  }, [success]);

  useEffect(() => {
    setNotifError(error);
  }, [error]);

  useEffect(() => {
    if (!userData?.username) {
      navigate('/');
    }
  }, []);

  if (userData?.username) {
    return (
      <>
        {notifSuccess && <Notifications message={notifSuccess} />}
        {notifError && <Notifications message={notifError} type='error' />}
        <NavbarMenu />
        <div className='flex bg-gray-100 text-gray-700' onClick={() => {
          if (sidebarToggle) {
            setSidebarToggle(!sidebarToggle);
          }
        }}>
          <SidebarMenu />
          <div className='md:px-10 px-5 py-5 flex flex-col gap-7 min-h-screen w-full md:pl-72 md:-ml-3 pt-20'>
            <div className="relative">{children}</div>
          </div>
        </div>
      </>
    )
  }
}
