document.addEventListener("DOMContentLoaded", () => {
    const addressContainer = document.getElementById("address-container");
    const addAddressBtn = document.getElementById("add-address-btn");
    const calculateRouteBtn = document.getElementById("calculate-route-btn");

    // Create a container for displaying results
    const resultsContainer = document.createElement("div");
    resultsContainer.id = "results-container";
    document.body.appendChild(resultsContainer);

    // Function to create a new address input field with a remove button
    function createAddressField() {
        const addressField = document.createElement("div");
        addressField.classList.add("address-field");

        const input = document.createElement("input");
        input.type = "text";
        input.name = "address";
        input.placeholder = "Enter an address";
        input.required = true;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.classList.add("remove-address-btn");
        removeButton.setAttribute("aria-label", "Remove address");
        
        const removeIcon = document.createElement("img");
        removeIcon.src = "/static/images/remove-icon.png";
        removeIcon.alt = "Remove";
        removeIcon.classList.add("icon-img");

        removeButton.appendChild(removeIcon);

        // Remove address field when clicking the remove button
        removeButton.addEventListener("click", () => {
            addressField.remove();
        });

        // Append input and button to the address field div
        addressField.appendChild(input);
        addressField.appendChild(removeButton);

        // Append the new field to the container
        addressContainer.appendChild(addressField);
    }

    // Keep Add Destination button always at the bottom
    addAddressBtn.addEventListener("click", () => {
        createAddressField();
    });

    // Function to fetch optimized route from the backend
    async function fetchOptimizedRoute(startingPoint, deliveryLocations) {
        try {
            const response = await fetch("/calculate-route", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    starting_point: startingPoint,
                    delivery_locations: deliveryLocations,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "An error occurred while calculating the route.");
            }

            return data;
        } catch (error) {
            console.error("Error fetching optimized route:", error);
            return { error: error.message };
        }
    }

    // Function to display the results
    function displayResults(data) {
        resultsContainer.innerHTML = `
            <h3>Optimized Route</h3>
            <p>Click the link below to open the route in Google Maps:</p>
            <a href="${data.maps_link}" target="_blank" class="maps-link">Open in Google Maps</a>
        `;
    }

    // Function to display error messages
    function displayError(errorData) {
        resultsContainer.innerHTML = `
            <h3>Error</h3>
            <p>${errorData.error}</p>
            ${
                errorData.invalid_addresses
                    ? `<p>Invalid addresses: ${errorData.invalid_addresses.join(", ")}</p>`
                    : ""
            }
        `;
    }

    // Handle form submission
    calculateRouteBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        const startingPoint = document.getElementById("starting-address").value;
        const deliveryLocations = Array.from(
            addressContainer.querySelectorAll("input[name='address']")
        ).map(input => input.value.trim()).filter(input => input !== "");

        if (!startingPoint || deliveryLocations.length === 0) {
            alert("Please enter a starting point and at least one delivery location.");
            return;
        }

        calculateRouteBtn.textContent = "Calculating...";
        calculateRouteBtn.disabled = true;

        const result = await fetchOptimizedRoute(startingPoint, deliveryLocations);

        calculateRouteBtn.textContent = "Calculate Route";
        calculateRouteBtn.disabled = false;

        if (result.error) {
            displayError(result);
        } else {
            displayResults(result);
        }
    });
});
