// Page for http://localhost:8080/itinerary-collections.html to display the details of the user's itinerary collection

async function fetchItineraryDetails() {
    try {
        const itineraryId = localStorage.getItem("selectedItineraryId");
        if (!itineraryId) {
            console.error("No itinerary ID found in localStorage");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No authentication token found.");
            return;
        }

        const response = await fetch(`http://localhost:5000/api/itineraries/${itineraryId}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch itinerary details");
        }

        const data = await response.json();
        console.log("Fetched itinerary data:", data);

        if (!data.itinerary) {
            console.error("Itinerary data not found");
            return;
        }

        displayItineraryDetails(data.itinerary);

    } catch (error) {
        console.error("Error fetching itinerary details:", error);
    }
}

function displayItineraryDetails(itinerary) {
    const itineraryTitle = document.getElementById("collection-title");
    const daysCount = document.getElementById("days-count");
    const itineraryForm = document.getElementById("itineraryForm");

    if (!itineraryTitle || !daysCount) {
        console.error("Itinerary title or days count element not found.");
        return;
    }

    // Update the itinerary title
    itineraryTitle.textContent = itinerary.itinerary_name || "Itinerary Collection Name";

    // Display the number of days from the database from itineraries table (days_added column)
    const days = itinerary.days_added || 0;
    daysCount.textContent = `Days: ${days}`;

    if (!itineraryForm) {
        console.error("Itinerary form not found.");
        return;
    }

    // Populate form fields with itinerary collection info
    document.getElementById("itineraryName").value = itinerary.itinerary_name || "";
    document.getElementById("destinations").value = itinerary.destinations ? itinerary.destinations.join(", ") : "";
    
    // Date format: "yyyy-MM-dd"
    const startDate = itinerary.start_date ? new Date(itinerary.start_date) : null;
    const endDate = itinerary.end_date ? new Date(itinerary.end_date) : null;

    document.getElementById("startDate").value = startDate && !isNaN(startDate) ? startDate.toISOString().split('T')[0] : "";
    document.getElementById("endDate").value = endDate && !isNaN(endDate) ? endDate.toISOString().split('T')[0] : "";
    
    document.getElementById("budget").value = itinerary.budget || "";

    // Fetch activities after displaying itinerary details
    fetchActivities(itinerary.id, days);  
}

// Fetch activities for the selected itinerary collection
async function fetchActivities(itineraryId, totalDays) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No authentication token found.");
            return;
        }

        const response = await fetch(
            `http://localhost:5000/api/itinerary/${itineraryId}/activities`, 
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch activities.");
        }

        const activitiesData = await response.json();
        console.log("Fetched activities:", activitiesData);

        // Check if activities exist in response
        if (!activitiesData || !Array.isArray(activitiesData) || activitiesData.length === 0) {
            console.warn("No activities found for this itinerary.");
        }

        displayActivities(activitiesData, totalDays);
    } catch (error) {
        console.error("Error fetching activities:", error);
    }
}

function displayActivities(activities, totalDays) {
    const container = document.getElementById("activities-container");

    if (!container) {
        console.error("Activity container not found.");
        return;
    }

    container.innerHTML = "";  
    
    // Loop through each day in the itinerary
    for (let i = 1; i <= totalDays; i++) {
        // Create day separator
        const daySeparator = document.createElement("div");
        daySeparator.classList.add("day");

        const dayText = document.createElement("div");
        dayText.classList.add("dayText");
        dayText.textContent = `Day ${i}`;
        daySeparator.appendChild(dayText);
        
        // Add the day separator to the container
        container.appendChild(daySeparator);
        
        // Get activities for this day
        const dayActivities = activities.filter(activity => activity.day === i);

        // If no activities for this day, display a message
        if (dayActivities.length === 0) {
            const noActivitiesMessage = document.createElement("p");
            noActivitiesMessage.classList.add("no-activities-message");
            noActivitiesMessage.textContent = "No activities scheduled for this day";
            container.appendChild(noActivitiesMessage);

            const browseActivitiesButton = document.createElement("button");
            browseActivitiesButton.classList.add("browseButton")
            browseActivitiesButton.textContent = "Browse Activities";

            // event listener for browse activities button to go to the activities.html page
            browseActivitiesButton.addEventListener("click", function() {
                window.location.href = "activities.html";
            });

            container.appendChild(browseActivitiesButton);
        } else {
            // Display the activities for this day
            dayActivities.forEach(activity => {
                // Create activity container
                const activityContainer = document.createElement("div");
                activityContainer.classList.add("itinerary-container");
                activityContainer.setAttribute("data-activity-id", activity.activity_id);

                // Activity image
                const img = document.createElement("img");
                img.src = activity.image_url ? activity.image_url : "assets/images/thetemplekyoto.png";
                img.alt = `Itinerary Activity: ${activity.title}`;
                img.classList.add("container-image");

                // Text container
                const textContainer = document.createElement("div");
                textContainer.classList.add("container-text");

                const title = document.createElement("h3");
                title.classList.add("less-bold", "headerSize");
                title.textContent = activity.title;

                const tag = document.createElement("p");
                tag.classList.add("container-tag");
                tag.innerHTML = `${activity.area} <span class="ellipses"></span> ${activity.interest}`;

                const tagTwo = document.createElement("p");
                tagTwo.classList.add("container-tag-two");
                tagTwo.textContent = activity.day ? `Day ${activity.day}` : "Unscheduled";

                // Buttons
                const buttonSet = document.createElement("div");
                buttonSet.classList.add("myItineraryButtonSet");

                const editButton = document.createElement("button");
                editButton.classList.add("editTimeButton");
                editButton.innerHTML = `<i class="fa-solid fa-pen editTimePen"></i> Edit Time`;
                editButton.onclick = () => editActivityTime(activity.activity_id);

                const deleteButton = document.createElement("button");
                deleteButton.classList.add("deleteButton");
                deleteButton.innerHTML = `<i class="fa-regular fa-trash-can deleteIcon"></i> Delete`;
                deleteButton.onclick = () => deleteActivity(activity.activity_id);

                // Assemble the activity container
                textContainer.appendChild(title);
                textContainer.appendChild(tag);
                textContainer.appendChild(tagTwo);

                buttonSet.appendChild(editButton);
                buttonSet.appendChild(deleteButton);

                activityContainer.appendChild(img);
                activityContainer.appendChild(textContainer);
                activityContainer.appendChild(buttonSet);

                // Add activity to the container (after the day separator)
                container.appendChild(activityContainer);
            });
        }
    }
}

// Delete activity from the itinerary and refresh
async function deleteActivity(activityId) {
    try {
        const itineraryId = localStorage.getItem("selectedItineraryId");
        if (!itineraryId) {
            console.error("No itinerary ID found in localStorage");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No authentication token found.");
            return;
        }

        // Confirm deletion before deleting an activity
        if (confirm("Are you sure you want to delete this activity?")) {
            const response = await fetch(`http://localhost:5000/api/itinerary/${itineraryId}/activities/${activityId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete activity");
            }

            // Remove activity on the page after deleting
            const activityElement = document.querySelector(`.itinerary-container[data-activity-id='${activityId}']`);
            if (activityElement) {
                activityElement.remove();
            }

            console.log("Activity deleted successfully");
        } else {
            console.log("Activity deletion cancelled.");
        }
        fetchItineraryDetails();
    } catch (error) {
        console.error("Error deleting activity:", error);
    }
}


// loads itinerary details when page loads
window.onload = () => {
    fetchItineraryDetails();
};