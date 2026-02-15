import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class AnalyticsService {
  constructor() {
    // Analytics API base URL from environment variable
    this.analyticsApiUrl = process.env.ANALYTICS_API_URL || 'http://localhost:8000';
  }

  /**
   * Get daily analysis for a specific date from FastAPI service
   */
  async getDailyAnalysis(dateString) {
    try {
      // console.log(`Fetching daily analysis from FastAPI for: ${dateString}`);
      
      const response = await axios.get(
        `${this.analyticsApiUrl}/api/analytics/daily/${dateString}`,
        {
          params: {
            include_charts: true
          },
          timeout: 60000 // 60 second timeout
        }
      );
      
      const result = response.data;
      
      // console.log('=== FASTAPI RESPONSE ===');
      // console.log('Status:', result.status);
      // console.log('Has charts:', 'charts' in result);
      
      // Handle different response types
      if (result.status === 'success') {
        return {
          status: 'success',
          data: result.data,
          charts: result.charts,
          date: result.date,
          timestamp: result.timestamp || new Date().toISOString()
        };
      } else if (result.status === 'no_data') {
        return {
          status: 'no_data',
          type: result.type,
          message: result.message,
          date: result.date,
          data: result.data || null,
          charts: result.charts || null,
          timestamp: result.timestamp || new Date().toISOString()
        };
      }
      
      return result;
    } catch (error) {
      console.error('Analytics API error:', error.message);
      
      // Handle network errors
      if (error.code === 'ECONNREFUSED') {
        return {
          error: true,
          message: 'Analytics service is not available. Please ensure it is running.',
          data: null
        };
      }
      
      // Handle timeout errors
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        return {
          error: true,
          message: 'Analytics service timeout. Please try again.',
          data: null
        };
      }
      
      // Handle HTTP errors
      if (error.response) {
        return {
          error: true,
          message: error.response.data?.detail || error.response.data?.message || 'Analytics service error',
          data: null
        };
      }
      
      return {
        error: true,
        message: `Daily analysis failed: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * Check analytics service health
   */
  async checkHealth() {
    try {
      const response = await axios.get(
        `${this.analyticsApiUrl}/health`,
        { timeout: 5000 }
      );
      
      return {
        available: true,
        ...response.data
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Legacy method for compatibility - checks Python dependencies
   * Now checks if FastAPI service is running
   */
  async checkPythonDependencies() {
    return await this.checkHealth();
  }
}

export default new AnalyticsService();
