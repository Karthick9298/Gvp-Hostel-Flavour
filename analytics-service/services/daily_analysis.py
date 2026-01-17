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

def calculate_quality_consistency(meal_ratings, meal_types):
    """
    Calculate Quality Consistency Score (0-100)
    Measures how consistent food quality is across all meals
    Higher score = more consistent quality across meals
    """
    valid_meal_ratings = []
    for meal_type in meal_types:
        if meal_ratings[meal_type]:
            avg = sum(meal_ratings[meal_type]) / len(meal_ratings[meal_type])
            valid_meal_ratings.append(avg)
    
    if len(valid_meal_ratings) < 2:
        return 0
    
    # Calculate coefficient of variation (lower = more consistent)
    import statistics
    mean = statistics.mean(valid_meal_ratings)
    if mean == 0:
        return 0
    
    std_dev = statistics.stdev(valid_meal_ratings) if len(valid_meal_ratings) > 1 else 0
    cv = (std_dev / mean) * 100 if mean > 0 else 100
    
    # Convert to consistency score (inverse of variation)
    # CV of 0% = 100 score, CV of 50%+ = 0 score
    consistency_score = max(0, min(100, 100 - (cv * 2)))
    
    return round(consistency_score, 1)



def generate_daily_summary(overall_rating, participation_rate, sentiment_analysis, consistency_score):
    """
    Generate a concise 3-4 line daily summary highlighting overall sentiment and trends
    """
    # Determine overall sentiment
    if overall_rating >= 4.0:
        sentiment_tone = "Excellent feedback today"
    elif overall_rating >= 3.5:
        sentiment_tone = "Positive feedback overall"
    elif overall_rating >= 2.5:
        sentiment_tone = "Mixed feedback received"
    else:
        sentiment_tone = "Concerns raised about food quality"
    
    # Identify best and worst performing meals
    meals_with_ratings = [(meal, data['average_rating']) for meal, data in sentiment_analysis.items() 
                          if data['total_responses'] > 0]
    
    summary_lines = []
    
    if meals_with_ratings:
        meals_with_ratings.sort(key=lambda x: x[1], reverse=True)
        best_meal = meals_with_ratings[0]
        worst_meal = meals_with_ratings[-1]
        
        # Line 1: Overall sentiment and participation
        summary_lines.append(
            f"{sentiment_tone} with {overall_rating:.1f}/5 average rating. "
            f"{participation_rate:.0f}% student participation."
        )
        
        # Line 2: Performance highlights
        if best_meal[1] >= 4.0:
            summary_lines.append(
                f"{best_meal[0]} performed excellently ({best_meal[1]:.1f}/5), "
                f"showing high student satisfaction."
            )
        elif best_meal[1] >= 3.0:
            summary_lines.append(
                f"{best_meal[0]} received acceptable ratings ({best_meal[1]:.1f}/5)."
            )
        
        # Line 3: Areas needing attention
        if worst_meal[1] < 3.0:
            negative_pct = sentiment_analysis[worst_meal[0]]['negative_percentage']
            summary_lines.append(
                f"{worst_meal[0]} needs immediate attention ({worst_meal[1]:.1f}/5, "
                f"{negative_pct:.0f}% negative feedback)."
            )
        
        # Line 4: Consistency insight
        if consistency_score >= 70:
            summary_lines.append(
                f"Quality consistency across meals is good ({consistency_score:.0f}/100)."
            )
        elif consistency_score >= 40:
            summary_lines.append(
                f"Quality varies moderately across meals (consistency: {consistency_score:.0f}/100)."
            )
        else:
            summary_lines.append(
                f"Significant quality variation detected across meals (consistency: {consistency_score:.0f}/100)."
            )
    else:
        summary_lines.append("No feedback data available for analysis.")
    
    return " ".join(summary_lines)



## This is main Analysis Function
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
        
        # Checalculate_quality_consistencyck if date is in the future
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
        all_comments = []  # Collect all comments with metadata for NLP sentiment analysis
        participating_students = 0
        
        # Process feedback data
        for feedback in feedback_data:
            user_has_feedback = False
            
            for meal_type in meal_types: ## getting each meal(morning, evening, etc) for each feedback
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
                        # Collect comment with metadata for sentiment analysis
                        all_comments.append({
                            'text': comment.strip(),
                            'meal': meal_names[meal_type],
                            'rating': rating
                        })
            
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
        
        # Sentiment analysis per meal (simplified)
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
                
                # Determine dominant sentiment
                dominant = max(sentiment_counts.items(), key=lambda x: x[1])[0] if sentiment_counts else 'neutral'
                
                # Get sample improvement areas (negative comments)
                negative_comments = [comments[i] for i, r in enumerate(ratings) if r <= 2 and i < len(comments) and comments[i]][:2]
                
                avg_rating = sum(ratings) / len(ratings)
                
                sentiment_analysis_per_meal[meal_name] = {
                    "average_rating": round(avg_rating, 2),
                    "total_responses": total_responses,
                    "positive_percentage": round(positive_pct, 1),
                    "negative_percentage": round(negative_pct, 1),
                    "dominant_sentiment": dominant,
                    "improvement_areas": negative_comments
                }
            else:
                sentiment_analysis_per_meal[meal_name] = {
                    "average_rating": 0,
                    "total_responses": 0,
                    "positive_percentage": 0,
                    "negative_percentage": 0,
                    "dominant_sentiment": "none",
                    "improvement_areas": []
                }
        
        # Calculate Quality Consistency Score (new metric)
        # Measures how consistent the ratings are across all meals
        quality_consistency_score = calculate_quality_consistency(meal_ratings, meal_types)
        
        # Generate concise daily sentiment summary
        daily_summary = generate_daily_summary(
            overall_rating, 
            participation_rate, 
            sentiment_analysis_per_meal,
            quality_consistency_score
        )
        
        # Prepare analysis data
        analysis_data = {
            "overview": {
                "totalStudents": total_students,
                "participatingStudents": participating_students,
                "participationRate": round(participation_rate, 1),
                "overallRating": round(overall_rating, 2),
                "qualityConsistencyScore": quality_consistency_score
            },
            "dailySummary": daily_summary,
            "averageRatingPerMeal": average_ratings_per_meal,
            "studentRatingPerMeal": student_rating_per_meal,
            "feedbackDistributionPerMeal": feedback_distribution_per_meal,
            "sentimentAnalysisPerMeal": sentiment_analysis_per_meal,
            "allComments": all_comments  # Add for NLP sentiment analysis in charts
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
