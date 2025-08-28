import axios from 'axios';

// Always use Azure backend (no localhost, no env)
const api = axios.create({
  baseURL: 'https://reelico-backend-crdtb0d6fva9ane4.uksouth-01.azurewebsites.net',
  withCredentials: false,
});

export default api;
