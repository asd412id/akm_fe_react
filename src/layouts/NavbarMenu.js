import axios from 'axios'
import { Dropdown, Navbar } from 'flowbite-react'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import { DataUjian } from '../recoil/atom/DataUjian'
import { expandSidebar } from '../recoil/atom/navigation'
import { userDataAtom } from '../recoil/atom/userAtom'
import Timer from '../components/Timer'
import { StopUjian } from '../recoil/atom/StopUjian'
import logo from '../assets/logo512.png'
import { MdOutlineSettings } from 'react-icons/md'

export default function NavbarMenu() {
  const [userData, setUserData] = useRecoilState(userDataAtom);
  const [sidebarToggle, setSidebarToggle] = useRecoilState(expandSidebar);
  const dataUjian = useRecoilValue(DataUjian);
  const [stopUjian, setStopUjian] = useRecoilState(StopUjian);
  const navigate = useNavigate();

  const logout = () => {
    axios.post('/logout')
      .then(() => {
        setUserData(null);
        navigate('/');
      })
      .catch(() => {
        window.location.reload();
      })
  }

  const setEndUjian = () => {
    setStopUjian(true);
  }

  return (
    <Navbar
      fluid={true}
      style={{ boxShadow: '0 2px 4px -4px gray' }}
      className='fixed z-40 w-full'
    >
      <Navbar.Brand href="/">
        <img
          src={logo}
          className="mr-3 h-6 sm:h-9"
          alt={process.env.REACT_APP_APPNAME + " Logo"}
        />
        <span className="self-center whitespace-nowrap text-xl font-bold dark:text-sky-100 text-sky-600">
          {process.env.REACT_APP_APPNAME}
        </span>
      </Navbar.Brand>
      {dataUjian !== null &&
        <div className="flex">
          <div className="font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded shadow px-3 text-lg">
            <Timer end={new Date((new Date(dataUjian.start)).getTime() + (dataUjian.jadwal.duration * 60 * 1000))} onComplete={setEndUjian} />
          </div>
        </div>
      }
      <div className="flex md:order-2 gap-2 items-center">
        <Dropdown
          arrowIcon={false}
          inline={true}
          label={<MdOutlineSettings className='w-7 h-7 fill-gray-600 hover:fill-sky-600 transition-all duration-200 hover:rotate-90' />}
        >
          <Dropdown.Header>
            <span className="block text-sm">
              {userData.name}
            </span>
            {userData.role !== undefined ?
              <>
                <span className="block truncate text-sm font-bold">
                  {userData.sekolah.name}
                </span>
                <span className="block truncate text-sm font-medium">
                  {userData.email}
                </span>
              </> : <>
                <span className="block truncate text-sm">
                  ID PESERTA: {userData.username}
                </span>
                <span className="block truncate text-sm font-bold">
                  {userData.sekolah.name}
                </span>
              </>
            }
          </Dropdown.Header>
          {userData.role !== undefined &&
            <>
              {userData.role === 'OPERATOR' &&
                <>
                  <Link to={`/sekolah`}>
                    <Dropdown.Item>
                      Pengaturan Sekolah
                    </Dropdown.Item>
                  </Link>
                  <Dropdown.Divider />
                </>
              }
              <Link to={`/akun`}>
                <Dropdown.Item>
                  Pengaturan Akun
                </Dropdown.Item>
              </Link>
              <Dropdown.Divider />
            </>
          }
          <Dropdown.Item onClick={logout}>
            Keluar
          </Dropdown.Item>
        </Dropdown>
        <Navbar.Toggle onClick={() => {
          setSidebarToggle(!sidebarToggle);
        }} />
      </div>
    </Navbar >
  )
}
