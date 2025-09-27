import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Arbitrum Sepolia network configuration
const ARBITRUM_SEPOLIA = {
  chainId: '0x66eee', // 421614 in hex
  chainName: 'Arbitrum Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
  blockExplorerUrls: ['https://sepolia.arbiscan.io/'],
};

// PYUSD contract address on Arbitrum Sepolia
const PYUSD_CONTRACT_ADDRESS = '0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1';

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [pyusdBalance, setPyusdBalance] = useState('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkWalletConnection();
    checkNetwork();
  }, []);

  // Fetch balance when account or network changes
  useEffect(() => {
    if (account && isCorrectNetwork) {
      fetchPyusdBalance();
    } else {
      setPyusdBalance('0');
    }
  }, [account, isCorrectNetwork]);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    }
  };

  const checkNetwork = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setNetwork(chainId);
        setIsCorrectNetwork(chainId === ARBITRUM_SEPOLIA.chainId);
      } catch (err) {
        console.error('Error checking network:', err);
      }
    }
  };

  const switchToArbitrumSepolia = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARBITRUM_SEPOLIA.chainId }],
      });
      setIsCorrectNetwork(true);
      setError(null);
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ARBITRUM_SEPOLIA],
          });
          setIsCorrectNetwork(true);
          setError(null);
        } catch (addError) {
          setError('Failed to add Arbitrum Sepolia network. Please add it manually.');
          console.error('Error adding network:', addError);
        }
      } else {
        setError('Failed to switch to Arbitrum Sepolia network.');
        console.error('Error switching network:', switchError);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Check network after connecting
        await checkNetwork();
      }
    } catch (err) {
      if (err.code === 4001) {
        setError('User rejected the connection request.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
      console.error('Error connecting wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
    setNetwork(null);
    setIsCorrectNetwork(false);
    setPyusdBalance('0');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const fetchPyusdBalance = async () => {
    if (!window.ethereum || !account) return;

    setIsLoadingBalance(true);
    try {
      // ERC-20 balanceOf function call
      // balanceOf(address) function signature: 0x70a08231
      // Pad the address to 32 bytes (64 hex characters)
      const paddedAddress = account.slice(2).padStart(64, '0');
      const data = `0x70a08231${paddedAddress}`;
      
      const balance = await window.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: PYUSD_CONTRACT_ADDRESS,
            data: data
          },
          'latest'
        ]
      });

      // Convert from wei to PYUSD (18 decimals)
      const balanceInPyusd = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(6);
      setPyusdBalance(balanceInPyusd);
    } catch (err) {
      console.error('Error fetching PYUSD balance:', err);
      setPyusdBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const getNetworkName = (chainId) => {
    if (chainId === ARBITRUM_SEPOLIA.chainId) {
      return 'Arbitrum Sepolia';
    }
    return 'Unknown Network';
  };

  // Listen for network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = (chainId) => {
        setNetwork(chainId);
        setIsCorrectNetwork(chainId === ARBITRUM_SEPOLIA.chainId);
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const value = {
    account,
    isConnected,
    isConnecting,
    error,
    network,
    isCorrectNetwork,
    pyusdBalance,
    isLoadingBalance,
    connectWallet,
    disconnectWallet,
    switchToArbitrumSepolia,
    fetchPyusdBalance,
    formatAddress,
    getNetworkName,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
