let state = {
    students: [
        { id: 'S101', name: 'Alex Johnson', course: 'Computer Science', contact: '555-0101', status: 'Checked In', roomId: '101' },
        { id: 'S102', name: 'Maria Garcia', course: 'Engineering', contact: '555-0102', status: 'Checked Out', roomId: null },
        { id: 'S103', name: 'James Smith', course: 'Mathematics', contact: '555-0103', status: 'Checked In', roomId: '102' }
    ],
    rooms: [
        { number: '101', type: 'Single', status: 'Occupied', occupantId: 'S101' },
        { number: '102', type: 'Double', status: 'Occupied', occupantId: 'S103' },
        { number: '103', type: 'Single', status: 'Available', occupantId: null },
        { number: '104', type: 'Double', status: 'Available', occupantId: null },
        { number: '201', type: 'Suite', status: 'Available', occupantId: null },
        { number: '202', type: 'Double', status: 'Available', occupantId: null }
    ],
    wardens: [
        { id: 'W01', name: 'Robert Brown', shift: 'Morning / Block A', contact: '555-9001', status: 'Active' },
        { id: 'W02', name: 'Linda Davis', shift: 'Night / Block B', contact: '555-9002', status: 'Active' }
    ],
    activities: [
        { action: 'Check In', studentName: 'Alex Johnson', room: '101', date: new Date().toLocaleDateString() },
        { action: 'Check In', studentName: 'James Smith', room: '102', date: new Date().toLocaleDateString() }
    ]
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);

    initNavigation();
    refreshAllViews();
});

// --- Date & Time ---
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('datetime').textContent = now.toLocaleDateString('en-US', options);
}

// --- Navigation Logic ---
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');

            // Update active link
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update active view
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === targetId) {
                    view.classList.add('active');
                }
            });

            // Refresh data when navigating
            refreshAllViews();
        });
    });

    // Room Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderRooms(btn.getAttribute('data-filter'));
        });
    });
}

// --- Refresh Display ---
function refreshAllViews() {
    updateDashboardStats();
    renderStudents();
    renderRooms('all');
    renderWardens();
    populateCheckInOutDropdowns();
}

