// DOM Elements
const driverNameSpan = document.getElementById('driver-name');
const queuedRidesList = document.getElementById('queued-rides-list');
const ongoingQueueList = document.getElementById('ongoing-queue-list');
const scheduledQueueList = document.getElementById('scheduled-queue-list');
const doneQueueList = document.getElementById('Done-Rides-List')
const cancelledQueueList = document.getElementById('Cancelled-Rides-List')
const queueRideModal = document.getElementById('queueRideModal');
const queueRideBtn = document.getElementById('queueRideBtn');
const closeQueueRideModalBtn = document.getElementById('closeQueueRideModalBtn');
const queueRideForm = document.getElementById('queueRideForm');
const logoutBtn = document.getElementById('logoutBtn');
const addVehicleLink = document.querySelector('li a[href="#addVehicleModal"]');
const addVehicleModal = document.getElementById('addVehicleModal');
const closeAddVehicleModalBtn = document.getElementById('closeAddVehicleModalBtn');
 // Create and append modal container for popups
 const modalContainer = document.createElement('div');
 modalContainer.id = 'popup-modal';
 modalContainer.innerHTML = `
     <div class="modal-content">
         <p id="modal-message"></p>
         <button id="close-modal">Close</button>
     </div>
 `;
 document.body.appendChild(modalContainer);
 console.log('Modal container appended:', modalContainer);
 
 // Modal styles
 const modalStyles = document.createElement('style');
 modalStyles.textContent = `
 #popup-modal {
     display: none;
     position: fixed;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     background: rgba(0, 0, 0, 0.6);
     justify-content: center;
     align-items: center;
     z-index: 1000;
 }
 .modal-content {
     background: #1b1b1b;
     color: #f8f8f8;
     padding: 20px;
     border-radius: 10px;
     box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
     text-align: center;
     width: 50%;
     max-width: 400px;
 }
 .modal-content button {
     margin-top: 15px;
     background: #ff0000;
     border: none;
     padding: 10px 20px;
     color: #fff;
     border-radius: 5px;
     cursor: pointer;
     transition: background 0.3s;
 }
 .modal-content button:hover {
     background: #cc0000;
 }
 `;
 document.head.appendChild(modalStyles);
 
 const showModal = (message, callback = null) => {
     const modal = document.getElementById('popup-modal');
     const messageContainer = document.getElementById('modal-message');
     const closeButton = document.getElementById('close-modal');
 
     messageContainer.textContent = message;
     modal.style.display = 'flex';
     console.log('Modal is now visible:', modal.style.display);  // Debugging
     closeButton.onclick = () => {
         modal.style.display = 'none';
         if (callback) callback(); // Execute callback if provided
     };
 };
// Utility Functions
function formatCurrency(value) {
    return `₱${(isNaN(value) || value === null ? 0 : parseFloat(value)).toFixed(2)}`;
}

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

async function fetchData(route) {
    try {
        const response = await fetch(route);
        if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Load Driver Data
async function loadDriverData() {
    try {
        const driverData = await fetchData('/api/driver-dashboard');
        if (!driverData) throw new Error('Driver data is undefined');
        
        if (driverNameSpan) driverNameSpan.textContent = driverData.name;
        loadQueuedRides(driverData.queuedRides);
        loadOngoingQueue(driverData.ongoingQueue);
        loadScheduledRides(driverData.scheduledRides);
        loadRidesHistory([...driverData.doneRides, ...driverData.cancelledRides]);
    } catch (error) {
        console.error('Error loading driver data:', error);
    }
}

// Modal Functions
function openQueueRideModal() {
    if (queueRideModal) queueRideModal.style.display = "block";
}

function closeQueueRideModal() {
    if (queueRideModal) queueRideModal.style.display = "none";
}

// Populate Vehicles Dropdown
async function populateVehicleDropdown() {
    const vehicleSelect = document.getElementById('vehicle-id');
    if (!vehicleSelect) return;

    vehicleSelect.innerHTML = '';

    try {
        const vehicles = await fetchData('/api/driver-dashboard/getVehicles');
        if (vehicles?.length) {
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.vehicle_id;
                option.textContent = vehicle.plate_number;
                vehicleSelect.appendChild(option);
            });
        } else {
            vehicleSelect.innerHTML = '<option value="">No vehicles available</option>';
        }
    } catch {
        vehicleSelect.innerHTML = '<option value="">Error loading vehicles</option>';
    }
}

// Fare Calculator
function calculateFare(startLocation, endLocation) {
    const fareMap = {
        'Igorot Garden': {
            'Barangay Hall': 12,
            'Holy Family Parish Church': 12,
            'SLU Mary Heights': 13,
            'Phase 1': 13,
            'Phase 2': 13,
            'Phase 3': 14
        },
        'Barangay Hall': {
            'Igorot Garden': 12,
            'SM Baguio': 12,
            'Burnham Park': 12,
            'SLU Mary Heights': 13,
            'Phase 1': 13,
            'Phase 2': 13,
            'Phase 3': 14

        },
        'SLU Mary Heights': {
            'Holy Family Parish Church': 12,
            'Barangay Hall': 10,
            'SM Baguio': 13,
            'Burnham Park': 13,
            'Igorot Garden': 13
        },
        'Phase 3': {
            'SLU Mary Heights': 10,
            'Holy Family Parish Church': 12,
            'Barangay Hall': 10,
            'SM Baguio': 14,
            'Burnham Park': 14,
            'Igorot Garden': 14
        }
    };

    return fareMap[startLocation]?.[endLocation] || 0;
}

