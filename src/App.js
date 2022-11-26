import axios from 'axios';
import { Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Login from './Pages/Login';
import { userDataAtom } from './recoil/atom/userAtom';
import Routes from './Routes/WebRoutes';

function App() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useRecoilState(userDataAtom);

  useEffect(() => {
    axios.get('/check').then(res => {
      setUserData(res.data);
      setLoading(false);
    }).catch(err => {
      setUserData(null);
      setLoading(false)
    })
  }, [])

  return (
    <>
      {loading ? <div className="flex justify-center items-center fixed inset-0 w-full min-h-screen">
        <Spinner size={`xl`} />
      </div > : userData ? <Routes /> : <Login />}
    </>
  );
}

export default App;
