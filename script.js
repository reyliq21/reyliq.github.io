const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- LOGIKA HITUNG MUNDUR ---
const targetDate = new Date("March 2, 2026 00:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = String(days).padStart(2, '0');
    document.getElementById("hours").innerText = String(hours).padStart(2, '0');
    document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
    document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// --- INTERAKSI TOMBOL & KARTU ---
const btnSurprise = document.getElementById('btn-surprise');
const cardDoa = document.getElementById('card-doa');
const btnClose = document.getElementById('btn-close');
const backgroundMusic = document.getElementById('background-music');
let fireworksInterval;

btnSurprise.addEventListener('click', () => {
    cardDoa.classList.add('visible');
    startFireworks();
    createConfetti();

    // Memulai musik jika sedang tidak diputar
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(error => {
            // Beberapa browser memblokir autoplay, ini untuk menangani error
            console.error("Gagal memutar musik:", error);
        });
    }

    // Panggil updateSlider untuk memastikan state awal (misal video di slide pertama) benar
    updateSlider();
});

btnClose.addEventListener('click', () => {
    cardDoa.classList.remove('visible');
    // Musik akan tetap berputar di latar belakang

    // Hentikan dan reset semua video di dalam slider
    slides.forEach(slide => {
        if (slide.tagName === 'VIDEO') {
            slide.pause();
            slide.currentTime = 0; // Kembali ke awal video
        }
    });
});

// --- LOGIKA PETASAN (FIREWORKS) ---
let particles = [];
let confettiParticles = [];

function ConfettiParticle(x, y) {
    this.x = x;
    this.y = y;
    this.color = ['#ff6b81', '#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#f1c40f', '#9b59b6'][Math.floor(Math.random() * 7)];
    this.size = Math.random() * 10 + 5;
    this.velocity = {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() * -15) - 5
    };
    this.gravity = 0.4;
    this.friction = 0.96;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 10;
    this.alpha = 1;
}

ConfettiParticle.prototype.draw = function() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
};

ConfettiParticle.prototype.update = function() {
    this.velocity.x *= this.friction;
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.rotation += this.rotationSpeed;
    this.alpha -= 0.005;
};

function createConfetti() {
    // Membuat ledakan besar dari tengah layar, tempat kartu muncul
    const burstOrigin = { x: canvas.width / 2, y: canvas.height / 2 };
    const particleCount = 200; // Jumlah partikel lebih banyak untuk efek lebih meriah

    for (let i = 0; i < particleCount; i++) {
        confettiParticles.push(new ConfettiParticle(burstOrigin.x, burstOrigin.y));
    }
}

function Particle(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8
    };
    this.alpha = 1;
    this.friction = 0.95;
}

Particle.prototype.draw = function() {
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
};

Particle.prototype.update = function() {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
};

function createFirework(x, y) {
    const colors = ['#ff6b81', '#ff4757', '#2ed573', '#1e90ff', '#ffa502'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function animateFireworks() {
    requestAnimationFrame(animateFireworks);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Efek trail/jejak
    // Karena background CSS transparan, kita gunakan clearRect agar tidak menumpuk warna hitam
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((particle, index) => {
        if (particle.alpha > 0) {
            particle.update();
            particle.draw();
        } else {
            particles.splice(index, 1);
        }
    });

    // Render Confetti
    confettiParticles.forEach((p, index) => {
        if (p.alpha > 0) {
            p.update();
            p.draw();
        } else {
            confettiParticles.splice(index, 1);
        }
    });
}

function startFireworks() {
    animateFireworks();
    fireworksInterval = setInterval(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height / 2;
        createFirework(x, y);
    }, 800);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// --- LOGIKA SLIDER FOTO ---
const sliderWrapper = document.querySelector('.slider-wrapper');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev-slide');
const nextBtn = document.querySelector('.next-slide');
let slideIndex = 0;

function updateSlider() {
    if (sliderWrapper) {
        sliderWrapper.style.transform = `translateX(-${slideIndex * 100}%)`;

        // Logika untuk play/pause video di dalam slider
        slides.forEach((slide, index) => {
            if (slide.tagName === 'VIDEO') {
                if (index === slideIndex) {
                    // Mainkan video jika slide-nya aktif
                    slide.play().catch(error => {
                        console.log("Pemutaran video otomatis diblokir:", error);
                    });
                } else {
                    // Jeda video jika slide-nya tidak aktif
                    slide.pause();
                }
            }
        });
    }
}

if (prevBtn && nextBtn) {
    nextBtn.addEventListener('click', () => {
        slideIndex = (slideIndex + 1) % slides.length;
        updateSlider();
    });

    prevBtn.addEventListener('click', () => {
        slideIndex = (slideIndex - 1 + slides.length) % slides.length;
        updateSlider();
    });
}
