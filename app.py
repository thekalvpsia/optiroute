from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
import os
import requests

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

def calculate_optimized_route(starting_point, locations):
    """Uses Google Directions API to calculate the optimal route."""
    all_locations = [starting_point] + locations + [starting_point]  # Ensure return to start

    # Convert addresses to coordinates
    location_coords = [get_coordinates(loc) for loc in all_locations]

    if None in location_coords:
        invalid_addresses = [all_locations[i] for i, coord in enumerate(location_coords) if coord is None]
        return {"error": "Invalid addresses", "invalid_addresses": invalid_addresses}

    origin = f"{location_coords[0][0]},{location_coords[0][1]}"
    destination = f"{location_coords[-1][0]},{location_coords[-1][1]}"
    waypoints = "|".join([f"{lat},{lng}" for lat, lng in location_coords[1:-1]])

    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&waypoints=optimize:true|{waypoints}&key={API_KEY}"

    response = requests.get(url).json()

    if response.get("status") == "OK":
        optimized_waypoints = response["routes"][0]["waypoint_order"]
        optimized_route = [location_coords[i+1] for i in optimized_waypoints]  # Reorder based on Google's response
        optimized_route.insert(0, location_coords[0])  # Add start
        optimized_route.append(location_coords[-1])  # Add end

        return optimized_route
    else:
        return {"error": "Failed to optimize route", "api_response": response}

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

@app.route("/get-api-key")
def get_api_key():
    return jsonify({"api_key": API_KEY})

@app.route("/calculate-route", methods=["POST"])
def calculate_route():
    data = request.json
    starting_point = data.get("starting_point")
    delivery_locations = data.get("delivery_locations")

    if not starting_point or not delivery_locations:
        return jsonify({"error": "Missing required fields"}), 400

    # Compute the optimized route
    route = calculate_optimized_route(starting_point, delivery_locations)

    # Handle errors in route calculation
    if isinstance(route, dict) and "error" in route:
        return jsonify(route), 400

    maps_link = generate_google_maps_link(route)
    return jsonify({"optimized_route": route, "maps_link": maps_link})

if __name__ == '__main__':
    app.run(debug=True)
