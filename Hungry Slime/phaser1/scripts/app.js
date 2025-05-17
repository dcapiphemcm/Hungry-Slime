class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        this.load.image('menuBackground', '../phaser1/assets/image/slime.jpg');
    }

    create() {
        // Background
        this.add.image(960, 540, 'menuBackground').setDisplaySize(1920, 1080);

        // Title
        this.add.text(960, 350, 'Hungry Slime', {
            fontSize: '96px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Play Button
        this.add.text(960, 540, 'Play', {
            fontSize: '64px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setInteractive()
          .on('pointerdown', () => this.scene.start('MainGame'))
          .on('pointerover', function () { this.setStyle({ fill: '#ff0000' }); })
          .on('pointerout', function () { this.setStyle({ fill: '#ffffff' }); });

        // Exit Button
        this.add.text(960, 640, 'Exit', {
            fontSize: '64px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setInteractive()
          .on('pointerdown', () => {
              this.add.text(960, 700, 'Exiting...', {
                  fontSize: '48px',
                  fill: '#ff0000'
              }).setOrigin(0.5);

              if (window.confirm("Are you sure you want to exit the game?")) {
                  window.open('', '_self');
                  window.close();
              }
          })
          .on('pointerover', function () { this.setStyle({ fill: '#ff0000' }); })
          .on('pointerout', function () { this.setStyle({ fill: '#ffffff' }); });
    }
}

class MainGame extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGame' });

        this.score = 0;
        this.gameOver = false;
        this.bombActive = true;
        this.currentRound = 1;
        this.starsCollected = 0;
        this.totalStarsCollected = 0;
        this.stretchTime = 0;
    }

    preload() {
        this.load.image("sky", "../phaser1/assets/image/sky.png");
        this.load.image("blue", "../phaser1/assets/image/blue.jpg");
        this.load.image("green", "../phaser1/assets/image/green.jpg");
        this.load.image("red", "../phaser1/assets/image/red.jpg");
        this.load.image("ground", "../phaser1/assets/image/platform.png");
        this.load.image("platform2", "../phaser1/assets/image/platform2.png");
        this.load.image("platform3", "../phaser1/assets/image/platform3.png");
        this.load.image("star", "../phaser1/assets/image/star.png");
        this.load.image("bomb", "../phaser1/assets/image/bomb.png");
        this.load.image("dude", "../phaser1/assets/image/dude.png");
    }

    create() {
        this.score = 0;
        this.gameOver = false;
        this.bombActive = true;
        this.currentRound = 1;
        this.starsCollected = 0;
        this.totalStarsCollected = 0;
        this.stretchTime = 0;

        this.backgroundImage = this.add.image(960, 540, 'sky');

        this.platforms = this.physics.add.staticGroup();
        this.createLevel1();

        this.player = this.physics.add.sprite(960, 500, 'dude');
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.stars = this.physics.add.group();
        this.bombs = this.physics.add.group();

        this.spawnStars();

        this.scoreText = this.add.text(16, 16, 'Apple: 0', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setDepth(10);

        this.winText = this.add.text(960, 400, 'You Win!', {
            fontSize: '96px',
            fill: '#23b000',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setVisible(false).setDepth(10);

        this.gameOverText = this.add.text(960, 400, 'Game Over', {
            fontSize: '96px',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setVisible(false).setDepth(10);

        this.restartButton = this.add.text(960, 520, 'Restart', {
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setInteractive()
          .on('pointerdown', () => this.restartGame())
          .on('pointerover', () => this.restartButton.setStyle({ fill: '#ff0000' }))
          .on('pointerout', () => this.restartButton.setStyle({ fill: '#ffffff' }))
          .setVisible(false).setDepth(10);

        this.backToMenuButton = this.add.text(960, 600, 'Back to Menu', {
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setInteractive()
          .on('pointerdown', () => this.scene.start('MainMenu'))
          .on('pointerover', () => this.backToMenuButton.setStyle({ fill: '#ff0000' }))
          .on('pointerout', () => this.backToMenuButton.setStyle({ fill: '#ffffff' }))
          .setVisible(false).setDepth(10);

        this.setupColliders();
    }

    setupColliders() {
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    }

    update() {
        if (this.gameOver) return;

        let moving = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-800);
            this.player.flipX = true;
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(800);
            this.player.flipX = false;
            moving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-1100);
        }

        if (moving) {
            this.stretchTime += stretchSpeed;
            this.player.scaleY = 1 + Math.sin(this.stretchTime) * stretchAmplitude;
            this.player.scaleX = 1 - Math.sin(this.stretchTime) * stretchAmplitude * 0.7;
        } else {
            this.player.scaleX = 1;
            this.player.scaleY = 1;
            this.stretchTime = 0;
        }

        if (this.bombActive) {
            this.bombs.getChildren().forEach(bomb => {
                const minVelX = 150;

                if (Math.abs(bomb.body.velocity.x) < minVelX) {
                    let newVelX = bomb.body.velocity.x === 0 ? (Phaser.Math.Between(0, 1) === 0 ? -minVelX : minVelX)
                                                             : (bomb.body.velocity.x > 0 ? minVelX : -minVelX);
                    bomb.setVelocityX(newVelX);
                }

                if (bomb.body.velocity.y === 0) {
                    bomb.setVelocityY(Phaser.Math.Between(150, 200));
                }

                bomb.rotation += 0.1;
            });
        }
    }

    spawnStars() {
        if (this.gameOver) return;

        const minDistance = 200;
        let attempts = 0;
        let spawned = 0;
        let positions = [];

        while (spawned < starBatchSize && attempts < 100) {
            let x = Phaser.Math.Between(100, 1800);
            let tooClose = positions.some(px => Math.abs(x - px) < minDistance);

            if (!tooClose) {
                let star = this.stars.create(x, 0, 'star');
                star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
                positions.push(x);
                spawned++;
            }

            attempts++;
        }
    }

    collectStar(player, star) {
        if (this.gameOver) return;

        star.disableBody(true, true);

        this.score++;
        this.starsCollected++;
        this.totalStarsCollected++;
        this.scoreText.setText('Apple: ' + this.score);

        if (this.starsCollected >= requiredStarsToAdvance) {
            this.bombActive = false;
            this.bombs.clear(true, true);
            this.nextRound();
        } else if (this.starsCollected % starBatchSize === 0) {
            if (this.bombActive) this.spawnBomb();
            this.spawnStars();
        }
    }

    spawnBomb() {
        let x = Phaser.Math.Between(100, 1820);
        let y = Phaser.Math.Between(50, 200);
        let bomb = this.bombs.create(x, y, 'bomb');
        bomb.setScale(0.5);
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-300, 300), Phaser.Math.Between(100, 200));
        bomb.setGravityY(300);
    }

    hitBomb(player, bomb) {
        this.physics.pause();
        player.setTint(0xff0000);
        this.gameOver = true;
        this.gameOverText.setVisible(true);
        this.restartButton.setVisible(true);
        this.backToMenuButton.setVisible(true);
    }

    restartGame() {
        this.gameOver = false;
        this.score = 0;
        this.starsCollected = 0;
        this.totalStarsCollected = 0;
        this.currentRound = 1;
        this.bombActive = true;
        this.scoreText.setText('Apple: 0');

        this.player.setTint(0xffffff);
        this.player.setPosition(960, 500);
        this.player.setVelocity(0);
        this.physics.resume();

        this.restartButton.setVisible(false);
        this.backToMenuButton.setVisible(false);
        this.winText.setVisible(false);
        this.gameOverText.setVisible(false);

        this.bombs.clear(true, true);
        this.stars.clear(true, true);
        this.platforms.clear(true, true);

        this.backgroundImage.setTexture('sky');
        this.createLevel1();

        this.spawnStars();

        this.setupColliders();
    }

    nextRound() {
        this.currentRound++;
        this.starsCollected = 0;
        this.bombActive = true;

        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.bombs.clear(true, true);
            this.stars.clear(true, true);
            this.platforms.clear(true, true);
            this.platforms = this.physics.add.staticGroup();

            this.player.setPosition(960, 500);
            this.player.setVelocity(0);
            this.player.setTint(0xffffff);
            this.physics.resume();

            if (this.currentRound === 2) {
                this.backgroundImage.setTexture('blue');
                this.createLevel2();
            } else if (this.currentRound === 3) {
                this.backgroundImage.setTexture('red');
                this.createLevel3();
            } else {
                // Level 3 complete: show win screen
                this.physics.pause();
                this.gameOver = true;
                this.bombActive = false;

                this.scoreText.setText('You win! Total Apples: ' + this.totalStarsCollected);
                this.winText.setVisible(true);

                // Show only the "Back to Menu" button, hide Restart button
                this.restartButton.setVisible(false);
                this.backToMenuButton.setVisible(true);

                // Fade in win screen for smoothness
                this.cameras.main.fadeIn(1000, 0, 0, 0);

                return;
            }

            this.spawnStars();
            this.setupColliders();

            this.cameras.main.fadeIn(1000, 0, 0, 0);
        });
    }

    createLevel1() {
        this.platforms.create(950, 1020, 'ground').setScale(4, 1).refreshBody();
        this.platforms.create(240, 800, 'ground');
        this.platforms.create(1700, 800, 'ground');
        this.platforms.create(975, 600, 'ground');
        this.platforms.create(240, 400, 'ground');
        this.platforms.create(1700, 400, 'ground');
    }

    createLevel2() {
        this.platforms.create(960, 1020, 'platform2').setScale(4, 1).refreshBody();
        this.platforms.create(960, 800, 'platform2');
        this.platforms.create(480, 600, 'platform2');
        this.platforms.create(1440, 600, 'platform2');
    }

    createLevel3() {
        this.platforms.create(960, 1020, 'platform3').setScale(4, 1).refreshBody();
        this.platforms.create(720, 800, 'platform3');
        this.platforms.create(1200, 800, 'platform3');
        this.platforms.create(480, 600, 'platform3');
        this.platforms.create(1440, 600, 'platform3');
    }
}

var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1500 },
            debug: false
        }
    },
    scene: [MainMenu, MainGame]
};

var starBatchSize = 5;
var requiredStarsToAdvance = 20;

var stretchAmplitude = 0.1;
var stretchSpeed = 0.2;

var game = new Phaser.Game(config);
