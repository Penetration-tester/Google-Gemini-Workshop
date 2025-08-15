// ==================================================================================
// FINAL, FULL-FEATURED FRONTEND SCRIPT
// ==================================================================================
// This is the complete and definitive frontend code for the Gemini Workshop.
// It includes all features: stable sessions, a full admin panel, Gemini AI,
// attendance with a visual timer, and Excel export functionality.
// It adheres to the original design where the login prompt appears on scroll.
// ==================================================================================

// --- Configuration ---
const API_URL = 'http://localhost:3000'; // Change this to your deployed Render URL when live

// --- DOM Element References ---
const authOverlay = document.getElementById('auth-overlay');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const appContent = document.getElementById('app-content');
const welcomeMessage = document.getElementById('welcome-message');
const adminPanel = document.getElementById('admin-panel');
const adminLogoutButton = document.getElementById('admin-logout-button');
const studentCountEl = document.getElementById('student-count');
const studentDetailsBody = document.getElementById('student-details-body');
const recentStudentDetailsBody = document.getElementById('recent-student-details-body');
const adminAddUserForm = document.getElementById('admin-add-user-form');
const adminAddUserStatus = document.getElementById('admin-add-user-status');
const attendanceSection = document.getElementById('attendance-section');
const attendanceForm = document.getElementById('attendance-form');
const attendanceCodeInput = document.getElementById('attendance-code');
const attendanceStatusMessage = document.getElementById('attendance-status-message');
const startAttendanceBtn = document.getElementById('start-attendance-btn');
const exportExcelBtn = document.getElementById('export-excel-btn');
const qrCodeArea = document.getElementById('qr-code-area');
const qrCodeImg = document.getElementById('qr-code-img');
const qrCodeText = document.getElementById('qr-code-text');
const attendanceTimerEl = document.getElementById('attendance-timer');
const loginPrompt = document.getElementById('login-prompt');
const showLoginBtn = document.getElementById('show-login-btn');
const logoutButton = document.getElementById('logout-button');
const mobileLogoutButton = document.getElementById('mobile-logout-button');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

// --- In-memory State ---
let currentUser = null;
let promptShown = false;
let attendanceTimerInterval = null;

// --- Helper Functions ---
function saveSession(token, user) {
    localStorage.setItem('authToken', token);
    currentUser = user;
}

function clearSession() {
    localStorage.removeItem('authToken');
    currentUser = null;
}

function loadSession() {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            clearSession();
            return;
        }
        currentUser = payload;
    } catch (e) {
        console.error("Failed to parse token:", e);
        clearSession();
    }
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
}

function startAttendanceTimer(expiryTime) {
    if (attendanceTimerInterval) clearInterval(attendanceTimerInterval);
    const expiryDate = new Date(expiryTime).getTime();
    attendanceTimerInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = expiryDate - now;
        if (distance < 0) {
            clearInterval(attendanceTimerInterval);
            attendanceTimerEl.textContent = "Session Expired";
            setTimeout(() => { qrCodeArea.classList.add('hidden'); }, 2000);
            return;
        }
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        attendanceTimerEl.textContent = `Session expires in: ${formattedMinutes}:${formattedSeconds}`;
    }, 1000);
}

// --- UI Update Functions ---
const updateUIForLoggedInUser = (user) => {
    welcomeMessage.textContent = `Welcome, ${user.name}! Let's explore the future of AI together.`;
    attendanceSection.classList.remove('hidden');
    logoutButton.classList.remove('hidden');
    mobileLogoutButton.classList.remove('hidden');
};

const updateUIForLoggedOutUser = () => {
    welcomeMessage.textContent = `A hands-on workshop for students to explore the future of artificial intelligence.`;
    attendanceSection.classList.add('hidden');
    logoutButton.classList.add('hidden');
    mobileLogoutButton.classList.add('hidden');
};

const renderAdminDashboard = (users = []) => {
    studentCountEl.textContent = users.length;
    studentDetailsBody.innerHTML = '';
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-800 hover:bg-gray-800/50';
        const blockButtonClass = user.isBlocked ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700';
        const blockButtonText = user.isBlocked ? 'Unblock' : 'Block';
        const attendanceStatusClass = user.attendance === 'Present' ? 'status-present' : 'status-absent';
        const lastLoginFormatted = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never';

        row.innerHTML = `
            <td class="p-3">${index + 1}</td>
            <td class="p-3">${user.name}</td>
            <td class="p-3">${user.class || 'N/A'}</td>
            <td class="p-3">${user.roll || 'N/A'}</td>
            <td class="p-3">${user.email}</td>
            <td class="p-3"><span class="${attendanceStatusClass}">${user.attendance || 'Absent'}</span></td>
            <td class="p-3 text-center">${user.loginCount || 0}</td>
            <td class="p-3 text-sm">${lastLoginFormatted}</td>
            <td class="p-3 flex gap-2">
                <button data-id="${user._id}" class="toggle-block-btn text-white font-bold py-1 px-3 rounded-lg text-sm ${blockButtonClass}">${blockButtonText}</button>
                <button data-id="${user._id}" class="delete-btn text-white font-bold py-1 px-3 rounded-lg text-sm bg-red-600 hover:bg-red-700">Delete</button>
            </td>
        `;
        studentDetailsBody.appendChild(row);
    });
};

// --- Core View-Switching Functions ---
async function showAdminPanel() {
    adminPanel.classList.remove('hidden');
    appContent.classList.add('hidden');
    authOverlay.classList.add('hidden');
    try {
        const response = await fetchWithAuth(`${"AIzaSyBWudgf3QBZl1MY7fAjE7esL81MXk95pLI"}/users`);
        if (!response.ok) throw new Error('Failed to fetch user data. You may not be an authorized admin.');
        const users = await response.json();
        renderAdminDashboard(users);
    } catch (error) {
        console.error("Admin panel error:", error);
        studentDetailsBody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-red-400">${error.message}</td></tr>`;
    }
}