// DateTime Functions
function setupDateTimePicker() {
    const scheduleTimeInput = document.getElementById('schedule-time');
    if (!scheduleTimeInput) return;

    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);

    scheduleTimeInput.min = formatLocalDateTime(now);
    scheduleTimeInput.step = 900;

    scheduleTimeInput.addEventListener('input', () => {
        const selectedTime = new Date(scheduleTimeInput.value);
        const roundedTime = roundToNearest15Minutes(selectedTime);
        scheduleTimeInput.value = formatLocalDateTime(roundedTime);
    });
}

function roundToNearest15Minutes(date) {
    const rounded = new Date(date);
    rounded.setSeconds(0, 0);
    rounded.setMinutes(Math.round(rounded.getMinutes() / 15) * 15);
    return rounded;
}

// Helper function to format a Date object as local "YYYY-MM-DDTHH:MM"
function formatLocalDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Form Submission Handlers
async function submitQueueRideForm(event) {
    event.preventDefault();
    const currentUser = await getCurrentUser();
    if (!currentUser?.user_id) {
        showModal("Unable to fetch user data. Please try again.");
        return;
    }

    const formData = new FormData(event.target);
    const startLocation = formData.get("start-location");
    const endLocation = formData.get("end-location");
    const fare = calculateFare(startLocation, endLocation);

    if (fare === 0) {
        showModal("Invalid start or end location. Please try again.");
        return;
    }

    const payload = {
        driver_id: currentUser.user_id,
        vehicle_id: formData.get("vehicle-id"),
        start_location: startLocation,
        end_location: endLocation,
        fare: fare,
        type: formData.get("ride-type")
    };

    if (payload.type === "scheduled") {
        const scheduleTime = formData.get("schedule-time");
        const selectedTime = new Date(scheduleTime);
        const now = new Date();

        if (!scheduleTime) {
            showModal("Please provide a valid schedule time for the ride.");
            return;
        }

        if (selectedTime < now) {
            showModal('Selected time is in the past. Please pick a valid time.');
            return;
        }

        if (selectedTime.getMinutes() % 15 !== 0) {
            showModal('Please select a time that aligns with 15-minute intervals.');
            return;
        }

        payload.schedule_time = scheduleTime;
    }

    try {
        const response = await fetch("/api/driver-dashboard/queue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showModal("Ride queued successfully!");
            loadDriverData();
            closeQueueRideModal();
        } else {
            showModal(`Failed to queue ride: ${await response.text()}`);
        }
    } catch (error) {
        console.error("Error submitting queue ride form:", error);
    }
}

async function submitAddVehicleForm(event) {
    event.preventDefault();
    const currentUser = await getCurrentUser();
    if (!currentUser?.user_id) {
        showModal('Unable to fetch user data. Please try again.');
        return;
    }
    // Fetch input values
    const plateNumber = document.getElementById('plate-number').value.trim();
    const capacity = document.getElementById('capacity').value;

    // Plate number validation
    const plateNumberPattern = /^[A-Z]{3} \d{3,4}$/; // Regular expression for ABC 123 or ABC 1234
    if (!plateNumberPattern.test(plateNumber)) {
        showModal("Invalid plate number format. Please use 'ABC 123' or 'ABC 1234'.");
        return;
    }

    const payload = {
        capacity: document.getElementById('capacity').value,
        plate_number: document.getElementById('plate-number').value,
        driver_id: currentUser.user_id
    };

    try {
        const response = await fetch('/api/driver-dashboard/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showModal('Vehicle added successfully!');
            addVehicleModal.style.display = 'none';
            populateVehicleDropdown();
        } else {
            showModal(`Failed to add vehicle: ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error adding vehicle:', error);
    }
}

// Table Update Functions
function loadQueuedRides(rides) {
    updateRidesTable(queuedRidesList, rides, true);
}

function loadOngoingQueue(rides) {
    updateRidesTable(ongoingQueueList, rides);
}

function loadScheduledRides(rides) {
    updateRidesTable(scheduledQueueList, rides);
}

function loadRidesHistory(rides) {
    const doneRides = rides.filter(ride => ride.status === 'Done');
    const cancelledRides = rides.filter(ride => ride.status === 'Cancelled');

    updateRidesTable(doneQueueList, doneRides);
    updateRidesTable(cancelledQueueList, cancelledRides);
}


function updateRidesTable(tableBody, rides, showButtons = false) {
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (rides?.length) {
        rides.forEach(ride => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ride.plate_number || 'N/A'}</td>
                <td>${ride.seat_status || 'N/A'}</td> <!-- Display 0/capacity here -->
                <td>${ride.start_location || 'N/A'}</td>
                <td>${ride.end_location || 'N/A'}</td>
                <td>${ride.status || 'N/A'}</td>
                <td>${ride.time_range || 'N/A'}</td>
                ${
                    showButtons
                        ? `
                    <td>
                        <button class="done-btn" data-ride-id="${ride.ride_id}">Done</button>
                        <button class="cancel-btn" data-ride-id="${ride.ride_id}">Cancel</button>
                    </td>
                `
                        : ''
                }
            `;
            tableBody.appendChild(row);
        });

        // Attach button event listeners if buttons are shown
        if (showButtons) {
            tableBody.querySelectorAll('.done-btn').forEach(button => {
                button.addEventListener('click', handleRideDone);
            });

            tableBody.querySelectorAll('.cancel-btn').forEach(button => {
                button.addEventListener('click', handleRideCancel);
            });
        }
    } else {
        tableBody.innerHTML = '<tr><td colspan="7">No rides available</td></tr>'; // Adjust for new column
    }
}



