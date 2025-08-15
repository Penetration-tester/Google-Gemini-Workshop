 // --- DOM Element References ---
        const authOverlay = document.getElementById('auth-overlay');
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginError = document.getElementById('login-error');
        const registerError = document.getElementById('register-error');
        
        const appContent = document.getElementById('app-content');
        const logoutButton = document.getElementById('logout-button');
        const mobileLogoutButton = document.getElementById('mobile-logout-button');
        const welcomeMessage = document.getElementById('welcome-message');

        const adminPanel = document.getElementById('admin-panel');
        const adminLogoutButton = document.getElementById('admin-logout-button');
        const studentCountEl = document.getElementById('student-count');
        const studentDetailsBody = document.getElementById('student-details-body');
        const recentStudentDetailsBody = document.getElementById('recent-student-details-body');
        const adminAddUserForm = document.getElementById('admin-add-user-form');
        const adminAddUserStatus = document.getElementById('admin-add-user-status');

        // Admin Attendance Elements
        const startAttendanceBtn = document.getElementById('start-attendance-btn');
        const qrCodeArea = document.getElementById('qr-code-area');
        const qrCodeImg = document.getElementById('qr-code-img');
        const qrCodeText = document.getElementById('qr-code-text');
        const attendanceTimerEl = document.getElementById('attendance-timer');

        // Student Attendance Elements
        const attendanceSection = document.getElementById('attendance-section');
        const attendanceForm = document.getElementById('attendance-form');
        const attendanceCodeInput = document.getElementById('attendance-code');
        const attendanceStatusMessage = document.getElementById('attendance-status-message');

        // Excel Upload Elements
        const excelUploadForm = document.getElementById('excel-upload-form');
        const excelFileInput = document.getElementById('excel-file');
        const excelUploadStatus = document.getElementById('excel-upload-status');

        // Login Prompt
        const loginPrompt = document.getElementById('login-prompt');
        const showLoginBtn = document.getElementById('show-login-btn');

        // --- In-memory Data Store & State ---
        let registeredUsers = [];
        let recentlyRegisteredUsers = [];
        let currentUser = null; // To track the logged-in user
        let attendanceSession = { key: null, expiry: null };
        let attendanceTimerInterval = null;
        let promptShown = false;

        // --- Helper function to generate a random password ---
        const generateRandomPassword = () => {
            return Math.random().toString(36).slice(-8);
        };

        // --- Data Persistence ---
        const saveUsersToLocalStorage = () => {
            localStorage.setItem('geminiWorkshopUsers', JSON.stringify(registeredUsers));
            localStorage.setItem('geminiWorkshopRecentUsers', JSON.stringify(recentlyRegisteredUsers));
        };

        const loadUsersFromLocalStorage = () => {
            const users = localStorage.getItem('geminiWorkshopUsers');
            const recentUsers = localStorage.getItem('geminiWorkshopRecentUsers');
            registeredUsers = users ? JSON.parse(users) : [];
            recentlyRegisteredUsers = recentUsers ? JSON.parse(recentUsers) : [];
        };
        
        const saveSessionToLocalStorage = () => {
            localStorage.setItem('geminiWorkshopSession', JSON.stringify(attendanceSession));
        };

        const loadSessionFromLocalStorage = () => {
            const session = localStorage.getItem('geminiWorkshopSession');
            if (session) {
                attendanceSession = JSON.parse(session);
            }
        };

        // --- Pre-populate data from CSV ---
        const preloadedStudentData = [
            { "Name": "Madhav Kaura", "Class": "BCA", "Roll no": 254732, "E-mail": "kauramadhav50@gmail.com" },
            { "Name": "Gurnoor Singh", "Class": "Bca 2nd year", "Roll no": 254561, "E-mail": "gurnoorkharoud1@gmail.com" },
            { "Name": "Suman jeet kaur", "Class": "B.Voc software development 2nd year", "Roll no": 258332, "E-mail": "Sumankhangura.0@gmail.com" },
            { "Name": "Gurwinderpal singh", "Class": "BCA", "Roll no": 254288, "E-mail": "gurwinderpalsinghguraya@gmail.com" },
            { "Name": "Gurpreet Kaur", "Class": "Bsc artificial intelligence and data science", "Roll no": 258499, "E-mail": "akamaulakh@gmail.com" },
            { "Name": "Inderjeet Singh", "Class": "BSC Hons Ai&Ds", "Roll no": 258519, "E-mail": "inderwalia37@gmail.com" },
            { "Name": "Manjot Singh", "Class": "B.sc", "Roll no": 258525, "E-mail": "manjotsinghpb23@gmail.com" },
            { "Name": "Gursewak Singh", "Class": "Bsc Hons AI&DS", "Roll no": 258512, "E-mail": "gursewakgaming20@gmail.com" },
            { "Name": "Prerna", "Class": "MCA 2nd year", "Roll no": 25094, "E-mail": "Prenamodgill@gmail.com" },
            { "Name": "Kiratveer singh", "Class": "BCA-1 A", "Roll no": 254282, "E-mail": "Kiratveersingh1212@gmail.com" },
            { "Name": "Yashkaran Singh", "Class": "BCA-|||", "Roll no": 254731, "E-mail": "yashkaransingh0827@gmail.com" },
            { "Name": "Khushpreet kaur", "Class": "Bsc Hons AI and Data science", "Roll no": "", "E-mail": "khushpreet11013@gmail.com" },
            { "Name": "Muskan Bairwal", "Class": "BSc. Hons AI and Data Sciences", "Roll no": 258532, "E-mail": "muskanbairwal@gmail.com" },
            { "Name": "Tamanna Devi", "Class": "BSc AI &DS 1year", "Roll no": 258484, "E-mail": "tamannadevi246@gmail.com" },
            { "Name": "Bhavnesh Shukla", "Class": "Bsc hons ( AI and Data Science) 1st year", "Roll no": 258493, "E-mail": "bhavneshshukla49@gmail.com" },
            { "Name": "Muskan", "Class": "Bca 3", "Roll no": 254709, "E-mail": "muskan240505@gmail.com" },
            { "Name": "Gopal Singh", "Class": "Bsc(hons) Ai& Data science", "Roll no": 258498, "E-mail": "gopal2006salopal@gmail.com" },
            { "Name": "Bindia", "Class": "BSc.(h)AI & DS", "Roll no": 258592, "E-mail": "vermabindia89@gmail.com" },
            { "Name": "Vaneeta kumari", "Class": "Bsc(hons) Artificial intelligence and data science", "Roll no": 258595, "E-mail": "vaneetagupta16@gmail.com" },
            { "Name": "Jasmeet kaur", "Class": "Bsc (Hons.)AI & DS", "Roll no": 258648, "E-mail": "jasmeetk4545@gmail.com" },
            { "Name": "Arshdeep Kaur", "Class": "Bsc AI&DS 3", "Roll no": 258650, "E-mail": "arshdeep30306@gmail.com" },
            { "Name": "Jassimar Kaur", "Class": "BCA 3", "Roll no": 254682, "E-mail": "jassimar98@gmail.com" },
            { "Name": "Alka verma", "Class": "BCA 3 year", "Roll no": 254706, "E-mail": "alka17765@gmail.com" },
            { "Name": "Rajwinder kaur", "Class": "Bsc(AI&DS)-3", "Roll no": 258649, "E-mail": "rajwinderapr2006@gmail.com" },
            { "Name": "Khushpreet kaur", "Class": "Bca first year", "Roll no": 254342, "E-mail": "khushpreetkaurmanes732@gmail.com" },
            { "Name": "Sehaj", "Class": "Bca 1", "Roll no": 254357, "E-mail": "shjsekhon07@gmail.com" },
            { "Name": "Lovely", "Class": "Bca1b", "Roll no": 254354, "E-mail": "lovelylovely0334@gmail.com" },
            { "Name": "MEHNAZ AKHTAR", "Class": "BCA 1", "Roll no": 254331, "E-mail": "Mehnazakhter00786@gmail.com" },
            { "Name": "Pragiya verma", "Class": "Bca 1st sem", "Roll no": 254350, "E-mail": "pragiyaverma34@gmail.com" },
            { "Name": "Simrandeep Kaur", "Class": "BCA 1", "Roll no": 254323, "E-mail": "simranmaan2006@gmail.com" }
        ];

        function loadInitialData() {
            loadUsersFromLocalStorage();
            if (registeredUsers.length === 0) {
                registeredUsers = preloadedStudentData.map(student => ({
                    name: student.Name,
                    class: student.Class,
                    roll: student['Roll no'] || 'N/A',
                    email: student['E-mail'],
                    password: generateRandomPassword(),
                    attendance: 'Absent',
                    isBlocked: false,
                    loginCount: 0,
                    lastLogin: 'Never'
                }));
                saveUsersToLocalStorage();
            }
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

        const showAppContent = () => {
            authOverlay.classList.add('hidden');
            adminPanel.classList.add('hidden');
            loginPrompt.classList.add('hidden');
            appContent.classList.remove('hidden');
            document.body.classList.remove('overflow-hidden');
            
            if (currentUser) {
                updateUIForLoggedInUser(currentUser);
            } else {
                updateUIForLoggedOutUser();
            }
        };

        const renderRecentlyRegisteredTable = () => {
            recentStudentDetailsBody.innerHTML = '';
            recentlyRegisteredUsers.forEach((user, index) => {
                const row = document.createElement('tr');
                row.className = 'border-b border-gray-800 hover:bg-gray-800/50';
                row.innerHTML = `
                    <td class="p-3">${index + 1}</td>
                    <td class="p-3">${user.name}</td>
                    <td class="p-3">${user.email}</td>
                    <td class="p-3">${user.password}</td>
                `;
                recentStudentDetailsBody.appendChild(row);
            });
        };

        const renderAdminDashboard = () => {
            studentCountEl.textContent = registeredUsers.length;
            studentDetailsBody.innerHTML = '';
            registeredUsers.forEach((user, index) => {
                const row = document.createElement('tr');
                row.className = 'border-b border-gray-800 hover:bg-gray-800/50';
                const attendanceStatusClass = user.attendance === 'Present' ? 'status-present' : 'status-absent';
                const blockButtonClass = user.isBlocked ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700';
                const blockButtonText = user.isBlocked ? 'Unblock' : 'Block';

                row.innerHTML = `
                    <td class="p-3">${index + 1}</td>
                    <td class="p-3">${user.name}</td>
                    <td class="p-3">${user.class}</td>
                    <td class="p-3">${user.roll}</td>
                    <td class="p-3">${user.email}</td>
                    <td class="p-3">${user.password}</td>
                    <td class="p-3"><span class="${attendanceStatusClass}">${user.attendance}</span></td>
                    <td class="p-3 text-center">${user.loginCount}</td>
                    <td class="p-3 text-sm">${user.lastLogin}</td>
                    <td class="p-3 flex gap-2">
                        <button data-email="${user.email}" class="toggle-block-btn text-white font-bold py-1 px-3 rounded-lg text-sm ${blockButtonClass}">
                            ${blockButtonText}
                        </button>
                        <button data-email="${user.email}" class="delete-btn text-white font-bold py-1 px-3 rounded-lg text-sm bg-red-600 hover:bg-red-700">
                            Delete
                        </button>
                    </td>
                `;
                studentDetailsBody.appendChild(row);
            });
            renderRecentlyRegisteredTable();
        };

        const showAdminPanel = () => {
            currentUser = { name: 'Admin', role: 'admin' };
            authOverlay.classList.add('hidden');
            appContent.classList.add('hidden');
            loginPrompt.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            document.body.classList.remove('overflow-hidden');
            renderAdminDashboard();
        };

        const showAuthScreen = () => {
            appContent.classList.add('hidden');
            adminPanel.classList.add('hidden');
            authOverlay.classList.remove('hidden');
            authOverlay.classList.add('flex');
            document.body.classList.add('overflow-hidden');
        };

        // Tab switching
        loginTab.addEventListener('click', () => {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            loginTab.classList.add('border-indigo-500', 'text-white');
            loginTab.classList.remove('border-transparent', 'text-gray-400');
            registerTab.classList.add('border-transparent', 'text-gray-400');
            registerTab.classList.remove('border-pink-500', 'text-white');
        });

        registerTab.addEventListener('click', () => {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            registerTab.classList.add('border-pink-500', 'text-white');
            registerTab.classList.remove('border-transparent', 'text-gray-400');
            loginTab.classList.add('border-transparent', 'text-gray-400');
            loginTab.classList.remove('border-indigo-500', 'text-white');
        });

        // Registration
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            registerError.textContent = '';
            const name = document.getElementById('register-name').value;
            const userClass = document.getElementById('register-class').value;
            const roll = document.getElementById('register-roll').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            if (!name || !userClass || !roll || !email || !password) {
                registerError.textContent = "Please fill out all fields.";
                return;
            }

            if (registeredUsers.some(user => user.email === email)) {
                registerError.textContent = "An account with this email already exists.";
                return;
            }

            const newUser = { name, class: userClass, roll, email, password, attendance: 'Absent', isBlocked: false, loginCount: 1, lastLogin: new Date().toLocaleString() };
            registeredUsers.push(newUser);
            recentlyRegisteredUsers.push(newUser);
            saveUsersToLocalStorage();
            currentUser = newUser;
            showAppContent();
        });

        // Login
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loginError.textContent = '';
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (email === 'admin@workshop.com' && password === 'admin123') {
                showAdminPanel();
                return;
            }

            const user = registeredUsers.find(u => u.email === email && u.password === password);
            if (user) {
                if (user.isBlocked) {
                    loginError.textContent = "This account has been blocked.";
                } else {
                    user.loginCount++;
                    user.lastLogin = new Date().toLocaleString();
                    saveUsersToLocalStorage();
                    currentUser = user;
                    showAppContent();
                }
            } else {
                loginError.textContent = "Invalid email or password.";
            }
        });

        // Logout
        const handleLogout = () => {
            currentUser = null;
            window.location.reload();
        };
        logoutButton.addEventListener('click', handleLogout);
        mobileLogoutButton.addEventListener('click', handleLogout);
        adminLogoutButton.addEventListener('click', handleLogout);

        // --- Admin Actions ---
        studentDetailsBody.addEventListener('click', (e) => {
            const target = e.target;
            const userEmail = target.dataset.email;
            if (!userEmail) return;

            const userIndex = registeredUsers.findIndex(u => u.email === userEmail);
            if (userIndex === -1) return;

            if (target.classList.contains('toggle-block-btn')) {
                registeredUsers[userIndex].isBlocked = !registeredUsers[userIndex].isBlocked;
            } else if (target.classList.contains('delete-btn')) {
                registeredUsers.splice(userIndex, 1);
            }
            
            saveUsersToLocalStorage();
            renderAdminDashboard();
        });

        adminAddUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            adminAddUserStatus.textContent = '';
            const name = document.getElementById('admin-add-name').value;
            const userClass = document.getElementById('admin-add-class').value;
            const roll = document.getElementById('admin-add-roll').value;
            const email = document.getElementById('admin-add-email').value;
            const password = document.getElementById('admin-add-password').value;

            if (!name || !userClass || !roll || !email || !password) {
                adminAddUserStatus.textContent = "Please fill out all fields.";
                adminAddUserStatus.className = "text-sm text-center mt-3 h-4 text-red-400";
                return;
            }

            if (registeredUsers.some(user => user.email === email)) {
                adminAddUserStatus.textContent = "An account with this email already exists.";
                adminAddUserStatus.className = "text-sm text-center mt-3 h-4 text-red-400";
                return;
            }

            const newUser = { name, class: userClass, roll, email, password, attendance: 'Absent', isBlocked: false, loginCount: 0, lastLogin: 'Never' };
            registeredUsers.push(newUser);
            recentlyRegisteredUsers.push(newUser);
            saveUsersToLocalStorage();
            renderAdminDashboard();
            adminAddUserForm.reset();
            adminAddUserStatus.textContent = "Student added successfully!";
            adminAddUserStatus.className = "text-sm text-center mt-3 h-4 text-green-400";
        });

        // --- Attendance Logic ---
        const updateAttendanceTimer = () => {
            const now = new Date().getTime();
            const remaining = attendanceSession.expiry - now;

            if (remaining > 0) {
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                attendanceTimerEl.textContent = `Session expires in: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                attendanceTimerEl.textContent = "Session Expired";
                qrCodeArea.classList.add('hidden');
                clearInterval(attendanceTimerInterval);
                attendanceSession.key = null;
                attendanceSession.expiry = null;
                saveSessionToLocalStorage();
            }
        };
        
        startAttendanceBtn.addEventListener('click', () => {
            attendanceSession.key = Math.floor(100000 + Math.random() * 900000).toString();
            attendanceSession.expiry = new Date().getTime() + 30 * 60 * 1000;
            registeredUsers.forEach(user => user.attendance = 'Absent');
            qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${attendanceSession.key}`;
            qrCodeText.textContent = attendanceSession.key;
            qrCodeArea.classList.remove('hidden');
            
            if(attendanceTimerInterval) clearInterval(attendanceTimerInterval);
            attendanceTimerInterval = setInterval(updateAttendanceTimer, 1000);
            updateAttendanceTimer();

            saveUsersToLocalStorage();
            saveSessionToLocalStorage();
            renderAdminDashboard();
        });

        attendanceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredCode = attendanceCodeInput.value;
            
            if (!currentUser || currentUser.role === 'admin') {
                attendanceStatusMessage.textContent = "Only logged-in students can mark attendance.";
                attendanceStatusMessage.className = "mt-4 h-5 text-yellow-400";
                return;
            }

            if (new Date().getTime() > attendanceSession.expiry) {
                attendanceStatusMessage.textContent = "Attendance session has expired.";
                attendanceStatusMessage.className = "mt-4 h-5 text-red-400";
                return;
            }

            if (enteredCode === attendanceSession.key) {
                const user = registeredUsers.find(u => u.email === currentUser.email);
                if (user) {
                    user.attendance = 'Present';
                    attendanceStatusMessage.textContent = "Success! Your attendance has been marked.";
                    attendanceStatusMessage.className = "mt-4 h-5 text-green-400";
                    saveUsersToLocalStorage();
                }
            } else {
                attendanceStatusMessage.textContent = "Invalid code. Please try again.";
                attendanceStatusMessage.className = "mt-4 h-5 text-red-400";
            }
            attendanceCodeInput.value = '';
        });

        // --- Excel Upload Logic ---
        excelUploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const file = excelFileInput.files[0];
            if (!file) {
                excelUploadStatus.textContent = "Please select a file.";
                excelUploadStatus.className = "text-sm text-center mt-3 h-auto text-red-400";
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);

                    let newUsersCount = 0;
                    let skippedDuplicateCount = 0;
                    let skippedInvalidCount = 0;

                    json.forEach((row, index) => {
                        const Name = row.Name;
                        const Class = row.Class;
                        const Roll = row['Roll no'];
                        const Email = row['E-mail'];

                        if (Name && Class && Roll && Email) {
                            if (registeredUsers.some(user => user.email === Email)) {
                                skippedDuplicateCount++;
                            } else {
                                const newUser = {
                                    name: Name,
                                    class: Class,
                                    roll: Roll,
                                    email: Email,
                                    password: generateRandomPassword(),
                                    attendance: 'Absent',
                                    isBlocked: false,
                                    loginCount: 0,
                                    lastLogin: 'Never'
                                };
                                registeredUsers.push(newUser);
                                recentlyRegisteredUsers.push(newUser);
                                newUsersCount++;
                            }
                        } else {
                            skippedInvalidCount++;
                            console.warn(`Skipping invalid row ${index + 2} in Excel file due to missing data:`, row);
                        }
                    });

                    saveUsersToLocalStorage();
                    renderAdminDashboard();
                    
                    let statusMessage = `Added: ${newUsersCount}.`;
                    let statusColor = "text-green-400";

                    if (skippedDuplicateCount > 0 || skippedInvalidCount > 0) {
                        statusColor = "text-yellow-400";
                        if (skippedDuplicateCount > 0) {
                            statusMessage += ` Skipped duplicates: ${skippedDuplicateCount}.`;
                        }
                        if (skippedInvalidCount > 0) {
                            statusMessage += ` Skipped invalid: ${skippedInvalidCount}.`;
                        }
                    }
                    
                    excelUploadStatus.textContent = statusMessage;
                    excelUploadStatus.className = `text-sm text-center mt-3 h-auto ${statusColor}`;
                    excelUploadForm.reset();

                } catch (error) {
                    console.error("Excel parsing error:", error);
                    excelUploadStatus.textContent = "Error reading the Excel file.";
                    excelUploadStatus.className = "text-sm text-center mt-3 h-auto text-red-400";
                }
            };
            reader.onerror = () => {
                excelUploadStatus.textContent = "Failed to read file.";
                excelUploadStatus.className = "text-sm text-center mt-3 h-auto text-red-400";
            };
            reader.readAsArrayBuffer(file);
        });


        // --- Mobile Menu Toggle ---
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // --- Generic Gemini API Caller with Exponential Backoff ---
        const callGeminiAPI = async (prompt, type = 'general') => {
            let finalPrompt = prompt;
            if (type === 'general') {
                finalPrompt = `Summarize the following text in a single, simple paragraph: ${prompt}`;
            } else if (type === 'project') {
                finalPrompt = `Generate a creative project idea based on the following as a simple paragraph: ${prompt}`;
            } else if (type === 'notes') {
                finalPrompt = `Generate study notes for the following topic as a simple paragraph: ${prompt}`;
            }

            const apiKey = ""; // Leave empty, Canvas will handle it.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${"AIzaSyBWudgf3QBZl1MY7fAjE7esL81MXk95pLI"}`;
            const payload = { contents: [{ role: "user", parts: [{ text: finalPrompt }] }] };
            let retries = 3, delay = 1000;
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    if (!response.ok) throw new Error(`API Error: ${response.status}`);
                    const result = await response.json();
                    if (result.candidates?.[0]?.content?.parts?.[0]?.text) return result.candidates[0].content.parts[0].text;
                    else throw new Error("Unexpected response format.");
                } catch (error) {
                    console.error(`Attempt ${i + 1} failed:`, error);
                    if (i === retries - 1) throw error;
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                }
            }
        };

        // --- Main "Try Gemini" Feature ---
        const geminiForm = document.getElementById('gemini-form');
        const generateButton = document.getElementById('generate-button');
        const buttonText = document.getElementById('button-text');
        const promptInput = document.getElementById('prompt-input');
        const geminiOutput = document.getElementById('gemini-output');
        const responseLoader = document.getElementById('response-loader');
        const errorMessage = document.getElementById('error-message');

        geminiForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const prompt = promptInput.value.trim();
            if (!prompt) {
                errorMessage.textContent = 'Please enter a prompt.';
                errorMessage.classList.remove('hidden');
                return;
            }
            geminiOutput.textContent = '';
            errorMessage.classList.add('hidden');
            responseLoader.style.display = 'flex';
            generateButton.disabled = true;
            buttonText.textContent = 'Generating...';
            try {
                geminiOutput.textContent = (await callGeminiAPI(prompt, 'general')).trim();
            } catch (error) {
                errorMessage.textContent = `An error occurred. Please try again.`;
                errorMessage.classList.remove('hidden');
                geminiOutput.textContent = 'Failed to get a response.';
            } finally {
                responseLoader.style.display = 'none';
                generateButton.disabled = false;
                buttonText.textContent = 'Generate Response';
            }
        });

        // --- ✨ New Feature: Suggest a Project Idea ---
        const suggestProjectBtn = document.getElementById('suggest-project-btn');
        suggestProjectBtn.addEventListener('click', async () => {
            const projectPrompt = "A simple but creative project idea for a student learning the Gemini API. The project should be achievable within a few hours.";
            promptInput.value = "Suggesting a project idea...";
            geminiOutput.textContent = '';
            errorMessage.classList.add('hidden');
            responseLoader.style.display = 'flex';
            generateButton.disabled = true;
            suggestProjectBtn.disabled = true;
            try {
                geminiOutput.textContent = (await callGeminiAPI(projectPrompt, 'project')).trim();
                promptInput.value = ""; 
            } catch (error) {
                 errorMessage.textContent = `An error occurred. Please try again.`;
                errorMessage.classList.remove('hidden');
                geminiOutput.textContent = 'Failed to get a project suggestion.';
            } finally {
                responseLoader.style.display = 'none';
                generateButton.disabled = false;
                suggestProjectBtn.disabled = false;
            }
        });

        // --- ✨ New Feature: Study Notes Modal ---
        const notesModal = document.getElementById('notes-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        const modalLoader = document.getElementById('modal-loader');
        const modalError = document.getElementById('modal-error');
        const generateNotesBtns = document.querySelectorAll('.generate-notes-btn');

        const openModal = () => notesModal.classList.remove('hidden');
        const closeModal = () => notesModal.classList.add('hidden');

        closeModalBtn.addEventListener('click', closeModal);
        notesModal.addEventListener('click', (e) => { if (e.target === notesModal) closeModal(); });

        generateNotesBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const topic = btn.dataset.topic;
                openModal();
                modalTitle.textContent = `Study Notes: ${topic}`;
                modalContent.innerHTML = '';
                modalError.classList.add('hidden');
                modalLoader.style.display = 'flex';
                try {
                    modalContent.textContent = (await callGeminiAPI(topic, 'notes')).trim();
                } catch (error) {
                    modalError.textContent = `Failed to generate notes. Please try again.`;
                    modalError.classList.remove('hidden');
                } finally {
                    modalLoader.style.display = 'none';
                }
            });
        });

        // --- Initialize App ---
        const initializeApp = () => {
            loadInitialData();
            loadSessionFromLocalStorage();
            
            if (attendanceSession.key && new Date().getTime() < attendanceSession.expiry) {
                if (attendanceTimerInterval) clearInterval(attendanceTimerInterval);
                attendanceTimerInterval = setInterval(updateAttendanceTimer, 1000);
            }

            showAppContent(); // Show main content by default

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

