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
  handleProfileUpdate();

  // Handle form submission for changing password
  handleChangePassword();

  // Start polling for ride status updates
  startRideStatusPolling();
});

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

function fetchPassengerDashboardData() {
  fetch('/api/passenger-dashboard')
    .then((response) => response.json())
    .then((data) => {
      console.log('Passenger Dashboard Data:', data);

      if (data.status === 'success') {
        displayPassengerInfo(data);
      } else {
        console.error('Error fetching passenger data:', data.message);
      }
    })
    .catch((error) => {
      console.error('Error fetching passenger dashboard data:', error);
    });
}

// Function to display passenger information
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

// Function to setup Profile Modal interactions
function setupProfileModal() {
  const profileModal = document.getElementById('profileModal');
  const profileBtn = document.getElementById('profileBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');

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

  // Close the modal when clicking outside the modal content
  window.addEventListener('click', (event) => {
    if (event.target === profileModal) {
      profileModal.style.display = 'none';
    }
  });
}

// Function to handle profile update submission
function handleProfileUpdate() {
  const profileForm = document.getElementById('profileForm');
  const profilePictureInput = document.getElementById('profile-picture-input');
  const currentProfilePicture = document.getElementById('current-profile-picture');

  profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('passenger-name-input').value.trim();
      const email = document.getElementById('passenger-email-input').value.trim();
      const profilePictureFile = profilePictureInput.files[0];

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (profilePictureFile) {
          formData.append('profile_picture', profilePictureFile);
      }

      try {
          const response = await fetch('/api/update-profile', {
              method: 'POST',
              body: formData,
          });

          const data = await response.json();

          if (data.status === 'success') {
              alert('Profile updated successfully.');

              // Update profile picture if a new one is uploaded
              if (data.profile_picture_url && currentProfilePicture) {
                  currentProfilePicture.src = data.profile_picture_url + '?t=' + new Date().getTime();
              } else {
                  console.warn('Profile picture element not found.');
              }

              // Close the modal
              document.getElementById('profileModal').style.display = 'none';
          } else {
              alert(data.message || 'Failed to update profile.');
          }
      } catch (error) {
          console.error('Error updating profile:', error);
          alert('An error occurred. Please try again.');
      }
  });
}

// Function to handle password change submission
function handleChangePassword() {
  const passwordForm = document.getElementById('changePasswordForm');

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        alert('Password changed successfully.');
        passwordForm.reset();
      } else {
        alert(data.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred. Please try again.');
    }
  });
}
// Global variable to store fetched data
let passengerDashboardData = null;

// Fetch passenger dashboard data
function fetchPassengerDashboardData() {
    // Assume an API endpoint that returns the necessary data (e.g., user info and available rides)
    fetch('/api/passenger-dashboard')
        .then(response => response.json())
        .then(data => {
            console.log('Passenger Dashboard Data:', data);

            // Store the fetched data
            passengerDashboardData = data;
            console.log(data);

            // Call function to display available rides in a list
            displayAvailableRidesList(passengerDashboardData);
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
        });
}

// Function to display available rides in a grid list
function displayAvailableRidesList(data) {
    const ridesList = document.getElementById('rides-list');

    // Clear any existing list content
    ridesList.innerHTML = '';

    // Loop through the available rides and create list items for each ride
    if (data.rides && data.rides.length > 0) {
        // Limit to the first 4 rides
        const firstfourRides = data.rides.slice(0, 4);
        
        firstfourRides.forEach(ride => {
            const listItem = document.createElement('li');
            listItem.classList.add('ride-item'); // Add a class for styling

            // Populate the list item with ride data
            listItem.innerHTML = `
                <h3>Ride ID: ${ride.ride_id}</h3>
                <p><strong>From:</strong> ${ride.start_location}</p>
                <p><strong>To:</strong> ${ride.end_location}</p>
                <button class="view-route-btn" onclick="showRouteModal(${ride.ride_id})">View Route</button>
            `;
            ridesList.appendChild(listItem);
        });
    } else {
        const noDataItem = document.createElement('li');
        noDataItem.classList.add('no-ride-item');
        noDataItem.innerHTML = `<p>No available rides at the moment.</p>`;
        ridesList.appendChild(noDataItem);
    }
}

// Function to show the route modal when the "View Route" button is clicked
function showRouteModal(rideId) {
    console.log('Showing route for rideId:', rideId);  // Log the rideId passed

    // Find the ride object by ride_id in the passengerDashboardData
    const ride = passengerDashboardData.rides.find(r => r.ride_id === rideId);

    if (ride) {
        // Populate the modal with the ride data
        document.getElementById('routeModal').style.display = 'flex';  // Show the modal
        document.getElementById('rideIdDisplay').textContent = ride.ride_id;
        document.getElementById('startLocationDisplay').textContent = ride.start_location;
        document.getElementById('endLocationDisplay').textContent = ride.end_location;

        // Add route description if available
        if (ride.route) {
            document.getElementById('routeDescription').textContent = ride.route;
        }

        // Embed a Google map link (opens in a new tab)
        if (ride.start_location && ride.end_location) {
            const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(ride.start_location)}&destination=${encodeURIComponent(ride.end_location)}`;
            document.getElementById('map').innerHTML = `<a href="${mapUrl}" target="_blank">Click here to view the route on Google Maps</a>`;
        } else {
            document.getElementById('map').innerHTML = '<p>No map available for this route.</p>';
        }
    } else {
        console.log('Ride not found for the given rideId');
    }
}

// Function to close the modal when the close button or outside the modal content is clicked
function closeModal() {
    document.getElementById('routeModal').style.display = 'none';  // Hide the modal
}

// Attach the event listener to close the modal when the close button is clicked
document.getElementById('closeModalBtn').addEventListener('click', closeModal);

// Close the modal when clicking anywhere outside the modal content
window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('routeModal')) {
        closeModal();  // Close the modal if clicked outside the modal content
    }
});

// Call fetchPassengerDashboardData() when the page loads
fetchPassengerDashboardData();


