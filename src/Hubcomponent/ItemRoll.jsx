import React, { useState, useEffect } from 'react';
import { Heart, Plus, X } from 'lucide-react';
import { ethers } from "ethers";
import axios from 'axios';
import { useLocation } from "react-router-dom";

const RandomWheel = ({ isOpen, onClose, targetNumber, onSpinComplete, userdata }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);

  // Updated segments with images
  const segments = [
    { id: 1, name: "iron swrod", image: "public/assets/weapon/swordiron.png" },
    { id: 2, name: "shadow dagger", image: "public/assets/weapon/dagger.png" },
    { id: 3, name: "golden axe", image: "public/assets/weapon/gaxe.png" },
    { id: 4, name: "crystal staff", image: "public/assets/weapon/staff.png" },
    { id: 5, name: "blood katana", image: "public/assets/weapon/katana.png" },
  ];

  const segmentAngle = 360 / segments.length;

  useEffect(() => {
    if (isOpen && targetNumber !== null && !hasSpun) {
      const timer = setTimeout(() => {
        spinToTarget();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, targetNumber, hasSpun]);

  useEffect(() => {
    if (isOpen) {
      setHasSpun(false);
      setRotation(0);
      setIsSpinning(false);
    }
  }, [isOpen]);

  const handleClaimWeapon = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        'http://localhost:3000/api/add/item/luckychest',
        {
          UserID: userdata._id,
          itemid: targetNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.status === 200) {
        alert(`Weapon with ID ${targetNumber} claimed successfully!`);
      } else {
        alert("Failed to claim weapon. Please try again.");
      }
    } catch (error) {
      alert("An error occurred while claiming the weapon. Please try again.");
    }
    onClose();
    onSpinComplete && onSpinComplete();
  };

  const spinToTarget = () => {
    setIsSpinning(true);
    const targetIndex = segments.findIndex(seg => seg.id === parseInt(targetNumber));
    const targetAngle = targetIndex * segmentAngle;
    const fullRotations = (Math.floor(Math.random() * 4) + 5) * 360;
    const finalRotation = fullRotations + (360 - targetAngle);

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      onSpinComplete && onSpinComplete();
    }, 4000);
  };

  if (!isOpen) return null;

return (
    <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    }}>
        <div style={{
            background: '#1f2937',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            position: 'relative',
        }}>

            <h2 style={{
                color: 'white',
                fontSize: '24px',
                marginBottom: '24px',
                fontWeight: 'bold',
            }}>
                Opening Lucky Chest...
            </h2>

            <div style={{
                position: 'relative',
                width: '300px',
                height: '300px',
                margin: '0 auto 24px',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '15px solid transparent',
                    borderRight: '15px solid transparent',
                    borderBottom: '30px solid #ef4444',
                    zIndex: 10,
                }} />

                <div style={{
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    position: 'relative',
                    background: 'rgb(28, 9, 61)',
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                    border: '4px solid #374151',
                }}>
                    {segments.map((seg, index) => {
                        const angle = (index * segmentAngle) - 90;
                        const radian = (angle * Math.PI) / 180;
                        const radius = 120;
                        const x = Math.cos(radian) * radius;
                        const y = Math.sin(radian) * radius;

                        // Assign rarity color based on segment id (1 lowest, 5 highest)
                        let rarityColor;
                        switch (seg.id) {
                            case 1:
                                rarityColor = '#9ca3af'; // gray (common)
                                break;
                            case 2:
                                rarityColor = '#38bdf8'; // blue (uncommon)
                                break;
                            case 3:
                                rarityColor = '#a3e635'; // green (rare)
                                break;
                            case 4:
                                rarityColor = '#fbbf24'; // yellow (epic)
                                break;
                            case 5:
                                rarityColor = '#f43f5e'; // red/pink (legendary)
                                break;
                            default:
                                rarityColor = '#fff';
                        }

                        return (
                            <div
                                key={seg.id}
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                                    textAlign: 'center',
                                    pointerEvents: 'none',
                                }}
                            >
                                <div style={{
                                    border: `3px solid ${rarityColor}`,
                                    borderRadius: '50%',
                                    padding: '4px',
                                    background: 'rgba(0,0,0,0.7)',
                                    boxShadow: `0 0 12px 2px ${rarityColor}55`,
                                    marginBottom: '4px'
                                }}>
                                    <img
                                        src={seg.image}
                                        alt={seg.name}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            objectFit: 'contain',
                                            filter: 'drop-shadow(0 0 4px black)',
                                        }}
                                    />
                                </div>
                                
                            </div>
                        );
                    })}
                </div>

                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '40px',
                    height: '40px',
                    background: '#374151',
                    borderRadius: '50%',
                    border: '3px solid #6b7280',
                    zIndex: 5,
                }} />
            </div>

            <div style={{ color: '#d1d5db', marginBottom: '16px' }}>
                {isSpinning ? (
                    <>
                        <p style={{ fontSize: '18px', marginBottom: '8px' }}>🎲 Rolling...</p>
                        <p style={{ fontSize: '14px', opacity: 0.7 }}>Determining your legendary weapon...</p>
                    </>
                ) : hasSpun ? (
                    <>
                        <p style={{ fontSize: '18px', marginBottom: '8px', color: '#22c55e' }}>🎉 Chest Opened!</p>
                        <p style={{ fontSize: '16px', fontWeight: 'bold', color: (() => {
                            // Show rarity color for result
                            const seg = segments.find(s => s.id == targetNumber);
                            switch (seg?.id) {
                                case 1: return '#9ca3af';
                                case 2: return '#38bdf8';
                                case 3: return '#a3e635';
                                case 4: return '#fbbf24';
                                case 5: return '#f43f5e';
                                default: return '#fff';
                            }
                        })() }}>
                            Weapon: {segments.find(s => s.id == targetNumber)?.name} 
                        </p>
                    </>
                ) : (
                    <p style={{ fontSize: '16px' }}>Preparing the wheel...</p>
                )}
            </div>

            {hasSpun && (
                <button
                    onClick={handleClaimWeapon}
                    style={{
                        background: 'linear-gradient(to right, #10b981, #14b8a6)',
                        color: 'white',
                        fontWeight: 'bold',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                    }}
                >
                    Claim Your Weapon!
                </button>
            )}
        </div>
    </div>
);
};


