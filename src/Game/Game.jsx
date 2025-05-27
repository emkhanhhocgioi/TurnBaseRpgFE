import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "./GameScene";

const Game = ({ mobdata ,playerdata,userdata,onFightEnd}) => {  // ✅ Destructure props here
    const gameContainer = useRef(null);

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,  // 👈 Cho phép fallback
            width: 600,
            height: 800,
            parent: gameContainer.current,
            physics: {
                default: "arcade",
                arcade: {
                    gravity: { y: 300 },
                    debug: false,
                },
            },
            scene: [new GameScene({ mobdata, playerdata, userdata, onFightEnd })],
        };
        

        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true); // ✅ Clean up on unmount
        };
    }, [mobdata,playerdata]);

    return <div ref={gameContainer} />;
};

export default Game;
