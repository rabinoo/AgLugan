//schedule script
const rides = {
  "bakakeng-to-city": [
    { time: "7:00 AM", seats: 5, waitTime: "10 mins" },
    { time: "8:30 AM", seats: 3, waitTime: "15 mins" },
    { time: "10:00 AM", seats: 0, waitTime: "30 mins" },
    { time: "12:00 PM", seats: 8, waitTime: "5 mins" },
  ],
  "city-to-bakakeng": [
    { time: "7:30 AM", seats: 4, waitTime: "8 mins" },
    { time: "9:00 AM", seats: 1, waitTime: "20 mins" },
    { time: "11:00 AM", seats: 0, waitTime: "35 mins" },
    { time: "1:00 PM", seats: 6, waitTime: "7 mins" },
  ],
};

function showRides() {
  const route = document.getElementById("route").value;
  const ridesList = document.getElementById("rides-list");
  ridesList.innerHTML = "";

  const availableRides = rides[route];

  if (availableRides.length === 0) {
    ridesList.innerHTML = "<li>No available rides.</li>";
    return;
  }

  availableRides.forEach((ride) => {
    const rideItem = document.createElement("li");
    
    const rideDetails = `
      <div>
        <span>Time:</span> ${ride.time}
      </div>
      <div>
        <span>Seats Available:</span> ${ride.seats}
      </div>
      <div>
        <span>Wait Time:</span> ${ride.waitTime}
      </div>
    `;

    rideItem.innerHTML = rideDetails;

    // Color-coding based on seat availability
    if (ride.seats === 0) {
      rideItem.style.backgroundColor = "#f8d7da";  // Red
    } else if (ride.seats <= 3) {
      rideItem.style.backgroundColor = "#fff3cd";  // Yellow
    } else {
      rideItem.style.backgroundColor = "#d4edda";  // Green
    }

    ridesList.appendChild(rideItem);
  });
}

function userExists() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  const users = [
      { username: 'admin', password: '123' },
      { username: 'user2', password: 'password2' },
  ];

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
      
      window.location.href = 'landingPage.html'; 
  } else {
      
      document.getElementById('message').innerText = 'Invalid username or password!';
  }
}

