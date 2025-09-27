import { useState } from 'react'
import { useWallet } from '../contexts/WalletContext'
import './MarketsPage.css'

function MarketsPage({ onBack }) {
  const { isConnected, isCorrectNetwork, pyusdBalance, isLoadingBalance, fetchPyusdBalance } = useWallet();
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [expandedMarket, setExpandedMarket] = useState(null);
  const [depositAmounts, setDepositAmounts] = useState({});

  const markets = [
    {
      id: 1,
      title: "Ethereum Price Prediction",
      question: "Will Ethereum price hit $5000 by January 1, 2026?",
      endDate: "January 1, 2026",
      totalDeposits: "$12,450",
      participants: 45,
      status: "Active"
    },
    {
      id: 2,
      title: "Bitcoin ETF Approval",
      question: "Will a Bitcoin ETF be approved by the SEC by March 2025?",
      endDate: "March 1, 2025",
      totalDeposits: "$8,920",
      participants: 32,
      status: "Active"
    },
    {
      id: 3,
      title: "DeFi TVL Milestone",
      question: "Will total DeFi TVL exceed $200B by June 2025?",
      endDate: "June 1, 2025",
      totalDeposits: "$5,670",
      participants: 28,
      status: "Active"
    }
  ];

  return (
    <div className="markets-page">
      <header className="markets-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Home
        </button>
        <h1>Prediction Markets</h1>
        <p>Participate in no-loss prediction markets</p>
      </header>

      <main className="markets-main">
        {!isConnected ? (
          <div className="connect-prompt">
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to participate in prediction markets</p>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="connect-prompt">
            <h2>Wrong Network</h2>
            <p>Please switch to Arbitrum Sepolia to participate in prediction markets</p>
          </div>
        ) : (
          <div className="markets-container">
            <div className="markets-grid">
              {markets.map(market => (
                <div 
                  key={market.id} 
                  className={`market-card ${expandedMarket === market.id ? 'expanded' : ''}`}
                  onClick={() => setExpandedMarket(expandedMarket === market.id ? null : market.id)}
                >
                  <div className="market-header">
                    <h3>{market.title}</h3>
                    <span className={`status ${market.status.toLowerCase()}`}>
                      {market.status}
                    </span>
                  </div>
                  
                  <div className="market-question">
                    <p>{market.question}</p>
                  </div>
                  
                  <div className="market-details">
                    <div className="detail-item">
                      <span className="label">End Date:</span>
                      <span className="value">{market.endDate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Total Deposits:</span>
                      <span className="value">{market.totalDeposits}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Participants:</span>
                      <span className="value">{market.participants}</span>
                    </div>
                  </div>

                  {expandedMarket === market.id && (
                    <div className="market-actions">
                      <div className="prediction-options">
                        <button 
                          className="prediction-btn yes-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMarket({...market, prediction: 'yes'});
                          }}
                        >
                          YES
                        </button>
                        <button 
                          className="prediction-btn no-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMarket({...market, prediction: 'no'});
                          }}
                        >
                          NO
                        </button>
                      </div>
                      
                      <div className="deposit-section">
                        <div className="balance-info">
                          <span className="balance-label">Your PYUSD Balance:</span>
                          <span className="balance-amount">
                            {isLoadingBalance ? 'Loading...' : `${pyusdBalance} PYUSD`}
                          </span>
                          <button 
                            className="refresh-balance-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchPyusdBalance();
                            }}
                            disabled={isLoadingBalance}
                          >
                            🔄
                          </button>
                        </div>
                        
                        <div className="deposit-input">
                          <input 
                            type="number" 
                            placeholder="Enter amount (PYUSD)"
                            className="amount-input"
                            value={depositAmounts[market.id] || ''}
                            onChange={(e) => {
                              e.stopPropagation();
                              setDepositAmounts(prev => ({
                                ...prev,
                                [market.id]: e.target.value
                              }));
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button 
                            className="max-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDepositAmounts(prev => ({
                                ...prev,
                                [market.id]: pyusdBalance
                              }));
                            }}
                          >
                            MAX
                          </button>
                        </div>
                        
                        <button 
                          className="deposit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle deposit logic here
                          }}
                          disabled={!depositAmounts[market.id] || parseFloat(depositAmounts[market.id]) <= 0 || parseFloat(depositAmounts[market.id]) > parseFloat(pyusdBalance)}
                        >
                          Deposit & Predict
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedMarket && (
              <div className="selected-market-overlay">
                <div className="selected-market-card">
                  <button 
                    className="close-btn"
                    onClick={() => setSelectedMarket(null)}
                  >
                    ×
                  </button>
                  <h3>Confirm Your Prediction</h3>
                  <p><strong>Market:</strong> {selectedMarket.title}</p>
                  <p><strong>Question:</strong> {selectedMarket.question}</p>
                  <p><strong>Your Prediction:</strong> <span className={`prediction-text ${selectedMarket.prediction}`}>{selectedMarket.prediction.toUpperCase()}</span></p>
                  <div className="confirmation-actions">
                    <button className="confirm-btn">Confirm Prediction</button>
                    <button className="cancel-btn" onClick={() => setSelectedMarket(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default MarketsPage;
