#!/usr/bin/env python3
"""
Daily Analysis Service
Analyzes feedback data for a specific day and generates visualizations
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.database import DatabaseConnection, get_date_range, safe_json_output, handle_error
from utils.chart_generator import ChartGenerator
from datetime import datetime, timedelta
from collections import Counter

def classify_sentiment(rating):
    """Classify rating into sentiment category"""
    if rating >= 4:
        return 'positive'
    elif rating <= 2:
        return 'negative'
    else:
        return 'neutral'

def analyze_daily_feedback(date_str):
    """Perform comprehensive daily analysis"""
    db_conn = DatabaseConnection()
    
    if not db_conn.connect():
        handle_error("Failed to connect to database", "DATABASE_ERROR")
        return
    
    try:
        # Parse and validate date
        try:
            requested_date = datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            handle_error("Invalid date format. Use YYYY-MM-DD", "INVALID_DATE")
            return
        
        # Check if date is in the future
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        if requested_date > today:
            safe_json_output({
                "status": "no_data",
                "message": f"Feedback will be available after {requested_date.strftime('%Y-%m-%d')}",
                "date": date_str,
                "type": "future_date"
            })
            return
        
        # Get date range for query
        start_date, end_date = get_date_range(date_str)
        
        # Get collections
        feedback_collection = db_conn.get_feedback_collection()
        users_collection = db_conn.get_users_collection()
        
        # Get total registered students
        total_students = users_collection.count_documents({"isAdmin": False})
        
        # Fetch feedback data for the day
        feedback_cursor = feedback_collection.find({
            "date": {
                "$gte": start_date,
                "$lt": end_date
            }
        })
        
        feedback_data = list(feedback_cursor)
        
        if not feedback_data:
            safe_json_output({
                "status": "no_data",
                "message": "No feedback found for this date",
                "date": date_str,
                "type": "no_feedback",
                "data": {
                    "overview": {
                        "totalStudents": total_students,
                        "participatingStudents": 0,
                        "participationRate": 0,
                        "overallRating": 0
                    }
                }
            })
            return
        
        # Initialize data structures
        meal_types = ['morning', 'afternoon', 'evening', 'night']
        meal_names = {
            'morning': 'Breakfast',
            'afternoon': 'Lunch',
            'evening': 'Dinner',
            'night': 'Night Snacks'
        }
        
        meal_ratings = {meal: [] for meal in meal_types}
        meal_comments = {meal: [] for meal in meal_types}
        rating_distribution = {meal: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0} for meal in meal_types}
        
        all_ratings = []
        participating_students = 0
        
        # Process feedback data
        for feedback in feedback_data:
            user_has_feedback = False
            
            for meal_type in meal_types:
                meal_data = feedback.get('meals', {}).get(meal_type, {})
                rating = meal_data.get('rating')
                comment = meal_data.get('comment', '')
                
                if rating is not None:
                    meal_ratings[meal_type].append(rating)
                    all_ratings.append(rating)
                    rating_distribution[meal_type][rating] += 1
                    user_has_feedback = True
                    
                    if comment and comment.strip():
                        meal_comments[meal_type].append(comment.strip())
            
            if user_has_feedback:
                participating_students += 1
        
        # Calculate overview metrics
        overall_rating = sum(all_ratings) / len(all_ratings) if all_ratings else 0
        participation_rate = (participating_students / total_students * 100) if total_students > 0 else 0
        
        # Calculate average ratings per meal
        average_ratings_per_meal = {}
        for meal_type in meal_types:
            if meal_ratings[meal_type]:
                avg = sum(meal_ratings[meal_type]) / len(meal_ratings[meal_type])
                average_ratings_per_meal[meal_names[meal_type]] = round(avg, 2)
            else:
                average_ratings_per_meal[meal_names[meal_type]] = 0
        
        # Calculate student participation per meal
        student_rating_per_meal = {}
        for meal_type in meal_types:
            student_rating_per_meal[meal_names[meal_type]] = len(meal_ratings[meal_type])
        
        # Prepare feedback distribution per meal
        feedback_distribution_per_meal = {}
        for meal_type in meal_types:
            feedback_distribution_per_meal[meal_names[meal_type]] = {
                "1_star": rating_distribution[meal_type][1],
                "2_star": rating_distribution[meal_type][2],
                "3_star": rating_distribution[meal_type][3],
                "4_star": rating_distribution[meal_type][4],
                "5_star": rating_distribution[meal_type][5]
            }
        
        # Sentiment analysis per meal
        sentiment_analysis_per_meal = {}
        for meal_type in meal_types:
            meal_name = meal_names[meal_type]
            ratings = meal_ratings[meal_type]
            comments = meal_comments[meal_type]
            
            if ratings:
                # Count sentiments
                sentiments = [classify_sentiment(r) for r in ratings]
                sentiment_counts = Counter(sentiments)
                
                total_responses = len(ratings)
                positive_count = sentiment_counts.get('positive', 0)
                negative_count = sentiment_counts.get('negative', 0)
                neutral_count = sentiment_counts.get('neutral', 0)
                
                # Calculate percentages
                positive_pct = (positive_count / total_responses * 100) if total_responses > 0 else 0
                negative_pct = (negative_count / total_responses * 100) if total_responses > 0 else 0
                neutral_pct = (neutral_count / total_responses * 100) if total_responses > 0 else 0
                
                # Determine dominant sentiment
                dominant = max(sentiment_counts.items(), key=lambda x: x[1])[0] if sentiment_counts else 'neutral'
                
                # Get sample comments
                positive_comments = [comments[i] for i, r in enumerate(ratings) if r >= 4 and i < len(comments) and comments[i]][:2]
                negative_comments = [comments[i] for i, r in enumerate(ratings) if r <= 2 and i < len(comments) and comments[i]][:2]
                
                avg_rating = sum(ratings) / len(ratings)
                
                sentiment_analysis_per_meal[meal_name] = {
                    "average_rating": round(avg_rating, 2),
                    "total_responses": total_responses,
                    "sentiment_distribution": {
                        "positive": {
                            "count": positive_count,
                            "percentage": round(positive_pct, 1),
                            "sample_comments": positive_comments
                        },
                        "negative": {
                            "count": negative_count,
                            "percentage": round(negative_pct, 1),
                            "sample_comments": negative_comments
                        },
                        "neutral": {
                            "count": neutral_count,
                            "percentage": round(neutral_pct, 1)
                        }
                    },
                    "dominant_sentiment": dominant,
                    "improvement_areas": negative_comments
                }
            else:
                sentiment_analysis_per_meal[meal_name] = {
                    "average_rating": 0,
                    "total_responses": 0,
                    "sentiment_distribution": {
                        "positive": {"count": 0, "percentage": 0, "sample_comments": []},
                        "negative": {"count": 0, "percentage": 0, "sample_comments": []},
                        "neutral": {"count": 0, "percentage": 0}
                    },
                    "dominant_sentiment": "none",
                    "improvement_areas": []
                }
        
        # Prepare analysis data
        analysis_data = {
            "overview": {
                "totalStudents": total_students,
                "participatingStudents": participating_students,
                "participationRate": round(participation_rate, 1),
                "overallRating": round(overall_rating, 2)
            },
            "averageRatingPerMeal": average_ratings_per_meal,
            "studentRatingPerMeal": student_rating_per_meal,
            "feedbackDistributionPerMeal": feedback_distribution_per_meal,
            "sentimentAnalysisPerMeal": sentiment_analysis_per_meal
        }
        
        # Generate charts
        try:
            output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'output')
            chart_gen = ChartGenerator(output_dir=output_dir)
            charts = chart_gen.generate_all_charts(analysis_data, date_str)
        except Exception as chart_error:
            print(f"Chart generation failed: {str(chart_error)}", file=sys.stderr)
            charts = {
                'avgRatings': {'path': None, 'base64': None},
                'distribution': {'path': None, 'base64': None},
                'sentiment': {'path': None, 'base64': None},
                'participation': {'path': None, 'base64': None}
            }
        
        # Output result
        result = {
            "status": "success",
            "date": date_str,
            "data": analysis_data,
            "charts": charts
        }
        
        safe_json_output(result)
        
    except Exception as e:
        handle_error(f"Daily analysis failed: {str(e)}", "ANALYSIS_ERROR")
    finally:
        db_conn.close()

def main():
    """Main entry point"""
    if len(sys.argv) != 2:
        handle_error("Usage: python daily_analysis.py <date_string>", "INVALID_ARGS")
        return
    
    date_str = sys.argv[1]
    analyze_daily_feedback(date_str)

if __name__ == "__main__":
    main()
