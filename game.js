// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

// Bullet Class
class Bullet {
    constructor(x, y, speed, isPlayerBullet = true) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = speed;
        this.isPlayerBullet = isPlayerBullet;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = this.isPlayerBullet ? '#00ff00' : '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.y < 0 || this.y > canvas.height;
    }
}

// Player Class
class Player {
    constructor() {
        this.width = 50;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = 5;
        this.bullets = [];
        this.shootCooldown = 0;
        this.maxCooldown = 15;
    }

    update(keys) {
        // Movement
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }

        // Shooting
        if (keys[' '] && this.shootCooldown === 0) {
            this.shoot();
            this.shootCooldown = this.maxCooldown;
        }

        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        // Update bullets
        this.bullets.forEach((bullet, index) => {
            bullet.update();
            if (bullet.isOffScreen()) {
                this.bullets.splice(index, 1);
            }
        });
    }

    shoot() {
        this.bullets.push(new Bullet(
            this.x + this.width / 2 - 2,
            this.y,
            -8,
            true
        ));
    }

    draw() {
        // Draw player ship (triangle shape)
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw());
    }

    getHitBox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, row) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.row = row;
        this.speed = 1;
        this.direction = 1; // 1 for right, -1 for left
    }

    update() {
        this.x += this.speed * this.direction;
    }

    draw() {
        // Draw enemy invader (simple rectangle with pattern)
        ctx.fillStyle = this.row < 2 ? '#ff0000' : this.row < 4 ? '#ff8800' : '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 8, this.y + 8, 8, 8);
        ctx.fillRect(this.x + 24, this.y + 8, 8, 8);
    }

    getHitBox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    shiftDown() {
        this.y += 20;
        this.direction *= -1;
    }
}

// Game Class
class Game {
    constructor() {
        this.state = GAME_STATE.START;
        this.player = new Player();
        this.enemies = [];
        this.enemyBullets = [];
        this.score = 0;
        this.keys = {};
        this.enemyShootTimer = 0;
        this.enemyShootInterval = 60;
        this.setupEventListeners();
        this.initEnemies();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (this.state === GAME_STATE.PLAYING) {
                // Prevent default behavior for game controls to avoid page scrolling
                if (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Start button
        document.getElementById('startButton').addEventListener('click', () => {
            this.start();
        });

        // Restart button
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restart();
        });
    }

    initEnemies() {
        this.enemies = [];
        const rows = 5;
        const cols = 10;
        const startX = 100;
        const startY = 50;
        const spacingX = 60;
        const spacingY = 50;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.enemies.push(new Enemy(
                    startX + col * spacingX,
                    startY + row * spacingY,
                    row
                ));
            }
        }
    }

    start() {
        this.state = GAME_STATE.PLAYING;
        document.getElementById('startScreen').classList.add('hidden');
        this.gameLoop();
    }

    restart() {
        this.state = GAME_STATE.PLAYING;
        this.score = 0;
        this.player = new Player();
        this.enemyBullets = [];
        this.initEnemies();
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('score').textContent = '0';
        this.gameLoop();
    }

    gameOver() {
        this.state = GAME_STATE.GAME_OVER;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }

    checkCollisions() {
        // Player bullets hitting enemies
        this.player.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy.getHitBox())) {
                    // Remove bullet and enemy
                    this.player.bullets.splice(bulletIndex, 1);
                    this.enemies.splice(enemyIndex, 1);
                    this.score += 10;
                    document.getElementById('score').textContent = this.score;
                }
            });
        });

        // Enemy bullets hitting player
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (this.isColliding(bullet, this.player.getHitBox())) {
                this.gameOver();
            }
        });
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    updateEnemyMovement() {
        let shouldShiftDown = false;
        let rightmostX = 0;
        let leftmostX = canvas.width;

        this.enemies.forEach(enemy => {
            if (enemy.x + enemy.width > rightmostX) {
                rightmostX = enemy.x + enemy.width;
            }
            if (enemy.x < leftmostX) {
                leftmostX = enemy.x;
            }
        });

        if (rightmostX >= canvas.width || leftmostX <= 0) {
            shouldShiftDown = true;
        }

        if (shouldShiftDown) {
            this.enemies.forEach(enemy => enemy.shiftDown());
        }
    }

    enemyShoot() {
        if (this.enemies.length === 0) return;

        this.enemyShootTimer++;
        if (this.enemyShootTimer >= this.enemyShootInterval) {
            this.enemyShootTimer = 0;
            
            // Random enemy shoots
            const randomEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
            this.enemyBullets.push(new Bullet(
                randomEnemy.x + randomEnemy.width / 2 - 2,
                randomEnemy.y + randomEnemy.height,
                4,
                false
            ));
        }
    }

    update() {
        if (this.state !== GAME_STATE.PLAYING) return;

        // Update player
        this.player.update(this.keys);

        // Update enemies
        this.enemies.forEach(enemy => enemy.update());
        this.updateEnemyMovement();

        // Enemy shooting
        this.enemyShoot();

        // Update enemy bullets
        this.enemyBullets.forEach((bullet, index) => {
            bullet.update();
            if (bullet.isOffScreen()) {
                this.enemyBullets.splice(index, 1);
            }
        });

        // Check collisions
        this.checkCollisions();

        // Check game over conditions
        if (this.enemies.length === 0) {
            // All enemies defeated - restart with more enemies
            this.initEnemies();
        }

        // Check if enemies reached bottom
        this.enemies.forEach(enemy => {
            if (enemy.y + enemy.height >= this.player.y) {
                this.gameOver();
            }
        });
    }

    draw() {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars background
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % canvas.width;
            const y = (i * 53) % canvas.height;
            ctx.fillRect(x, y, 1, 1);
        }

        if (this.state === GAME_STATE.PLAYING) {
            // Draw player
            this.player.draw();

            // Draw enemies
            this.enemies.forEach(enemy => enemy.draw());

            // Draw enemy bullets
            this.enemyBullets.forEach(bullet => bullet.draw());
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        
        if (this.state === GAME_STATE.PLAYING) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Initialize game
const game = new Game();
game.draw(); // Draw initial state

