import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform} from 'react-native';
import {roundToNearestPoint5} from './functions';
import moment from 'moment';

export async function getTemperature(temperature, temperatureExpiryDate) {
  const currentDate = new Date().toISOString().split('T')[0];

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      return Geolocation.requestAuthorization('whenInUse');
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  };

  const fetchTemperature = async (latitude: number, longitude: number) => {
    const API_KEY = 'ad908ef8b352ebf0749f38acd4ba6501';
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
      );
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
      );
      const data = await response.json();
      const forecastData = await forecastResponse.json();
      return {
        tempMin: roundToNearestPoint5(data.main.temp_min),
        tempMax: roundToNearestPoint5(data.main.temp_max),
        weather:
          data.weather[0].main === 'Clouds' ? 'Cloudy' : data.weather[0].main,
        windSpeed: roundToNearestPoint5(data.wind.speed * 3.6),
        humidity: roundToNearestPoint5(data.main.humidity),
        precipitation: roundToNearestPoint5(data?.rain?.['1h'] || 0),
        date: `${moment(new Date()).format('DD-MM-YYYY hh:mm A')}`,
        forecast: forecastData.list.splice(0, 5).map(item => ({
          date: moment(item.dt_txt).format('hh:mm A'),
          temp: roundToNearestPoint5(item.main.temp),
          weather:
            item.weather[0].main === 'Clouds' ? 'Cloudy' : item.weather[0].main,
        })),
      };
    } catch (error) {
      console.error(error);
      return {
        tempMin: '',
        tempMax: '',
        forecast: [],
      };
    }
  };

  if (temperature && temperatureExpiryDate === currentDate) {
    return temperature;
  } else {
    try {
      const permissionGranted = await requestLocationPermission();
      if (permissionGranted) {
        const location = await new Promise((resolve, reject) =>
          Geolocation.getCurrentPosition(
            position => resolve(position),
            error => reject(error),
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          ),
        );

        const newTemperature = await fetchTemperature(
          location.coords.latitude,
          location.coords.longitude,
        );
        return {data: newTemperature, expiryDate: currentDate};
      } else {
        throw new Error('Location permission not granted');
      }
    } catch (error) {
      console.error(error);
      return {
        data: {
          tempMin: '',
          tempMax: '',
        },
      };
    }
  }
}
