// Tag Functionality //
document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const value = event.target.value;
      // Select div from html. Tags will be displayed in the div
      const tagContainer = document.querySelector('.selected-checkbox-tags');
  
      if (event.target.checked) {
        // Create a new tag
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.setAttribute('data-value', value);
        tag.innerHTML = `${value} <button aria-label="Remove tag"><i class="fa-solid fa-xmark"></i></button>`;
  
        // Append the tag to the tag container
        tagContainer.appendChild(tag);
  
        // Add event listener to the remove button
        tag.querySelector('button').addEventListener('click', () => {
          // Uncheck related checkbox
          event.target.checked = false; 
          // Remove tag
          tag.remove(); 
        });
      } else {
        // Remove tag if the checkbox is unchecked
        const tagToRemove = tagContainer.querySelector(`.tag[data-value="${value}"]`);
        if (tagToRemove) tagToRemove.remove();
      }
    });
  });
  // Clears all tags and checkboxes once Clear All is clicked // 
  document.querySelector('.clear-all').addEventListener('click', () => {
    // Clear all the tags
    const tagContainer = document.querySelector('.selected-checkbox-tags');
    tagContainer.innerHTML = '';
  
    // Uncheck all checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
  });


  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function(event) {
      console.log('Card clicked');
      
      // Check for the 'Add to Itinerary' button, don't navigate if clicked
      if (event.target.closest('.addItineraryButton')) {
        event.stopPropagation();
        return;
      }
  
      // Get the URL from data-url and navigate to specific activity details page
      const pageUrl = this.getAttribute('data-url');
      console.log('Navigating to:', pageUrl); // Debug log for URL
  
      if (pageUrl) {
        window.location.href = pageUrl;
      } else {
        console.error("No URL found for this card!");
      }
    });
  });
  

  // Search Feature
  document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".activities-search-box input");
    const searchButton = document.querySelector(".activities-search-button");
    const cards = document.querySelectorAll(".card");

    function filterActivities() {
      const searchText = searchInput.value.toLowerCase();

      cards.forEach((card) => {
        const title = card.querySelector(".cardTitle").textContent.toLowerCase();
        
        if (title.includes(searchText)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    }

    // Event Listeners
    searchButton.addEventListener("click", filterActivities);
    searchInput.addEventListener("keyup", filterActivities); 
  });

  // Go to My Itinerary Button
  document.querySelector(".goToMyItineraryButton").addEventListener("click", function () {
    window.location.href = "my-itinerary.html"; 
});

