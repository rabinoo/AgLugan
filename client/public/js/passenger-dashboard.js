document.addEventListener('DOMContentLoaded', function () {
  // Disable browser cache for back button
  window.onload = function () {
    if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
      window.location.reload();
    }
  };

  // Check session status on page load
  checkSessionStatus();

  // Fetch passenger dashboard data
  fetchPassengerDashboardData();

  // Setup Logout Functionality
  setupLogout();

  // Handle profile modal interactions
  setupProfileModal();

  // Handle form submission for updating profile
  if (document.getElementById('profileForm')) {
    handleProfileUpdate();
  }

  // Handle form submission for changing password
  if (document.getElementById('changePasswordForm')) {
    handlePasswordUpdate();
  }

  // Setup modal close button
  setupDetailsModalClose();
});
// Create and append 2 container for popups (named as 2)
const container2 = document.createElement('div');
container2.id = 'popup-2';
container2.innerHTML = `
   <div class="content-2">
       <p id="message-2"></p>
       <button id="close-2">Close</button>
   </div>
`;
document.body.appendChild(container2);
console.log('2 container appended:', container2);

// 2 styles for version 2
const styles2 = document.createElement('style');
styles2.textContent = `
#popup-2 {
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
.content-2 {
   background: #1b1b1b;
   color: #f8f8f8;
   padding: 20px;
   border-radius: 10px;
   box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
   text-align: center;
   width: 50%;
   max-width: 400px;
}
.content-2 button {
   margin-top: 15px;
   background: #ff0000;
   border: none;
   padding: 10px 20px;
   color: #fff;
   border-radius: 5px;
   cursor: pointer;
   transition: background 0.3s;
}
.content-2 button:hover {
   background: #cc0000;
}
`;
document.head.appendChild(styles2);

const show2 = (message, callback = null) => {
   const container = document.getElementById('popup-2');
   const messageContainer = document.getElementById('message-2');
   const closeButton = document.getElementById('close-2');

   messageContainer.textContent = message;
   container.style.display = 'flex';

   closeButton.onclick = () => {
       container.style.display = 'none';
       if (callback) callback(); 
   };
};

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

// Fetch passenger dashboard data
function fetchPassengerDashboardData() {
  fetch('/api/passenger-dashboard')
    .then(response => response.json())
    .then(data => {
      console.log('Passenger Dashboard Data:', data);

      // Store the fetched data
      passengerDashboardData = data;

      // Display passenger information
      if (data.user) {
        displayPassengerInfo(data);
      } else {
        console.error('User information is missing in the fetched data.');
      }

      // Display payment history
      if (data.payments) {
        displayPaymentHistory(data.payments);
      }

      // Call function to display available rides
      displayAvailableRidesList(data);
    })
    .catch(error => {
      console.error('Error fetching dashboard data:', error);
    });
}

