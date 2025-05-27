import React, { useState, useEffect } from 'react';
import { ethers ,parseEther } from "ethers";
import axios from 'axios';
import { data } from 'react-router-dom';
const styles = {
  container: {
    maxWidth: "1024px",
    margin: "0 auto",
    padding: "22px"
  },
  heading: {
    fontSize: "1.875rem",
    fontWeight: "700",
    marginBottom: "24px"
  },
  card: {
    width:"100%",
    
    backgroundColor: "white",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    padding: "24px"
  },
  cardMargin: {
    marginBottom: "32px"
  },
  subheading: {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "16px"
  },
  flexRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px"
  },
  inputContainer: {
    width: "100%"
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "4px"
  },
  input: {
    width: "100%",
    padding: "8px 16px",
    border: "1px solid #D1D5DB",
    borderRadius: "6px"
  },
  buttonContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "16px"
  },
  primaryButton: {
    padding: "8px 24px",
    backgroundColor: "#2563EB",
    color: "white",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer"
  },
  primaryButtonDisabled: {
    backgroundColor: "#93C5FD",
    cursor: "not-allowed"
  },
  secondaryButton: {
    padding: "8px 16px",
    backgroundColor: "#10B981",
    color: "white",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer"
  },
  secondaryButtonDisabled: {
    backgroundColor: "#6EE7B7",
    cursor: "not-allowed"
  },
  headerFlex: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },
  tableContainer: {
    overflowX: "auto",
    width:"100%"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableHead: {
    backgroundColor: "#F9FAFB"
  },
  tableHeader: {
    padding: "12px 24px",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  tableBody: {
    backgroundColor: "white"
  },
  tableRow: {
    borderBottom: "1px solid #E5E7EB"
  },
  tableCell: {
    color:"black",
    padding: "16px 24px",
    whiteSpace: "nowrap"
  },
  statusBase: {
    padding: "2px 8px",
    borderRadius: "9999px",
    fontSize: "0.75rem"
  },
  statusCompleted: {
    backgroundColor: "#D1FAE5",
    color: "#065F46"
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E"
  },
  statusFailed: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C"
  },
  emptyState: {
    color: "#6B7280",
    textAlign: "center",
    padding: "16px 0"
  },
  // Media query styles implemented in component using inline conditional styling
};

