import Phaser from "phaser";
import axios from "axios";

class GameScene extends Phaser.Scene {
    constructor({ mobdata, playerdata, userdata, onFightEnd }) {
        super({ key: "GameScene" });

        this.mobstat = mobdata.mobdata;
        this.playerStat = playerdata;
      
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
        
        // Set game dimensions
        this.gameWidth = 600;
        this.gameHeight = 800;
    }

    preload() {
        this.load.image("mobinfo", "public/assets/UI/mediumWoodBoard.png");
        this.load.image("bg", "public/assets/bg.jpg");
        this.load.spritesheet("sheet", "public/assets/hero.png", { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet("attackSheet", "public/assets/sprite/heroattack.png", { frameWidth: 100, frameHeight: 100 });
        this.load.image("attack", "public/assets/slkillcard/attack.png",{ frameWidth: 100, frameHeight: 100 });
        this.load.image("heal","public/assets/slkillcard/healing.png",{ frameWidth: 100, frameHeight: 100 });
        this.load.image("fireball","public/assets/slkillcard/fireball.png",{ frameWidth: 100, frameHeight: 100 })
        this.load.spritesheet("mobSheet", "public/assets/mobs/orc.png", { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet("mobAttack", "public/assets/sprite/orcattack.png", { frameWidth: 100, frameHeight: 100 });
    }

    create() {
        // Center background within 600x800 screen
        this.add.image(this.gameWidth / 2, this.gameHeight / 2, "bg")
            .setDisplaySize(this.gameWidth, this.gameHeight);

        // Position player and mob closer together for smaller screen
        this.player = this.add.sprite(150, 500, "sheet").setOrigin(0.5);
        this.player.setScale(2.5); // Adjusted scale for smaller screen

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

        // Mob sprite - positioned on right side but closer
        this.mob = this.add.sprite(450, 500, "mobSheet").setOrigin(0.5);
        this.mob.setScale(2.5); // Adjusted scale for smaller screen
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

        // Attack Card UI - moved to bottom center
        this.attackCard = this.add.image(this.gameWidth / 2, this.gameHeight - 75, "attack").setOrigin(0.5);
        this.attackCard.setScale(0.09);
        this.attackCard.setInteractive();
        this.attackCard.on("pointerdown", () => {
            this.action = "attack";
            this.PlayerTurn(this.action);
        });

        // Healing Card UI 
        this.healCard = this.add.image(this.gameWidth / 3, this.gameHeight - 75, "heal").setOrigin(0.5);
        this.healCard.setScale(0.09);
        this.healCard.setInteractive();
        this.healCard.on("pointerdown", () => {
            this.action = "heal";
            this.PlayerTurn(this.action);
        });

        // FireBall Card UI - positioned close to the right of attack UI
        this.fireballCard = this.add.image(this.gameWidth / 2 + 105, this.gameHeight - 75, "fireball").setOrigin(0.5);
        this.fireballCard.setScale(0.09);
        this.fireballCard.setInteractive();
        this.fireballCard.on("pointerdown", () => {


            this.action = "fireball";
            this.PlayerTurn(this.action);
        });

        // Create UI
        this.createStatsUI();
        this.updateStatsUI();
    }

    createStatsUI() {
        // Player UI Container - top left
        this.playerinfo = this.add.container(150, 120);
        const playerInfoImage = this.add.image(0, 0, "mobinfo").setOrigin(0.5).setScale(0.4);
        this.playerinfo.add(playerInfoImage);

        const playerTextStyle = { fontSize: "16px", color: "#000", align: "center" };
        this.playerTextElements = [];

        const playerStats = 7;
        const lineSpacing = 20;
        const playerStartY = -(playerStats * lineSpacing) / 2 + lineSpacing / 2;

        for (let i = 0; i < playerStats; i++) {
            const text = this.add.text(0, playerStartY + i * lineSpacing, "", playerTextStyle).setOrigin(0.5);
            this.playerinfo.add(text);
            this.playerTextElements.push(text);
        }

        // Mob UI Container - top right
        this.mobinfo = this.add.container(450, 120);
        const mobInfoImage = this.add.image(0, 0, "mobinfo").setOrigin(0.5).setScale(0.4);
        this.mobinfo.add(mobInfoImage);

        const mobTextStyle = { fontSize: "16px", color: "#000", align: "center" };
        this.mobTextElements = [];

        const mobStats = 6;
        const startY = -(mobStats * lineSpacing) / 2 + lineSpacing / 2;

        for (let i = 0; i < mobStats; i++) {
            const text = this.add.text(0, startY + i * lineSpacing, "", mobTextStyle).setOrigin(0.5);
            this.mobinfo.add(text);
            this.mobTextElements.push(text);
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
            `Player HP: ${this.playerStat.player.hp}`,
            `Player MP: ${this.playerStat.player.mp}`,
            `Player DMG: ${this.playerStat.player.damage}`,
            `Player Armor: ${this.playerStat.player.armor}`,
            `Player Agility: ${this.playerStat.player.agility}`,
            `Player Class: ${this.playerStat.player.characterClass}`,
            `Player Level: ${this.playerStat.player.level}`
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
                x: this.mob.x - 70, // Adjusted distance for smaller screen
                duration: 400, // Slightly faster for smaller distance
                ease: "Power1",
                onComplete: () => {
                    this.player.play("attack");

                    this.time.delayedCall(800, () => {
                        this.mobstat.hp -= this.playerStat.damage;
                        console.log("Mob HP:", this.mobstat.hp);
                        
                        this.tweens.add({
                            targets: this.player,
                            x: originalX,
                            duration: 400,
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
        if (action === "heal") {
            const healAmount = 10;
            const originalHP = this.playerStat.hp;
            const maxHP = this.playerStat.maxHp || 100; // Assuming maxHp is defined, default to 100 if not

            this.playerStat.hp = Math.min(originalHP + healAmount, maxHP);
            this.playerStat.mp -= 20;
            // Display heal text above the player
            const healText = this.add.text(this.player.x, this.player.y - 50, `+${healAmount} HP`, 
            { fontSize: '20px', fill: '#22ff22' })
            .setOrigin(0.5);

            this.tweens.add({
            targets: healText,
            y: healText.y - 30,
            alpha: 0,
            duration: 1500,
            onComplete: () => healText.destroy()
            });

            this.updateStatsUI();
            this.setTurn = 1; // End player's turn
        }
        if (action === "fireball") {
            const originalX = this.player.x;

            this.tweens.add({
            targets: this.player,
            x: this.mob.x - 70, // Adjusted distance for smaller screen
            duration: 400, // Slightly faster for smaller distance
            ease: "Power1",
            onComplete: () => {
                this.player.play("attack");

                this.time.delayedCall(800, () => {
                const fireballDamage = this.playerStat.damage * 1.2; // 1.2x player damage
                this.mobstat.hp -= fireballDamage;
                this.playerStat.player.mp -= 30; // Reduce player MP by 10
                console.log("Mob HP:", this.mobstat.hp);
                console.log("Player MP:", this.playerStat.player.mp);

                this.tweens.add({
                    targets: this.player,
                    x: originalX,
                    duration: 400,
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

    showDropTokenContainer(dropTokenJson, itemjson) {
        // Create a container at the center of the screen
        const container = this.add.container(this.gameWidth / 2, this.gameHeight / 2);
    
        // Background for the container
        const background = this.add.image(0, 0, "mobinfo").setOrigin(0.5).setScale(0.5);
        container.add(background);
    
        // Text content
        const style = { fontSize: "18px", color: "#000", align: "center", wordWrap: { width: 250 } };
        
        let displayText = "";
        if (dropTokenJson.success === true) {
            displayText = `Mob đã rơi ${dropTokenJson.amount} token và ${itemjson.name}`;
        } else {
            displayText = "Mob không rơi token";
        }
        
        const text = this.add.text(0, 0, displayText, style).setOrigin(0.5);
        container.add(text);
    
        // Create a close button under the reward container
        const closeButton = this.add.text(0, 40, 'Close', { fontSize: '22px', fill: '#fff' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.closeDropTokenContainer(container); // Close the container and clean up the scene
            });
        container.add(closeButton);
    
        container.setDepth(10); // Bring the container to the front
    }
    
  
    closeDropTokenContainer(container) {
    
        container.destroy();
    
    
        this.scene.stop();
        if (this.onFightEnd) {
            this.onFightEnd(); 
        }
    }
    
    createLoadingContainer() {
        const container = this.add.container(this.gameWidth / 2, this.gameHeight / 2);
    
        const background = this.add.image(0, 0, "mobinfo").setOrigin(0.5).setScale(0.5);
        container.add(background);
    
        const loadingText = this.add.text(0, 0, "Đang thống kê dữ liệu...", {
            fontSize: "20px",
            color: "#000",
            align: "center",
            wordWrap: { width: 250 },
        }).setOrigin(0.5);
        container.add(loadingText);
    
        container.setDepth(11); // Để nổi hơn tất cả UI khác
    
        return container; // Trả về để tí nữa còn destroy
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
                        x: this.player.x + 70, // Adjusted distance for smaller screen
                        duration: 600,
                        ease: "Power1",
                        onComplete: () => {
                            this.time.delayedCall(700, () => {
                                this.playerStat.hp -= this.mobstat.dmg;
                                console.log("Player HP:", this.playerStat.hp);
                                this.playerStat.mp += 10;
                                if (this.playerStat.hp <= 0) {
                                    this.player.destroy();
                                    this.endGame(); // End if player dies
                                }
                                this.updateStatsUI();
                            });
    
                            this.tweens.add({
                                targets: this.mob,
                                x: mobOriginalX,
                                duration: 600,
                                ease: "Power1",
                                onComplete: () => {
                                    this.mob.play("mobidle");
                                }
                            });
                        }
                    });
                    break;
    
                case 2: // Heal
                    // Using a text notification instead of alert for better UX on small screen
                    const healText = this.add.text(this.mob.x, this.mob.y - 50, "Heal +10", 
                        { fontSize: '20px', fill: '#22ff22' })
                        .setOrigin(0.5);
                    
                    this.tweens.add({
                        targets: healText,
                        y: healText.y - 30,
                        alpha: 0,
                        duration: 1500,
                        onComplete: () => healText.destroy()
                    });
                    
                    this.mobstat.hp += 30;
                    this.playerStat.mp += 10;
                    this.updateStatsUI();
                    break;
    
                case 3: // die
                    const loadingContainer = this.createLoadingContainer();
                    
                    const dropTokenJson = await res.data.resFinal.DroptokenJson;
                    const itemjson = await res.data.resFinal.item;

                    // Giả lập 2 giây delay để "thống kê dữ liệu"
                    this.time.delayedCall(2000, () => {
                        loadingContainer.destroy(); // Xóa container loading
                        this.showDropTokenContainer(dropTokenJson, itemjson); // Show container phần thưởng
                        this.mob.destroy();
                    });
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