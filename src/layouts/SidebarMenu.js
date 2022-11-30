import React from 'react'
import { Sidebar } from 'flowbite-react';
import { HiChartPie, HiUserGroup } from 'react-icons/hi'
import { MdLibraryBooks, MdSchedule } from 'react-icons/md'
import { ImBooks } from 'react-icons/im'
import { GiGraduateCap } from 'react-icons/gi'
import { Link, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataAtom } from '../recoil/atom/userAtom';
import { expandSidebar } from '../recoil/atom/navigation';

export default function SidebarMenu() {
  const userData = useRecoilValue(userDataAtom);
  const [sidebarToggle, setSidebarToggle] = useRecoilState(expandSidebar)
  const location = useLocation();
  return (
    <div className="w-fit">
      <Sidebar aria-label="Sidebar with logo branding example"
        className={'w-56 md:block left-0 bottom-0 fixed z-10 top-12 shadow-lg ' + (!sidebarToggle && 'hidden')}
        style={{ boxShadow: '0 2px -4px 4px gray' }}>
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item
              to='/'
              as={Link}
              icon={HiChartPie}
              active={location.pathname === '/'}
            >
              Beranda
            </Sidebar.Item>
            {userData.role === 'OPERATOR' &&
              <>
                <Sidebar.Item
                  to='/mapel'
                  as={Link}
                  icon={ImBooks}
                  active={location.pathname === '/mapel'}
                >
                  Mata Pelajaran
                </Sidebar.Item>
                <Sidebar.Item
                  to='/penilai'
                  as={Link}
                  icon={GiGraduateCap}
                  active={location.pathname === '/penilai'}
                >
                  Penilai
                </Sidebar.Item>
                <Sidebar.Item
                  to='/peserta'
                  as={Link}
                  icon={HiUserGroup}
                  active={location.pathname === '/peserta'}
                >
                  Peserta
                </Sidebar.Item>
              </>
            }
            <Sidebar.Item
              to='/soal'
              as={Link}
              icon={MdLibraryBooks}
              active={location.pathname.startsWith('/soal')}
            >
              Bank Soal
            </Sidebar.Item>
            <Sidebar.Item
              to='/jadwal'
              as={Link}
              icon={MdSchedule}
              active={location.pathname.startsWith('/jadwal')}
            >
              Jadwal Ujian
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  )
}