// Display payment history
function displayPaymentHistory(payments) {
  const paymentHistoryTableBody = document.querySelector('#payment-history-table tbody');
  
  paymentHistoryTableBody.innerHTML = '';

  if (payments.length > 0) {
      payments.forEach(payment => {
          const row = document.createElement('tr');
          
          // Format payment amount
          const amount = parseFloat(payment.amount);
          const formattedAmount = isNaN(amount) ? 'N/A' : `₱${amount.toFixed(2)}`;

          row.innerHTML = `
              <td>#${payment.ride_id}</td>
              <td>${formattedAmount}</td>
              <td>${payment.payment_method}</td>
              <td><span class="payment-status ${payment.status.toLowerCase()}">${payment.status}</span></td>
              <td>${new Date(payment.payment_date).toLocaleDateString()}</td>
              <td>
                  <button class="action-btn" onclick="showDetailsModal(${payment.ride_id})">
                      View Details
                  </button>
              </td>
          `;
          
          paymentHistoryTableBody.appendChild(row);
      });
  } else {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td colspan="6" class="no-data">
              <i class="fas fa-history" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
              No payment history found
          </td>
      `;
      paymentHistoryTableBody.appendChild(row);
  }
}

// Display passenger information
function displayPassengerInfo(data) {
  const passengerNameElement = document.getElementById('passenger-name');
  const currentProfilePicture = document.getElementById('current-profile-picture');

  if (passengerNameElement && data.user) {
    passengerNameElement.innerText = data.user.name || 'Unknown';
  } else {
    console.error('Passenger name or user data is missing.');
  }

  if (currentProfilePicture && data.user.profile_picture_url) {
    currentProfilePicture.src = data.user.profile_picture_url;
  } else {
    console.error('Profile picture element or URL is missing.');
  }
}

// Display available rides
function displayAvailableRidesList(data) {
  const ridesList = document.getElementById('rides-list');

  ridesList.innerHTML = ''; // Clear existing rides list

  if (data.rides && data.rides.length > 0) {
    // Filter rides to only include those with status "In Queue"
    const availableRides = data.rides.filter((ride) => ride.status === 'In Queue');

    if (availableRides.length > 0) {
      availableRides.forEach((ride) => {
        const listItem = document.createElement('li');
        listItem.classList.add('ride-item', 'available-ride-item');

        // Add an event listener to open the modal when the card is clicked
        listItem.addEventListener('click', () => {
          showRouteModal(ride); 
        });

        // Populate the list item with ride data and icon
        listItem.innerHTML = `
<div class="ride-info">
    <div class="route-icon">
        <i class="fas fa-route"></i>
    </div>
    <div class="ride-content">
        <div class="route-text">${ride.start_location} - ${ride.end_location}</div>
        <div class="ride-details">
            <div class="detail-row">
                <span class="label">Schedule:</span>
                <span class="value">${ride.time_range}</span>
            </div>
            <div class="detail-row">
                <span class="label">Status:</span>
                <span class="status ${ride.status.toLowerCase().replace(' ', '-')}">${ride.status}</span>
            </div>
        </div>
    </div>
</div>
        `;
        ridesList.appendChild(listItem);
      });
    } else {
      const noDataItem = document.createElement('li');
      noDataItem.classList.add('no-ride-item');
      noDataItem.innerHTML = `<p>No available rides at the current time.</p>`;
      ridesList.appendChild(noDataItem);
    }
  } else {
    const noDataItem = document.createElement('li');
    noDataItem.classList.add('no-ride-item');
    noDataItem.innerHTML = `<p>No rides available at the moment.</p>`;
    ridesList.appendChild(noDataItem);
  }
}

// Show ride details modal
function showDetailsModal(rideId) {
  if (!rideId) {
    show2('Invalid Ride ID');
    return;
  }

  fetch(`/api/ride-details?ride_id=${rideId}`)
    .then(response => response.json())
    .then(data => {
      console.log('Ride Details Data:', data);

      if (data.status === 'success') {
        document.getElementById('modal-ride-id').textContent = data.ride.ride_id || 'N/A';
        document.getElementById('modal-route').textContent = data.ride.route || 'N/A';
        document.getElementById('modal-schedule').textContent = data.ride.schedule || 'N/A';
        document.getElementById('modal-plate-number').textContent = data.ride.plate_number || 'N/A';
        document.getElementById('modal-payment-amount').textContent = `₱${parseFloat(data.payment.amount).toFixed(2)}` || 'N/A';
        document.getElementById('modal-payment-method').textContent = data.payment.payment_method || 'N/A';
        document.getElementById('modal-payment-status').textContent = data.payment.status || 'N/A';
        document.getElementById('modal-payment-date').textContent = new Date(data.payment.payment_date).toLocaleDateString() || 'N/A';

        // Display the modal
        document.getElementById('detailsModal').style.display = 'block';
      } else {
        show2('Failed to fetch ride details.');
      }
    })
    .catch(error => {
      console.error('Error fetching ride details:', error);
      show2('An error occurred while fetching details.');
    });
}

// Close details modal
function setupDetailsModalClose() {
  const closeModalButton = document.getElementById('closeDetailsModal');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', () => {
      document.getElementById('detailsModal').style.display = 'none';
    });
  }
}

function updatePaymentStatusStyle() {
  const statusElement = document.getElementById('modal-payment-status');
  if (statusElement) {
      const status = statusElement.textContent.toLowerCase();
      statusElement.setAttribute('data-status', status);
  }
}
updatePaymentStatusStyle();

// Profile modal setup with all handlers
function setupProfileModal() {
  const profileModal = document.getElementById('profileModal');
  const profileBtn = document.getElementById('profileBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const profilePictureInput = document.getElementById('profile-picture-input');
  const currentProfilePicture = document.getElementById('current-profile-picture');

  // Setup password visibility toggles
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const inputId = this.getAttribute('data-for');
      const input = document.getElementById(inputId);
      if (input.type === 'password') {
        input.type = 'text';
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
      }
    });
  });

  // Profile picture change handler
  if (profilePictureInput) {
    profilePictureInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          currentProfilePicture.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      if (profileModal) {
        profileModal.style.display = 'block';
      }
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (profileModal) {
        profileModal.style.display = 'none';
      }
    });
  }

  window.addEventListener('click', (event) => {
    if (event.target === profileModal) {
      profileModal.style.display = 'none';
    }
  });
}

// Profile update handler
function handleProfileUpdate() {
  const profileForm = document.getElementById('profileForm');
  const profilePictureInput = document.getElementById('profile-picture-input');

  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('passenger-name-input').value.trim());
    formData.append('email', document.getElementById('passenger-email-input').value.trim());

    if (profilePictureInput.files[0]) {
      formData.append('profile_picture', profilePictureInput.files[0]);
    }

    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.status === 'success') {
        show2('Profile updated successfully');
        document.getElementById('profileModal').style.display = 'none';
        // Update profile picture in the dashboard if it was changed
        if (data.profile_picture_url) {
          document.getElementById('current-profile-picture').src = 
            data.profile_picture_url + '?t=' + new Date().getTime();
        }
        location.reload();
      } else {
        show2(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      show2('An error occurred while updating the profile');
    }
  });
}

// Password update handler
function handlePasswordUpdate() {
  const passwordForm = document.getElementById('changePasswordForm');

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    if (!currentPassword || !newPassword || !confirmPassword) {
      show2('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      show2('New password and confirmation do not match');
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        show2('Password changed successfully');
        passwordForm.reset();
        document.getElementById('profileModal').style.display = 'none';
      } else {
        show2(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      show2('An error occurred while changing the password');
    }
  });
}

// Logout setup
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      fetch('/api/logout', { method: 'POST' })
        .then(response => {
          if (response.ok) {
            show2('You have been logged out.');
            window.location.href = '/login';
          } else {
            throw new Error('Failed to log out properly.');
          }
        })
        .catch(error => {
          console.error('Error during logout:', error);
          show2('An error occurred while trying to log out. Please try again.');
        });
    });
  }
}

const locations = {
  "SLU Mary Heights": [16.385431230475408, 120.59332518930958],
  "Holy Family Parish Church": [16.390849719238346, 120.59038991417202],
  "Igorot Garden": [16.413115332778087, 120.5944202827095],
  "SM Baguio": [16.40909857340778, 120.59979147431693],
  "Burham Park": [16.412475921804447, 120.59296601748652],
  "Phase 1": [16.386170610199027, 120.58975987299971],
  "Phase 2": [16.384299383092074, 120.59003912657275],
  "Phase 3": [16.381427480873413, 120.59409463187622],
  "Barangay Hall": [16.396485330039443, 120.58249126050718]
};

let currentMap = null;
let currentRoutingControl = null;

function showRouteModal(route) {
    // Debug logging
    console.log('Route object received:', route);
    console.log('Start location:', route.start_location);
    console.log('End location:', route.end_location);
    
    const routeModal = document.getElementById('routeModal');
    const rideIdDisplay = document.getElementById('rideIdDisplay');
    const startLocationDisplay = document.getElementById('startLocationDisplay');
    const endLocationDisplay = document.getElementById('endLocationDisplay');
    const mapContainer = document.getElementById('mapContainer');
    const closeBtn = document.getElementById('closeRouteModalBtn');

    // Cleanup function
    function cleanupMap() {
        if (currentRoutingControl) {
            currentMap.removeControl(currentRoutingControl);
            currentRoutingControl = null;
        }
        if (currentMap) {
            currentMap.remove();
            currentMap = null;
        }
        if (mapContainer) {
            mapContainer.innerHTML = '';
        }
    }

    // Clean up existing map
    cleanupMap();

    // Close button handler (removed duplicate)
    closeBtn.onclick = function() {
        routeModal.style.display = 'none';
        cleanupMap();
    };

    window.onclick = function(event) {
        if (event.target == routeModal) {
            routeModal.style.display = 'none';
            cleanupMap();
        }
    }

    // Debug logging for coordinates
    const startCoords = locations[route.start_location];
    const endCoords = locations[route.end_location];
    console.log('Start coordinates:', startCoords);
    console.log('End coordinates:', endCoords);

    if (!startCoords || !endCoords) {
        console.error('Invalid coordinates:', {
            startLocation: route.start_location,
            endLocation: route.end_location,
            availableLocations: Object.keys(locations)
        });
        return;
    }

    rideIdDisplay.textContent = route.ride_id || 'N/A';
    startLocationDisplay.textContent = route.start_location || 'N/A';
    endLocationDisplay.textContent = route.end_location || 'N/A';

    // Show modal first
    routeModal.style.display = 'block';

    // Small delay to ensure container is visible
    setTimeout(() => {
        try {
            // Initialize new map
            currentMap = L.map(mapContainer);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(currentMap);

            currentRoutingControl = L.Routing.control({
                waypoints: [
                    L.latLng(startCoords[0], startCoords[1]),
                    L.latLng(endCoords[0], endCoords[1])
                ],
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                showAlternatives: false,
                lineOptions: {
                    styles: [
                        {color: 'red', opacity: 0.8, weight: 4}
                    ]
                },
                createMarker: function(i, waypoint, n) {
                    const marker = L.marker(waypoint.latLng);
                    marker.bindPopup(i === 0 ? 'Start: ' + route.start_location : 'End: ' + route.end_location);
                    return marker;
                }
            }).addTo(currentMap);

            currentRoutingControl.on('routesfound', function(e) {
                const container = document.querySelector('.leaflet-routing-container');
                if (container) {
                    container.style.display = 'none';
                }
                currentMap.fitBounds(L.latLngBounds(startCoords, endCoords), {
                    padding: [50, 50]
                });
            });
        } catch (error) {
            console.error('Error initializing map:', error);
            cleanupMap();
        }
    }, 100);
}


// Poll payment status every 30 seconds
setInterval(() => {
  fetch('/api/passenger-dashboard')
    .then(response => response.json())
    .then(data => {
      if (data.payments) {
        displayPaymentHistory(data.payments);
      }
    })
    .catch(error => console.error('Error polling payment status:', error));
}, 30000);

