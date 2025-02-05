# OptiRoute

OptiRoute is a web application designed to help delivery drivers find the most efficient route for their deliveries. By entering multiple locations, the app calculates the optimal route and provides a direct link to Google Maps for navigation.

## Demo

A live demo of OptiRoute is hosted on **[Render](https://render.com/)**.  
[Try OptiRoute](https://aris-optiroute.onrender.com)

## Features

- **Optimized Route Calculation**: Finds the shortest path for multiple destinations and returns to the starting point.
- **Google Maps Integration**: Provides a link to open the optimized route in Google Maps.
- **Location Autocomplete**: Allows users to enter business names or addresses with Google Places Autocomplete.
- **Current Location Support**: Users can set their starting point using their current location.
- **Error Handling**: Alerts users when an invalid address is entered and suggests corrections.
- **Dark Theme**: Styled with a minimalist Dracula-inspired dark theme.
- **Mobile-Friendly Design**: Works on both desktop and mobile devices.
- **Smooth Animations**: Fade-in effect for a better user experience.
- **Improved API Security**: Utilizes a hybrid approach to secure API keys while maintaining performance.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python Flask
- **Maps & Routing**: Google Maps API (Places, Directions, and Geocoding)
- **Hosting**: Render

## Future Enhancements

- **Additional Map Providers**: Support for alternatives like Apple Maps.
- **User Accounts**: Save frequently used routes.
- **Route Customization**: Allow manual reordering of destinations.
- **Traffic Considerations**: Optimize based on real-time traffic data.
- **Offline Support**: Enable saving and accessing routes without an internet connection.

## How to Use

1. Clone this repository:
   ```bash
   git clone https://github.com/thekalvpsia/optiroute.git
   ```
2. Navigate into the project folder:
   ```bash
   cd optiroute
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your API keys:
   - Frontend API Key: Open `index.html`, locate the Google Maps `<script>` tag, and replace the existing API key (the value between `key=` and `&libraries=places`) with your own. **If you try running this with my key, it won’t work. Nice try.**
   - Backend API Key: Create a `.env` file from the example template:
     ```bash
     cp .env.example .env
     ```
     Then, add your BACKEND_API_KEY inside the `.env` file.
5. Run the application:
   ```bash
   python app.py
   ```
6. Open your browser and go to:
   ```
   http://127.0.0.1:5000
   ```

## Contributing

Contributions are welcome! If you'd like to improve OptiRoute, feel free to fork the repository and submit a pull request.

## Credits

- Icons by [Freepik](https://www.flaticon.com/authors/freepik) from [Flaticon](https://www.flaticon.com/).

## License

OptiRoute is licensed under the MIT License.

