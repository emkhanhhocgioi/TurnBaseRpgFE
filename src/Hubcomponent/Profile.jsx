import React from "react";
import { ethers } from "ethers";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';
import CreateCharacter from "./CreateCharacter";
import SellModal from "../Modal/SellModal";
import { ToastContainer, toast } from 'react-toastify';
const Profile = () => {
  const location = useLocation();
  const { userdata } = location.state || {}; // Safely accessing the passed userdata
  const [transfervalue, setTransferValue] = useState(10);
  const [userbalance, setUserbalance] = useState([]); // lưu dữ liệu người dùng
  const [account, setAccount] = useState();
  const [userCharacter, setUserCharacter] = useState(); // lưu dữ liệu người dùng
  const [inventory, setInventory] = useState();
  const [IsModalVisible, setIsModalVisible] = useState(false); // trạng thái của modal
  const [selectedItem, setSelectedItem] = useState(null); // Track which item is currently selected
  const [sellmodalvisable, setSellmodalVisable] = useState(false); // Fixed typo in function name
  const [itemToSell, setItemToSell] = useState(null); // Add this state to track the item being sold
  const [itemsEquipped, setItemsEquipped] = useState({
    weapon: null,
    armor: null,
    accessory: null,
  });
  const dropnotify = () => toast("Drop item success!");
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
  }

  const getUserCharacter = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token từ localStorage
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      } else {
        console.log("Token:", token); 
      }

      const Userid = userdata?._id; 
      if (!Userid) {
        console.error("UserID is missing.");
        return;
      }
      console.log("UserID:", Userid); // Kiểm tra UserID  

      const response = await axios.post(
        "http://localhost:3000/api/get/user/character",
        { UserID: Userid },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        console.log("User inventory:", data.inventory); // Hiển thị thông báo từ server
        console.log("User Equipment:", data.equippedItems); // Hiển thị thông báo từ server
        setItemsEquipped(data.equippedItems); // Cập nhật itemsEquipped
        const itemStats = calculateItemStats(data.equippedItems); // Tính toán stats từ items
        const finalCharacter = {
          ...data.character,
          damage: (data.character?.damage || 0) + itemStats.dmg,
          hp: (data.character?.hp || 0) + itemStats.hp,
          mp: (data.character?.mp || 0) + itemStats.mp,
          armor: (data.character?.armor || 0) + itemStats.armor,
          agility: (data.character?.agility || 0) + itemStats.agility,
        };
        setUserCharacter(finalCharacter); // Cập nhật user character
        setInventory(data.inventory)
      } else {
        console.error(`Failed to fetch character: ${response.status} ${response.data}`);
      }
    } catch (error) {
      console.error("Error fetching user character:", error.response ? error.response.data : error.message || error);
    }
  };
  const calculateItemStats = (equippedItems) => {
    if (!equippedItems || typeof equippedItems !== 'object') {
      return { dmg: 0, hp: 0, mp: 0, armor: 0, agility: 0 };
    }

   
    const itemsArray = Object.values(equippedItems).filter(Boolean);

    return itemsArray.reduce(
      (acc, item) => {
        if (item.attributes && Array.isArray(item.attributes)) {
          item.attributes.forEach((stat) => {
            acc.dmg += stat.dmg || 0;
            acc.hp += stat.hp || 0;
            acc.mp += stat.mp || 0;
            acc.armor += stat.armor || 0;
            acc.agility += stat.agility || 0;
          });
        }
        console.log("Item stats calculated:", acc);
        return acc;
   
      },
      { dmg: 0, hp: 0, mp: 0, armor: 0, agility: 0 }
    );
  };
  
  // Toggle item selection
  const handleItemClick = (index) => {
    if (selectedItem === index) {
      setSelectedItem(null); // Deselect if already selected
    } else {
      setSelectedItem(index); // Select the new item
      console.log(selectedItem)
    }
  };
  
  const setEquipItems =  async (item) =>{
   
    try {
      const response = await axios.post("http://localhost:3000/api/update/items/equipped", {
        itemId: item._id, // Assuming item has an _id property
        UserID: userdata._id, // Assuming userdata has an _id property
        slot: item.slot, // Assuming item has a 'slot' property (e.g., 'weapon', 'armor', 'accessory')
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        console.log("Item equipped successfully:", response.data);
       
      } else {
        console.error(`Failed to equip item: ${response.status} ${response.data}`);
      }
    } catch (error) {
      console.error("Error equipping item:", error.response ? error.response.data : error.message || error);
    }
  }

  
  const handleEquip = (item) => {
    itemsEquipped[item.slot] = item; // Assuming item has a 'slot' property
    console.log("Equipping item:", item);
    setItemsEquipped({ ...itemsEquipped }); // Update state to trigger re-render
    setEquipItems(item); // Call the function to update equipped items in the backend
    getUserCharacter();
    setSelectedItem(null); 
  };

  const handleDelete = (item) => {
    console.log("Deleting item:", item);  
    try {
      const res = axios.post("http://localhost:3000/api/delete/items", {
        itemId: item._id, // Assuming item has an _id property
        userId: userdata._id, // Assuming userdata has an _id property
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      if (res) {
        dropnotify();
       
        getUserCharacter(); // Refresh the character data to reflect changes
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }
  // Handle sell action
  const handleSell = (item) => {
    console.log("Selling item:", item);
    setItemToSell(item); 
    setSellmodalVisable(true); 
    setSelectedItem(null); 
  };

  // Function to close sell modal
  const closeSellModal = () => {
    setSellmodalVisable(false);
    setItemToSell(null);
  };

  useEffect(() => {
    getUserBalance();
    getUserCharacter();
  }, []); 

  return (
    
    <div style={style.mainGrid}>
      {/* Profile Card */}
    
      <div style={{ ...style.card, ...style.profileCard }}>
        <img
          src="https://ts2.mm.bing.net/th?id=OIP.zjjf6-aJUXqQTv0Yzvz4QQHaHa&pid=15.1"
          alt="avatar"
          style={style.avatar}
        />
        <div style={style.username}>{userdata?.username}</div>
        <div style={style.role}>Adventurer</div>
        <div style={style.balanceSection}>
          <button style={style.button}>View Balance</button>
          <button style={style.secondaryButton}>{userbalance}</button>
        </div>
   
      </div>

      <div style={{ ...style.card, marginTop: "20px" }}>
        <div style={style.sectionTitle}>🎒 Character Inventory</div>
        {/* Item In Use Section */}
        <div style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          {["weapon", "armor", "accessory"].map((slot) => (
            <div
              key={slot}
              style={{
                ...style.inventoryItem,
                minWidth: "80px",
                minHeight: "80px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed #1abc9c",
                backgroundColor: "#23213a",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#1abc9c", marginBottom: "5px" }}>
                {slot.charAt(0).toUpperCase() + slot.slice(1)}
              </div>
              {itemsEquipped[slot] ? (
                <>
                  <div style={{ fontSize: "13px", color: "#fff" }}>{itemsEquipped[slot].name}</div>
                  {itemsEquipped[slot].attributes &&
                    itemsEquipped[slot].attributes.map((stat, idx) => (
                      <div key={idx} style={{ fontSize: "11px", color: "#aaa" }}>
                        DMG: {stat.dmg} | HP: {stat.hp} | MP: {stat.mp} | Armor: {stat.armor} | Agility: {stat.agility}
                      </div>
                    ))}
                </>
              ) : (
                <div style={{ color: "#888", fontSize: "12px" }}>Empty</div>
              )}
            </div>
          ))}
          </div>
        </div>
        <div style={style.labelText}>Backpack </div>
        {inventory && inventory.length > 0 ? (
          <div style={style.inventoryGrid}>
            {inventory.map((item, index) => (
              <div
                key={index}
                style={{
                  ...style.inventoryButton,
                  border: selectedItem === index ? '2px solid #1abc9c' : 'none'
                }}
                onClick={() => handleItemClick(index)}
              >
                <div style={style.inventoryText}>{item.name}</div>
                
                {/* Stats and Actions display when selected */}
                {selectedItem === index && (
                  <div style={style.statsDisplay}>
                    {item.attributes && item.attributes.length > 0 && (
                      <div style={style.statsList}>
                        {item.attributes.map((stat, idx) => (
                          <div key={idx} style={style.statItem}>
                            <p style={style.statText}>DMG: {stat.dmg}</p>
                            <p style={style.statText}>HP: {stat.hp}</p>
                            <p style={style.statText}>MP: {stat.mp}</p>
                            <p style={style.statText}>Armor: {stat.armor}</p>
                            <p style={style.statText}>Agility: {stat.agility}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={style.actionButtons}>
                      <button 
                        style={style.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquip(item);
                        }}
                      >
                        Equip
                      </button>
                      <button 
                        style={style.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                      >
                        Delete item
                      </button>
                      <button 
                        style={style.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSell(item);
                        }}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={style.labelText}>No items in inventory.</div>
        )}
      </div>

      {/* Character Section */}
      <div style={style.card}>
        <div style={style.sectionTitle}>🛡️ Your Character</div>

        {userCharacter ? (
          <div style={style.statBox}>
            <div
              style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#2c2b40',
                borderRadius: '8px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src="https://th.bing.com/th/id/OIP.DjJzH1rmt4aGYouKnQuZ6gHaHa?w=159&h=180&c=7&r=0&o=5&pid=1.7"
                alt="Character"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '8px',
                  objectFit: 'cover',
                }}
              />
            </div>

            <div
              style={{
                width: '100%',
                borderRadius: '8px',
                padding: '15px',
                color: '#ccc',
              }}
            >
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Character Stats</h4>
              <div>
                <p><strong>Class:</strong> {userCharacter.characterClass}</p>
                <p><strong>HP:</strong> {userCharacter.hp}</p>
                <p><strong>MP:</strong> {userCharacter.mp}</p>
                <p><strong>Damage:</strong> {userCharacter.damage}</p>
                <p><strong>Armor:</strong> {userCharacter.armor}</p>
                <p><strong>Agility:</strong> {userCharacter.agility}</p>
                <p><strong>Level:</strong> {userCharacter.level}</p>
                <p><strong>EXP:</strong> {userCharacter.exp}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={style.labelText}>
              You don't have a character yet. Click below to create your first one!
            </div>

            <button
              onClick={() => setIsModalVisible(true)}
              style={{ ...style.button, marginTop: "20px" }}
            >
              CREATE CHARACTER
            </button>
          </>
        )}
      </div>
      
      {/* Sell Modal */}
      {sellmodalvisable && itemToSell && (
         <SellModal  
           style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "50%",
              height: "50%",
              zIndex: 9999,
              backgroundColor: "#1c1a2e",
              borderRadius: "20px",
              padding: "20px"
            }} 
            onClose={closeSellModal}
            userdata={userdata} 
            itemdata={itemToSell} 
          />
      )}
       <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Create Character Modal */}
      {IsModalVisible && (
        <CreateCharacter 
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            height: "50%",
            zIndex: 9999,
            backgroundColor: "#1c1a2e",
            borderRadius: "20px",
            padding: "20px"
          }} 
          onClose={() => setIsModalVisible(false)} 
          userdata={userdata} 
        />
      )}
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
    backgroundSize: "cover",
  },
  welcomeText: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "30px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr", // 3 columns grid
    gap: "20px",
    padding: "20px",
    minHeight: "500px", // You can set a minimum height if required
  },
  card: {
    backgroundColor: "#1c1a2e",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
  },
  profileCard: {
    textAlign: "center",
    paddingBottom: "30px",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    marginBottom: "10px",
  },
  username: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  role: {
    fontSize: "14px",
    color: "#aaa",
    marginBottom: "20px",
  },
  balanceSection: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "10px",
  },
  button: {
    backgroundColor: "#1abc9c",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
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
    marginBottom: "10px",
    fontWeight: "bold",
    color: "white",
  },
  inputField: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2c2b40",
    color: "#fff",
  },
  emailText: {
    marginTop: "10px",
    fontSize: "14px",
  },
  labelText: {
    color: "#aaa",
    marginBottom: "5px",
  },
  downloadButton: {
    marginTop: "10px",
    backgroundColor: "#2ecc71",
    border: "none",
    borderRadius: "10px",
    color: "white",
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  statBox: {
    display: 'flex',
    width: '100%',
    height: '400px',
    justifyContent: 'space-between',
    border: '1px solid #444',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  inventoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '10px',
    marginTop: '10px',
  },
  inventoryItem: {
    backgroundColor: '#2c2b40',
    borderRadius: '10px',
    padding: '10px',
    textAlign: 'center',
    color: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  inventoryIcon: {
    width: '50px',
    height: '50px',
    marginBottom: '5px',
  },
  inventoryText: {
    fontSize: '14px',
  },
  inventoryButton: {
    position: 'relative',
    backgroundColor: '#2c2b40',
    borderRadius: '10px',
    padding: '10px',
    textAlign: 'center',
    color: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    overflow: 'visible',
    transition: 'transform 0.2s',
    minHeight: '40px',
  },
  statsDisplay: {
    position: 'absolute',
    top: '100%',
    left: '0',
    width: '200px',
    backgroundColor: '#2c2b40',
    borderRadius: '10px',
    padding: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
    zIndex: 20,
    color: '#fff',
    textAlign: 'left',
    marginTop: '10px',
  },
  statsList: {
    marginBottom: '10px',
  },
  statItem: {
    marginBottom: '5px',
  },
  statText: {
    margin: '2px 0',
    fontSize: '12px',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '8px',
  },
  actionButton: {
    backgroundColor: '#1abc9c',
    color: '#fff',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    margin: '0 3px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  hoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(28, 26, 46, 0.95)',
    borderRadius: '10px',
    display: 'none',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    zIndex: 10,
  },
};

export default Profile;