import React, { useState, useEffect } from "react";
import axios from "axios";

const MarketPlace = () => {
  const [userbalance, setUserbalance] = useState(0);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const getUserBalance = async () => {
      const userwallet = "0xdd51C61689dbfbAAE324430367961B27E419da90";
      try {
        const response = await axios.post("http://localhost:3000/api/getTokenBalanceOfUser", {
          address: userwallet,
        });
        setUserbalance(response.data.balance);
      } catch (error) {
        console.error("Error fetching user balance:", error);
      }
    };

    getUserBalance();

    // Dummy items data - Replace with real data/API call
    setItems([
      { name: "Sword of Valor", type: "Weapon", price: "10 MTK" },
      { name: "Shield of Light", type: "Armor", price: "7 MTK" },
      { name: "Potion Pack", type: "Consumable", price: "3 MTK" },
    ]);
  }, []);

  return (
    <div style={style.container}>
      <h1 style={style.welcomeText}>Welcome To DDT Marketplace</h1>
      <div style={style.mainGridContainer}>
        <div style={{ ...style.card, ...style.profileCard }}>
          <h2 style={style.username}>Your MTK Token</h2>
          <div style={style.balanceSection}>
            <button style={style.secondaryButton}>{userbalance} MTK</button>
          </div>
        </div>

        <div style={{ ...style.card, ...style.itemTableCard }}>
          <h2 style={style.sectionTitle}>Marketplace Items</h2>
          <table style={style.table}>
            <thead>
              <tr>
                <th style={style.tableHeader}>Item</th>
                <th style={style.tableHeader}>Type</th>
                <th style={style.tableHeader}>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td style={style.tableCell}>{item.name}</td>
                  <td style={style.tableCell}>{item.type}</td>
                  <td style={style.tableCell}>{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const style = {
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
    color: "#fff",
  },
  welcomeText: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "30px",
  },
  mainGridContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "20px",
  },
  card: {
    backgroundColor: "#1c1a2e",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
  },
  profileCard: {
    textAlign: "center",
  },
  itemTableCard: {
    overflowX: "auto",
  },
  username: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  balanceSection: {
    display: "flex",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "#34495e",
    padding: "10px 20px",
    borderRadius: "10px",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "#fff",
  },
  tableHeader: {
    backgroundColor: "#2c2b40",
    padding: "12px",
    borderBottom: "1px solid #444",
    textAlign: "left",
  },
  tableCell: {
    padding: "10px",
    borderBottom: "1px solid #444",
  },
};

export default MarketPlace;
