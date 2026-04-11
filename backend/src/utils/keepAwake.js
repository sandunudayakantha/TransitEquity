import axios from 'axios';

/**
 * Pings the server to keep it awake on hosting platforms like Render Free Tier.
 */
const keepAwake = () => {
  const url = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}/health`;
  
  if (!url) return;

  // Run every 14 minutes (Render spins down after 15 mins of inactivity)
  setInterval(async () => {
    try {
      console.log(`[Keep-Awake] Pinging server at ${url}...`);
      await axios.get(url);
    } catch (error) {
      console.error('[Keep-Awake] Ping failed:', error.message);
    }
  }, 14 * 60 * 1000); 
};

export default keepAwake;
