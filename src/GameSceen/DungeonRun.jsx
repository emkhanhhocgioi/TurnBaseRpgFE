import React, { useState, useEffect } from "react";
import axios from "axios";
import Game from "../Game/Game";
import { useLocation } from "react-router-dom";
const GRID_SIZE = 12;

const DungeonRun = () => {
  const location = useLocation();
  const { userCharacter, userdata, dlevel } = location.state;
  
  const [mobData, setMobData] = useState([]);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [diceRoll, setDiceRoll] = useState(0);
  const [moveableTiles, setMoveableTiles] = useState([]);
  const [turn, setTurn] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [isInFight, setIsInFight] = useState(false);
  const [infightMobdata, setInfightMobdata] = useState([]);
  const [gameLog, setGameLog] = useState([
    { type: "info", message: "Welcome to the dungeon! Roll the dice to begin your adventure." }
  ]);
  
  useEffect(() => {
    MobGenerate();
   
    console.log("Level:" + dlevel);
  }, []);

  useEffect(() => {
    let timer;
    if (turn === 1) {
      timer = setTimeout(() => {
        addToLog("system", "Enemy turn begins...");
        MobTurn();
        setTurn(0);
        setTurnCount(prevCount => prevCount + 1);
        addToLog("system", "Enemy turn ends. It's your turn now.");
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [turn]);

  useEffect(() => {
    const redBoxes = mobData.map((mob) => mob.index);
    if (redBoxes.includes(playerIndex)) {
      const encounterMob = mobData.find((mob) => mob.index === playerIndex);
      setInfightMobdata(encounterMob);
      setIsInFight(true);
      addToLog("combat", `⚔️ You encountered ${encounterMob.name} (Lvl ${encounterMob.level})!`);
      console.log("⚔️ Player is in fight!");
    } else {
      setIsInFight(false);
      console.log("✅ Player is not in fight.");
    }
  }, [playerIndex, mobData]);

  const addToLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setGameLog(prevLog => [
      { type, message, timestamp },
      ...prevLog.slice(0, 49) // Keep only the latest 50 logs
    ]);
  };

  const MobGenerate = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/game/generate-mob-level", {
        dlevel: dlevel,
      });
      const data = response.data.resData;
      console.log("Mobs generated:", data);
      setMobData(data);
      addToLog("system", `Generated ${data.length} enemies in the dungeon.`);
    } catch (error) {
      console.error("Error fetching mobs:", error);
      addToLog("error", "Failed to generate enemies. Please try again.");
    }
  };

  const MobTurn = async () => {
    const CurrentState = {
      MobData: mobData, 
      playerPot: playerIndex, 
    };
    console.log(CurrentState);
    try {
      const response = await axios.post("http://localhost:3000/api/game/generate-mob-event", { CurrentState: CurrentState }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = response.data;
      if (data.success) {
        console.log(data);
        setMobData(data.mobDataAfterEvent);
        addToLog("system", "Enemies have moved around the dungeon.");
      } 
    } catch (error) {
      console.error("Error fetching mobs:", error);
      addToLog("error", "Error during enemy turn. Please try again.");
    }
  };

  const RollDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceRoll(roll);
    addToLog("dice", `🎲 You rolled a ${roll}!`);
    
    const startRow = Math.floor(playerIndex / GRID_SIZE);
    const startCol = playerIndex % GRID_SIZE;
    const tiles = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const row = Math.floor(i / GRID_SIZE);
      const col = i % GRID_SIZE;
      const distance = Math.abs(row - startRow) + Math.abs(col - startCol);
      if (distance <= roll && i !== playerIndex) {
        tiles.push(i);
      }
    }
    setMoveableTiles(tiles);
    addToLog("movement", `You can move to ${tiles.length} different tiles.`);
  };
  
  const handleFightEnd = (result) => {
    // Result can include details about the fight outcome
    const defeatedMob = infightMobdata;
    const remainingMobs = mobData.filter((mob) => mob.index !== infightMobdata.index);
    setMobData(remainingMobs);
    setInfightMobdata([]);
    setIsInFight(false);
    
    // Add detailed log about the fight outcome
    addToLog("combat", `✅ Combat ended! You defeated ${defeatedMob.name} and earned ${defeatedMob.mobXp} XP.`);
  };
  
  const playerMove = (newIndex) => {
    if (moveableTiles.includes(newIndex)) {
      const oldRow = Math.floor(playerIndex / GRID_SIZE);
      const oldCol = playerIndex % GRID_SIZE;
      const newRow = Math.floor(newIndex / GRID_SIZE);
      const newCol = newIndex % GRID_SIZE;
      
      setPlayerIndex(newIndex);
      setMoveableTiles([]);
      setDiceRoll(0);
      setTurn(1);
      
      addToLog("movement", `🚶 Moved from position [${oldRow},${oldCol}] to [${newRow},${newCol}].`);
    }
  };

  const getBoxStyle = (index) => {
    const mob = mobData.find((m) => m.index === index);
    const isHovered = index === hoverIndex;
    const isPlayer = index === playerIndex;

    let backgroundColor = "#ddd";
    if (mob) {
      backgroundColor = isHovered ? "darkred" : "red";
    }
    if (isPlayer) {
      backgroundColor = "blue";
    }
    if (moveableTiles.includes(index)) {
      backgroundColor = "#90ee90"; // light green
    }

    return {
      width: "30px",
      height: "30px",
      backgroundColor,
      border: "1px solid #ccc",
      transition: "background-color 0.2s ease",
      position: "relative",
      cursor: moveableTiles.includes(index) ? "pointer" : "default",
    };
  };

  const renderTooltip = (index) => {
    if (index === playerIndex) {
      return (
        <div
          style={{
            position: "absolute",
            top: "-60px",
            left: "-20px",
            backgroundColor: "#fff",
            color: "#000",
            padding: "6px",
            border: "1px solid #333",
            borderRadius: "4px",
            fontSize: "12px",
            width: "100px",
            zIndex: 100,
            boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          🧍 You (Player)
        </div>
      );
    }

    const mob = mobData.find((m) => m.index === index);
    if (!mob) return null;

    return (
      <div
        style={{
          position: "absolute",
          top: "-120px",
          left: "-50px",
          backgroundColor: "#fff",
          color: "#000",
          padding: "6px",
          border: "1px solid #333",
          borderRadius: "4px",
          fontSize: "12px",
          width: "140px",
          zIndex: 100,
          boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <strong>{mob.name}</strong> (Lvl {mob.level})<br />
        ❤️ HP: {mob.hp}/{mob.maxHp}<br />
        ⚔️ DMG: {mob.dmg}<br />
        🛡 Armor: {mob.armor}<br />
        🌀 Agi: {mob.agility}<br />
        📦 Type: {mob.type}<br />
        ⭐ XP: {mob.xp}
      </div>
    );
  };

  // Function to get log entry style based on type
  const getLogStyle = (type) => {
    switch (type) {
      case "combat":
        return { color: "#d9534f", fontWeight: "bold" }; // Red for combat
      case "dice":
        return { color: "#0275d8", fontWeight: "bold" }; // Blue for dice
      case "movement":
        return { color: "#5cb85c", fontWeight: "bold" }; // Green for movement
      case "error":
        return { color: "#d9534f", fontWeight: "bold" }; // Bold red for errors
      default:
        return { color: "black" }; // Default color - black
    }
  };

  return (
    <div className="dungeon-container" style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "10px" }}>
      <h1 style={{ textAlign: "center", margin: "10px 0", color: "black" }}>🧱 Dungeon Adventure</h1>
      
      <div className="main-content" style={{ display: "flex", flex: 1, gap: "10px" }}>
        {/* Left Panel - Grid and Controls */}
        <div className="left-panel" style={{ width: "35%", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="controls" style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ flex: 1, textAlign: "center", padding: "5px", background: "#f5f5f5", borderRadius: "5px" }}>
              <h3 style={{ color: "black" }}>🎲 Roll: {diceRoll}</h3>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "5px", background: "#f5f5f5", borderRadius: "5px", color: turn === 0 ? "black" : "#d9534f" }}>
              <h3>Turn: {turn === 0 ? "Player" : "Enemy"}</h3>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "5px", background: "#f5f5f5", borderRadius: "5px" }}>
              <h3 style={{ color: "black" }}>📅 Turn #{turnCount}</h3>
            </div>
          </div>
          
          <div className="grid-and-controls" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${GRID_SIZE}, 30px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 30px)`,
                gap: "2px",
                border: "2px solid #333",
                background: "#f0f0f0",
                height: "fit-content",
                marginBottom: "15px"
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                <div
                  key={i}
                  style={getBoxStyle(i)}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => !isInFight && playerMove(i)}
                >
                  {hoverIndex === i && renderTooltip(i)}
                </div>
              ))}
            </div>
            
            {turn === 0 && !isInFight ? (
              <button 
                onClick={RollDice} 
                style={{ 
                  padding: "12px 30px", 
                  fontSize: "18px",
                  fontWeight: "bold",
                  backgroundColor: "#4CAF50", 
                  color: "black", 
                  border: "2px solid #2E7D32", 
                  borderRadius: "8px", 
                  cursor: "pointer",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  width: "80%",
                  margin: "0 auto"
                }}
              >
                🎲 Roll Dice
              </button>
            ) : (
              <button 
                disabled 
                style={{ 
                  padding: "12px 30px", 
                  fontSize: "18px",
                  fontWeight: "bold",
                  backgroundColor: "#cccccc", 
                  color: "#333333", 
                  border: "2px solid #999999", 
                  borderRadius: "8px", 
                  cursor: "not-allowed",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  width: "80%",
                  margin: "0 auto"
                }}
              >
                🎲 Roll Dice
              </button>
            )}
          </div>
        </div>
        
        {/* Middle Panel - Game Scene */}
        <div className="middle-panel" style={{ 
          width: "40%", 
          background: "#f8f8f8", 
          border: "1px solid #ddd", 
          borderRadius: "5px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden"
        }}>
          {isInFight ? (
            <Game 
              mobdata={{ mobdata: infightMobdata }} 
              playerdata={{ player: userCharacter }} 
              userdata={{ userdata: userdata }}  
              onFightEnd={handleFightEnd}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <h2>Explore the Dungeon</h2>
              <p>Roll the dice and move to a new position.</p>
              <p>Watch out for enemies lurking in the shadows!</p>
            </div>
          )}
        </div>
        
        {/* Right Panel - Game Log */}
        <div className="right-panel" style={{ 
          width: "25%", 
          background: "#f8f8f8", 
          border: "1px solid #ddd", 
          borderRadius: "5px",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          maxHeight: "90vh",
        }}>
          <h3 style={{ textAlign: "center", padding: "10px", margin: 0, borderBottom: "1px solid #ddd", color: "black" }}>
            📜 Adventure Log
          </h3>
          <div className="log-container" style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}>
            {gameLog.map((entry, index) => (
              <div key={index} className="log-entry" style={{ 
                padding: "5px", 
                borderBottom: "1px solid #eee",
                fontSize: "14px",
                display: "flex",
                alignItems: "flex-start",
                gap: "5px"
              }}>
                <span style={{ color: "#888", fontSize: "12px", whiteSpace: "nowrap" }}>
                  {entry.timestamp}
                </span>
                <span style={getLogStyle(entry.type)}>
                  {entry.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DungeonRun;