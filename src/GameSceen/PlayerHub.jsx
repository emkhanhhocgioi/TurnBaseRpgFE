import React, { useEffect, useState } from 'react';
import Profile from '../Hubcomponent/Profile';
import MarketPlace from '../Hubcomponent/MarketPlace';
import bgImage from '/public/assets/hubui/mainhubbackground.jpg';
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
export default function PlayerHub() {
  const navigate = useNavigate(); 
  const [page, setPage] = useState('profile');
  const location = useLocation();
  const { userdata } = location.state || {}; // Safely accessing the passed userdata



  const [userCharacter, setUserCharacter] = useState(); // lưu dữ liệu người dùng
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
const handleNavigate = () => {
  // Ensure userCharacter is defined
  if (userCharacter) {
    navigate('/DungeonRun', { state: { userCharacter: userCharacter , userdata: userdata } });
  } else {
    console.error("userCharacter is undefined!");
  }
};
useEffect(() => {
    getUserCharacter(); // Gọi hàm khi component được mount
}, []); // Chỉ gọi một lần khi component được mount

  const style = {
    layoutContainer: {
      display: 'flex',
      height: '100vh',
      backgroundColor: '#0d0c1d',
      fontFamily: 'Poppins, sans-serif',
      color: 'white',
    },
    leftSidebar: {
      width: '250px',
      flexShrink: 0,
      flexGrow: 0,
      backgroundColor: '#15132b',
      padding: '20px',
      boxSizing: 'border-box',
      overflowY: 'auto',
    },
    sidebarSection: {
      marginBottom: '25px',
    },
    sectionTitle: {
      color: '#63f3f8',
      fontSize: '12px',
      fontWeight: 600,
      letterSpacing: '1px',
      marginBottom: '10px',
    },
    sidebarBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      backgroundColor: '#1d1b35',
      color: '#c7c7d9',
      border: 'none',
      padding: '12px 16px',
      marginBottom: '10px',
      borderRadius: '12px',
      fontSize: '14px',
      cursor: 'pointer',
    },
    activeBtn: {
      border: '1px solid #63f3f8',
      color: '#ffffff',
    },
    highlightedBtn: {
      border: '1px solid #f3d563',
      color: '#ffd700',
      fontWeight: 'bold',
    },
    newTag: {
      fontSize: '10px',
      backgroundColor: '#ffd700',
      color: '#000',
      padding: '2px 6px',
      borderRadius: '8px',
      marginLeft: '8px',
    },
    mainHub: {
      flexGrow: 1,
      padding: '20px',
      backgroundColor: '#ffffff',
      color: '#000',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflowY: 'auto',
    },
  };

  return (
    <div style={style.layoutContainer}>
      <div style={style.leftSidebar}>
        <div style={style.sidebarSection}>
          <p style={style.sectionTitle}>MY ACCOUNT</p>
          <button onClick={() => setPage('profile')} style={{ ...style.sidebarBtn, ...(page === 'profile' && style.activeBtn) }}>Profile</button>
          <button onClick={handleNavigate} style={style.sidebarBtn}>
            Play RavenQuest
          </button>

          <button style={style.sidebarBtn}>My Referrals</button>
        </div>

        <div style={style.sidebarSection}>
          <p style={style.sectionTitle}>THE MARKET PLACE </p>
          <button style={{ ...style.sidebarBtn, ...style.highlightedBtn }}>
            <span>🎁 Lucky Chests</span>
            <span style={style.newTag}>NEW</span>
          </button>
          <button onClick={() => setPage('marketplace')} style={{ ...style.sidebarBtn, ...(page === 'marketplace' && style.activeBtn) }}>MTK MARKETPLACE</button>
        </div>

        <div style={style.sidebarSection}>
          <p style={style.sectionTitle}>$QUEST BALANCE</p>
          <button style={style.sidebarBtn}>Website Balance</button>
          <button style={style.sidebarBtn}>Passport Balance</button>
        </div>

        <div style={style.sidebarSection}>
          <p style={style.sectionTitle}>COLLECTION</p>
          <button style={style.sidebarBtn}>Ascended Collection</button>
          <button style={style.sidebarBtn}>My Munk</button>
          <button style={style.sidebarBtn}>Munk Collection</button>
          <button style={style.sidebarBtn}>Ascended History</button>
        </div>
      </div>

      <div style={style.mainHub}>
      {page === 'profile' && userdata && <Profile userdata={userdata} />}
      {page === 'marketplace' && userdata && <MarketPlace userdata={userdata} />}

      </div>
    </div>
  );
}