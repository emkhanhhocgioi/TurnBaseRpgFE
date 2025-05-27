import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useLocation } from "react-router-dom";

const WebsiteBalance = () => {
    const location = useLocation();
    const { userdata } = location.state || {};
    const [transfervalue, setTransferValue] = useState("");
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isExchangeOfferModalOpen, setIsExchangeOfferModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [exchangeOfferAmount, setExchangeOfferAmount] = useState("");
    const [withdrawnOffer,setWithdrawnOffer] = useState([]);
    const contractaddress = '0x131FC01D962Fee7675586cbffdb8Afb2a589A291';

    const transactions = [
        { id: 1, type: "Deposit", amount: "100", date: "2025-04-28" },
        { id: 2, type: "Withdraw", amount: "50", date: "2025-04-27" },
        { id: 3, type: "Deposit", amount: "200", date: "2025-04-25" },
    ];

    const [userbalance, setUserbalance] = useState(0);
    const [isPendingTx, setIsPendingTx] = useState(false);

    useEffect(() => {
        const getUserBalance = async () => {
            const userwallet = userdata.walletAddress;
            try {
                const response = await axios.post("http://localhost:3000/api/getTokenBalanceOfUser", {
                    address: userwallet,
                });
                const data = response.data;
                console.log("User balance:", data);
                setUserbalance(data.balance);
            } catch (error) {
                console.error("Error fetching user balance:", error);
            }
        };

        if (userdata && userdata.walletAddress) {
            getUserBalance();
        }
        getUserWithdrawnOffer();
    }, [userdata]);

    
    async function WithDrawBDCToWallet() {
        const CONTRACT_ADDRESS = contractaddress;
        const CONTRACT_ABI = [
            "function WithDrawFromWallet(address from, address to, uint256 amount) public",
            "function balanceOf(address account) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ];
    
        const walletAddress = userdata.walletAddress;
    
        if (!window.ethereum) {
            alert("Cần cài đặt MetaMask hoặc ví web3 khác.");
            return;
        }
    
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const currentAddress = await signer.getAddress();
    
            if (!ethers.isAddress(walletAddress)) {
                alert("Địa chỉ ví đích không hợp lệ!");
                return;
            }
    
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            // Get token balance and decimals
            const [balance, decimals] = await Promise.all([
                contract.balanceOf(walletAddress),
                contract.decimals()
            ]);
    
            if (balance === 0n) {
                alert("Số dư của bạn là 0. Không thể thực hiện rút.");
                return;
            }
    
            // Convert balance to whole tokens for the WithDrawFromWallet function
            // The contract function will multiply by 10^decimals internally
            const wholeTokens = balance / (10n ** BigInt(decimals));
            
            console.log(`Số dư: ${ethers.formatUnits(balance, decimals)} BIDI`);
            console.log(`Chuyển: ${wholeTokens} tokens (không bao gồm decimals)`);
    
            // Show pending message
            const pendingMsg = document.getElementById('pendingTxMessage');
            if (pendingMsg) pendingMsg.style.display = 'block';
    
            // Execute the transaction
            const tx = await contract.WithDrawFromWallet(
                walletAddress,
                currentAddress,
                wholeTokens
            );
    
            const receipt = await tx.wait();
            
            // Hide pending message
            if (pendingMsg) pendingMsg.style.display = 'none';
            
            alert(`Chuyển token BIDI thành công!`);
    
        } catch (error) {
            console.error("Giao dịch thất bại:", error);
            
            // Simplified error handling
            let errorMessage = error?.reason || error?.message || "Lỗi không xác định";
            
            if (errorMessage.includes("Insufficient balance")) {
                alert("Số dư không đủ để thực hiện giao dịch.");
            } else if (errorMessage.includes("gas required") || errorMessage.includes("insufficient funds")) {
                alert("Không đủ ETH để trả phí gas.");
            } else {
                alert("Chuyển token thất bại: " + errorMessage);
            }
    
            const pendingMsg = document.getElementById('pendingTxMessage');
            if (pendingMsg) pendingMsg.style.display = 'none';
        }
    }
    
    const getUserWithdrawnOffer = async () => {
        try {
          const response = await axios.get('http://localhost:3000/api/get/token/offer');
          console.log("📦 Raw response:", response);
    
          const rawData = response.data?.data;
    
          if (!Array.isArray(rawData)) {
            console.error("❌ Invalid format: response.data.data is not an array", rawData);
            return;
          }
    
          const formattedItems = rawData.map((item, index) => {
            if (!Array.isArray(item) || item.length < 5) {
              console.warn(`⚠️ Item at index ${index} is malformed:`, item);
              return null;
            }
          
            return {
              offerid: item[0],
              toWallet: item[1],
              fromWallet: item[2],
              amount: `${item[3]}`,
              isApproved: item[4],
            };
          })
          console.log(formattedItems)
          
    
          setWithdrawnOffer(formattedItems);
        } catch (error) {
          console.error("🚨 Failed to fetch exchange offers:", error);
        }
      };


    
    // Hàm kết nối ví
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            localStorage.setItem('metamask', accounts[0]);
            alert('Kết nối ví thành công!');
        } catch (error) {
            console.error("Lỗi kết nối ví:", error);
            alert("Không thể kết nối ví.");
        }
    } else {
        alert("Hãy cài đặt Metamask!");
    }
}
    

    // Hàm mua token
    async function buyToken(transfervalue) {
        if (!transfervalue || parseInt(transfervalue) <= 0) {
            alert("Please enter a valid amount to deposit");
            return;
        }

        setIsPendingTx(true);
        
        const CONTRACT_ADDRESS = contractaddress;
        const CONTRACT_ABI = [
            "function buyMoreTokken(uint256 amount, address account) public payable"
        ];
        const walletAddress = userdata.walletAddress; // Lấy địa chỉ ví từ localStorage

        if (!walletAddress) {
            setIsPendingTx(false);
            return alert("Vui lòng kết nối ví trước.");
        }

        if (!window.ethereum) {
            setIsPendingTx(false);
            return alert("Hãy kết nối ví trước!");
        }

        try {
         
            if (!walletAddress) {
                await connectWallet(); 
                setIsPendingTx(false);
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const pricePerToken = ethers.parseEther("0.00005"); // Giá mỗi token là 0.00005 Ether
            const totalPrice = pricePerToken * BigInt(transfervalue); // Tổng giá trị cần thanh toán

            // Gửi giao dịch mua token
            const tx = await contract.buyMoreTokken(
                BigInt(transfervalue), 
                walletAddress,         
                { value: totalPrice }   
            );

            await tx.wait(); // Chờ giao dịch hoàn thành

            setIsPendingTx(false);
            setIsDepositModalOpen(false);
            alert("Mua token thành công!");
        } catch (error) {
            console.error("Giao dịch thất bại:", error);
            setIsPendingTx(false);
            alert("Mua token thất bại: " + (error.message || "Lỗi không xác định"));
        }
    }

    async function CreateWithdrawOffer () {
       
        const CONTRACT_ADDRESS = contractaddress;
        const CONTRACT_ABI = [
            "function CreateExchangeOffer(uint256 amount,address from) public",
            "function balanceOf(address account) view returns (uint256)"
        ];
        
    
        const walletAddress = userdata.walletAddress;
        if (!walletAddress) return alert("Vui lòng kết nối ví trước.");
        if (!window.ethereum) return alert("Hãy kết nối ví trước!");
    
        try {
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
    
            const tx = await contract.CreateExchangeOffer(exchangeOfferAmount, walletAddress);
            await tx.wait();
    
            alert("Tạo yêu cầu rút token thành công!");
        } catch (error) {
            console.error("Giao dịch thất bại:", error);
            alert("Giao dịch thất bại!");
        }
    }

    return (
        <>
            <div style={styles.websiteBalanceContainer}>
                <div style={styles.websiteBalanceTitle}>
                    <span>Website Balance</span>
                    <span style={styles.infoIcon}>?</span>
                </div>

                <div style={styles.balanceCard}>
                    <div style={styles.balanceHeader}>
                        <span style={styles.statusIcon}>✔</span>
                        <span>Available Tokens</span>
                    </div>
                    <div style={styles.balanceContent}>
                        <img
                            src="path/to/token-image.png"
                            alt="Token"
                            style={styles.tokenImage}
                        />
                        <span style={styles.tokenAmount}>{userbalance} BDC</span>
                    </div>
                    <div style={styles.balanceActions}>
                        <button style={styles.depositButton} onClick={() => setIsDepositModalOpen(true)}>
                            Deposit to Game
                        </button>
                        <button
                            onClick={() => setIsWithdrawModalOpen(true)}
                            style={styles.withdrawButton}
                        >
                            Withdraw to Wallet
                        </button>
                        <button
                            onClick={() => setIsExchangeOfferModalOpen(true)}
                            style={styles.withdrawButton}
                        >
                            Create Withdraw offer
                        </button>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div style={styles.transactionWrapper}>
                <div style={styles.transactionList}>
                    <h3 style={styles.transactionTitle}>Transaction History</h3>
                    <ul style={styles.transactionItems}>
                    {withdrawnOffer
                        .filter((tx) => userdata.walletAddress === tx.fromWallet)
                        .map((tx) => (
                            <li key={tx.offerid} style={styles.transactionItem}>
                            <span>{tx.toWallet}</span>
                            <span>{tx.fromWallet} Tokens</span>
                            <span>{tx.amount}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Pending Transaction Overlay */}
            {isPendingTx && (
                <div style={styles.pendingOverlay}>
                    <div style={styles.pendingMessage} id="pendingTxMessage">
                        <div style={styles.spinner}></div>
                        <p>Transaction in progress...</p>
                        <p>Please wait and do not close this window</p>
                    </div>
                </div>
            )}

            {/* Deposit Modal */}
            {isDepositModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2>Deposit Tokens</h2>
                        <input
                            type="number"
                            value={transfervalue}
                            onChange={(e) => setTransferValue(e.target.value)}
                            placeholder="Enter token amount"
                            style={styles.inputField}
                        />
                        <div style={styles.modalInfo}>
                            <p>Rate: 1 token = 0.00005 ETH</p>
                            <p>Total cost: {transfervalue ? (parseFloat(transfervalue) * 0.00005).toFixed(6) : "0"} ETH</p>
                        </div>
                        <div style={styles.modalButtons}>
                            <button
                                style={styles.confirmButton}
                                onClick={() => buyToken(transfervalue)}
                            >
                                Confirm
                            </button>
                            <button
                                style={styles.cancelButton}
                                onClick={() => setIsDepositModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {isWithdrawModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2>Withdraw Tokens</h2>
                        <input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Enter token amount to withdraw"
                            style={styles.inputField}
                        />
                        <div style={styles.modalInfo}>
                            <p>Available balance: {userbalance} BDC</p>
                            <p>Tokens will be sent to your connected wallet</p>
                            <p>Wallet: {userdata?.walletAddress.slice(0, 6)}...{userdata?.walletAddress.slice(-4)}</p>
                        </div>
                        <div style={styles.modalButtons}>
                            <button
                                style={styles.confirmButton}
                                onClick={WithDrawBDCToWallet}
                            >
                                Confirm
                            </button>
                            <button
                                style={styles.cancelButton}
                                onClick={() => setIsWithdrawModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Exchange Offer Modal */}
            {isExchangeOfferModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2>Create Withdraw Offer</h2>
                        <input
                            type="number"
                            value={exchangeOfferAmount}
                            onChange={(e) => setExchangeOfferAmount(e.target.value)}
                            placeholder="Enter token amount for exchange"
                            style={styles.inputField}
                        />
                        <div style={styles.modalInfo}>
                            <p>Available balance: {userbalance} BDC</p>
                            <p>Creating an exchange offer will initiate a withdrawal request</p>
                            <p>This will be processed by administrators</p>
                        </div>
                        <div style={styles.modalButtons}>
                            <button
                                style={styles.confirmButton}
                                onClick={CreateWithdrawOffer}
                            >
                                Confirm
                            </button>
                            <button
                                style={styles.cancelButton}
                                onClick={() => setIsExchangeOfferModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WebsiteBalance;

const styles = {
    websiteBalanceContainer: {
        padding: "20px",
        backgroundColor: "#1c1a2e",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        maxWidth: "80%",
        margin: "0 auto",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    websiteBalanceTitle: {
        fontSize: "20px",
        fontWeight: "bold",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        color: "white",
    },
    infoIcon: {
        fontSize: "14px",
        color: "#888",
        cursor: "pointer",
    },
    balanceCard: {
        backgroundColor: "#1c1a2e",
        borderRadius: "8px",
        border: "10px solid rgba(12, 12, 12, 0.1)",
        padding: "16px",
        boxShadow: "0 3px 3px rgba(5, 4, 4, 0.1)",
        width: "100%",
        maxWidth: "800px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    balanceHeader: {
        fontSize: "16px",
        fontWeight: "bold",
        marginBottom: "12px",
        display: "flex",
        alignItems: "center",
    },
    statusIcon: {
        color: "green",
        marginRight: "8px",
    },
    balanceContent: {
        display: "flex",
        alignItems: "center",
        marginBottom: "16px",
    },
    tokenImage: {
        width: "40px",
        height: "40px",
        marginRight: "12px",
    },
    tokenAmount: {
        fontSize: "18px",
        fontWeight: "bold",
    },
    balanceActions: {
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        gap: "10px",
    },
    depositButton: {
        backgroundColor: "#4caf50",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        padding: "10px 16px",
        cursor: "pointer",
        flex: 1,
    },
    withdrawButton: {
        backgroundColor: "#f44336",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        padding: "10px 16px",
        cursor: "pointer",
        flex: 1,
    },
    transactionWrapper: {
        marginTop: "40px",
        display: "flex",
        justifyContent: "center",
        padding: "20px",
        maxWidth: "100%",
    },
    transactionList: {
        width: "100%",
        maxWidth: "80%",
        backgroundColor: "#2b2a3d",
        padding: "20px",
        borderRadius: "8px",
    },
    transactionTitle: {
        marginBottom: "12px",
        fontSize: "18px",
        fontWeight: "bold",
        color: "#ffffff",
    },
    transactionItems: {
        listStyle: "none",
        padding: 0,
        margin: 0,
    },
    transactionItem: {
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid #444",
        fontSize: "14px",
        color: "#ddd",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: "#1c1a2e",
        padding: "30px",
        borderRadius: "10px",
        width: "350px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        color: "white",
    },
    modalInfo: {
        backgroundColor: "#2b2a3d",
        padding: "12px",
        borderRadius: "5px",
        fontSize: "14px",
    },
    inputField: {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #555",
        backgroundColor: "#2b2a3d",
        color: "white",
    },
    modalButtons: {
        display: "flex",
        justifyContent: "space-between",
        gap: "10px",
    },
    confirmButton: {
        backgroundColor: "#4caf50",
        padding: "10px",
        border: "none",
        color: "white",
        borderRadius: "5px",
        cursor: "pointer",
        flex: 1,
    },
    cancelButton: {
        backgroundColor: "#f44336",
        padding: "10px",
        border: "none",
        color: "white",
        borderRadius: "5px",
        cursor: "pointer",
        flex: 1,
    },
    pendingOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
    },
    pendingMessage: {
        backgroundColor: "#1c1a2e",
        padding: "30px",
        borderRadius: "10px",
        textAlign: "center",
        color: "white",
        maxWidth: "400px",
    },
    spinner: {
        border: "5px solid rgba(255, 255, 255, 0.3)",
        borderTop: "5px solid #4caf50",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        margin: "0 auto 20px auto",
        animation: "spin 1s linear infinite",
    },
};