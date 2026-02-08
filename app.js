// ========================================
// BIKE4CHAI PAGE - JAVASCRIPT
// Password-Protected Admin System
// ========================================

// DOM Elements
const elements = {
    // Profile
    profileImage: document.getElementById('profileImage'),
    riderName: document.getElementById('riderName'),
    riderTagline: document.getElementById('riderTagline'),
    teamName: document.getElementById('teamName'),

    // Progress
    progressBar: document.getElementById('progressBar'),
    progressPercent: document.getElementById('progressPercent'),
    amountRaised: document.getElementById('amountRaised'),
    amountGoal: document.getElementById('amountGoal'),

    // Stats
    donorCount: document.getElementById('donorCount'),
    daysLeft: document.getElementById('daysLeft'),
    milesRiding: document.getElementById('milesRiding'),
    riderRank: document.getElementById('riderRank'),

    // Other
    riderMessage: document.getElementById('riderMessage'),
    donateBtn: document.getElementById('donateBtn'),
    donorsList: document.getElementById('donorsList'),

    // Logo (for admin access trigger)
    logoSection: document.querySelector('.logo-section'),

    // Buttons
    shareBtn: document.getElementById('shareBtn'),

    // Password Modal
    passwordModal: document.getElementById('passwordModal'),
    closePasswordModal: document.getElementById('closePasswordModal'),
    adminPassword: document.getElementById('adminPassword'),
    newPassword: document.getElementById('newPassword'),
    confirmPassword: document.getElementById('confirmPassword'),
    passwordError: document.getElementById('passwordError'),
    firstTimeSetup: document.getElementById('firstTimeSetup'),
    submitPasswordBtn: document.getElementById('submitPasswordBtn'),

    // Customize Modal
    customizeModal: document.getElementById('customizeModal'),
    closeModal: document.getElementById('closeModal'),
    saveBtn: document.getElementById('saveBtn'),
    resetBtn: document.getElementById('resetBtn'),

    // Share Modal
    shareModal: document.getElementById('shareModal'),
    closeShareModal: document.getElementById('closeShareModal'),
    sharePreview: document.getElementById('sharePreview'),

    // Form Inputs
    inputName: document.getElementById('inputName'),
    inputTagline: document.getElementById('inputTagline'),
    inputTeam: document.getElementById('inputTeam'),
    inputGoal: document.getElementById('inputGoal'),
    inputRaised: document.getElementById('inputRaised'),
    inputDonors: document.getElementById('inputDonors'),
    inputDays: document.getElementById('inputDays'),
    inputMiles: document.getElementById('inputMiles'),
    inputRank: document.getElementById('inputRank'),
    inputMessage: document.getElementById('inputMessage'),
    inputDonateUrl: document.getElementById('inputDonateUrl'),
    inputTheme: document.getElementById('inputTheme'),
    changePassword: document.getElementById('changePassword')
};

// Default data
const defaultData = {
    name: 'Your Name Here',
    tagline: 'Riding for a cause that matters ❤️',
    team: 'Team Chai',
    goal: 5000,
    raised: 0,
    donors: 0,
    days: 45,
    miles: 180,
    rank: null,
    message: "I'm riding in Bike4Chai because I believe in the incredible work Chai Lifeline does for children and families facing serious illness. Every mile I ride represents hope, and every donation brings us closer to making a real difference. Join me on this journey!",
    donateUrl: 'https://bike4chai.com/donate',
    theme: 'orange',
    recentDonors: [
        { name: 'John Doe', initials: 'JD', amount: 100, time: 'Just now' },
        { name: 'Sarah M.', initials: 'SM', amount: 50, time: '2 hours ago' },
        { name: 'Anonymous', initials: 'AK', amount: 180, time: '1 day ago' }
    ]
};

// Current data state
let currentData = { ...defaultData };

// Admin state
let logoClickCount = 0;
let logoClickTimer = null;

// ========================================
// PASSWORD / SECURITY FUNCTIONS
// ========================================

// Simple hash function for password (not cryptographically secure, but sufficient for local storage)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'bike4chai_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getStoredPasswordHash() {
    return localStorage.getItem('bike4chai_admin_hash');
}

