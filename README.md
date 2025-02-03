# OptiRoute

OptiRoute is a web application designed to help delivery drivers find the most efficient route for their deliveries. By entering multiple locations, the app calculates the optimal route and provides a direct link to Google Maps for navigation.

## Demo

A live demo of OptiRoute is hosted on **[Render](https://render.com/)**.  
[Try OptiRoute](https://optiroute.onrender.com)

## Features

- **Optimized Route Calculation**: Finds the shortest path for multiple destinations and returns to the starting point.
- **Google Maps Integration**: Provides a link to open the optimized route in Google Maps.
- **Location Autocomplete**: Allows users to enter business names or addresses with Google Places Autocomplete.
- **Current Location Support**: Users can set their starting point using their current location.
- **Error Handling**: Alerts users when an invalid address is entered.
- **Dark Theme**: Styled with a minimalist Dracula-inspired dark theme.
- **Mobile-Friendly Design**: Works on both desktop and mobile devices.
- **Smooth Animations**: Fade-in effect for a better user experience.

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
4. Set up your environment variables (Google Maps API key):
   ```bash
   cp .env.example .env
   ```
   Then, add your Google Maps API key inside the `.env` file.
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

