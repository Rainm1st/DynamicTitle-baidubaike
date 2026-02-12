// ========== 1. 梅花飘落效果 (保持不变) ==========
class PlumBlossom {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.blossoms = [];
        this.resize();
        this.init();
        window.addEventListener('resize', () => this.resize());
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    init() {
        for (let i = 0; i < 50; i++) {
            this.blossoms.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 2,
                speedY: Math.random() * 1 + 0.5,
                speedX: Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
        this.animate();
    }
    drawBlossom(blossom) {
        const { x, y, radius, opacity } = blossom;
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.globalAlpha = opacity;
        for (let i = 0; i < 5; i++) {
            this.ctx.save();
            this.ctx.rotate((Math.PI * 2 * i) / 5);
            this.ctx.beginPath();
            this.ctx.ellipse(0, -radius, radius * 0.6, radius * 1.2, 0, 0, Math.PI * 2);
            this.ctx.fillStyle = '#d4af37';
            this.ctx.fill();
            this.ctx.restore();
        }
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.restore();
    }
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.blossoms.forEach(blossom => {
            blossom.y += blossom.speedY;
            blossom.x += blossom.speedX;
            if (blossom.y > this.canvas.height) {
                blossom.y = -10;
                blossom.x = Math.random() * this.canvas.width;
            }
            if (blossom.x > this.canvas.width) blossom.x = 0;
            else if (blossom.x < 0) blossom.x = this.canvas.width;
            this.drawBlossom(blossom);
        });
        requestAnimationFrame(() => this.animate());
    }
}
const canvas = document.getElementById('plumBlossomCanvas');
if (canvas) new PlumBlossom(canvas);

