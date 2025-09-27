import { useState } from 'react'
import './App.css'
import { WalletProvider, useWallet } from './contexts/WalletContext'
import MarketsPage from './pages/MarketsPage'

function WalletButton() {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    error, 
    network,
    isCorrectNetwork,
    connectWallet, 
    disconnectWallet, 
    switchToArbitrumSepolia,
    formatAddress,
    getNetworkName
  } = useWallet();

  return (
    <div className="wallet-section">
      {!isConnected ? (
        <div className="wallet-connect">
          <button 
            className="connect-btn" 
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="wallet-info">
            <span className="wallet-address">{formatAddress(account)}</span>
            <span className="network-info">
              {network ? getNetworkName(network) : 'Unknown Network'}
            </span>
            {!isCorrectNetwork && (
              <button className="switch-network-btn" onClick={switchToArbitrumSepolia}>
                Switch to Arbitrum Sepolia
              </button>
            )}
            <button className="disconnect-btn" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HomePage({ onViewMarkets }) {
  return (
    <div className="app">
      <header className="header">
        <h1>No-Loss Prediction Market</h1>
        <p>Earn yield on your predictions with zero risk</p>
      </header>
      
      <main className="main">
        <div className="market-section">
          <WalletButton />
          
          <div className="info-cards">
            <div className="info-card">
              <h3>How it works</h3>
              <ul>
                <li>Make predictions on yes/no questions</li>
                <li>Your deposit earns yield on Aave</li>
                <li>Winners get yield + deposit back</li>
                <li>Losers get deposit back (no loss!)</li>
              </ul>
            </div>
            
            <div className="info-card">
              <h3>Active Markets</h3>
              <p>View and participate in current prediction markets</p>
              <button className="view-markets-btn" onClick={onViewMarkets}>
                View Markets
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleViewMarkets = () => {
    setCurrentPage('markets');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  return (
    <WalletProvider>
      {currentPage === 'home' ? (
        <HomePage onViewMarkets={handleViewMarkets} />
      ) : (
        <MarketsPage onBack={handleBackToHome} />
      )}
    </WalletProvider>
  )
}

export default App
