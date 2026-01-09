#!/usr/bin/env python3
"""
Test script for chart generation
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.chart_generator import ChartGenerator
from datetime import datetime, timedelta

def main():
    """Test chart generation with sample data"""
    
    # Sample data structure
    sample_data = {
        "overview": {
            "totalStudents": 150,
            "participatingStudents": 120,
            "participationRate": 80.0,
            "overallRating": 4.2
        },
        "averageRatingPerMeal": {
            "Breakfast": 4.5,
            "Lunch": 3.8,
            "Dinner": 4.1,
            "Night Snacks": 3.9
        },
        "studentRatingPerMeal": {
            "Breakfast": 110,
            "Lunch": 105,
            "Dinner": 115,
            "Night Snacks": 85
        },
        "feedbackDistributionPerMeal": {
            "Breakfast": {
                "1_star": 2,
                "2_star": 5,
                "3_star": 15,
                "4_star": 40,
                "5_star": 48
            },
            "Lunch": {
                "1_star": 8,
                "2_star": 12,
                "3_star": 35,
                "4_star": 30,
                "5_star": 20
            },
            "Dinner": {
                "1_star": 3,
                "2_star": 7,
                "3_star": 20,
                "4_star": 45,
                "5_star": 40
            },
            "Night Snacks": {
                "1_star": 5,
                "2_star": 10,
                "3_star": 25,
                "4_star": 30,
                "5_star": 15
            }
        },
        "sentimentAnalysisPerMeal": {
            "Breakfast": {
                "average_rating": 4.5,
                "total_responses": 110,
                "sentiment_distribution": {
                    "positive": {"count": 88, "percentage": 80.0, "sample_comments": ["Great taste", "Excellent"]},
                    "negative": {"count": 7, "percentage": 6.4, "sample_comments": ["Cold food"]},
                    "neutral": {"count": 15, "percentage": 13.6}
                },
                "dominant_sentiment": "positive"
            },
            "Lunch": {
                "average_rating": 3.8,
                "total_responses": 105,
                "sentiment_distribution": {
                    "positive": {"count": 50, "percentage": 47.6, "sample_comments": ["Good"]},
                    "negative": {"count": 20, "percentage": 19.0, "sample_comments": ["Too salty", "Bad quality"]},
                    "neutral": {"count": 35, "percentage": 33.3}
                },
                "dominant_sentiment": "positive"
            },
            "Dinner": {
                "average_rating": 4.1,
                "total_responses": 115,
                "sentiment_distribution": {
                    "positive": {"count": 85, "percentage": 73.9, "sample_comments": ["Tasty"]},
                    "negative": {"count": 10, "percentage": 8.7, "sample_comments": ["Cold"]},
                    "neutral": {"count": 20, "percentage": 17.4}
                },
                "dominant_sentiment": "positive"
            },
            "Night Snacks": {
                "average_rating": 3.9,
                "total_responses": 85,
                "sentiment_distribution": {
                    "positive": {"count": 45, "percentage": 52.9, "sample_comments": ["Nice"]},
                    "negative": {"count": 15, "percentage": 17.6, "sample_comments": ["Less quantity"]},
                    "neutral": {"count": 25, "percentage": 29.4}
                },
                "dominant_sentiment": "positive"
            }
        }
    }
    
    # Get yesterday's date
    yesterday = datetime.now() - timedelta(days=1)
    date_str = yesterday.strftime('%Y-%m-%d')
    
    print(f"Testing chart generation for: {date_str}")
    
    # Initialize chart generator
    chart_gen = ChartGenerator(output_dir='output')
    
    try:
        # Generate all charts
        charts = chart_gen.generate_all_charts(sample_data, date_str)
        
        print("\n✅ Chart generation successful!")
        print(f"\nGenerated charts:")
        for chart_name, chart_data in charts.items():
            if chart_data['path']:
                print(f"  - {chart_name}: {chart_data['path']}")
            else:
                print(f"  - {chart_name}: No data to generate")
        
        print(f"\n📁 Charts saved to: output/daily/{date_str}/")
        
    except Exception as e:
        print(f"\n❌ Chart generation failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