const Admin = () => {
    const contractAddress = '0x131FC01D962Fee7675586cbffdb8Afb2a589A291';
    const [contractbl,setContractbl] = useState(0);
    const [depositAmount, setDepositAmount] = useState(10);
    const [exchangeOffers, setExchangeOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        // Add window resize listener for responsive design
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        getContractToken();
        
        // Mock data for exchange offers
        const mockOffers = [
            { id: 1, amount: "5", date: "2025-05-01", status: "Pending" },
            { id: 2, amount: "3.5", date: "2025-05-01", status: "Completed" },
            { id: 3, amount: "10", date: "2025-04-30", status: "Failed" },
        ];
        setExchangeOffers(mockOffers);
        getUserWithdrawnOffer();
   
        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const ApproveExchange = async (offerId) => {
        try {
            const resdata = await axios.post("http://localhost:3000/api/approve/token/offer", {
                id: offerId
            });
            if (resdata.data.success) {
                alert(`Offer ID ${offerId} approved successfully!`);
                // Update the status of the offer in the UI
                setExchangeOffers((prevOffers) =>
                    prevOffers.map((offer) =>
                        offer.offerid === offerId ? { ...offer, isApproved: true } : offer
                    )
                );
            } else {
                alert(`Failed to approve offer ID ${offerId}: ${resdata.data.message}`);
            }
        } catch (error) {
            console.error("Error approving exchange offer:", error);
            alert("An error occurred while approving the offer.");
        }
    };
    const DeclineExchange = async (offerId) =>{
      try {
        const resdata = await axios.post("http://localhost:3000/api/decline/token/offer", {
            id: offerId
        });
        if (resdata.data.success) {
            alert(`Offer ID ${offerId} Decline successfully!`);
            // Update the status of the offer in the UI
            setExchangeOffers((prevOffers) =>
                prevOffers.map((offer) =>
                    offer.offerid === offerId ? { ...offer, isApproved: true } : offer
                )
            );
        } else {
            alert(`Failed to approve offer ID ${offerId}: ${resdata.data.message}`);
        }
    } catch (error) {
        console.error("Error approving exchange offer:", error);
        alert("An error occurred while approving the offer.");
    }
    }
    const getContractToken = async () => {
        try {
          const response = await axios.get("http://localhost:3000/api/testbzh");
          
          // Log the entire response for debugging
          console.log("Full response:", response);
          
          if (response.data && response.data.success) {
            console.log("Contract balance:", response.data.contractBalance);
            console.log("Token equivalent:", response.data.tokenEquivalent);
            setContractbl(response.data.contractBalance)
          }
        } catch (error) {
          console.error("API call failed:", error.response ? error.response.data : error.message);
        }
      };
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
          
    
          setExchangeOffers(formattedItems);
        } catch (error) {
          console.error("🚨 Failed to fetch exchange offers:", error);
        }
      };
    

      const depositToContract = async () => {
        if (!depositAmount || depositAmount <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        
        const CONTRACT_ADDRESS = contractAddress;
        const CONTRACT_ABI = [
            "function deposit() external payable"  // Changed to match the expected contract function
        ];
        
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            // Convert depositAmount to Wei
            const amountInWei = ethers.parseEther(depositAmount.toString());
            
            // Call the deposit function with the correct parameters
            const tx = await contract.deposit({ value: amountInWei });
            await tx.wait();
            
            // Add the new deposit to the exchange offers
            const newOffer = {
                id: exchangeOffers.length + 1,
                amount: depositAmount.toString(),
                date: new Date().toISOString().split('T')[0],
                status: "Completed"
            };
            setExchangeOffers([newOffer, ...exchangeOffers]);
            
            alert("Deposit successful!");
        } catch (error) {
            console.error("Transaction failed:", error);
            alert("Deposit failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const ownerWithdrawFromContract = async () => {
      const CONTRACT_ADDRESS = contractAddress;
      const CONTRACT_ABI = [
          "function withdrawEthToOwner() external"
      ];
      
      setLoading(true);
      try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          
          const tx = await contract.withdrawEthToOwner();
          await tx.wait();
          
          alert("Withdrawal successful!");
      } catch (error) {
          console.error("Transaction failed:", error);
          alert("Withdrawal failed: " + error.message);
      } finally {
          setLoading(false);
      }
  };

    const getStatusStyle = (status) => {
        let baseStyle = { ...styles.statusBase };
        switch(status) {
            case "Completed":
                return { ...baseStyle, ...styles.statusCompleted };
            case "Pending":
                return { ...baseStyle, ...styles.statusPending };
            default:
                return { ...baseStyle, ...styles.statusFailed };
        }
    };

    // Responsive style adjustments
    const isDesktop = windowWidth >= 768;
    
    const responsiveFlexRow = {
        ...styles.flexRow,
        ...(isDesktop && { 
            flexDirection: "row" 
        })
    };
    
    const responsiveInputContainer = {
        ...styles.inputContainer,
        ...(isDesktop && { 
            width: "50%" 
        })
    };
    
    const responsiveButtonContainer = {
        ...styles.buttonContainer,
        ...(isDesktop && { 
            width: "50%",
            marginTop: 0
        })
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Admin Panel</h1>
            <p style={{fontSize:"16px"}}>{"Contract Balance: "+contractbl}</p>
            {/* Top container with input for amount */}
            <div style={{...styles.card, ...styles.cardMargin}}>
                <h2 style={styles.subheading}>Deposit to Contract</h2>
                <div style={responsiveFlexRow}>
                    <div style={responsiveInputContainer}>
                        <label htmlFor="amount" style={styles.label}>
                            Amount (ETH)
                        </label>
                        <input
                            id="amount"
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
                            min="0.001"
                            step="0.001"
                            style={styles.input}
                        />
                    </div>
                    <div style={responsiveButtonContainer}>
                        <button
                            onClick={depositToContract}
                            disabled={loading}
                            style={{
                                ...styles.primaryButton,
                                ...(loading && styles.primaryButtonDisabled)
                            }}
                        >
                            {loading ? "Processing..." : "Deposit to Contract"}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Bottom container with exchange offers list */}
            <div style={styles.card}>
                <div style={styles.headerFlex}>
                    <h2 style={styles.subheading}>Exchange Offers</h2>
                    <button
                        onClick={ownerWithdrawFromContract}
                        disabled={loading}
                        style={{
                            ...styles.secondaryButton,
                            ...(loading && styles.secondaryButtonDisabled)
                        }}
                    >
                        {loading ? "Processing..." : "Withdraw to Owner"}
                    </button>
                </div>
                
                {exchangeOffers.length > 0 ? (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead style={styles.tableHead}>
                                <tr>
                                    <th style={styles.tableHeader}>ID</th>
                                    <th style={styles.tableHeader}>From Wallet</th>
                                    <th style={styles.tableHeader}>To Wallet</th>
                                    <th style={styles.tableHeader}>Amount</th>
                                    <th style={styles.tableHeader}>Status</th>
                                    <th style={styles.tableHeader}>Action</th>
                                </tr>
                            </thead>
                            <tbody style={styles.tableBody}>
                                {exchangeOffers.map((offer, index) => (
                                    <tr key={index} style={styles.tableRow}>
                                        <td style={styles.tableCell}>{offer.offerid}</td>
                                        <td style={styles.tableCell}>{offer.fromWallet}</td>
                                        <td style={styles.tableCell}>{offer.toWallet}</td>
                                        <td style={styles.tableCell}>{offer.amount}</td>
                                        <td style={styles.tableCell}>
                                            <span style={{ color: offer.isApproved ? "green" : "red" }}>
                                                {offer.isApproved ? "Approved" : "Rejected"}
                                            </span>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <button
                                                style={{
                                                    ...styles.primaryButton,
                                                    backgroundColor: "green",
                                                    marginRight: "8px"
                                                }}
                                                onClick={() => ApproveExchange(offer.offerid)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                style={{
                                                    ...styles.primaryButton,
                                                    backgroundColor: "red"
                                                }}
                                                onClick={() => DeclineExchange(offer.offerid)}
                                            >
                                                Decline
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={styles.emptyState}>No exchange offers available</p>
                )}
            </div>
        </div>
    );
};

export default Admin;