let googleMapsApiKey = "";

async function loadGoogleMapsAPI() {
    try {
        const response = await fetch("/get-api-key");
        const data = await response.json();
        googleMapsApiKey = data.api_key;

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
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
            componentRestrictions: { country: "us" },
        });
    } else {
        console.warn("Google Maps API not loaded yet.");
    }
}

// Function to display geocoding errors as an alert
function displayGeocodingError(invalidAddresses) {
    const errorMessage = `The following locations could not be found:\n\n${invalidAddresses.join("\n")}\n\nTry entering the full address instead.`;
    alert(errorMessage);
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
    const getLocationBtn = document.getElementById("get-location-btn").addEventListener("click", fetchUserLocation);

    if (getLocationBtn) {
        getLocationBtn.addEventListener("click", fetchUserLocation);
    }

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
                throw data; // Throw the entire response object to handle errors properly
            }

            // Handle locations that couldn't be geocoded
            if (data.invalid_addresses && data.invalid_addresses.length > 0) {
                displayGeocodingError(data.invalid_addresses);
                return { error: "Some locations could not be found." };
            }

            return data;
        } catch (error) {
            console.error("Error fetching optimized route:", error);
            
            if (error.invalid_addresses) {
                displayGeocodingError(error.invalid_addresses);
                return { error: "Handled" };
            }
            
            return { error: error.error || "An unknown error occurred." };
        }
    }

    // Function to get user's location and reverse geocode it into an address
    async function fetchUserLocation() {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`User location: ${latitude}, ${longitude}`);

            if (!googleMapsApiKey) {
                alert("Google Maps API key is not available.");
                return;
            }

            try {
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`);
                const data = await response.json();

                if (data.status === "OK" && data.results.length > 0) {
                    const userAddress = data.results[0].formatted_address;
                    document.getElementById("starting-address").value = userAddress;
                } else {
                    alert("Unable to retrieve address from location. Please enter it manually.");
                }
            } catch (error) {
                console.error("Error fetching address from location:", error);
                alert("An error occurred while retrieving your location.");
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Failed to get your location. Please ensure location services are enabled.");
        });
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

        document.getElementById("loading-screen").style.display = "flex";
        calculateRouteBtn.disabled = true;

        const result = await fetchOptimizedRoute(startingPoint, deliveryLocations);

        document.getElementById("loading-screen").style.display = "none";
        calculateRouteBtn.disabled = false;

        if (result.error && result.error !== "Handled") {
            alert(result.error);
            return;
        }
    
        if (result.maps_link) {
            window.location.href = `/results?maps_link=${encodeURIComponent(result.maps_link)}`;
        }
    });
});