const ItemRoll = () => {
  const location = useLocation();
  const { userdata } = location.state || {};
  const [selectedMultiplier, setSelectedMultiplier] = useState('x1');
  const [exclusiveDrop, setExclusiveDrop] = useState(false);
  const contractaddress = '0x131FC01D962Fee7675586cbffdb8Afb2a589A291';
  const multipliers = ['x1', 'x2', 'x3', 'x4', 'x5'];
  const [itemdrop, setItemDrop] = useState(null);
  const [showWheel, setShowWheel] = useState(false);
  const [targetChestId, setTargetChestId] = useState(null);

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#2c2c54',
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundPattern: {
      position: 'absolute',
      inset: '0',
      opacity: '0.1',
    },
    backgroundCircle1: {
      position: 'absolute',
      top: '80px',
      left: '80px',
      width: '384px',
      height: '384px',
      border: '1px solid #a855f7',
      borderRadius: '50%',
    },
    backgroundCircle2: {
      position: 'absolute',
      bottom: '80px',
      right: '80px',
      width: '256px',
      height: '256px',
      border: '1px solid #3b82f6',
      borderRadius: '50%',
    },
    backgroundCircle3: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '512px',
      height: '512px',
      border: '1px solid #6366f1',
      borderRadius: '50%',
    },
    navArrow: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#a855f7',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      transition: 'color 0.3s',
    },
    navArrowLeft: {
      left: '32px',
    },
    navArrowRight: {
      right: '32px',
    },
    navArrowSvg: {
      width: '48px',
      height: '48px',
    },
    mainContent: {
      position: 'relative',
      zIndex: '10',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '16px',
    },
    headerActions: {
      position: 'absolute',
      top: '32px',
      right: '32px',
      display: 'flex',
      gap: '16px',
    },
    favoriteButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: 'rgba(31, 41, 55, 0.5)',
      borderRadius: '8px',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
    addToBattleButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: '#7c3aed',
      borderRadius: '8px',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '8px',
      letterSpacing: '0.1em',
    },
    priceBadgeContainer: {
      position: 'relative',
      marginBottom: '32px',
    },
    priceBadge: {
      background: 'linear-gradient(to right, #ec4899, #8b5cf6)',
      color: 'white',
      padding: '4px 16px',
      borderRadius: '20px',
      fontSize: '18px',
      fontWeight: '600',
    },
    priceBadgeArrow: {
      position: 'absolute',
      top: '-8px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '0',
      height: '0',
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderBottom: '4px solid #ec4899',
    },
    caseImageContainer: {
      position: 'relative',
      marginBottom: '32px',
    },
    caseImage: {
      width: '320px',
      height: '240px',
      background: 'linear-gradient(135deg, #d97706, #ea580c, #d97706)',
      borderRadius: '8px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      transform: 'rotate(3deg)',
      transition: 'transform 0.3s',
      cursor: 'pointer',
      position: 'relative',
    },
    caseImageGlow: {
      position: 'absolute',
      inset: '0',
      background: 'linear-gradient(to right, transparent, white, transparent)',
      opacity: '0.2',
      borderRadius: '8px',
    },
    caseImageContent: {
      position: 'absolute',
      inset: '16px',
      background: 'linear-gradient(135deg, #fbbf24, #ea580c)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
    },
    caseImageBlur: {
      position: 'absolute',
      inset: '-16px',
      background: 'linear-gradient(to right,rgb(28, 9, 61), #ec4899, #7c3aed)',
      borderRadius: '8px',
      filter: 'blur(12px)',
      opacity: '0.3',
      zIndex: '-1',
    },
    actionText: {
      textAlign: 'center',
      marginBottom: '16px',
    },
    actionTextMain: {
      color: 'white',
      fontSize: '18px',
      marginBottom: '8px',
    },
    actionTextPoints: {
      color: '#fbbf24',
      fontWeight: 'bold',
    },
    warningContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '32px',
    },
    warningArrow: {
      width: '0',
      height: '0',
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderBottom: '8px solid #ef4444',
    },
    warningText: {
      color: '#f87171',
      fontWeight: '600',
    },
    controlsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      marginBottom: '32px',
    },
    exclusiveDropContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    exclusiveDropIcon: {
      width: '24px',
      height: '24px',
      background: '#7c3aed',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    exclusiveDropLabel: {
      color: '#d1d5db',
    },
    exclusiveDropToggle: {
      width: '48px',
      height: '24px',
      borderRadius: '20px',
      background: '#4b5563',
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.3s',
    },
    exclusiveDropToggleActive: {
      background: '#7c3aed',
    },
    exclusiveDropToggleSlider: {
      width: '20px',
      height: '20px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute',
      top: '2px',
      transition: 'transform 0.3s',
    },
    exclusiveDropToggleSliderActive: {
      transform: 'translateX(24px)',
    },
    exclusiveDropToggleSliderInactive: {
      transform: 'translateX(2px)',
    },
    multipliersContainer: {
      display: 'flex',
      gap: '8px',
    },
    multiplierButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    multiplierButtonActive: {
      background: '#7c3aed',
      color: 'white',
    },
    multiplierButtonInactive: {
      background: '#374151',
      color: '#d1d5db',
    },
    depositButton: {
      background: 'linear-gradient(to right, #10b981, #14b8a6)',
      color: 'white',
      fontWeight: 'bold',
      padding: '16px 48px',
      borderRadius: '8px',
      fontSize: '20px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    animatedDot1: {
      position: 'absolute',
      top: '80px',
      left: '160px',
      width: '8px',
      height: '8px',
      background: '#a855f7',
      borderRadius: '50%',
      animation: 'pulse 2s infinite',
    },
    animatedDot2: {
      position: 'absolute',
      bottom: '128px',
      right: '240px',
      width: '12px',
      height: '12px',
      background: '#3b82f6',
      borderRadius: '50%',
      animation: 'bounce 1s infinite',
    },
    animatedDot3: {
      position: 'absolute',
      top: '240px',
      right: '160px',
      width: '4px',
      height: '4px',
      background: '#ec4899',
      borderRadius: '50%',
      animation: 'ping 1s infinite',
    },
  };
  useEffect(() => { 
    console.log(userdata)
  }, [userdata]);

  const handleChestOpen = async () => {
    const CONTRACT_ADDRESS = contractaddress;
    const CONTRACT_ABI = [
        "function balanceOf(address account) view returns (uint256)",
        "function rollLuckyChest(address user, uint256 amount) public payable returns (uint256)",
        "event ChestRolled(address indexed user, uint256 chestId)"
    ];

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const userAddress = await signer.getAddress();
    const amount = ethers.parseEther("0.00005");

    try {
        const tx = await contract.rollLuckyChest(userAddress, amount, { value: amount });
        console.log("Transaction sent:", tx.hash);
        
        // Show wheel immediately when transaction is sent
        setShowWheel(true);
        
        const receipt = await tx.wait();
        console.log("Transaction receipt:", receipt);
        console.log("Receipt logs:", receipt.logs);

        // Method 1: Using contract.interface to parse logs
        const parsedLogs = receipt.logs.map(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                console.log("Parsed log:", parsed);
                return parsed;
            } catch (e) {
                console.log("Could not parse log:", log, "Error:", e.message);
                return null;
            }
        }).filter(log => log !== null);

        console.log("All parsed logs:", parsedLogs);

        const chestRolledEvent = parsedLogs.find(parsedLog => parsedLog.name === "ChestRolled");

        if (chestRolledEvent) {
            const chestId = chestRolledEvent.args.chestId.toString();
            console.log("Chest opened! Chest ID:", chestId);
            setTargetChestId(chestId);
            setItemDrop(chestId);
        } else {
            console.log("Chest roll event not found in parsed logs.");
            
            // Method 2: Try querying events by filter
            try {
                const filter = contract.filters.ChestRolled(userAddress);
                const events = await contract.queryFilter(filter, receipt.blockNumber, receipt.blockNumber);
                console.log("Events from queryFilter:", events);
                
                if (events.length > 0) {
                    const chestId = events[0].args.chestId.toString();
                    setTargetChestId(chestId);
                    setItemDrop(chestId);
                } else {
                    // Fallback: use a random number for demo
                    const fallbackId = Math.floor(Math.random() * 100).toString();
                    setTargetChestId(fallbackId);
                    setItemDrop(fallbackId);
                }
            } catch (filterError) {
                console.log("Could not query filter for events:", filterError);
                // Fallback: use a random number for demo
                const fallbackId = Math.floor(Math.random() * 100).toString();
                setTargetChestId(fallbackId);
                setItemDrop(fallbackId);
            }
        }

    } catch (error) {
        console.error("Transaction failed:", error);
        setShowWheel(false); // Hide wheel if transaction fails
        
        // If the transaction reverted, the error might contain the revert reason
        if (error.reason) {
            console.error("Revert reason:", error.reason);
        }
        if (error.data) {
            console.error("Error data:", error.data);
        }
    }
  };

  const handleWheelClose = () => {
    setShowWheel(false);
    setTargetChestId(null);
  };

  const handleSpinComplete = () => {
    console.log("Spin completed for chest ID:", targetChestId);
  };

  return (
    <div style={styles.container}>
      {/* Background Pattern */}
      <div style={styles.backgroundPattern}>
        <div style={styles.backgroundCircle1}></div>
        <div style={styles.backgroundCircle2}></div>
        <div style={styles.backgroundCircle3}></div>
      </div>

      <div style={styles.mainContent}>
        {/* Header Actions */}
        <div style={styles.headerActions}>
        
        </div>

        {/* Case Title */}
        <h1 style={styles.title}>Lucky chest</h1>
        
        {/* Price Badge */}
        <div style={styles.priceBadgeContainer}>
          <div style={styles.priceBadge}>
            12000 BDC or 0.00005 ETH
          </div>
          <div style={styles.priceBadgeArrow}></div>
        </div>

        {/* Case Image */}
        <div style={styles.caseImageContainer}>
          <div 
            style={styles.caseImage}
            onMouseEnter={(e) => e.target.style.transform = 'rotate(0deg)'}
            onMouseLeave={(e) => e.target.style.transform = 'rotate(3deg)'}
          >
            <div style={styles.caseImageGlow}></div>
            <div style={styles.caseImageContent}>
              <img 
                src="public/assets/hubui/chestrmbg.png" 
                alt="Chest"
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  background: 'rgba(255,255,255,0.05)'
                }}
              />
            </div>
          </div>
          <div style={styles.caseImageBlur}></div>
        </div>

        {/* Main Action Text */}
        <div style={styles.actionText}>
          <p style={styles.actionTextMain}>
            OPEN THIS CHEST AND GET YOUR LEGENDARY WEAPON
          </p>
        </div>

        {/* Controls */}
        <div style={styles.controlsContainer}>
        </div>

        {/* Deposit Button */}
        <button 
          style={styles.depositButton}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(to right, #059669, #0d9488)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(to right, #10b981, #14b8a6)';
            e.target.style.transform = 'scale(1)';
          }}
          onClick={handleChestOpen}
        >
          OPEN
        </button>

        {/* Display last item drop */}
        {itemdrop && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '8px',
            border: '1px solid #22c55e',
          }}>
            <p style={{ color: '#22c55e', fontWeight: 'bold', margin: 0 }}>
              Last Drop: Weapon ID {itemdrop}
            </p>
          </div>
        )}
      </div>

      {/* Random Wheel Modal */}
      <RandomWheel 
        isOpen={showWheel}
        onClose={handleWheelClose}
        targetNumber={targetChestId}
        onSpinComplete={handleSpinComplete}
        userdata={userdata}
      />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ItemRoll;