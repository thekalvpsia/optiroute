from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
import os
import requests
import itertools

app = Flask(__name__)
load_dotenv()
API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

# Function to get coordinates from an address
def get_coordinates(address):
    if not address.strip():
        return None  # Handle empty address inputs

    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={API_KEY}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx, 5xx)
        data = response.json()

        if data.get("status") == "OK":
            location = data["results"][0]["geometry"]["location"]
            return (location["lat"], location["lng"])
        else:
            print(f"Geocoding failed for {address}: {data.get('status')}")
            return None  # Address could not be geocoded
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None

# Function to calculate the shortest route using brute force TSP
def calculate_shortest_route(starting_point, locations):
    all_locations = [starting_point] + locations + [starting_point]  # Ensure it returns to the start
    location_coords = [get_coordinates(loc) for loc in all_locations]

    # Handle invalid addresses
    if None in location_coords:
        invalid_addresses = [all_locations[i] for i, coord in enumerate(location_coords) if coord is None]
        return {"error": "Invalid addresses", "invalid_addresses": invalid_addresses}

    # Generate all possible orders of visiting locations
    shortest_path = None
    shortest_distance = float("inf")

    for perm in itertools.permutations(location_coords[1:-1]):  # Permute only delivery locations
        route = [location_coords[0]] + list(perm) + [location_coords[0]]
        distance = 0

        try:
            # Calculate total route distance using Google Maps API
            for i in range(len(route) - 1):
                url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={route[i][0]},{route[i][1]}&destinations={route[i+1][0]},{route[i+1][1]}&key={API_KEY}"
                response = requests.get(url).json()
                
                if response.get("status") != "OK":
                    print(f"Distance matrix API failed: {response}")
                    return {"error": "Distance calculation failed"}

                distance += response["rows"][0]["elements"][0]["distance"]["value"]

            # Update shortest path
            if distance < shortest_distance:
                shortest_distance = distance
                shortest_path = route
        except requests.exceptions.RequestException as e:
            print(f"Distance matrix API request error: {e}")
            return {"error": "API request failed"}

    return shortest_path

# Function to generate Google Maps link for navigation
def generate_google_maps_link(route):
    if not route or "error" in route:
        return None  # Handle cases where the route calculation fails

    waypoints = "|".join([f"{lat},{lng}" for lat, lng in route[1:-1]])  # Skip start & end for waypoints
    start = f"{route[0][0]},{route[0][1]}"
    end = f"{route[-1][0]},{route[-1][1]}"
    return f"https://www.google.com/maps/dir/?api=1&origin={start}&destination={end}&waypoints={waypoints}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/results")
def results():
    return render_template("results.html")

@app.route("/calculate-route", methods=["POST"])
def calculate_route():
    data = request.json
    starting_point = data.get("starting_point")
    delivery_locations = data.get("delivery_locations")

    if not starting_point or not delivery_locations:
        return jsonify({"error": "Missing required fields"}), 400

    # Compute the shortest route
    route = calculate_shortest_route(starting_point, delivery_locations)

    # Handle errors in route calculation
    if isinstance(route, dict) and "error" in route:
        return jsonify(route), 400

    maps_link = generate_google_maps_link(route)
    return jsonify({"optimized_route": route, "maps_link": maps_link})

if __name__ == '__main__':
    app.run(debug=True)
