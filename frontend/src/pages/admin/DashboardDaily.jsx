import React, { useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  AverageRatingPerMealChart,
  StudentRatingPerMealChart,
  AllMealsFeedbackDistributionChart
} from '../../components/charts/DailyAnalysisCharts';
import { 
  FaChartBar, 
  FaUsers, 
  FaComments,
  FaCalendarAlt,
  FaStar,
  FaExclamationTriangle,
  FaChartLine,
  FaClock,
  FaUtensils,
  FaCoffee,
  FaLightbulb,
  FaExclamationCircle,
  FaCheckCircle,
  FaSearch
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const DailyAnalysisDashboard = () => {
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });

  const handleAnalyzeClick = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    try {
      setLoading(true);
      setDailyData(null);
      const response = await fetch(`http://localhost:5000/api/analytics/daily/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
        }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setDailyData(data.data);
      } else if (data.status === 'no_data') {
        setDailyData({
          type: data.type,
          message: data.message,
          overview: data.data?.overview || {
            totalStudents: 0,
            participatingStudents: 0,
            participationRate: 0,
            overallRating: 0
          }
        });
      } else {
        console.error('Error in daily analysis:', data.message);
        toast.error(data.message || 'Failed to fetch daily data');
      }
    } catch (error) {
      console.error('Error fetching daily data:', error);
      toast.error('Failed to fetch daily analysis data');
    } finally {
      setLoading(false);
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast': return <FaCoffee className="text-yellow-500" />;
      case 'lunch': return <FaUtensils className="text-orange-500" />;
      case 'dinner': return <FaUtensils className="text-blue-500" />;
      case 'night snacks': return <FaUtensils className="text-green-500" />;
      default: return <FaUtensils className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
              <FaChartBar className="text-2xl text-indigo-600 animate-pulse" />
            </div>
          </div>
          <LoadingSpinner text="Loading daily analysis..." />
          <p className="text-sm text-gray-600 mt-2">Analyzing feedback data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl shadow-lg backdrop-blur-sm">
                <FaChartBar className="text-4xl animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Daily Analysis Dashboard</h1>
                <p className="text-indigo-100 mt-2">Hostel Food Feedback & Insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="space-y-8">
              {/* Date Selector */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Daily Analysis</h2>
                  <p className="text-gray-600 mt-1">Select a date and click 'Analyze' to view insights</p>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Analysis Date:</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      disabled={loading}
                    />
                    <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={loading || !selectedDate}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <FaSearch />
                        <span>Analyze</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Initial State - No Data Loaded */}
              {!loading && !dailyData && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-300 rounded-2xl p-12 text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full">
                      <FaChartBar className="text-indigo-600 text-4xl" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready to Analyze</h3>
                  <p className="text-gray-600 text-lg mb-2">Select a date from the calendar above</p>
                  <p className="text-gray-500">Click the <span className="font-semibold text-indigo-600">'Analyze'</span> button to view detailed insights</p>
                </div>
              )}

              {/* No Feedback State */}
              {dailyData && dailyData.type === 'no_feedback' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-yellow-100 rounded-full">
                      <FaExclamationTriangle className="text-yellow-600 text-2xl" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-yellow-800 mb-2">No Feedback Found</h3>
                  <p className="text-yellow-700">{dailyData.message}</p>
                </div>
              )}

              {/* Future Date State */}
              {dailyData && dailyData.type === 'future_date' && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <FaClock className="text-blue-600 text-2xl" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-blue-800 mb-2">Feedback Not Available</h3>
                  <p className="text-blue-700">{dailyData.message}</p>
                </div>
              )}

              {/* Success Data Display */}
              {dailyData && !dailyData.type && (
                <>
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Students</p>
                            <p className="text-4xl font-bold">{dailyData.overview?.totalStudents || 0}</p>
                          </div>
                          <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                            <FaUsers className="text-3xl" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-100">
                          <FaCheckCircle className="text-sm" />
                          <span className="text-sm">Registered users</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Participation Rate</p>
                            <p className="text-4xl font-bold">{dailyData.overview?.participationRate || 0}%</p>
                          </div>
                          <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                            <FaChartLine className="text-3xl" />
                          </div>
                        </div>
                        <div className="w-full bg-green-400 bg-opacity-30 rounded-full h-2">
                          <div 
                            className="bg-white h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${dailyData.overview?.participationRate || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Overall Rating</p>
                            <p className="text-4xl font-bold">{dailyData.overview?.overallRating || 0}/5.0</p>
                          </div>
                          <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                            <FaStar className="text-3xl" />
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`text-lg ${
                                star <= Math.round(dailyData.overview?.overallRating || 0) 
                                  ? 'text-yellow-300' 
                                  : 'text-purple-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Matplotlib/Seaborn Charts */}
                  {dailyData.charts && (
                    <div className="mt-8">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">AI-Generated Visual Analysis</h3>
                        <p className="text-gray-600">Professional data visualizations using matplotlib & seaborn</p>
                      </div>
                      
                      <div className="space-y-8">
                        {dailyData.charts.avgRatings?.base64 && (
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                              <FaChartBar className="text-indigo-600" />
                              <span>Average Ratings per Meal</span>
                            </h4>
                            <div className="flex justify-center">
                              <img 
                                src={dailyData.charts.avgRatings.base64} 
                                alt="Average Ratings per Meal"
                                className="max-w-full h-auto rounded-lg shadow-md"
                              />
                            </div>
                          </div>
                        )}

                        {dailyData.charts.distribution?.base64 && (
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                              <FaChartBar className="text-purple-600" />
                              <span>Rating Distribution by Star</span>
                            </h4>
                            <div className="flex justify-center">
                              <img 
                                src={dailyData.charts.distribution.base64} 
                                alt="Rating Distribution"
                                className="max-w-full h-auto rounded-lg shadow-md"
                              />
                            </div>
                          </div>
                        )}

                        {dailyData.charts.sentiment?.base64 && (
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                              <FaComments className="text-green-600" />
                              <span>Sentiment Analysis per Meal</span>
                            </h4>
                            <div className="flex justify-center">
                              <img 
                                src={dailyData.charts.sentiment.base64} 
                                alt="Sentiment Analysis"
                                className="max-w-full h-auto rounded-lg shadow-md"
                              />
                            </div>
                          </div>
                        )}

                        {dailyData.charts.participation?.base64 && (
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                              <FaUsers className="text-blue-600" />
                              <span>Student Participation Rate</span>
                            </h4>
                            <div className="flex justify-center">
                              <img 
                                src={dailyData.charts.participation.base64} 
                                alt="Participation Rate"
                                className="max-w-full h-auto rounded-lg shadow-md"
                              />
                            </div>
                          </div>
                        )}

                        {dailyData.charts.wordcloud?.base64 && (
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                              <FaComments className="text-pink-600" />
                              <span>Comment Word Cloud</span>
                            </h4>
                            <div className="flex justify-center">
                              <img 
                                src={dailyData.charts.wordcloud.base64} 
                                alt="Word Cloud"
                                className="max-w-full h-auto rounded-lg shadow-md"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interactive Charts */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Interactive Charts</h3>
                      <p className="text-gray-600">Chart.js powered interactive visualizations</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      <AverageRatingPerMealChart 
                        data={dailyData.averageRatingPerMeal || {}}
                        title="Average Rating per Meal"
                      />
                      <StudentRatingPerMealChart 
                        data={dailyData.studentRatingPerMeal || {}}
                        title="Student Participation per Meal"
                      />
                    </div>

                    <AllMealsFeedbackDistributionChart 
                      data={dailyData.feedbackDistributionPerMeal || {}}
                    />
                  </div>

                  {/* Sentiment Details */}
                  {dailyData.sentimentAnalysisPerMeal && (
                    <div className="mt-8">
                      <h4 className="text-xl font-bold text-gray-900 mb-6">Detailed Sentiment Analysis</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {Object.entries(dailyData.sentimentAnalysisPerMeal).map(([meal, data]) => {
                          const avgRating = data.average_rating || 0;
                          const statusIcon = avgRating >= 4 ? '🟢' : avgRating >= 3 ? '🟡' : '🔴';
                          const statusText = avgRating >= 4 ? 'Performing Well' : avgRating >= 3 ? 'Needs Attention' : 'Urgent Action Required';
                          const statusColor = avgRating >= 4 ? 'green' : avgRating >= 3 ? 'yellow' : 'red';

                          return (
                            <div key={meal} className={`bg-white rounded-xl p-6 shadow-md border-2 border-${statusColor}-200`}>
                              <div className="flex items-start justify-between mb-4">
                                <h5 className="font-bold text-lg text-gray-900 flex items-center space-x-2">
                                  {getMealIcon(meal.toLowerCase())}
                                  <span>{meal}</span>
                                </h5>
                                <div className="flex flex-col items-end">
                                  <span className="text-2xl mb-1">{statusIcon}</span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${statusColor}-100 text-${statusColor}-800`}>
                                    {statusText}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Average Rating:</span>
                                  <span className="font-bold text-lg">{data.average_rating}/5.0</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Total Responses:</span>
                                  <span className="font-medium">{data.total_responses}</span>
                                </div>

                                {data.improvement_areas && data.improvement_areas.length > 0 ? (
                                  <div>
                                    <p className="text-sm font-semibold text-red-700 mb-3 flex items-center">
                                      <FaExclamationTriangle className="mr-2" /> 
                                      Action Required ({data.improvement_areas.length} issues)
                                    </p>
                                    <ul className="text-sm space-y-2">
                                      {data.improvement_areas.slice(0, 3).map((comment, i) => (
                                        <li key={i} className="flex items-start space-x-2 bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                                          <span className="text-red-600 font-bold text-xs mt-0.5">#{i + 1}</span>
                                          <span className="text-gray-800 flex-1">&quot;{comment}&quot;</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                                    <p className="text-sm font-medium text-green-700 flex items-center">
                                      <FaCheckCircle className="mr-2" />
                                      No negative feedback
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Overall Summary */}
                  {dailyData.overallSummary && (
                    <div className="mt-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-indigo-200 shadow-lg">
                      <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                        <FaChartLine className="text-indigo-600" />
                        <span>Daily Action Dashboard</span>
                      </h4>

                      {dailyData.overallSummary.performance_summary && (
                        <div className="bg-white rounded-xl p-4 mb-6 border-l-4 border-indigo-500 shadow-sm">
                          <p className="text-gray-700 text-sm font-mono">{dailyData.overallSummary.performance_summary}</p>
                        </div>
                      )}

                      <div className="space-y-6">
                        {dailyData.overallSummary.key_insights && dailyData.overallSummary.key_insights.length > 0 && (
                          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
                            <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center space-x-2">
                              <FaLightbulb className="text-blue-500" />
                              <span>Key Insights</span>
                            </h5>
                            <div className="space-y-3">
                              {dailyData.overallSummary.key_insights.map((insight, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                                  <span className="flex items-center justify-center w-7 h-7 bg-blue-500 text-white text-sm font-bold rounded-full">
                                    {index + 1}
                                  </span>
                                  <p className="text-sm font-medium text-gray-800 pt-1">{insight}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {dailyData.overallSummary.critical_actions && dailyData.overallSummary.critical_actions.length > 0 && (
                          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-red-500">
                            <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center space-x-2">
                              <FaExclamationTriangle className="text-red-500" />
                              <span>Priority Actions</span>
                            </h5>
                            <div className="space-y-3">
                              {dailyData.overallSummary.critical_actions.map((action, index) => (
                                <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                                  <span className="text-2xl">{index === 0 ? '🔴' : '🟡'}</span>
                                  <p className="text-sm text-gray-800 font-medium">{action}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Error State */}
              {!dailyData && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                  <FaExclamationCircle className="text-red-600 text-4xl mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h3>
                  <p className="text-red-700 mb-4">Unable to load daily analysis.</p>
                  <button 
                    onClick={handleAnalyzeClick}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAnalysisDashboard;
