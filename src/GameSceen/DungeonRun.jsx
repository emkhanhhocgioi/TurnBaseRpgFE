import React, { useState, useEffect } from "react";
import axios from "axios";
import Game from "../Game/Game";
import { useLocation } from "react-router-dom";
const GRID_SIZE = 12;

const DungeonRun = () => {
  const location = useLocation();
  const { userCharacter ,userdata} = location.state;  // Destructure userCharacter correctly
  
  const [mobData, setMobData] = useState([]); // lưu mảng các mob
  const [hoverIndex, setHoverIndex] = useState(null); // index đang hover
  const [playerIndex, setPlayerIndex] = useState(0); // vị trí người chơi
  const [diceRoll, setDiceRoll] = useState(0); // giá trị xúc xắc
  const [moveableTiles, setMoveableTiles] = useState([]);
  const [turn, setTurn] = useState(0); // lượt chơi
  const [turnCount,setTurnCount] = useState(0); // số lần lượt chơi đã qua
  const [isInFight, setIsInFight] = useState(false); // trạng thái có đang trong trận đấu hay không
  const [infightMobdata,setInfightMobdata] = useState([]); // dữ liệu mob trong trận đấu
  
  useEffect(() => {
    MobGenerate();
    console.log(userCharacter);  // Make sure userCharacter is logged
 
  }, []);

  useEffect(() => {
    let timer;
    if (turn === 1) {
      timer = setTimeout(() => {
        MobTurn();
        setTurn(0); // chuyển lượt về người chơi
      }, 0); // 2 giây delay
    }
    return () => clearTimeout(timer);
  }, [turn]);

  useEffect(() => {
    const redBoxes = mobData.map((mob) => mob.index);
    if (redBoxes.includes(playerIndex)) {
      setInfightMobdata(mobData.find((mob) => mob.index === playerIndex));
      setIsInFight(true);
      console.log("⚔️ Player is in fight!");
    } else {
      setIsInFight(false);
      console.log("✅ Player is not in fight.");
    }
  }, [playerIndex, mobData]);

  const MobGenerate = async () => {
    const dlevel = 1;
    try {
      const response = await axios.post("http://localhost:3000/api/game/generate-mob-level", {
        dlevel: dlevel,
      });
      const data = response.data.resData;
      console.log("Mobs generated:", data);
      setMobData(data);
    } catch (error) {
      console.error("Error fetching mobs:", error);
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
      } 
    } catch (error) {
      console.error("Error fetching mobs:", error);
    }
  };

  const RollDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceRoll(roll);
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
  };
  const handleFightEnd = () => {
    // Filter out the mob from mobData and infightMobdata
    const remainingMobs = mobData.filter((mob) => mob.index !== infightMobdata.index);
    setMobData(remainingMobs); // Update mobData to exclude the mob being fought
    setInfightMobdata([]); // Clear the infightMobdata since the fight ended
    setIsInFight(false); // Set the fight status to false
  };
  

  const playerMove = (newIndex) => {
    if (moveableTiles.includes(newIndex)) {
      setPlayerIndex(newIndex);
      setMoveableTiles([]); // reset sau khi di chuyển
      setDiceRoll(0); // reset xúc xắc
      setTurn(1); // chuyển lượt cho bot **chỉ khi di chuyển hợp lệ**
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
      cursor: mob || isPlayer ? "pointer" : "default",
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

  return (
    <div className="container" style={{ backgroundColor: "", padding: "20px", display: "flex", width: "100%", height: "100vh", justifyContent: "center", alignItems: "center" }}>
      {!isInFight ? (
        <div className="container1" style={{ padding: "20px", textAlign: "center" }}>
          <h1>🧱 Dungeon Grid</h1>
          <h3>🎲 Rolled: {diceRoll}</h3>
          <h3 style={{ color: turn === 0 ? "blue" : "red" }}>
            🧍 Turn: {turn === 0 ? "Player" : "Bot"}
          </h3>
          <button onClick={() => console.log(mobData)}>🔁 Regenerate Mobs</button>
          {turn === 0 ? (
            <button onClick={RollDice}>🔁 Roll Dice To Move</button>
          ) : (
            <button disabled>🔁 Roll Dice To Move</button>
          )}
          <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${GRID_SIZE}, 30px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 30px)`,
                gap: "2px",
                border: "2px solid #333",
                background: "#f0f0f0",
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                <div
                  key={i}
                  style={getBoxStyle(i)}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => playerMove(i)}
                >
                  {hoverIndex === i && renderTooltip(i)}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="container1" style={{ padding: "20px", textAlign: "center", opacity: 0.5, pointerEvents: "none" }}>
          <h1>🧱 Dungeon Grid</h1>
          <h3>🎲 Rolled: {diceRoll}</h3>
          <h3 style={{ color: turn === 0 ? "blue" : "red" }}>
            🧍 Turn: {turn === 0 ? "Player" : "Bot"}
          </h3>
          <button disabled>🔁 Regenerate Mobs</button>
          <button disabled>🔁 Roll Dice To Move</button>
          <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${GRID_SIZE}, 30px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 30px)`,
                gap: "2px",
                border: "2px solid #333",
                background: "#f0f0f0",
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                <div
                  key={i}
                  style={getBoxStyle(i)}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => playerMove(i)}
                >
                  {hoverIndex === i && renderTooltip(i)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container2" style={{ background: "white", width: "80%", height: "100vh" }}>
        <div className="gameScene">
          {isInFight && (
            <Game mobdata={{ mobdata: infightMobdata }} playerdata={{ player: userCharacter }} userdata = {{userdata:userdata}}  onFightEnd={handleFightEnd}/>
          )}
        </div>
      </div>
    </div>
  );
};

export default DungeonRun;
