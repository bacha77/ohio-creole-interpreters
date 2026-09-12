document.addEventListener('DOMContentLoaded', () => {
    // -- FIREBASE AUTHENTICATION --
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const btnLogout = document.getElementById('btn-logout');

    // Wait slightly to ensure module loaded
    setTimeout(() => {
        if (window.firebaseAuth) {
            const { auth, loginUser, logoutUser, onAuthStateChanged } = window.firebaseAuth;

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    loginOverlay.classList.add('hidden');
                } else {
                    loginOverlay.classList.remove('hidden');
                }
            });

            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('login-email').value;
                    const password = document.getElementById('login-password').value;
                    
                    try {
                        loginError.style.display = 'none';
                        await loginUser(email, password);
                    } catch (error) {
                        loginError.textContent = "Invalid email or password.";
                        loginError.style.display = 'block';
                    }
                });
            }

            if (btnLogout) {
                btnLogout.addEventListener('click', async () => {
                    await logoutUser();
                });
            }

            // -- FIRESTORE DATABASE LOGIC --
            const { db, collection, addDoc, getDocs } = window.firebaseDb;

            // Load Interpreters
            const loadInterpreters = async () => {
                const rosterTbody = document.getElementById('roster-tbody');
                if (!rosterTbody) return;
                
                try {
                    const querySnapshot = await getDocs(collection(db, "interpreters"));
                    rosterTbody.innerHTML = ''; // Clear table
                    
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        const tr = document.createElement('tr');
                        
                        let statusClass = data.status === 'Active' ? 'badge-success' : 'badge-warning';

                        tr.innerHTML = `
                            <td>${data.name}</td>
                            <td>${data.phone}</td>
                            <td>${data.location}</td>
                            <td>${data.certification}</td>
                            <td><span class="${statusClass}">${data.status || 'Active'}</span></td>
                            <td><button class="btn-icon"><i class="fa-solid fa-ellipsis-vertical"></i></button></td>
                        `;
                        rosterTbody.appendChild(tr);
                    });
                } catch (error) {
                    console.error("Error fetching interpreters:", error);
                }
            };

            // Call load immediately if on dashboard
            loadInterpreters();

            // Handle Add Interpreter Modal
            const btnAddInterpreter = document.getElementById('btn-add-interpreter');
            const addInterpreterOverlay = document.getElementById('add-interpreter-overlay');
            const closeInterpreterModal = document.getElementById('close-interpreter-modal');
            const addInterpreterForm = document.getElementById('add-interpreter-form');

            if (btnAddInterpreter) {
                btnAddInterpreter.addEventListener('click', () => {
                    addInterpreterOverlay.classList.remove('hidden');
                });
            }

            if (closeInterpreterModal) {
                closeInterpreterModal.addEventListener('click', () => {
                    addInterpreterOverlay.classList.add('hidden');
                });
            }

            if (addInterpreterForm) {
                addInterpreterForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const newInterpreter = {
                        name: document.getElementById('int-name').value,
                        phone: document.getElementById('int-phone').value,
                        location: document.getElementById('int-location').value,
                        certification: document.getElementById('int-cert').value,
                        status: 'Active',
                        createdAt: new Date().toISOString()
                    };

                    try {
                        const submitBtn = addInterpreterForm.querySelector('button[type="submit"]');
                        submitBtn.textContent = 'Saving...';
                        
                        // Write to Firestore
                        await addDoc(collection(db, "interpreters"), newInterpreter);
                        
                        // Reset and close modal
                        addInterpreterForm.reset();
                        addInterpreterOverlay.classList.add('hidden');
                        submitBtn.textContent = 'Save Interpreter';
                        
                        // Reload the table
                        loadInterpreters();
                    } catch (error) {
                        console.error("Error adding interpreter:", error);
                        alert("Failed to add interpreter to database.");
                    }
                });
            }
        }
    }, 500);

    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const targetId = item.getAttribute('data-target');
            
            // If it's a link to an external page (like Back to Site), let it act normally
            if(!targetId) return;
            
            e.preventDefault();

            // Update active nav state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Switch views
            viewSections.forEach(section => {
                section.classList.remove('active');
                if(section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });

    // -- BOOKKEEPING LOGIC --
    const bookkeepingTable = document.querySelector('#bookkeeping-view .data-table tbody');
    if (bookkeepingTable) {
        // Recalculate payout when hours or rate changes
        bookkeepingTable.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                const row = e.target.closest('tr');
                const hoursInput = row.querySelector('input[type="number"]');
                const rateSelect = row.querySelector('select');
                const payoutCell = row.querySelector('td:nth-child(5) strong');
                
                if (hoursInput && rateSelect && payoutCell) {
                    const hours = parseFloat(hoursInput.value) || 0;
                    const rate = parseFloat(rateSelect.value) || 0;
                    const total = (hours * rate).toFixed(2);
                    payoutCell.textContent = `$${total}`;
                }
            }
        });

        // "Mark Paid" functionality
        bookkeepingTable.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-primary') && e.target.textContent.trim() === 'Mark Paid') {
                const row = e.target.closest('tr');
                const statusBadge = row.querySelector('.status');
                
                // Change status badge
                statusBadge.textContent = 'Paid';
                statusBadge.classList.remove('badge-warning');
                statusBadge.classList.add('badge-success');
                
                // Change button to receipt icon
                const btnContainer = e.target.parentElement;
                btnContainer.innerHTML = '<button class="btn-icon"><i class="fa-solid fa-file-invoice"></i></button>';
            }
        });
    }

    // -- DAILY SCHEDULE LOGIC --
    const scheduleTable = document.querySelector('#schedule-view .data-table tbody');
    if (scheduleTable) {
        // "Save" functionality
        scheduleTable.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-primary') && e.target.textContent.trim() === 'Save') {
                const row = e.target.closest('tr');
                const dropdown = row.querySelector('select');
                const statusBadge = row.querySelector('.status');
                
                if (dropdown && dropdown.value !== "") {
                    // Change status to Dispatched
                    statusBadge.textContent = 'Dispatched';
                    statusBadge.classList.remove('badge-warning');
                    statusBadge.classList.add('badge-success');
                    
                    // Replace dropdown with plain text name
                    const selectedName = dropdown.options[dropdown.selectedIndex].text;
                    const cell = dropdown.parentElement;
                    cell.innerHTML = `<strong>${selectedName}</strong>`;
                    
                    // Change button to Edit icon
                    const btnContainer = e.target.parentElement;
                    btnContainer.innerHTML = '<button class="btn-icon"><i class="fa-solid fa-pen"></i></button>';
                } else {
                    alert("Please select a contractor before saving.");
                }
            }
        });
    }

    // -- GLOBAL BUTTON ALERTS (Placeholder for backend) --
    document.querySelectorAll('.btn-primary').forEach(btn => {
        if (!btn.hasAttribute('onclick') && !btn.closest('td') && !btn.closest('#login-form')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                alert("This feature will be fully functional once the backend database is connected!");
            });
        }
    });
});
