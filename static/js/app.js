document.addEventListener("DOMContentLoaded", () => {
    const addressContainer = document.getElementById("address-container");

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

    // Attach event listener to the existing plus button for adding new fields
    document.querySelector(".add-address-btn").addEventListener("click", () => {
        createAddressField();
    });
});
