import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AnalyticsService {
  constructor() {
    this.analyticsPath = path.join(__dirname, '../../analytics-service');
    // Use virtual environment Python
    this.pythonExecutable = path.join(this.analyticsPath, 'venv', 'bin', 'python');
  }

  /**
   * Execute Python script and return parsed JSON result
   */
  async executePythonScript(scriptName, args = []) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.analyticsPath, 'services', scriptName);
      const process = spawn(this.pythonExecutable, [scriptPath, ...args]);
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script error (${scriptName}):`, stderr);
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
          return;
        }
        
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Python output:', stdout);
          reject(new Error(`Failed to parse Python script output: ${parseError.message}`));
        }
      });
      
      process.on('error', (error) => {
        reject(new Error(`Failed to start Python script: ${error.message}`));
      });
      
      // Set timeout for long-running processes
      setTimeout(() => {
        process.kill('SIGTERM');
        reject(new Error('Python script timeout'));
      }, 60000); // 60 second timeout
    });
  }

  /**
   * Get daily analysis for a specific date
   */
  async getDailyAnalysis(dateString) {
    try {
      console.log(`Fetching daily analysis for: ${dateString}`);
      const result = await this.executePythonScript('daily_analysis.py', [dateString]);
      
      // DEBUG: Log what Python returned
      console.log('=== PYTHON SCRIPT RESULT ===');
      console.log('Result keys:', Object.keys(result));
      console.log('Has charts from Python:', 'charts' in result);
      if (result.charts) {
        console.log('Charts keys from Python:', Object.keys(result.charts));
      } else {
        console.log('❌ NO CHARTS FROM PYTHON!');
      }
      
      // Handle different response types from Python script
      if (result.status === 'success') {
        const returnValue = {
          status: 'success',
          data: result.data,
          charts: result.charts, // *** FIXED: Pass through charts ***
          date: result.date,
          timestamp: new Date().toISOString()
        };
        
        // DEBUG: Log what we're returning
        console.log('=== SERVICE RETURN VALUE ===');
        console.log('Return keys:', Object.keys(returnValue));
        console.log('Has charts in return:', 'charts' in returnValue);
        
        return returnValue;
      } else if (result.status === 'no_data') {
        return {
          status: 'no_data',
          type: result.type,
          message: result.message,
          date: result.date,
          data: result.data || null,
          charts: result.charts || null, // *** FIXED: Pass through charts even if no data ***
          timestamp: new Date().toISOString()
        };
      } else if (result.error) {
        throw new Error(result.message);
      }
      
      return result;
    } catch (error) {
      console.error('Daily analysis error:', error);
      return {
        error: true,
        message: `Daily analysis failed: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * Get weekly analysis for a specific date (finds the week containing this date)
   */
  // async getWeeklyAnalysis(dateString) {
  //   try {
  //     console.log(`Fetching weekly analysis for week containing: ${dateString}`);
  //     const result = await this.executePythonScript('weekly_analysis.py', [dateString]);
      
  //     if (result.error) {
  //       throw new Error(result.message);
  //     }
      
  //     return result;
  //   } catch (error) {
  //     console.error('Weekly analysis error:', error);
  //     return {
  //       error: true,
  //       message: `Weekly analysis failed: ${error.message}`,
  //       data: null
  //     };
  //   }
  // }

  /**
   * Get historical analysis between two dates
   */
  // async getHistoricalAnalysis(startDate, endDate, analysisType = 'comparison') {
  //   try {
  //     console.log(`Fetching historical ${analysisType} analysis: ${startDate} to ${endDate}`);
  //     const result = await this.executePythonScript('historical_analysis.py', [startDate, endDate, analysisType]);
      
  //     if (result.error) {
  //       throw new Error(result.message);
  //     }
      
  //     return result;
  //   } catch (error) {
  //     console.error('Historical analysis error:', error);
  //     return {
  //       error: true,
  //       message: `Historical analysis failed: ${error.message}`,
  //       data: null
  //     };
  //   }
  // }

  /**
   * Get quick stats for dashboard
   */
  // async getQuickStats(dateString) {
  //   try {
  //     const dailyAnalysis = await this.getDailyAnalysis(dateString);
      
  //     if (dailyAnalysis.error) {
  //       return {
  //         error: true,
  //         message: 'Failed to fetch quick stats',
  //         data: null
  //       };
  //     }
      
  //     const data = dailyAnalysis.data;
      
  //     return {
  //       date: dateString,
  //       overallRating: data.overview.overallRating,
  //       participationRate: data.overview.participationRate,
  //       totalFeedbacks: data.overview.totalFeedbacks,
  //       alertsCount: data.alerts.length,
  //       bestMeal: this.getBestMeal(data.mealPerformance),
  //       worstMeal: this.getWorstMeal(data.mealPerformance),
  //       trend: this.calculateTrendIndicator(data.mealPerformance),
  //       timestamp: new Date().toISOString()
  //     };
  //   } catch (error) {
  //     console.error('Quick stats error:', error);
  //     return {
  //       error: true,
  //       message: `Quick stats failed: ${error.message}`,
  //       data: null
  //     };
  //   }
  // }

  /**
   * Get current alerts from latest analysis
   */
  // async getCurrentAlerts() {
  //   try {
  //     const yesterday = new Date();
  //     yesterday.setDate(yesterday.getDate() - 1);
  //     const dateString = yesterday.toISOString().split('T')[0];
      
  //     const dailyAnalysis = await this.getDailyAnalysis(dateString);
      
  //     if (dailyAnalysis.error) {
  //       return {
  //         error: true,
  //         message: 'Failed to fetch alerts',
  //         data: []
  //       };
  //     }
      
  //     const alerts = dailyAnalysis.data.alerts || [];
      
  //     // Add severity levels and timestamps
  //     const processedAlerts = alerts.map(alert => ({
  //       ...alert,
  //       id: this.generateAlertId(alert),
  //       severity: this.getAlertSeverity(alert.type),
  //       timestamp: new Date().toISOString(),
  //       date: dateString
  //     }));
      
  //     return {
  //       error: false,
  //       data: processedAlerts,
  //       total: processedAlerts.length,
  //       critical: processedAlerts.filter(a => a.type === 'critical').length,
  //       warning: processedAlerts.filter(a => a.type === 'warning').length,
  //       info: processedAlerts.filter(a => a.type === 'info').length
  //     };
  //   } catch (error) {
  //     console.error('Alerts fetch error:', error);
  //     return {
  //       error: true,
  //       message: `Failed to fetch alerts: ${error.message}`,
  //       data: []
  //     };
  //   }
  // }

  /**
   * Generate analytics report
   */
  // async generateReport(options) {
  //   try {
  //     const { reportType, startDate, endDate, format = 'json' } = options;
      
  //     let analysisResult;
      
  //     switch (reportType) {
  //       case 'daily':
  //         analysisResult = await this.getDailyAnalysis(startDate);
  //         break;
  //       case 'weekly':
  //         analysisResult = await this.getWeeklyAnalysis(startDate);
  //         break;
  //       case 'comparison':
  //         analysisResult = await this.getHistoricalAnalysis(startDate, endDate, 'comparison');
  //         break;
  //       case 'trends':
  //         analysisResult = await this.getHistoricalAnalysis(startDate, endDate, 'trend');
  //         break;
  //       case 'patterns':
  //         analysisResult = await this.getHistoricalAnalysis(startDate, endDate, 'pattern');
  //         break;
  //       default:
  //         throw new Error(`Unknown report type: ${reportType}`);
  //     }
      
  //     if (analysisResult.error) {
  //       return {
  //         error: true,
  //         message: analysisResult.message
  //       };
  //     }
      
  //     // Format the report
  //     const report = this.formatReport(analysisResult, reportType, format);
      
  //     return {
  //       error: false,
  //       data: report.data,
  //       filename: report.filename,
  //       format: format
  //     };
      
  //   } catch (error) {
  //     console.error('Report generation error:', error);
  //     return {
  //       error: true,
  //       message: `Report generation failed: ${error.message}`
  //     };
  //   }
  // }

  /**
   * Check if Python dependencies are installed
   */
  async checkPythonDependencies() {
    try {
      const result = await this.executePythonScript('../utils/check_dependencies.py');
      return result;
    } catch (error) {
      return {
        error: true,
        message: 'Failed to check Python dependencies',
        missing: ['Unable to check']
      };
    }
  }

  /**
   * Install Python dependencies
   */
  async installPythonDependencies() {
    return new Promise((resolve, reject) => {
      const requirementsPath = path.join(this.analyticsPath, 'requirements.txt');
      const process = spawn('pip3', ['install', '-r', requirementsPath]);
      
      let output = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          reject(new Error(`pip install failed: ${output}`));
        }
      });
    });
  }

  // Helper methods
  // getBestMeal(mealPerformance) {
  //   let bestMeal = null;
  //   let bestRating = 0;
    
  //   for (const [meal, data] of Object.entries(mealPerformance)) {
  //     if (data.averageRating > bestRating) {
  //       bestRating = data.averageRating;
  //       bestMeal = { meal, rating: bestRating };
  //     }
  //   }
    
  //   return bestMeal;
  // }

  // getWorstMeal(mealPerformance) {
  //   let worstMeal = null;
  //   let worstRating = 6; // Start with max possible rating + 1
    
  //   for (const [meal, data] of Object.entries(mealPerformance)) {
  //     if (data.averageRating > 0 && data.averageRating < worstRating) {
  //       worstRating = data.averageRating;
  //       worstMeal = { meal, rating: worstRating };
  //     }
  //   }
    
  //   return worstMeal;
  // }

  // calculateTrendIndicator(mealPerformance) {
  //   // Simple trend calculation based on current ratings
  //   const ratings = Object.values(mealPerformance)
  //     .filter(meal => meal.averageRating > 0)
  //     .map(meal => meal.averageRating);
    
  //   if (ratings.length === 0) return 'no_data';
    
  //   const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    
  //   if (avgRating >= 4.0) return 'excellent';
  //   if (avgRating >= 3.5) return 'good';
  //   if (avgRating >= 3.0) return 'average';
  //   return 'poor';
  // }

  // generateAlertId(alert) {
  //   // Generate a simple ID based on alert content
  //   const content = `${alert.type}-${alert.meal || 'general'}-${alert.message}`;
  //   return Buffer.from(content).toString('base64').substring(0, 16);
  // }

  // getAlertSeverity(type) {
  //   const severityMap = {
  //     'critical': 1,
  //     'warning': 2,
  //     'info': 3
  //   };
  //   return severityMap[type] || 3;
  // }

  // formatReport(analysisResult, reportType, format) {
  //   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  //   const filename = `${reportType}-report-${timestamp}.${format}`;
    
  //   if (format === 'json') {
  //     return {
  //       data: JSON.stringify(analysisResult, null, 2),
  //       filename
  //     };
  //   }
    
  //   if (format === 'csv') {
  //     // Convert to CSV format (simplified)
  //     const csvData = this.convertToCSV(analysisResult);
  //     return {
  //       data: csvData,
  //       filename
  //     };
  //   }
    
  //   // Default to JSON
  //   return {
  //     data: JSON.stringify(analysisResult, null, 2),
  //     filename
  //   };
  // }

  // convertToCSV(data) {
  //   // Simple CSV conversion - can be enhanced based on specific needs
  //   try {
  //     const headers = ['Date', 'Metric', 'Value', 'Notes'];
  //     let csvContent = headers.join(',') + '\n';
      
  //     // Add overview data
  //     if (data.data && data.data.overview) {
  //       const overview = data.data.overview;
  //       csvContent += `${data.date || 'N/A'},Overall Rating,${overview.overallRating},\n`;
  //       csvContent += `${data.date || 'N/A'},Participation Rate,${overview.participationRate}%,\n`;
  //       csvContent += `${data.date || 'N/A'},Total Feedbacks,${overview.totalFeedbacks},\n`;
  //     }
      
  //     // Add meal performance data
  //     if (data.data && data.data.mealPerformance) {
  //       const meals = data.data.mealPerformance;
  //       for (const [mealType, mealData] of Object.entries(meals)) {
  //         csvContent += `${data.date || 'N/A'},${mealType} Rating,${mealData.averageRating},\n`;
  //         csvContent += `${data.date || 'N/A'},${mealType} Participation,${mealData.participants},\n`;
  //       }
  //     }
      
  //     return csvContent;
  //   } catch (error) {
  //     console.error('CSV conversion error:', error);
  //     return 'Error converting data to CSV format';
  //   }
  // }
}

export default new AnalyticsService();