async function handleRideDone(event) {
    const rideId = event.target.dataset.rideId;

    try {
        const response = await fetch(`/api/driver-dashboard/rides/${rideId}/done`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            showModal('Ride marked as done!');
            loadDriverData(); // Refresh the queue data
        } else {
            showModal(`Failed to mark ride as done: ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error marking ride as done:', error);
    }
}

async function handleRideCancel(event) {
    const rideId = event.target.dataset.rideId;

    try {
        const response = await fetch(`/api/driver-dashboard/rides/${rideId}/cancel`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            showModal('Ride canceled successfully!');
            loadDriverData(); // Refresh the queue data
        } else {
            showModal(`Failed to cancel ride: ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error canceling ride:', error);
    }
}


// Auth Functions
async function getCurrentUser() {
    try {
        const response = await fetch('/api/driver-dashboard/getCurrent', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        if (response.ok) return await response.json();
        console.error('Failed to fetch user data');
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
    return null;
}

async function handleLogout() {
    try {
        const response = await fetch('/api/logout', { method: 'POST' });
        if (response.ok) {
            showModal('You have been logged out successfully.');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        showModal('An error occurred while logging out. Please try again.');
    }
}


// Location Selection Handler
function disableSameLocation() {
    const startLocationSelect = document.getElementById('start-location');
    const endLocationSelect = document.getElementById('end-location');

    if (!startLocationSelect || !endLocationSelect) return;

    startLocationSelect.addEventListener('change', () => {
        const selectedStart = startLocationSelect.value;
        Array.from(endLocationSelect.options).forEach(option => {
            option.disabled = option.value === selectedStart;
            option.style.color = option.disabled ? 'gray' : '';
        });
    });
}

async function pollRideStatusUpdates() {
    try {
        const response = await fetch('/api/driver-dashboard/updateRideStatuses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Updated rides:', data.updatedRides);

            // Refresh the driver data to reflect changes
            await loadDriverData();
        } else {
            console.error('Failed to update ride statuses');
        }
    } catch (error) {
        console.error('Error polling ride status updates:', error);
    }
}



// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkSessionStatus();// Check session status on page load
    setupDateTimePicker();
    loadDriverData();
    disableSameLocation();
    setInterval(pollRideStatusUpdates, 10000); // Poll every 10 seconds
    // Add event listeners with null checks
    logoutBtn?.addEventListener('click', handleLogout);
    
    queueRideBtn?.addEventListener('click', async () => {
        await populateVehicleDropdown();
        openQueueRideModal();
    });

    closeQueueRideModalBtn?.addEventListener('click', closeQueueRideModal);
    queueRideForm?.addEventListener('submit', submitQueueRideForm);

    addVehicleLink?.addEventListener('click', (event) => {
        event.preventDefault();
        if (addVehicleModal) addVehicleModal.style.display = 'block';
    });

    closeAddVehicleModalBtn?.addEventListener('click', () => {
        if (addVehicleModal) addVehicleModal.style.display = 'none';
    });

    document.querySelector("#addVehicleForm")?.addEventListener("submit", submitAddVehicleForm);

    const rideTypeSelect = document.getElementById('ride-type');
    const scheduleTimeContainer = document.getElementById('schedule-time-container');
    const scheduleTimeInput = document.getElementById('schedule-time');

    if (rideTypeSelect && scheduleTimeContainer && scheduleTimeInput) {
        rideTypeSelect.addEventListener('change', () => {
            if (rideTypeSelect.value === 'scheduled') {
                scheduleTimeContainer.style.display = 'block'; // Show the schedule time input
                scheduleTimeInput.setAttribute('required', 'true'); // Add `required`
            } else {
                scheduleTimeContainer.style.display = 'none'; // Hide the schedule time input
                scheduleTimeInput.removeAttribute('required'); // Remove `required`
                scheduleTimeInput.value = ''; // Clear any value
            }
        });
    }
});

// Check session status
function checkSessionStatus() {
    fetch('/api/check-session')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'logged_out') {
          window.location.href = '/login';
        }
      })
      .catch(error => {
        console.error('Error checking session:', error);
      });
  }