function setStoredPasswordHash(hash) {
    localStorage.setItem('bike4chai_admin_hash', hash);
}

function isPasswordSet() {
    return !!getStoredPasswordHash();
}

async function verifyPassword(password) {
    const storedHash = getStoredPasswordHash();
    const inputHash = await hashPassword(password);
    return storedHash === inputHash;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function animateNumber(element, targetValue, duration = 1000, prefix = '', suffix = '') {
    const startValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out cubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const currentValue = Math.round(startValue + (targetValue - startValue) * easeProgress);
        element.textContent = prefix + currentValue.toLocaleString() + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// ========================================
// DATA MANAGEMENT
// ========================================

function loadData() {
    const saved = localStorage.getItem('bike4chai_data');
    if (saved) {
        try {
            currentData = { ...defaultData, ...JSON.parse(saved) };
        } catch (e) {
            console.error('Error loading saved data:', e);
            currentData = { ...defaultData };
        }
    }
    return currentData;
}

function saveData() {
    localStorage.setItem('bike4chai_data', JSON.stringify(currentData));
}

function resetData() {
    currentData = { ...defaultData };
    localStorage.removeItem('bike4chai_data');
}

// ========================================
// UI UPDATE FUNCTIONS
// ========================================

function updateUI() {
    // Profile
    elements.riderName.textContent = currentData.name;
    elements.riderTagline.textContent = currentData.tagline;
    elements.teamName.textContent = currentData.team;

    // Progress
    const progress = Math.min((currentData.raised / currentData.goal) * 100, 100);
    elements.progressBar.style.setProperty('--progress', `${progress}%`);
    elements.progressPercent.textContent = `${Math.round(progress)}%`;

    animateNumber(elements.amountRaised, currentData.raised, 1200, '$');
    elements.amountGoal.textContent = formatCurrency(currentData.goal);

    // Stats
    animateNumber(elements.donorCount, currentData.donors, 800);

    if (currentData.days !== null) {
        animateNumber(elements.daysLeft, currentData.days, 600);
    } else {
        elements.daysLeft.textContent = '--';
    }

    animateNumber(elements.milesRiding, currentData.miles, 800);

    if (currentData.rank !== null) {
        elements.riderRank.textContent = `#${currentData.rank}`;
    } else {
        elements.riderRank.textContent = '#--';
    }

    // Message
    elements.riderMessage.textContent = currentData.message;

    // Donate button
    elements.donateBtn.href = currentData.donateUrl;

    // Theme
    document.body.dataset.theme = currentData.theme;

    // Update share preview
    updateSharePreview();
}

function updateFormInputs() {
    elements.inputName.value = currentData.name;
    elements.inputTagline.value = currentData.tagline;
    elements.inputTeam.value = currentData.team;
    elements.inputGoal.value = currentData.goal;
    elements.inputRaised.value = currentData.raised;
    elements.inputDonors.value = currentData.donors;
    elements.inputDays.value = currentData.days || '';
    elements.inputMiles.value = currentData.miles;
    elements.inputRank.value = currentData.rank || '';
    elements.inputMessage.value = currentData.message;
    elements.inputDonateUrl.value = currentData.donateUrl;
    elements.inputTheme.value = currentData.theme;
    elements.changePassword.value = '';
}

function updateDonorsList() {
    const donors = currentData.recentDonors || defaultData.recentDonors;

    elements.donorsList.innerHTML = donors.map(donor => `
        <div class="donor-card">
            <div class="donor-avatar">${donor.initials || getInitials(donor.name)}</div>
            <div class="donor-info">
                <span class="donor-name">${donor.name}</span>
                <span class="donor-time">${donor.time}</span>
            </div>
            <span class="donor-amount">${formatCurrency(donor.amount)}</span>
        </div>
    `).join('');
}

function updateSharePreview() {
    const message = `Support my Bike4Chai ride for Chai Lifeline! I've raised ${formatCurrency(currentData.raised)} of my ${formatCurrency(currentData.goal)} goal. Every donation helps families facing serious illness. 🚴❤️`;
    elements.sharePreview.textContent = `"${message}"`;
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModalFunc(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function closeAllModals() {
    closeModalFunc(elements.passwordModal);
    closeModalFunc(elements.customizeModal);
    closeModalFunc(elements.shareModal);
}

// ========================================
// ADMIN ACCESS FUNCTIONS
// ========================================

function triggerAdminAccess() {
    // Reset password modal state
    elements.adminPassword.value = '';
    elements.newPassword.value = '';
    elements.confirmPassword.value = '';
    elements.passwordError.textContent = '';

    // Show/hide first time setup based on whether password is set
    if (isPasswordSet()) {
        elements.firstTimeSetup.style.display = 'none';
        elements.adminPassword.parentElement.style.display = 'block';
    } else {
        elements.firstTimeSetup.style.display = 'block';
        elements.adminPassword.parentElement.style.display = 'none';
    }

    openModal(elements.passwordModal);
}

async function handlePasswordSubmit() {
    elements.passwordError.textContent = '';

    if (isPasswordSet()) {
        // Verify existing password
        const password = elements.adminPassword.value;
        if (!password) {
            elements.passwordError.textContent = 'Please enter your password';
            return;
        }

        const isValid = await verifyPassword(password);
        if (isValid) {
            closeModalFunc(elements.passwordModal);
            updateFormInputs();
            openModal(elements.customizeModal);
            showToast('🔓 Admin mode unlocked!');
        } else {
            elements.passwordError.textContent = 'Incorrect password. Try again.';
            elements.adminPassword.value = '';
            elements.adminPassword.focus();
        }
    } else {
        // First time setup - create password
        const newPass = elements.newPassword.value;
        const confirmPass = elements.confirmPassword.value;

        if (!newPass || newPass.length < 4) {
            elements.passwordError.textContent = 'Password must be at least 4 characters';
            return;
        }

        if (newPass !== confirmPass) {
            elements.passwordError.textContent = 'Passwords do not match';
            return;
        }

        const hash = await hashPassword(newPass);
        setStoredPasswordHash(hash);
        closeModalFunc(elements.passwordModal);
        updateFormInputs();
        openModal(elements.customizeModal);
        showToast('✅ Password created! Admin mode unlocked!');
    }
}

// ========================================
// SHARE FUNCTIONS
// ========================================

function getShareText() {
    return `Support my Bike4Chai ride for Chai Lifeline! I've raised ${formatCurrency(currentData.raised)} of my ${formatCurrency(currentData.goal)} goal. Every donation helps families facing serious illness. 🚴❤️ ${currentData.donateUrl}`;
}

function shareToWhatsApp() {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareToFacebook() {
    const url = encodeURIComponent(currentData.donateUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareToTwitter() {
    const text = encodeURIComponent(getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function shareByEmail() {
    const subject = encodeURIComponent(`Support ${currentData.name}'s Bike4Chai Ride!`);
    const body = encodeURIComponent(getShareText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function copyLink() {
    const text = currentData.donateUrl;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Link copied to clipboard!');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--gradient-primary);
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        font-weight: 600;
        z-index: 10000;
        animation: fadeInUp 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ========================================
// PARTICLES ANIMATION
// ========================================

function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const delay = Math.random() * 20;
        const duration = Math.random() * 20 + 20;

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: hsla(${Math.random() * 60 + 230}, 70%, 70%, 0.3);
            border-radius: 50%;
            left: ${left}%;
            top: 100%;
            animation: floatUp ${duration}s linear infinite;
            animation-delay: -${delay}s;
        `;

        container.appendChild(particle);
    }

    // Add keyframe animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            from {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 0.5;
            }
            90% {
                opacity: 0.5;
            }
            to {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(10px);
            }
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// EVENT LISTENERS
// ========================================

function initEventListeners() {
    // Triple-click on logo to access admin
    elements.logoSection.addEventListener('click', () => {
        logoClickCount++;

        if (logoClickTimer) {
            clearTimeout(logoClickTimer);
        }

        logoClickTimer = setTimeout(() => {
            logoClickCount = 0;
        }, 500);

        if (logoClickCount >= 3) {
            logoClickCount = 0;
            triggerAdminAccess();
        }
    });

    // Keyboard shortcut: Ctrl+Shift+E for admin access
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            triggerAdminAccess();
        }

        // Close modals on Escape
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Password Modal
    elements.closePasswordModal.addEventListener('click', () => {
        closeModalFunc(elements.passwordModal);
    });

    elements.submitPasswordBtn.addEventListener('click', handlePasswordSubmit);

    // Allow Enter key to submit password
    elements.adminPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handlePasswordSubmit();
    });
    elements.confirmPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handlePasswordSubmit();
    });

    elements.passwordModal.addEventListener('click', (e) => {
        if (e.target === elements.passwordModal) {
            closeModalFunc(elements.passwordModal);
        }
    });

    // Customize Modal
    elements.closeModal.addEventListener('click', () => {
        closeModalFunc(elements.customizeModal);
    });

    elements.customizeModal.addEventListener('click', (e) => {
        if (e.target === elements.customizeModal) {
            closeModalFunc(elements.customizeModal);
        }
    });

    // Save button
    elements.saveBtn.addEventListener('click', async () => {
        // Collect form data
        currentData = {
            ...currentData,
            name: elements.inputName.value || defaultData.name,
            tagline: elements.inputTagline.value || defaultData.tagline,
            team: elements.inputTeam.value || defaultData.team,
            goal: parseInt(elements.inputGoal.value) || defaultData.goal,
            raised: parseInt(elements.inputRaised.value) || 0,
            donors: parseInt(elements.inputDonors.value) || 0,
            days: elements.inputDays.value ? parseInt(elements.inputDays.value) : null,
            miles: parseInt(elements.inputMiles.value) || defaultData.miles,
            rank: elements.inputRank.value ? parseInt(elements.inputRank.value) : null,
            message: elements.inputMessage.value || defaultData.message,
            donateUrl: elements.inputDonateUrl.value || defaultData.donateUrl,
            theme: elements.inputTheme.value
        };

        // Check if password change requested
        const newPass = elements.changePassword.value;
        if (newPass && newPass.length >= 4) {
            const hash = await hashPassword(newPass);
            setStoredPasswordHash(hash);
            showToast('✅ Password updated!');
        }

        saveData();
        updateUI();
        closeModalFunc(elements.customizeModal);
        showToast('Changes saved!');
    });

    // Reset button
    elements.resetBtn.addEventListener('click', () => {
        if (confirm('Reset all page data to defaults? This will NOT reset your admin password.')) {
            resetData();
            updateFormInputs();
            updateUI();
            showToast('Reset to defaults');
        }
    });

    // Theme live preview
    elements.inputTheme.addEventListener('change', (e) => {
        document.body.dataset.theme = e.target.value;
    });

    // Share button
    elements.shareBtn.addEventListener('click', () => {
        openModal(elements.shareModal);
    });

    // Close share modal
    elements.closeShareModal.addEventListener('click', () => {
        closeModalFunc(elements.shareModal);
    });

    // Close modals on backdrop click
    elements.shareModal.addEventListener('click', (e) => {
        if (e.target === elements.shareModal) {
            closeModalFunc(elements.shareModal);
        }
    });

    // Share options
    document.querySelectorAll('.share-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.share;
            switch (type) {
                case 'whatsapp': shareToWhatsApp(); break;
                case 'facebook': shareToFacebook(); break;
                case 'twitter': shareToTwitter(); break;
                case 'email': shareByEmail(); break;
                case 'copy': copyLink(); break;
            }
            closeModalFunc(elements.shareModal);
        });
    });
}

// ========================================
// INITIALIZATION
// ========================================

function init() {
    loadData();
    createParticles();
    updateUI();
    updateDonorsList();
    initEventListeners();

    // Console hint for developers
    console.log('%c🚴 Bike4Chai Page', 'font-size: 20px; font-weight: bold; color: #f97316;');
    console.log('%cAdmin Access: Triple-click the logo or press Ctrl+Shift+E', 'color: #666;');
}

// Start application
document.addEventListener('DOMContentLoaded', init);

// ========================================
// EXPORT FOR TESTING (if needed)
// ========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        getInitials,
        currentData,
        defaultData
    };
}