// --- Render Dashboard ---
function updateDashboardStats() {
    document.getElementById('stat-total-students').textContent = state.students.length;

    const available = state.rooms.filter(r => r.status === 'Available').length;
    const occupied = state.rooms.filter(r => r.status === 'Occupied').length;

    document.getElementById('stat-available-rooms').textContent = available;
    document.getElementById('stat-occupied-rooms').textContent = occupied;
    document.getElementById('stat-total-wardens').textContent = state.wardens.length;

    // Recent Activity
    const tbody = document.getElementById('recent-activity-body');
    tbody.innerHTML = '';
    state.activities.slice().reverse().forEach(act => {
        const badgeClass = act.action.includes('In') ? 'success' : 'danger';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge ${badgeClass}">${act.action}</span></td>
            <td>${act.studentName}</td>
            <td>${act.room || '-'}</td>
            <td>${act.date}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Render Students ---
function renderStudents() {
    const tbody = document.getElementById('student-table-body');
    tbody.innerHTML = '';
    state.students.forEach(student => {
        const badgeClass = student.status === 'Checked In' ? 'success' : 'warning';
        const roomDisp = student.roomId ? `(Room ${student.roomId})` : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${student.id}</td>
            <td><strong>${student.name}</strong></td>
            <td>${student.course}</td>
            <td>${student.contact}</td>
            <td><span class="badge ${badgeClass}">${student.status}</span> <small>${roomDisp}</small></td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Render Rooms ---
function renderRooms(filter) {
    const grid = document.getElementById('rooms-grid');
    grid.innerHTML = '';

    let filteredRooms = state.rooms;
    if (filter === 'available') filteredRooms = state.rooms.filter(r => r.status === 'Available');
    if (filter === 'occupied') filteredRooms = state.rooms.filter(r => r.status === 'Occupied');

    filteredRooms.forEach(room => {
        const isOccupied = room.status === 'Occupied';
        const badgeClass = isOccupied ? 'danger' : 'success';
        const occupantDisp = isOccupied ? `Occupant: ${state.students.find(s => s.id === room.occupantId)?.name || 'Unknown'}` : 'Ready for check-in';

        const card = document.createElement('div');
        card.className = `room-card ${isOccupied ? 'occupied' : ''}`;
        card.innerHTML = `
            <div class="room-header">
                <span class="room-number">Room ${room.number}</span>
                <span class="badge ${badgeClass}">${room.status}</span>
            </div>
            <div class="room-details">
                <p><i class="fa-solid fa-bed"></i> Type: ${room.type}</p>
                <p style="margin-top: 8px;">${occupantDisp}</p>
            </div>
            ${isOccupied
                ? '<button class="btn btn-primary w-full" style="opacity: 0.8; cursor: default;">Currently In Use</button>'
                : `<button class="btn btn-primary w-full" onclick="openBookingModal('${room.number}')">Book Online Now</button>`
            }
        `;
        grid.appendChild(card);
    });
}

// --- Render Wardens ---
function renderWardens() {
    const tbody = document.getElementById('warden-table-body');
    tbody.innerHTML = '';
    state.wardens.forEach(warden => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${warden.name}</strong></td>
            <td>${warden.shift}</td>
            <td>${warden.contact}</td>
            <td><span class="badge success">${warden.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Check In / Out Logic ---
function toggleCheckinFields() {
    const action = document.getElementById('action-type').value;
    const roomGroup = document.getElementById('room-selection-group');
    if (action === 'checkout') {
        roomGroup.style.display = 'none';
        document.getElementById('select-room').removeAttribute('required');
    } else {
        roomGroup.style.display = 'block';
        document.getElementById('select-room').setAttribute('required', 'true');
    }
    populateCheckInOutDropdowns();
}

function populateCheckInOutDropdowns() {
    const action = document.getElementById('action-type').value;
    const studentSelect = document.getElementById('select-student');
    const roomSelect = document.getElementById('select-room');

    studentSelect.innerHTML = '<option value="">-- Choose Student --</option>';
    roomSelect.innerHTML = '<option value="">-- Choose Available Room --</option>';

    if (action === 'checkin') {
        // Only show students who are Checked Out
        state.students.filter(s => s.status === 'Checked Out').forEach(s => {
            studentSelect.innerHTML += `<option value="${s.id}">${s.name} (${s.id})</option>`;
        });
        // Show Available Rooms
        state.rooms.filter(r => r.status === 'Available').forEach(r => {
            roomSelect.innerHTML += `<option value="${r.number}">Room ${r.number} - ${r.type}</option>`;
        });
    } else {
        // Only show students who are Checked In
        state.students.filter(s => s.status === 'Checked In').forEach(s => {
            studentSelect.innerHTML += `<option value="${s.id}">${s.name} (Room ${s.roomId})</option>`;
        });
    }
}

function handleCheckInOut(e) {
    e.preventDefault();
    const action = document.getElementById('action-type').value;
    const studentId = document.getElementById('select-student').value;
    const roomId = document.getElementById('select-room').value;

    const student = state.students.find(s => s.id === studentId);

    if (action === 'checkin') {
        const room = state.rooms.find(r => r.number === roomId);

        student.status = 'Checked In';
        student.roomId = room.number;

        room.status = 'Occupied';
        room.occupantId = student.id;

        state.activities.push({
            action: 'Check In',
            studentName: student.name,
            room: room.number,
            date: new Date().toLocaleDateString()
        });
        alert(`Successfully Checked In ${student.name} to Room ${room.number}`);
    } else {
        const room = state.rooms.find(r => r.number === student.roomId);

        student.status = 'Checked Out';
        student.roomId = null;

        if (room) {
            room.status = 'Available';
            room.occupantId = null;
        }

        state.activities.push({
            action: 'Check Out',
            studentName: student.name,
            room: room ? room.number : 'N/A',
            date: new Date().toLocaleDateString()
        });
        alert(`Successfully Checked Out ${student.name}`);
    }

    e.target.reset();
    toggleCheckinFields();
    refreshAllViews();
}

// --- Modals and Forms ---
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal.classList.contains('show')) {
        modal.classList.remove('show');
    } else {
        modal.classList.add('show');
    }
}

function handleAddStudent(e) {
    e.preventDefault();
    const name = document.getElementById('student-name').value;
    const course = document.getElementById('student-course').value;
    const contact = document.getElementById('student-contact').value;

    const newId = 'S' + (100 + state.students.length + 1);

    state.students.push({
        id: newId,
        name: name,
        course: course,
        contact: contact,
        status: 'Checked Out',
        roomId: null
    });

    e.target.reset();
    toggleModal('add-student-modal');
    refreshAllViews();
    alert('Student added successfully!');
}

function openBookingModal(roomNumber) {
    document.getElementById('booking-room-number-display').textContent = 'Room ' + roomNumber;
    document.getElementById('booking-room-number').value = roomNumber;
    document.getElementById('book-room-form').reset();
    toggleModal('book-room-modal');
}

function handleOnlineBooking(e) {
    e.preventDefault();
    const roomNumber = document.getElementById('booking-room-number').value;
    const name = document.getElementById('booking-name').value;
    const course = document.getElementById('booking-course').value;
    const contact = document.getElementById('booking-contact').value;

    const newId = 'S' + (100 + state.students.length + 1);

    state.students.push({
        id: newId,
        name: name,
        course: course,
        contact: contact,
        status: 'Checked In',
        roomId: roomNumber
    });

    const room = state.rooms.find(r => r.number === roomNumber);
    if (room) {
        room.status = 'Occupied';
        room.occupantId = newId;
    }

    state.activities.push({
        action: 'Online Booking',
        studentName: name,
        room: roomNumber,
        date: new Date().toLocaleDateString()
    });

    e.target.reset();
    toggleModal('book-room-modal');
    refreshAllViews();
    alert(`Successfully booked Room ${roomNumber} for ${name}!`);
}

// --- Logout Logic ---
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

// Close dropdown if clicked outside
document.addEventListener('click', function(event) {
    const profile = document.querySelector('.profile');
    const dropdown = document.getElementById('profile-dropdown');
    if (profile && !profile.contains(event.target)) {
        if(dropdown) dropdown.style.display = 'none';
    }
});

function handleLogout() {
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('main-layout').style.display = 'none';
    document.getElementById('profile-dropdown').style.display = 'none';
    
    // Clear login fields
    document.getElementById('login-id').value = '';
    document.getElementById('login-password').value = '';
    
    alert('You have successfully logged out.');
}

// --- Login Logic ---
function handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById('login-role').value;
    const userId = document.getElementById('login-id').value.toUpperCase();

    let isAuth = false;
    let userName = '';

    if (role === 'student') {
        const student = state.students.find(s => s.id === userId);
        if (student) {
            isAuth = true;
            userName = student.name;
        }
    } else if (role === 'warden') {
        const warden = state.wardens.find(w => w.id === userId);
        if (warden) {
            isAuth = true;
            userName = warden.name;
        }
    }

    if (isAuth) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('main-layout').style.display = 'flex';
        
        // Update profile image and name
        const profileImg = document.querySelector('.profile img');
        if (profileImg) {
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff`;
            profileImg.alt = userName;
        }

        alert(`Welcome, ${userName}!`);
    } else {
        alert('Invalid User ID for the selected role. Hint: Use "S101" for a student or "W01" for a warden.');
    }
}
