import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { analyticsAPI } from '../../config/api';
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

      const data = await analyticsAPI.getDailyAnalysis(selectedDate);

      if (data.status === 'success') {
        // Include charts from response along with data
        const mergedData = {
          ...data.data,
          charts: data.charts
        };
        setDailyData(mergedData);
        toast.success('Analysis completed successfully!');
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
        toast.info(data.message || 'No feedback data available for this date');
      } else {
        toast.error(data.message || 'Failed to fetch daily data');
      }
    } catch (error) {
      console.error('Error in daily analysis:', error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch daily analysis data';
      toast.error(errorMessage);
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
      <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fadeIn border border-primary-800/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>

            <div className="relative">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="p-3 sm:p-4 bg-white bg-opacity-20 rounded-2xl shadow-lg backdrop-blur-sm flex-shrink-0">
                  <FaChartBar className="text-2xl sm:text-4xl animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Daily Analysis Dashboard</h1>
                  <p className="text-white text-opacity-90 mt-2">Hostel Food Feedback & Insights</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="bg-navy-800 rounded-2xl shadow-2xl border border-navy-700 p-8 sm:p-12 lg:p-16 relative overflow-hidden">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-pink-900/10 animate-pulse"></div>

            <div className="relative flex flex-col items-center justify-center space-y-6">
              {/* Loading Text with Gradient */}
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Analyzing Data...
                </h3>
                <p className="text-gray-300 text-lg">Generating insights and visualizations for {selectedDate}</p>

                {/* Progress Indicators */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <span>Processing feedback data</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <span>Creating visualizations</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span>Analyzing sentiment</span>
                  </div>
                </div>

                {/* Animated Dots */}
                <div className="mt-6 flex items-center justify-center space-x-2">
                  <div
                    className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce-fast shadow-lg shadow-indigo-500/50"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-purple-400 rounded-full animate-bounce-fast shadow-lg shadow-purple-500/50"
                    style={{ animationDelay: "120ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-pink-400 rounded-full animate-bounce-fast shadow-lg shadow-pink-500/50"
                    style={{ animationDelay: "240ms" }}
                  ></div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800
 text-white rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fadeIn border border-primary-800/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>

          <div className="relative">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="p-3 sm:p-4 bg-white bg-opacity-20 rounded-2xl shadow-lg backdrop-blur-sm flex-shrink-0">
                <FaChartBar className="text-2xl sm:text-4xl animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Daily Analysis Dashboard</h1>
                <p className="text-white text-opacity-90 mt-2">Hostel Food Feedback & Insights</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-navy-800 rounded-2xl shadow-xl border border-navy-700 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-6 sm:space-y-8">
              {/* Date Selector - Responsive Layout */}
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">Daily Analysis</h2>
                  <p className="text-gray-400 mt-1 text-sm sm:text-base">Select a date and click 'Analyze' to view insights</p>
                </div>

                {/* Controls - Stack on mobile, side-by-side on desktop */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                  {/* Date Input with Label */}
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Analysis Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-navy-900 border border-navy-700 text-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-base transition-all hover:border-indigo-600"
                        disabled={loading}
                      />
                      <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={loading || !selectedDate}
                    className="w-full sm:w-auto sm:min-w-[200px] px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 text-base"
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
                <div className="bg-gradient-to-br from-navy-800 to-navy-900 border-2 border-dashed border-indigo-700/40 rounded-2xl p-12 text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-6 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-2 border-indigo-700/40 rounded-full">
                      <FaChartBar className="text-indigo-400 text-4xl" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-100 mb-3">Ready to Analyze</h3>
                  <p className="text-gray-300 text-lg mb-2">Select a date from the calendar above</p>
                  <p className="text-gray-400">Click the <span className="font-semibold text-indigo-400">'Analyze'</span> button to view detailed insights</p>
                </div>
              )}

              {/* No Feedback State */}
              {dailyData && dailyData.type === 'no_feedback' && (
                <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-2xl p-8 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-yellow-900/30 border border-yellow-700/40 rounded-full">
                      <FaExclamationTriangle className="text-yellow-400 text-2xl" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-yellow-300 mb-2">No Feedback Found</h3>
                  <p className="text-yellow-400">{dailyData.message}</p>
                </div>
              )}

              {/* Future Date State */}
              {dailyData && dailyData.type === 'future_date' && (
                <div className="bg-blue-900/20 border border-blue-700/40 rounded-2xl p-8 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-blue-900/30 border border-blue-700/40 rounded-full">
                      <FaClock className="text-blue-400 text-2xl" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-blue-300 mb-2">Feedback Not Available</h3>
                  <p className="text-blue-400">{dailyData.message}</p>
                </div>
              )}

              {/* Success Data Display */}
              {dailyData && !dailyData.type && (
                <>
                  {/* Daily Summary Section */}
                  {dailyData.dailySummary && (
                    <div className="mb-8 bg-gradient-to-r from-navy-800 to-navy-900 rounded-2xl p-6 border-2 border-indigo-700/40 shadow-lg">
                      <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center space-x-2">
                        <FaLightbulb className="text-indigo-400" />
                        <span>Daily Summary</span>
                      </h3>
                      <p className="text-gray-200 leading-relaxed text-base">
                        {dailyData.dailySummary}
                      </p>
                    </div>
                  )}

                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-navy-900 bg-opacity-30 rounded-full -mr-12 -mt-12"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Students</p>
                            <p className="text-4xl font-bold">{dailyData.overview?.totalStudents || 0}</p>
                          </div>
                          <div className="p-3 bg-navy-900 bg-opacity-40 rounded-xl backdrop-blur-sm">
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
                      <div className="absolute top-0 right-0 w-24 h-24 bg-navy-900 bg-opacity-30 rounded-full -mr-12 -mt-12"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Participation Rate</p>
                            <p className="text-4xl font-bold">{dailyData.overview?.participationRate || 0}%</p>
                          </div>
                          <div className="p-3 bg-navy-900 bg-opacity-40 rounded-xl backdrop-blur-sm">
                            <FaChartLine className="text-3xl" />
                          </div>
                        </div>
                        <div className="w-full bg-green-900 bg-opacity-40 rounded-full h-2">
                          <div
                            className="bg-green-200 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${dailyData.overview?.participationRate || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-navy-900 bg-opacity-30 rounded-full -mr-12 -mt-12"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-amber-100 text-sm font-medium uppercase tracking-wide">Quality Consistency</p>
                            <p className="text-4xl font-bold">{dailyData.overview?.qualityConsistencyScore || 0}/100</p>
                          </div>
                          <div className="p-3 bg-navy-900 bg-opacity-40 rounded-xl backdrop-blur-sm">
                            <FaChartLine className="text-3xl" />
                          </div>
                        </div>
                        <div className="text-amber-100 text-sm">
                          {(dailyData.overview?.qualityConsistencyScore || 0) >= 70
                            ? '🟢 Highly Consistent'
                            : (dailyData.overview?.qualityConsistencyScore || 0) >= 40
                              ? '🟡 Moderately Consistent'
                              : '🔴 Needs Improvement'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-navy-900 bg-opacity-30 rounded-full -mr-12 -mt-12"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Overall Rating</p>
                            <p className="text-4xl font-bold">{dailyData.overview?.overallRating || 0}/5.0</p>
                          </div>
                          <div className="p-3 bg-navy-900 bg-opacity-40 rounded-xl backdrop-blur-sm">
                            <FaStar className="text-3xl" />
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`text-lg ${star <= Math.round(dailyData.overview?.overallRating || 0)
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
                        <h3 className="text-2xl font-bold text-gray-100 mb-2">AI-Generated Visual Analysis</h3>
                        <p className="text-gray-400">Professional data visualizations using matplotlib & seaborn</p>
                      </div>

                      <div className="space-y-8">
                        {dailyData.charts.avgRatings?.base64 && (
                          <div className="bg-navy-800 rounded-2xl p-6 shadow-xl border border-navy-700">
                            <h4 className="text-xl font-bold text-gray-100 mb-4 flex items-center space-x-2">
                              <FaChartBar className="text-indigo-400" />
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
                          <div className="bg-navy-800 rounded-2xl p-6 shadow-xl border border-navy-700">
                            <h4 className="text-xl font-bold text-gray-100 mb-4 flex items-center space-x-2">
                              <FaChartBar className="text-purple-400" />
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
                          <div className="bg-navy-800 rounded-2xl p-6 shadow-xl border border-navy-700">
                            <h4 className="text-xl font-bold text-gray-100 mb-4 flex items-center space-x-2">
                              <FaComments className="text-green-400" />
                              <span>Sentiment Analysis (NLP-Based)</span>
                            </h4>
                            <div className="flex justify-center">
                              <img
                                src={dailyData.charts.sentiment.base64}
                                alt="Sentiment Analysis"
                                className="max-w-full h-auto rounded-lg shadow-md"
                              />
                            </div>

                            {/* Display Top Comments if available */}
                            {dailyData.charts.sentiment.topComments && (
                              <div className="mt-6 grid md:grid-cols-2 gap-6">
                                {/* Positive Comments */}
                                {dailyData.charts.sentiment.topComments.positive?.length > 0 && (
                                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/40">
                                    <h5 className="font-bold text-green-300 mb-3 flex items-center">
                                      <span className="mr-2">✅</span> Top Positive Comments
                                    </h5>
                                    <div className="space-y-3">
                                      {dailyData.charts.sentiment.topComments.positive.map((comment, idx) => (
                                        <div key={idx} className="bg-navy-900/60 rounded p-3 shadow-sm border border-green-800/30">
                                          <p className="text-sm text-gray-300 mb-1">"{comment.text}"</p>
                                          <p className="text-xs text-gray-500">
                                            {comment.meal} • {comment.rating}★
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Negative Comments */}
                                {dailyData.charts.sentiment.topComments.negative?.length > 0 && (
                                  <div className="bg-red-900/20 rounded-lg p-4 border border-red-700/40">
                                    <h5 className="font-bold text-red-300 mb-3 flex items-center">
                                      <span className="mr-2">❌</span> Top Concerns
                                    </h5>
                                    <div className="space-y-3">
                                      {dailyData.charts.sentiment.topComments.negative.map((comment, idx) => (
                                        <div key={idx} className="bg-navy-900/60 rounded p-3 shadow-sm border border-red-800/30">
                                          <p className="text-sm text-gray-300 mb-1">"{comment.text}"</p>
                                          <p className="text-xs text-gray-500">
                                            {comment.meal} • {comment.rating}★
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {dailyData.charts.participation?.base64 && (
                          <div className="bg-navy-800 rounded-2xl p-6 shadow-xl border border-navy-700">
                            <h4 className="text-xl font-bold text-gray-100 mb-4 flex items-center space-x-2">
                              <FaUsers className="text-blue-400" />
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
                          <div className="bg-navy-800 rounded-2xl p-6 shadow-xl border border-navy-700">
                            <h4 className="text-xl font-bold text-gray-100 mb-4 flex items-center space-x-2">
                              <FaComments className="text-pink-400" />
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAnalysisDashboard;
