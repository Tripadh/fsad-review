import axios from 'axios';

// Standalone demo file: intentionally triggers a failed Axios request.
// This file is NOT imported anywhere in the app.
async function runAxiosFailureDemo() {
  try {
    await axios.get('http://localhost:9999/this-endpoint-does-not-exist');
    console.log('Unexpected success');
  } catch (error) {
    console.log('Axios demo failure captured.');
    console.log('Message:', error.message);
    console.log('Code:', error.code);

    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('No response received from server.');
    }
  }
}

runAxiosFailureDemo();
