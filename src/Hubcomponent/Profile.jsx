import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';
import CreateCharacter from "./CreateCharacter";
const Profile = () => {
  const location =  useLocation();
  const { userdata } = location.state || {}; // Safely accessing the passed userdata

  const [userbalance, setUserbalance] = useState([]); // lưu dữ liệu người dùng

  const [userCharacter, setUserCharacter] = useState(); // lưu dữ liệu người dùng

  const [IsModalVisible, setIsModalVisible] = useState(false); // trạng thái của modal
  const getUserBalance = async () => {
    const userwallet = userdata.walletAddress;
    try {
        const response = await axios.post("http://localhost:3000/api/getTokenBalanceOfUser", {
            address: userwallet,
        });
        const data = response.data;
        console.log("User balance:", data); // Hiển thị thông báo từ server
        setUserbalance(data.balance); // Cập nhật userbalance sau khi bot di chuyển
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
        }else{
          console.log("Token:", token); // Kiểm tra token
        }

        const Userid = userdata?._id; // Lấy UserID từ userdata (thêm kiểm tra nếu userdata không tồn tại)
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
            console.log("User character:", data); // Hiển thị thông báo từ server
            setUserCharacter(data); // Cập nhật user character
        } else {
            console.error(`Failed to fetch character: ${response.status} ${response.data}`);
        }
    } catch (error) {
        console.error("Error fetching user character:", error.response ? error.response.data : error.message || error);
    }
};


useEffect(() => {
    getUserBalance();
    getUserCharacter();
},[]); // Chỉ chạy một lần khi component được mount
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
      <button style={style.secondaryButton}>{userbalance} MTK</button>
    </div>
    <button style={style.button}>DISCORD LINK</button>
  </div>

  {/* Wallet + Claim Code */}
  <div>
    <div style={style.card}>
      <div style={style.sectionTitle}>💡 Wallet Linking</div>
      <div style={style.labelText}>
        Your account does not have any wallet linked. Click the button
        below to link your wallet:
      </div>
      <button style={style.secondaryButton}>SIGN IN WITH METAMASK</button>
    </div>
    <div style={{ ...style.card, marginTop: "20px" }}>
      <div style={style.sectionTitle}>🔏 Claim Code</div>
      <input type="text" placeholder="Your code here" style={style.inputField} />
      <button style={style.button}>CLAIM CODE</button>
    </div>
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

{IsModalVisible && (
 <CreateCharacter style={{
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  height: "50%",
  zIndex: 9999, // để đảm bảo nó ở trên các phần khác nếu cần
  backgroundColor: "#1c1a2e", // tùy chọn nếu bạn muốn hiển thị rõ
  borderRadius: "20px",       // thẩm mỹ
  padding: "20px"             // khoảng cách nội dung
}} onClose={() => setIsModalVisible(false)} userdata={userdata}/>
)
}
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
      color:"white",
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
  };
   
export default Profile;
