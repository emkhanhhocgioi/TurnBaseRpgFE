import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { ethers,parseEther,formatEther } from "ethers";
const MarketPlace = () => {
  const location = useLocation();
  const { userdata } = location.state || {};
  const [userbalance, setUserbalance] = useState(0);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const getUserBalance = async () => {
      const userwallet = userdata.walletAddress;
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
  const getListeditem = async () => {
    try {
      const resdata = await axios.get("http://localhost:3000/api/getallitem");
      const rawItems = resdata.data.data;
  
      // Convert mảng thành object có key rõ ràng
      const formattedItems = rawItems.map(itemArr => ({
        listedid: itemArr[0],
        seller: itemArr[1],
        itemname: itemArr[2],
        desc: itemArr[4],
        itemid: itemArr[3],
        price: `${formatEther(itemArr[5])} BDC`,// convert wei → MTK using parseEther
        issold: itemArr[6]
      }));
      console.log(formattedItems)
      setItems(formattedItems);
    } catch (error) {
      console.error("Error fetching listed items:", error);
    }
  };
  
  const buyItemListed = async (productid,seller,itemid) => {
    try {
      const buyer = userdata.walletAddress;
      const data = {
        productid: productid,
        buyer: buyer,
        seller:seller,
        itemId:itemid
      };
      const resdata = await axios.post("http://localhost:3000/api/buylisteditem", {data:data}, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (resdata.status === 200) {
        alert("Item purchased successfully!");
        getListeditem(); // Refresh the listed items after purchase
      } else {
        alert("Failed to purchase the item. Please try again.");
      }
    } catch (error) {
      console.error("Error purchasing item:", error);
      alert("An error occurred while purchasing the item.");
    }
  };

  useEffect(() => {
    getListeditem();
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
                <th style={style.tableHeader}>Name</th>
                <th style={style.tableHeader}>ID</th>
                <th style={style.tableHeader}>Description</th>
                <th style={style.tableHeader}>Price</th>
                <th style={style.tableHeader}>Seller</th>
                <th style={style.tableHeader}>Status</th>
                <th style={style.tableHeader}>Action</th>
              </tr>
            </thead>
            <tbody>
            {items
              .filter((item) => userdata?.walletAddress !== item.seller)
              .map((item, index) => (
                <tr key={index}>
                  <td style={style.tableCell}>
                    <img 
                      src={`data:image/webp;base64,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`} 
                      alt={item.itemname} 
                      style={{ width: "50px", height: "50px", borderRadius: "5px" }} 
                    />
                  </td>
                <td style={style.tableCell}>{item.itemname}</td>
                <td style={style.tableCell}>{item.itemid}</td>
                <td style={style.tableCell}>{item.desc}</td>
                <td style={style.tableCell}>{item.price}</td>
                <td style={style.tableCell}>{item.seller}</td>
                <td style={style.tableCell}>{item.issold ? "Yes" : "No"}</td>
                <td style={style.tableCell}>
                  <button onClick={() => {buyItemListed(item.listedid,item.seller,item.itemid)}} style={style.secondaryButton}>Buy</button>
                </td>
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
