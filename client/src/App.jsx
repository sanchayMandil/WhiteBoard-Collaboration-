import { Routes, Route, useLocation } from 'react-router-dom';
import Navi from './components/header/Navi';
import Footer from './components/footer/Footer';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Join from './pages/Join';
import Home from './pages/Home';
import Rssue from './pages/Rssue';
import Board from './components/Board/Board';

function App() {
  const location = useLocation();

  // Check if the current route is one where you don't want the Navi and Footer
  const isNavFooterHidden = location.pathname === '/dashboard' || location.pathname.startsWith('/board');

  return (
    <>
      {/* Conditionally render Navi */}
      {!isNavFooterHidden && <Navi />}
      <Routes>
        <Route path='' element={<Home />} />
        <Route path='login' element={<Signin />} />
        <Route path='register' element={<Signup />} />
        <Route path='join' element={<Join />} />
        <Route path='issue' element={<Rssue />} /> {/* Your Issue Page */}
        <Route path='board' element={<Board />} /> {/* Your Whiteboard Page */}
        <Route path='dashboard' element={<Dashboard />} /> {/* Your Dashboard Page */}
        <Route path="/board/:whiteboardId" element={<Board />} />
      </Routes>

      {/* Conditionally render Footer */}
      {!isNavFooterHidden && <Footer />}
    </>
  );
}

export default App;