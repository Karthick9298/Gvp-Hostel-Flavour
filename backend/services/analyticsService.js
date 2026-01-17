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
    // Use virtual environment Python from root .venv
    this.pythonExecutable = path.join(__dirname, '../..', '.venv', 'bin', 'python');
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
   * Install Python dependencies
   */
  async installPythonDependencies() {
    return new Promise((resolve, reject) => {
      const requirementsPath = path.join(this.analyticsPath, 'requirements.txt');
      const process = spawn('pip', ['install', '-r', requirementsPath]);
      
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

}

export default new AnalyticsService();
