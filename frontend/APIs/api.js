//this single file will handle ALL API calls to keep it easy and clean

import axios from 'axios';

// Base URL for the API (your API Gateway endpoint)
const API_URL = 'https://your-api-url'; //the API must be deployed for me to access this


//******** MARKETPLACE *********/
// Function to fetch marketplace listings
export const getMarketplaceListings = async () => {
    try {
      const response = await axios.get(`${API_URL}/marketplace`);
      return response.data; // Returns the listings data
    } catch (error) {
      console.error('Error fetching marketplace listings:', error);
      throw error; // You might want to handle this in your components later
    }
  };