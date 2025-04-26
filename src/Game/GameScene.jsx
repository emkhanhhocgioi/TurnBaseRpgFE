import Phaser from "phaser";
import axios from "axios";

class GameScene extends Phaser.Scene {
    constructor({ mobdata, playerdata ,userdata,onFightEnd }) {
        super({ key: "GameScene" });

        this.mobstat = mobdata.mobdata;
        this.playerStat = playerdata.player;
        this.Userdata = userdata.userdata;
        this.onFightEnd = onFightEnd; // Store the onFightEnd callback
        console.log("Mob Data:", this.mobstat);
        console.log("Player Data:", this.playerStat);
        console.log("User Data:", this.Userdata);
        this.action = null;
        this.setTurn = 0;

        this.playerSkill = {
            skillName: "Fireball",
            skillType: "Magic",
            skillDamage: 20,
            skillCooldown: 5,
            skillDescription: "A basic attack that deals damage to the enemy.",
        };
    }

    preload() {
        this.load.image("mobinfo", "public/assets/UI/mediumWoodBoard.png");
        this.load.image("bg", "public/assets/bg.jpg");
        this.load.spritesheet("sheet", "public/assets/hero.png", { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet("attackSheet", "public/assets/sprite/heroattack.png", { frameWidth: 100, frameHeight: 100 });
        this.load.image("attack", "public/assets/slkillcard/attack.png");
        this.load.spritesheet("mobSheet", "public/assets/mobs/orc.png", { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet("mobAttack", "public/assets/sprite/orcattack.png", { frameWidth: 100, frameHeight: 100 });
    }

    create() {
        this.add.image(250, 250, "bg").setOrigin(0.5);

        // Player sprite
        this.player = this.add.sprite(200, 400, "sheet").setOrigin(0.5);
        this.player.setScale(1000 / 220, 1000 / 220);

        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("sheet", { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "attack",
            frames: this.anims.generateFrameNumbers("attackSheet", { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0,
        });

        // Mob sprite
        this.mob = this.add.sprite(800, 400, "mobSheet").setOrigin(0.5);
        this.mob.setScale(1000 / 220, 1000 / 220);
        this.mob.flipX = true;

        this.anims.create({
            key: "mobidle",
            frames: this.anims.generateFrameNumbers("mobSheet", { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "mobattack",
            frames: this.anims.generateFrameNumbers("mobAttack", { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0,
        });

        this.player.play("idle");
        this.mob.play("mobidle");

        // Attack Card UI
        this.attackCard = this.add.image(500, 600, "attack").setOrigin(0.5);
        this.attackCard.setScale(30 / 200, 30 / 200);
        this.attackCard.setInteractive();
        this.attackCard.on("pointerdown", () => {
            this.action = "attack";
            this.PlayerTurn(this.action);
        });

        // Create UI
        this.createStatsUI();
        this.updateStatsUI();
    }

    createStatsUI() {
        // Mob UI Container
        this.mobinfo = this.add.container(850, 100);
        const mobInfoImage = this.add.image(0, 0, "mobinfo").setOrigin(0.5).setScale(0.5);
        this.mobinfo.add(mobInfoImage);

        const mobTextStyle = { fontSize: "20px", color: "#000", align: "center" };
        this.mobTextElements = [];

        const mobStats = 6;
        const lineSpacing = 24;
        const startY = -(mobStats * lineSpacing) / 2 + lineSpacing / 2;

        for (let i = 0; i < mobStats; i++) {
            const text = this.add.text(0, startY + i * lineSpacing, "", mobTextStyle).setOrigin(0.5);
            this.mobinfo.add(text);
            this.mobTextElements.push(text);
        }

        // Player UI Container
        this.playerinfo = this.add.container(200, 100);
        const playerInfoImage = this.add.image(0, 0, "mobinfo").setOrigin(0.5).setScale(0.5);
        this.playerinfo.add(playerInfoImage);

        const playerTextStyle = { fontSize: "20px", color: "#000", align: "center" };
        this.playerTextElements = [];

        const playerStats = 7;
        const playerStartY = -(playerStats * lineSpacing) / 2 + lineSpacing / 2;

        for (let i = 0; i < playerStats; i++) {
            const text = this.add.text(0, playerStartY + i * lineSpacing, "", playerTextStyle).setOrigin(0.5);
            this.playerinfo.add(text);
            this.playerTextElements.push(text);
        }
    }

    updateStatsUI() {
        // Update Mob Text
        const mobStatsTexts = [
            `Mob HP: ${this.mobstat.hp}`,
            `Mob DMG: ${this.mobstat.dmg}`,
            `Mob Armor: ${this.mobstat.armor}`,
            `Mob Agility: ${this.mobstat.agility}`,
            `Mob Type: ${this.mobstat.mobType}`,
            `Mob Level: ${this.mobstat.mobLevel}`
        ];
        this.mobTextElements.forEach((text, index) => {
            text.setText(mobStatsTexts[index]);
        });

        // Update Player Text
        const playerStatsTexts = [
            `Player HP: ${this.playerStat.hp}`,
            `Player MP: ${this.playerStat.mp}`,
            `Player DMG: ${this.playerStat.damage}`,
            `Player Armor: ${this.playerStat.armor}`,
            `Player Agility: ${this.playerStat.agility}`,
            `Player Class: ${this.playerStat.characterClass}`,
            `Player Level: ${this.playerStat.level}`
        ];
        this.playerTextElements.forEach((text, index) => {
            text.setText(playerStatsTexts[index]);
        });
    }

    update() {
        if (this.setTurn === 1) {
            this.MobTurn();
            this.setTurn = 0;
            this.updateStatsUI();
        }
    }

    PlayerTurn(action) {
        if (action === "attack") {
            const originalX = this.player.x;

            this.tweens.add({
                targets: this.player,
                x: this.mob.x - 100,
                duration: 500,
                ease: "Power1",
                onComplete: () => {
                    this.player.play("attack");

                    this.time.delayedCall(800, () => {
                        this.mobstat.hp -= this.playerStat.damage;
                        console.log("Mob HP:", this.mobstat.hp);
                        

                        this.tweens.add({
                            targets: this.player,
                            x: originalX,
                            duration: 500,
                            ease: "Power1",
                            onComplete: () => {
                                this.player.play("idle");
                                this.updateStatsUI();
                                this.setTurn = 1;
                            }
                        });
                    });
                }
            });
        }
    }
    showDropTokenContainer(dropTokenJson) {
        // Create a container at the center of the screen
        const container = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
    
        // Background for the container
        const background = this.add.image(0, 0, "mobinfo").setOrigin(0.5).setScale(0.6);
        container.add(background);
    
        // Text content
        const style = { fontSize: "20px", color: "#000", align: "center", wordWrap: { width: 300 } };
        
        let displayText = "";
        if (dropTokenJson.success === true) {
            displayText = `Mob đã rơi ${dropTokenJson.amount} token`;
        } else {
            displayText = "Mob không rơi token";
        }
        
        const text = this.add.text(0, 0, displayText, style).setOrigin(0.5);
        container.add(text);
    
        // Create a close button under the reward container
        const closeButton = this.add.text(0, 50, 'Close', { fontSize: '24px', fill: '#fff' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.closeDropTokenContainer(container); // Close the container and clean up the scene
            });
        container.add(closeButton);
    
        container.setDepth(10); // Bring the container to the front
    }
    
    // Method to close the drop token container and clean up the scene
    closeDropTokenContainer(container) {
        // Destroy the container and any child objects within it
        container.destroy();
    
        // Optionally, you could transition to another scene or end the game
        this.scene.stop(); // Stop the current scene
        if (this.onFightEnd) {
            this.onFightEnd(); // Notify that the fight is over
        }
    }
    
    

    async MobTurn() {
        const gamestate = {
            playerStat: this.playerStat,
            mobstat: this.mobstat,
            Userdata: this.Userdata,
        };
    
        try {
            const res = await axios.post("http://localhost:3000/api/game/mob-random-turn", { gamestate }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            switch (res.data.action) {
                case 1: // Attack
                    this.mob.play("mobattack");
                    const mobOriginalX = this.mob.x;
                    this.tweens.add({
                        targets: this.mob,
                        x: this.player.x + 100,
                        duration: 800,
                        ease: "Power1",
                        onComplete: () => {
                            this.time.delayedCall(900, () => {
                                this.playerStat.hp -= this.mobstat.dmg;
                                console.log("Player HP:", this.playerStat.hp);
    
                                if (this.playerStat.hp <= 0) {
                                    this.player.destroy();
                                    this.endGame(); // ✅ End nếu player chết
                                }
                                this.updateStatsUI();
                            });
    
                            this.tweens.add({
                                targets: this.mob,
                                x: mobOriginalX,
                                duration: 800,
                                ease: "Power1",
                                onComplete: () => {
                                    this.mob.play("mobidle");
                                }
                            });
                        }
                    });
                    break;
    
                case 2: // Heal
                    alert("Mob heal!");
                    this.mobstat.hp += 10;
                    this.updateStatsUI();
                    break;
    
                case 3: // die
                    const dropTokenJson = await res.data.resFinal.DroptokenJson;
                    this.showDropTokenContainer(dropTokenJson);
                    this.mob.destroy();
                    
                    // Trì hoãn kết thúc game sau khi thông báo đã được đóng
                   
                    break;
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    endGame() {
        if (!this.isGameOver) {
            this.isGameOver = true;
            console.log("🔥 End Game!");
            if (this.onFightEnd) {
                this.onFightEnd(); // Call the callback to notify the end of the fight
            }
        }
    }
    
}

export default GameScene;