function showAppContent() {
    appContent.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    authOverlay.classList.add('hidden');
    if (currentUser) {
        updateUIForLoggedInUser(currentUser);
    } else {
        updateUIForLoggedOutUser();
    }
}

function showAuthScreen() {
    authOverlay.classList.remove('hidden');
    authOverlay.classList.add('flex');
    appContent.classList.add('hidden');
    adminPanel.classList.add('hidden');
}

// --- Event Listeners ---
loginTab.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    loginTab.classList.add('border-indigo-500', 'text-white');
    registerTab.classList.remove('border-pink-500', 'text-white');
});

registerTab.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    registerTab.classList.add('border-pink-500', 'text-white');
    loginTab.classList.remove('border-transparent', 'text-gray-400');
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Login failed.');
        saveSession(result.token, result.user);
        if (result.user.role === 'admin') {
            showAdminPanel();
        } else {
            showAppContent();
        }
    } catch (error) {
        clearSession();
        loginError.textContent = error.message;
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';
    const name = document.getElementById('register-name').value;
    const userClass = document.getElementById('register-class').value;
    const roll = document.getElementById('register-roll').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, userClass, roll, email, password }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Registration failed.');
        alert('Registration successful! Please switch to the Login tab to sign in.');
        registerForm.reset();
        loginTab.click();
    } catch (error) {
        registerError.textContent = error.message;
    }
});

const handleLogout = () => {
    clearSession();
    showAppContent();
};
logoutButton.addEventListener('click', handleLogout);
mobileLogoutButton.addEventListener('click', handleLogout);
adminLogoutButton.addEventListener('click', handleLogout);

studentDetailsBody.addEventListener('click', async (e) => {
    const target = e.target.closest('button');
    if (!target) return;
    const userId = target.dataset.id;
    if (!userId) return;

    if (target.classList.contains('delete-btn')) {
        if (confirm(`Are you sure you want to permanently delete this user?`)) {
            try {
                const response = await fetchWithAuth(`${API_URL}/users/${userId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete user.');
                showAdminPanel();
            } catch (error) { alert('Could not delete the user.'); }
        }
    }

    if (target.classList.contains('toggle-block-btn')) {
        try {
            const response = await fetchWithAuth(`${API_URL}/users/${userId}/block`, { method: 'PATCH' });
            if (!response.ok) throw new Error('Failed to update user status.');
            showAdminPanel();
        } catch (error) { alert('Could not update user status.'); }
    }
});

adminAddUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    adminAddUserStatus.textContent = '';
    const name = document.getElementById('admin-add-name').value;
    const userClass = document.getElementById('admin-add-class').value;
    const roll = document.getElementById('admin-add-roll').value;
    const email = document.getElementById('admin-add-email').value;
    const password = document.getElementById('admin-add-password').value;
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, userClass, roll, email, password }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to add user.');
        adminAddUserStatus.textContent = "Student added successfully!";
        adminAddUserStatus.className = "text-sm text-center mt-3 h-4 text-green-400";
        adminAddUserForm.reset();
        showAdminPanel();
    } catch (error) {
        adminAddUserStatus.textContent = error.message;
        adminAddUserStatus.className = "text-sm text-center mt-3 h-4 text-red-400";
    }
});

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

startAttendanceBtn.addEventListener('click', async () => {
    try {
        const response = await fetchWithAuth(`${"AIzaSyBWudgf3QBZl1MY7fAjE7esL81MXk95pLI"}/attendance/start`, { method: 'POST' });
        if (!response.ok) throw new Error('Could not start session. Are you an admin?');
        const session = await response.json();
        qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${session.code}`;
        qrCodeText.textContent = session.code;
        qrCodeArea.classList.remove('hidden');
        startAttendanceTimer(session.expiresAt);
    } catch (error) {
        alert(error.message);
    }
});

attendanceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const enteredCode = attendanceCodeInput.value;
    if (!currentUser) return;
    const userId = currentUser.userId || currentUser.id;
    if (!userId) {
        attendanceStatusMessage.textContent = "Error: User ID not found. Please log in again.";
        return;
    }
    try {
        const response = await fetch(`${API_URL}/attendance/mark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: enteredCode, userId })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        attendanceStatusMessage.textContent = "Success! Your attendance has been marked.";
        attendanceStatusMessage.className = "mt-4 h-5 text-green-400";
    } catch (error) {
        attendanceStatusMessage.textContent = error.message;
        attendanceStatusMessage.className = "mt-4 h-5 text-red-400";
    }
});

exportExcelBtn.addEventListener('click', async () => {
    try {
        const response = await fetchWithAuth(`${API_URL}/attendance/export`);
        if (!response.ok) throw new Error('Failed to download the report.');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `attendance-report-${date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        console.error("Excel export error:", error);
        alert("Could not generate the attendance report.");
    }
});

// --- App Initialization ---
const initializeApp = () => {
    loadSession();
    if (currentUser && currentUser.role === 'admin') {
        showAdminPanel();
    } else {
        showAppContent();
    }
    window.addEventListener('scroll', () => {
        if (!currentUser && !promptShown && window.scrollY > 400) {
            loginPrompt.classList.remove('hidden');
            promptShown = true;
        }
    });
    showLoginBtn.addEventListener('click', () => {
        loginPrompt.classList.add('hidden');
        showAuthScreen();
    });
};


window.onload = initializeApp;

