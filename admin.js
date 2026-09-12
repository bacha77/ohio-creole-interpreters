document.addEventListener('DOMContentLoaded', () => {
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
        if (!btn.hasAttribute('onclick') && !btn.closest('td')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                alert("This feature will be fully functional once the backend database is connected!");
            });
        }
    });
});
