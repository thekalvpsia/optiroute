async function loadGoogleMapsAPI() {
    try {
        const response = await fetch("/get-api-key");
        const data = await response.json();
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.api_key}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.setAttribute("loading", "async");

        script.onload = () => {
            console.log("Google Maps API loaded successfully.");
            initializeAutocompleteFields(); // Initialize autocomplete only after API loads
        };

        document.getElementById("google-maps-script").replaceWith(script);
    } catch (error) {
        console.error("Failed to load Google Maps API:", error);
    }
}

// Initialize autocomplete for input fields AFTER Google Maps API is loaded
function initializeAutocompleteFields() {
    const startingAddressInput = document.getElementById("starting-address");
    if (startingAddressInput) {
        new google.maps.places.Autocomplete(startingAddressInput, {
            types: ["establishment", "geocode"],
        });
    }

    document.querySelectorAll("input[name='address']").forEach((input) => {
        new google.maps.places.Autocomplete(input, {
            types: ["establishment", "geocode"],
        });
    });

    console.log("Autocomplete initialized for all input fields.");
}

// Function to initialize autocomplete with business names and addresses
function initializeAutocomplete(inputElement) {
    if (typeof google !== "undefined" && google.maps && google.maps.places) {
        new google.maps.places.Autocomplete(inputElement, {
            types: ["establishment", "geocode"],
        });
    } else {
        console.warn("Google Maps API not loaded yet.");
    }
}

// Handle page load
document.addEventListener("DOMContentLoaded", async () => {
    await loadGoogleMapsAPI(); // Load Google Maps API first
});

// Address field management
document.addEventListener("DOMContentLoaded", () => {
    const addressContainer = document.getElementById("address-container");
    const addAddressBtn = document.getElementById("add-address-btn");
    const calculateRouteBtn = document.getElementById("calculate-route-btn");

    // Function to create a new address input field with a remove button
    function createAddressField() {
        const addressField = document.createElement("div");
        addressField.classList.add("address-field");

        const input = document.createElement("input");
        input.type = "text";
        input.name = "address";
        input.placeholder = "Enter an address or place";
        input.required = true;

        // Initialize autocomplete when new field is added
        initializeAutocomplete(input);

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
            window.location.href = `/results?maps_link=${encodeURIComponent(result.maps_link)}`;
        }
    });
});
