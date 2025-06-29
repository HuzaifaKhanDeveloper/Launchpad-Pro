import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/common/Layout';
import NetworkGuard from './components/common/NetworkGuard';
import Home from './pages/Home';
import TokenSales from './pages/TokenSales';
import TokenSaleDetail from './pages/TokenSaleDetail';
import CreateSale from './pages/CreateSale';
import Dashboard from './pages/Dashboard';
import Staking from './pages/Staking';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
          }}
        />
        <NetworkGuard>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="sales" element={<TokenSales />} />
              <Route path="sales/:id" element={<TokenSaleDetail />} />
              <Route path="create-sale" element={<CreateSale />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="staking" element={<Staking />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Routes>
        </NetworkGuard>
      </div>
    </Router>
  );
}

export default App;