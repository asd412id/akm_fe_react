import axios from 'axios'
import { Avatar, Dropdown, Navbar } from 'flowbite-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import { userDataAtom } from '../recoil/atom/userAtom'

export default function NavbarMenu() {
  const userData = useRecoilValue(userDataAtom);
  const [_, setUserData] = useRecoilState(userDataAtom);

  const logout = () => {
    axios.post('/logout')
      .then(() => {
        setUserData(null);
        window.location = '/';
      })
      .catch(() => {
        window.location.reload();
      })
  }

  return (
    <Navbar
      fluid={true}
      style={{ boxShadow: '0 2px 4px -4px gray' }}
      className='fixed z-40 w-full'
    >
      <Navbar.Brand href="https://flowbite.com/">
        <img
          src="https://flowbite.com/docs/images/logo.svg"
          className="mr-3 h-6 sm:h-9"
          alt="Flowbite Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          {process.env.REACT_APP_APPNAME}
        </span>
      </Navbar.Brand>
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline={true}
          label={<Avatar alt="User settings" rounded={true} size='sm' />}
        >
          <Dropdown.Header>
            <span className="block text-sm">
              {userData.name}
            </span>
            <span className="block truncate text-sm font-medium">
              {userData.email}
            </span>
          </Dropdown.Header>
          {userData.role === 'OPERATOR' &&
            <Link to={`/sekolah`}>
              <Dropdown.Item>
                Pengaturan Sekolah
              </Dropdown.Item>
            </Link>
          }
          <Link to={`/akun`}>
            <Dropdown.Item>
              Pengaturan Akun
            </Dropdown.Item>
          </Link>
          <Dropdown.Divider />
          <Dropdown.Item onClick={logout}>
            Keluar
          </Dropdown.Item>
        </Dropdown>
        <Navbar.Toggle />
      </div>
    </Navbar >
  )
}
