document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const participantsContainer = document.getElementById("participants-container");
  const participantsList = document.getElementById("participants-list");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Function to fetch and display participants of a selected activity
  async function fetchParticipants(activityName) {
    try {
      const response = await fetch(`/activities/${encodeURIComponent(activityName)}/participants`);
      const participants = await response.json();

      participantsList.innerHTML = "";

      if (participants.length === 0) {
        participantsList.innerHTML = "<li>No participants yet.</li>";
      } else {
        participants.forEach((participant) => {
          const listItem = document.createElement("li");
          listItem.textContent = participant;
          participantsList.appendChild(listItem);
        });
      }

      participantsContainer.classList.remove("hidden");
    } catch (error) {
      console.error("Error fetching participants:", error);
      participantsList.innerHTML = "<li>Failed to load participants. Please try again later.</li>";
      participantsContainer.classList.remove("hidden");
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Update participants when an activity is selected
  activitySelect.addEventListener("change", (event) => {
    const selectedActivity = event.target.value;

    if (selectedActivity) {
      fetchParticipants(selectedActivity);
    } else {
      participantsContainer.classList.add("hidden");
    }
  });

  // Initialize app
  fetchActivities();
});
