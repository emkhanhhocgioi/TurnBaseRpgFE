import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useLocation } from "react-router-dom";

const WebsiteBalance = () => {
    const location = useLocation();
    const { userdata } = location.state || {};
    const [transfervalue, setTransferValue] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const withdrawValue = 100;
    const contractaddress = '0x42D7881c94781A284f28B31120FB7eEC217d1DfA';

    const transactions = [
        { id: 1, type: "Deposit", amount: "100", date: "2025-04-28" },
        { id: 2, type: "Withdraw", amount: "50", date: "2025-04-27" },
        { id: 3, type: "Deposit", amount: "200", date: "2025-04-25" },
    ];

    const [userbalance, setUserbalance] = useState(0);

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
    }, [userdata]);

  
    

    async function WithDrawBDCToWalllet() {
        // Địa chỉ hợp đồng BidiTOKEN
        const CONTRACT_ADDRESS = contractaddress;
        
        // ABI khớp với hợp đồng thực tế
        const CONTRACT_ABI = [
            // Hàm WithDrawFromWallet đúng với hợp đồng
            "function WithDrawFromWallet(address from, address to, uint256 amount) public",
            "function balanceOf(address account) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ];
    
        // Lấy địa chỉ ví đích từ dữ liệu người dùng
        const walletAddress = userdata.walletAddress;
    
        // Kiểm tra xem có MetaMask hoặc ví web3 khác không
        if (!window.ethereum) {
            alert("Cần cài đặt MetaMask hoặc ví web3 khác. Vui lòng cài đặt và kết nối ví của bạn.");
            return;
        }
    
        try {
            // Yêu cầu kết nối ví
            await window.ethereum.request({ method: "eth_requestAccounts" });
    
            const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
            const signer = await provider.getSigner();
            const currentAddress = await signer.getAddress();
    
            // Kiểm tra địa chỉ
            if (!ethers.isAddress(walletAddress)) {
                alert("Địa chỉ ví đích không hợp lệ!");
                return;
            }
    
            // Tạo instance của hợp đồng
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            // Mặc định số thập phân là 18 (phổ biến cho ERC20)
            let decimals = 18;
            try {
                const decimalsResult = await contract.decimals();
                decimals = Number(decimalsResult);
            } catch (error) {
                console.warn("Không thể lấy được số thập phân của token, mặc định là 18:", error);
            }
            
            // Lấy số dư hiện tại của người dùng
            let balance;
            try {
                balance = await contract.balanceOf(walletAddress);
                console.log(`Số dư hiện tại: ${ethers.formatUnits(balance)} token BIDI.`);
            } catch (error) {
                console.warn("Không thể kiểm tra số dư:", error);
                return;
            }
    
            // Kiểm tra nếu số dư bằng 0
            if (balance === 0n) {
                alert("Số dư của bạn là 0. Không thể thực hiện rút.");
                return;
            }
    
            // Chuyển đổi số dư thành đơn vị nhỏ nhất
            const withdrawAmount = balance;
    
            console.log("Địa chỉ ví nhận:", walletAddress);
            console.log("Địa chỉ người gửi:", currentAddress);
            console.log("Số lượng chuyển:", ethers.formatUnits(withdrawAmount, decimals), "token BIDI");
            console.log("Số lượng chuyển (đơn vị nhỏ nhất):", withdrawAmount.toString());
    
            // Hiển thị thông báo đang xử lý
            const pendingMsg = document.getElementById('pendingTxMessage');
            if (pendingMsg) pendingMsg.style.display = 'block';
    
            // GỬI GIAO DỊCH - GIỮ NGUYÊN THỨ TỰ THAM SỐ KHỚP VỚI HỢP ĐỒNG
            // WithDrawFromWallet(address from, address to, uint256 amount)
            const tx = await contract.WithDrawFromWallet(
                walletAddress,  // from - địa chỉ người gửi (tài khoản hiện tại)
                currentAddress,   // to - địa chỉ nhận token
                withdrawAmount,  // amount - số lượng token (toàn bộ số dư)
                {
                    gasLimit: 300000 // Gas limit rõ ràng để tránh lỗi ước tính
                }
            );
    
            console.log("Giao dịch đã gửi:", tx.hash);
            
            // Đợi xác nhận
            const receipt = await tx.wait();
            console.log("Giao dịch đã được xác nhận:", receipt);
    
            // Ẩn thông báo đang xử lý
            if (pendingMsg) pendingMsg.style.display = 'none';
            
            alert(`Chuyển ${ethers.formatUnits(withdrawAmount, decimals)} token BIDI thành công!`);
            
            // Tùy chọn làm mới giao diện hiển thị số dư
            // refreshBalanceDisplay();
    
        } catch (error) {
            console.error("Giao dịch thất bại:", error);
            
            // Xử lý lỗi nâng cao
            let errorMessage;
            if (error.data) {
                errorMessage = `Chi tiết lỗi: ${error.data}`;
            } else if (error.error && error.error.message) {
                errorMessage = error.error.message;
            } else {
                errorMessage = error?.reason || error?.message || "Lỗi không xác định";
            }
            
            // Xử lý lỗi "Insufficient balance" từ hợp đồng
            if (errorMessage.includes("Insufficient balance")) {
                alert("Số dư không đủ để thực hiện giao dịch.");
            }
            // Xử lý các lỗi chung
            else if (errorMessage.includes("gas required exceeds allowance") || 
                errorMessage.includes("insufficient funds")) {
                alert("Giao dịch thất bại: Bạn không có đủ ETH để trả phí gas.");
            } else if (errorMessage.includes("execution reverted")) {
                alert("Giao dịch thất bại: Hợp đồng từ chối thực thi. Có thể do số dư token không đủ hoặc hạn chế của hợp đồng.");
            } else if (errorMessage.includes("Cannot mix BigInt")) {
                alert("Lỗi định dạng số khi chuyển đổi giá trị token.");
            } else {
                alert("Chuyển token thất bại! Lý do: " + errorMessage);
            }
            
            // Ẩn thông báo đang xử lý
            const pendingMsg = document.getElementById('pendingTxMessage');
            if (pendingMsg) pendingMsg.style.display = 'none';
        }
    }


    
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
    const CONTRACT_ADDRESS = contractaddress;
    const CONTRACT_ABI = [
        "function buyMoreTokken(uint256 amount, address account) public payable"
    ];
    const walletAddress = userdata.walletAddress; // Lấy địa chỉ ví từ localStorage

    if (!walletAddress) {
        return alert("Vui lòng kết nối ví trước.");
    }

    if (!window.ethereum) return alert("Hãy kết nối ví trước!");

    try {
        // Nếu ví chưa kết nối, yêu cầu kết nối
        if (!walletAddress) {
            await connectWallet(); // Kết nối ví nếu chưa có tài khoản
            return; // Dừng nếu kết nối ví thất bại
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const pricePerToken = ethers.parseEther("0.005"); // Giá mỗi token là 0.005 Ether
        const totalPrice = pricePerToken * BigInt(transfervalue); // Tổng giá trị cần thanh toán

        // Gửi giao dịch mua token
        const tx = await contract.buyMoreTokken(
            BigInt(transfervalue), // Số lượng token muốn mua
            walletAddress,          // Địa chỉ ví của người mua
            { value: totalPrice }   // Số Ether cần trả
        );

        await tx.wait(); // Chờ giao dịch hoàn thành

        alert("Mua token thành công!");
    } catch (error) {
        console.error("Giao dịch thất bại:", error);
        alert("Mua token thất bại!");
    }
}

async function CreateWithdrawOffer () {
    const amount = 10;
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

        const tx = await contract.CreateExchangeOffer(amount,walletAddress);
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
                        <button style={styles.depositButton} onClick={() => setIsModalOpen(true)}>
                            Deposit to Game
                        </button>
                        <button
                            onClick={WithDrawBDCToWalllet}
                            style={styles.withdrawButton}
                        >
                            Withdraw to Wallet
                        </button>
                        <button
                            onClick={CreateWithdrawOffer}
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
                        {transactions.map((tx) => (
                            <li key={tx.id} style={styles.transactionItem}>
                                <span>{tx.type}</span>
                                <span>{tx.amount} Tokens</span>
                                <span>{tx.date}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
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
                        <div style={styles.modalButtons}>
                            <button
                                style={styles.confirmButton}
                                onClick={() => {
                                    buyToken(transfervalue);
                                    setIsModalOpen(false);
                                }}
                            >
                                Confirm
                            </button>
                            <button
                                style={styles.cancelButton}
                                onClick={() => setIsModalOpen(false)}
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
        width: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        color: "white",
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
};
