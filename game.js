// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

// Sound Manager Class
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * this.masterVolume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playShoot(isPowerUp = false) {
        if (isPowerUp) {
            // Power-up shoot sound - higher pitch, more powerful
            this.playTone(800, 0.1, 'square', 0.4);
            this.playTone(1000, 0.1, 'square', 0.3);
        } else {
            // Normal shoot sound
            this.playTone(600, 0.08, 'square', 0.3);
        }
    }

    playEnemyShoot() {
        // Lower pitch for enemy shots
        this.playTone(300, 0.1, 'sawtooth', 0.2);
    }

    playExplosion() {
        // Explosion sound - noise-like with multiple frequencies
        const frequencies = [100, 150, 200, 80];
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.15, 'sawtooth', 0.25 / (i + 1));
            }, i * 20);
        });
    }

    playPowerUp() {
        // Power-up activation sound - ascending tones
        const tones = [400, 600, 800, 1000];
        tones.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', 0.3);
            }, i * 100);
        });
    }

    playGameOver() {
        // Game over sound - descending sad tones
        const tones = [400, 350, 300, 250];
        tones.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.3, 'sine', 0.4);
            }, i * 150);
        });
    }
}

// Create global sound manager
const soundManager = new SoundManager();

// Bullet Class
class Bullet {
    constructor(x, y, speed, isPlayerBullet = true, damage = 1) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = speed;
        this.isPlayerBullet = isPlayerBullet;
        this.damage = damage;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        if (this.isPlayerBullet && this.damage > 1) {
            // Power-up bullets are larger and brighter
            ctx.fillStyle = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            ctx.fillRect(this.x - 1, this.y, this.width + 2, this.height);
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = this.isPlayerBullet ? '#00ff00' : '#ff0000';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
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
        this.powerUpActive = false;
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
        const damage = this.powerUpActive ? 3 : 1; // Power-up bullets do 3x damage
        this.bullets.push(new Bullet(
            this.x + this.width / 2 - 2,
            this.y,
            -8,
            true,
            damage
        ));
        // Play shoot sound
        soundManager.playShoot(this.powerUpActive);
    }

    draw() {
        // Draw player ship (triangle shape)
        if (this.powerUpActive) {
            // Power-up glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffff';
            ctx.fillStyle = '#00ffff';
        } else {
            ctx.fillStyle = '#00ff00';
            ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

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

// Explosion Class
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.lifetime = 20;
        this.age = 0;
        
        // Create particles
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                color: `hsl(${Math.random() * 60 + 10}, 100%, ${50 + Math.random() * 50}%)`
            });
        }
    }

    update() {
        this.age++;
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // Gravity
            particle.size *= 0.95; // Shrink
        });
    }

    draw() {
        const alpha = 1 - (this.age / this.lifetime);
        this.particles.forEach(particle => {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    isFinished() {
        return this.age >= this.lifetime;
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
        this.health = 1;
        this.maxHealth = 1;
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
        this.explosions = [];
        this.score = 0;
        this.keys = {};
        this.enemyShootTimer = 0;
        this.enemyShootInterval = 60;
        this.powerUpActivated = false;
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
        this.explosions = [];
        this.powerUpActivated = false;
        this.initEnemies();
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('score').textContent = '0';
        this.gameLoop();
    }

    gameOver() {
        this.state = GAME_STATE.GAME_OVER;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        // Play game over sound
        soundManager.playGameOver();
    }

    checkCollisions() {
        // Check for power-up activation
        if (this.score > 100 && !this.powerUpActivated) {
            this.powerUpActivated = true;
            this.player.powerUpActive = true;
            // Play power-up sound
            soundManager.playPowerUp();
        }

        // Player bullets hitting enemies
        this.player.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy.getHitBox())) {
                    // Apply damage
                    enemy.health -= bullet.damage;
                    
                    // Remove bullet
                    this.player.bullets.splice(bulletIndex, 1);
                    
                    // If enemy is destroyed
                    if (enemy.health <= 0) {
                        // Create explosion at enemy position
                        this.explosions.push(new Explosion(
                            enemy.x + enemy.width / 2,
                            enemy.y + enemy.height / 2
                        ));
                        
                        // Play explosion sound
                        soundManager.playExplosion();
                        
                        // Remove enemy
                        this.enemies.splice(enemyIndex, 1);
                        this.score += 10;
                        document.getElementById('score').textContent = this.score;
                    }
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
            // Play enemy shoot sound
            soundManager.playEnemyShoot();
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

        // Update explosions
        this.explosions.forEach((explosion, index) => {
            explosion.update();
            if (explosion.isFinished()) {
                this.explosions.splice(index, 1);
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

            // Draw explosions
            this.explosions.forEach(explosion => explosion.draw());
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