// ========== 2. 粒子特效 (用于收下祝福时的庆祝) ==========
const particleCanvas = document.createElement('canvas');
particleCanvas.id = 'particleCanvas';
particleCanvas.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 9999;
`;
document.body.appendChild(particleCanvas);
const pCtx = particleCanvas.getContext('2d');
let particles = [];

function resizeParticleCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeParticleCanvas);
resizeParticleCanvas();

class Particle {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.size = Math.random() * 8 + 2;
        this.speedX = Math.random() * 6 - 3; // 速度快一点
        this.speedY = Math.random() * 6 - 3;
        const colors = ['#d4af37', '#c8102e', '#f5f5dc', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = 1.0;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02;
        this.size *= 0.95;
    }
    draw() {
        pCtx.fillStyle = this.color;
        pCtx.globalAlpha = this.life;
        pCtx.beginPath();
        pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.globalAlpha = 1.0;
    }
}

function animateParticles() {
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// 触发烟花爆炸函数
function explodeParticles(x, y, count = 30) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y));
    }
}

// ========== 3. 互动菜单逻辑 (切换页面) ==========
const gameMenu = document.getElementById('gameMenu');
const cardCustoms = document.getElementById('cardCustoms');
const customsArea = document.getElementById('customsArea');
const backToMenuBtn = document.getElementById('backToMenu');

// 切换到习俗科普
if (cardCustoms && customsArea) {
    cardCustoms.addEventListener('click', () => {
        gameMenu.classList.add('hidden');
        customsArea.classList.remove('hidden');
    });
}
// 返回菜单
if (backToMenuBtn) {
    backToMenuBtn.addEventListener('click', () => {
        customsArea.classList.add('hidden');
        gameMenu.classList.remove('hidden');
    });
}

// ========== 4. 抽签逻辑 (修复版) ==========
const cardFortune = document.getElementById('cardFortune');
const fortuneModal = document.getElementById('fortuneModal');
const closeModal = document.querySelector('.close-modal');
const drawBtn = document.getElementById('drawBtn');
const fortuneResult = document.getElementById('fortuneResult');
const fortuneDesc = document.getElementById('fortuneDesc');

const fortunes = [
    { title: "大吉", desc: "诸事顺遂，元宵甜甜，生活美满！" },
    { title: "暴富", desc: "财源滚滚来，就像煮开的元宵一个个浮起来！" },
    { title: "桃花", desc: "人缘爆棚，也许会遇到那个陪你吃元宵的人哦。" },
    { title: "健康", desc: "身体倍儿棒，吃嘛嘛香，一口气能吃十个！" },
    { title: "上岸", desc: "逢考必过，努力都有回报，前程似锦！" },
    { title: "平安", desc: "岁岁平安，最简单的幸福就是家人闲坐，灯火可亲。" }
];

let currentFortuneState = 'ready'; // ready, drawing, drawn

// 打开弹窗
if (cardFortune) {
    cardFortune.addEventListener('click', () => {
        resetFortuneUI();
        fortuneModal.classList.remove('closing'); // 移除可能的关闭动画类
        fortuneModal.classList.add('active');
    });
}

// 关闭弹窗
if (closeModal) {
    closeModal.addEventListener('click', () => {
        fortuneModal.classList.remove('active');
    });
}

// 重置 UI
function resetFortuneUI() {
    currentFortuneState = 'ready';
    fortuneResult.innerHTML = '<span class="placeholder">准备好了吗？</span>';
    fortuneDesc.textContent = '点击下方按钮抽取你的新年关键词';
    drawBtn.textContent = '开启好运';
    drawBtn.disabled = false;
    drawBtn.style.background = ''; // 恢复默认背景
}

// 核心按钮逻辑
if (drawBtn) {
    drawBtn.addEventListener('click', (e) => {
        if (currentFortuneState === 'ready') {
            // 阶段 1：开始抽签
            currentFortuneState = 'drawing';
            drawBtn.disabled = true;
            drawBtn.textContent = '祈福中...';
            fortuneResult.innerHTML = '<div style="font-size:40px; animation: rotate 0.5s infinite;">🎲</div>';
            
            // 模拟 1.5秒 等待
            setTimeout(() => {
                const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
                
                // 显示结果
                fortuneResult.innerHTML = `<div class="fortune-word">${randomFortune.title}</div>`;
                fortuneDesc.textContent = randomFortune.desc;
                
                // 按钮变为“收下祝福”状态
                drawBtn.textContent = '🧧 收下祝福';
                drawBtn.disabled = false;
                drawBtn.style.background = 'linear-gradient(90deg, #d4af37, #f0e6d2)'; // 变成金色按钮
                drawBtn.style.color = '#8b0000';
                currentFortuneState = 'drawn';
                
                // 小烟花
                const rect = fortuneResult.getBoundingClientRect();
                explodeParticles(rect.left + rect.width/2, rect.top + rect.height/2, 20);

            }, 1500);

        } else if (currentFortuneState === 'drawn') {
            // 阶段 2：收下祝福 (执行动画并关闭)
            
            // 1. 满屏烟花庆祝
            const x = window.innerWidth / 2;
            const y = window.innerHeight / 2;
            explodeParticles(x, y, 60); // 大爆炸
            explodeParticles(x - 100, y - 50, 30);
            explodeParticles(x + 100, y - 50, 30);

            // 2. 按钮反馈
            drawBtn.textContent = '祝福已收入囊中！';
            drawBtn.disabled = true;

            // 3. 执行飞走动画并关闭 (延时 1秒)
            setTimeout(() => {
                fortuneModal.classList.add('closing'); // 添加 CSS 类执行飞走动画
                
                // 动画播完后彻底隐藏并重置
                setTimeout(() => {
                    fortuneModal.classList.remove('active');
                    fortuneModal.classList.remove('closing');
                    resetFortuneUI(); // 偷偷重置，为下次做好准备
                }, 500); // 对应 CSS .closing 的动画时间
            }, 1000);
        }
    });
}

// ========== 5. 音频播放修复 (带调试) ==========
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');

if (musicToggle && bgMusic) {
    bgMusic.volume = 0.4;

    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            // 尝试播放
            const playPromise = bgMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    musicToggle.textContent = '🔊';
                    console.log('播放成功');
                }).catch(error => {
                    console.error('播放失败:', error);
                    alert('无法播放音频。\n原因可能是：\n1. 项目根目录下没有 bgm.mp3 文件。\n2. 浏览器限制了自动播放 (请检查浏览器设置)。');
                    musicToggle.textContent = '🔇';
                });
            }
        } else {
            bgMusic.pause();
            musicToggle.textContent = '🔇';
        }
    });

    // 监听错误
    bgMusic.addEventListener('error', (e) => {
        console.error('音频文件加载错误:', e);
        musicToggle.style.opacity = '0.5'; // 变灰提示不可用
        musicToggle.title = "音频文件加载失败";
    });
}