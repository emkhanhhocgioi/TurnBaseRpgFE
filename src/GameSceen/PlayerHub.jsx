import React, { useEffect, useState } from 'react';
import Profile from '../Hubcomponent/Profile';
import MarketPlace from '../Hubcomponent/MarketPlace';
import WebsiteBalance from '../Hubcomponent/WebsiteBalance';
import LevelSelecter from './LevelSelecter';
import ItemRoll from '../Hubcomponent/ItemRoll';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import your background image
// Consider moving this to an assets folder that's properly handled by your bundler
const bgImagePath = '/assets/hubui/mainhubbackground.jpg';

export default function PlayerHub() {
  const navigate = useNavigate();
  const [page, setPage] = useState('profile');
  const location = useLocation();
  const { userdata } = location.state || {};
  const [userCharacter, setUserCharacter] = useState(null);
  
  // Redirect if no userdata is found
  useEffect(() => {
    if (!userdata) {
      console.error("No user data available");
      navigate('/login', { replace: true }); // Redirect to login if no user data
    }
  }, [userdata, navigate]);

  const getUserCharacter = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found in localStorage.");
        navigate('/login', { replace: true });
        return;
      }

      if (!userdata?._id) {
        console.error("UserID is missing.");
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/api/get/user/character", 
        { UserID: userdata._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        
        // Calculate stats from items
        const itemStats = calculateItemStats(data.equippedItems);
        
        
        // Merge with character base stats
        const finalCharacter = {
          ...data.character,
          damage: (data.character?.damage || 0) + itemStats.dmg,
          hp: (data.character?.hp || 0) + itemStats.hp,
          mp: (data.character?.mp || 0) + itemStats.mp,
          armor: (data.character?.armor || 0) + itemStats.armor,
          agility: (data.character?.agility || 0) + itemStats.agility,
        };
        
        setUserCharacter(finalCharacter);
      } else {
        console.error(`Failed to fetch character: ${response.status} ${response.data}`);
      }
    } catch (error) {
      console.error("Error fetching user character:", 
        error.response ? error.response.data : error.message || error);
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

  // Call getUserCharacter when userdata changes
  useEffect(() => {
    if (userdata?._id) {
      getUserCharacter();
    }
  }, [userdata]);

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
      backgroundImage: `url(${bgImagePath})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflowY: 'auto',
    },
  };

  // Show loading state when waiting for user data
  if (!userdata) {
    return <div style={{ ...style.layoutContainer, justifyContent: 'center', alignItems: 'center' }}>
      Loading user data...
    </div>;
  }

  return (
    <div style={style.layoutContainer}>
      <div style={style.leftSidebar}>
        <div style={style.sidebarSection}>
          <p style={style.sectionTitle}>MY ACCOUNT</p>
          <button 
            onClick={() => setPage('profile')} 
            style={{ ...style.sidebarBtn, ...(page === 'profile' && style.activeBtn) }}
          >
            Profile
          </button>
          <button 
            onClick={() => setPage('level')} 
            style={{ ...style.sidebarBtn, ...(page === 'level' && style.activeBtn) }}
          >
            Play RavenQuest
          </button>
          <button style={style.sidebarBtn}>My Referrals</button>
        </div>

        <div style={style.sidebarSection}>
          <p style={style.sectionTitle}>THE MARKET PLACE</p>
          <button style={{ ...style.sidebarBtn, ...style.highlightedBtn }}
           onClick={() => setPage('LootChest')} >
            <span>🎁 Lucky Chests</span>
            <span style={style.newTag}>NEW</span>
          </button>
          <button 
            onClick={() => setPage('marketplace')} 
            style={{ ...style.sidebarBtn, ...(page === 'marketplace' && style.activeBtn) }}
          >
            MTK MARKETPLACE
          </button>
        </div>

        <div style={style.sidebarSection}>
          <p style={style.sectionTitle}>$QUEST BALANCE</p>
          <button 
            onClick={() => setPage('websitebalance')} 
            style={{ ...style.sidebarBtn, ...(page === 'websitebalance' && style.activeBtn) }}
          >
            Website Balance
          </button>
          <button style={style.sidebarBtn}>Passport Balance</button>
        </div>

       
      </div>

      <div style={style.mainHub}>
        
        {page === 'level' && userCharacter ? (
          <LevelSelecter 
            style={{ marginTop: "10%" }} 
            userCharacter={userCharacter} 
            userdata={userdata} 
          />
        ) : page === 'level' && (
          <div>Loading character data...</div>
        )}

        {page === 'profile' && (
          <Profile 
            userdata={userdata} 
            userCharacter={userCharacter} 
          />
        )}
        
        {page === 'marketplace' && (
          <MarketPlace 
            userdata={userdata} 
            userCharacter={userCharacter} 
          />
        )}
        
        {page === 'websitebalance' && (
          <WebsiteBalance 
            userdata={userdata} 
            userCharacter={userCharacter} 
          />
        )}
        {page === 'LootChest' && (
          <ItemRoll 
            userdata={userdata} 
            userCharacter={userCharacter} 
          />
        )}
      </div>
    </div>
  );
}