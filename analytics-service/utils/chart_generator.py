#!/usr/bin/env python3
"""
Chart Generation Utility - Creates visualizations for daily analysis
"""

import os
import base64
from io import BytesIO
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

# Set style
sns.set_theme(style="whitegrid")
plt.rcParams['figure.facecolor'] = 'white'
plt.rcParams['axes.facecolor'] = 'white'

class ChartGenerator:
    def __init__(self, output_dir='output'):
        self.output_dir = output_dir
        
    def get_date_dir(self, date_str):
        """Get and create directory for specific date"""
        date_dir = os.path.join(self.output_dir, 'daily', date_str)
        os.makedirs(date_dir, exist_ok=True)
        return date_dir
    
    def save_and_encode(self, fig, filepath):
        """Save figure to file and return base64 encoding"""
        # Save to file
        fig.savefig(filepath, dpi=100, bbox_inches='tight', facecolor='white')
        
        # Convert to base64
        buffer = BytesIO()
        fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight', facecolor='white')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close(fig)
        
        return {
            'path': filepath,
            'base64': f'data:image/png;base64,{image_base64}'
        }
    
    def generate_avg_ratings_chart(self, data, date_str):
        """Generate average ratings bar chart"""
        meal_data = data.get('averageRatingPerMeal', {})
        
        if not meal_data or all(v == 0 for v in meal_data.values()):
            return {'path': None, 'base64': None}
        
        fig, ax = plt.subplots(figsize=(10, 6))
        
        meals = list(meal_data.keys())
        ratings = list(meal_data.values())
        
        # Color-coded bars
        colors = ['#dc2626' if r < 2.5 else '#f59e0b' if r < 3.5 else '#16a34a' for r in ratings]
        
        bars = ax.bar(meals, ratings, color=colors, alpha=0.8, edgecolor='black')
        
        # Add value labels
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{height:.2f}', ha='center', va='bottom', fontsize=11, fontweight='bold')
        
        ax.set_ylabel('Average Rating', fontsize=12, fontweight='bold')
        ax.set_xlabel('Meal Type', fontsize=12, fontweight='bold')
        ax.set_title('Average Rating per Meal', fontsize=14, fontweight='bold', pad=20)
        ax.set_ylim(0, 5.5)
        ax.grid(axis='y', alpha=0.3)
        
        filepath = os.path.join(self.get_date_dir(date_str), 'avg_ratings.png')
        return self.save_and_encode(fig, filepath)
    
    def generate_rating_distribution_chart(self, data, date_str):
        """Generate stacked bar chart for rating distribution"""
        distribution_data = data.get('feedbackDistributionPerMeal', {})
        
        if not distribution_data:
            return {'path': None, 'base64': None}
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        meals = list(distribution_data.keys())
        stars = ['1_star', '2_star', '3_star', '4_star', '5_star']
        colors = ['#dc2626', '#f59e0b', '#fbbf24', '#84cc16', '#16a34a']
        
        # Prepare data for stacking
        star_counts = {star: [] for star in stars}
        for meal in meals:
            for star in stars:
                star_counts[star].append(distribution_data[meal].get(star, 0))
        
        # Create stacked bars
        x = range(len(meals))
        bottom = [0] * len(meals)
        
        for star, color in zip(stars, colors):
            values = star_counts[star]
            ax.bar(x, values, bottom=bottom, label=star.replace('_', ' ').title(), 
                   color=color, alpha=0.8, edgecolor='black')
            bottom = [b + v for b, v in zip(bottom, values)]
        
        ax.set_ylabel('Number of Ratings', fontsize=12, fontweight='bold')
        ax.set_xlabel('Meal Type', fontsize=12, fontweight='bold')
        ax.set_title('Rating Distribution per Meal', fontsize=14, fontweight='bold', pad=20)
        ax.set_xticks(x)
        ax.set_xticklabels(meals, rotation=0)
        ax.legend(title='Rating', bbox_to_anchor=(1.05, 1), loc='upper left')
        ax.grid(axis='y', alpha=0.3)
        
        filepath = os.path.join(self.get_date_dir(date_str), 'rating_distribution.png')
        return self.save_and_encode(fig, filepath)
    
    def generate_sentiment_chart(self, data, date_str):
        """Generate sentiment analysis pie charts"""
        sentiment_data = data.get('sentimentAnalysisPerMeal', {})
        
        if not sentiment_data:
            return {'path': None, 'base64': None}
        
        fig, axes = plt.subplots(2, 2, figsize=(14, 12))
        axes = axes.flatten()
        
        colors = ['#16a34a', '#dc2626', '#6b7280']  # positive, negative, neutral
        
        for idx, (meal, meal_data) in enumerate(sentiment_data.items()):
            if idx >= 4:
                break
            
            # Use simplified sentiment structure
            positive_pct = meal_data.get('positive_percentage', 0)
            negative_pct = meal_data.get('negative_percentage', 0)
            neutral_pct = 100 - positive_pct - negative_pct
            
            labels = []
            sizes = []
            
            if positive_pct > 0:
                labels.append('Positive')
                sizes.append(positive_pct)
            if negative_pct > 0:
                labels.append('Negative')
                sizes.append(negative_pct)
            if neutral_pct > 0:
                labels.append('Neutral')
                sizes.append(neutral_pct)
            
            if sizes:
                axes[idx].pie(sizes, labels=labels, colors=colors[:len(sizes)], 
                             autopct='%1.1f%%', startangle=90, textprops={'fontsize': 10})
                axes[idx].set_title(f'{meal}\n(Avg: {meal_data.get("average_rating", 0):.2f}/5)', 
                                   fontsize=12, fontweight='bold')
            else:
                axes[idx].text(0.5, 0.5, 'No Data', ha='center', va='center', 
                              fontsize=14, transform=axes[idx].transAxes)
                axes[idx].set_title(meal, fontsize=12, fontweight='bold')
        
        plt.suptitle('Sentiment Analysis per Meal', fontsize=16, fontweight='bold', y=0.98)
        plt.tight_layout()
        
        filepath = os.path.join(self.get_date_dir(date_str), 'sentiment_analysis.png')
        return self.save_and_encode(fig, filepath)
    
    def generate_participation_chart(self, data, date_str):
        """Generate participation donut chart"""
        overview = data.get('overview', {})
        total_students = overview.get('totalStudents', 0)
        participating = overview.get('participatingStudents', 0)
        
        if total_students == 0:
            return {'path': None, 'base64': None}
        
        fig, ax = plt.subplots(figsize=(8, 8))
        
        non_participating = total_students - participating
        sizes = [participating, non_participating]
        labels = ['Participated', 'Did Not Participate']
        colors = ['#16a34a', '#dc2626']
        
        wedges, texts, autotexts = ax.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%',
                                           startangle=90, textprops={'fontsize': 12})
        
        # Draw circle for donut effect
        centre_circle = plt.Circle((0, 0), 0.70, fc='white')
        ax.add_artist(centre_circle)
        
        # Add center text
        participation_rate = overview.get('participationRate', 0)
        ax.text(0, 0, f'{participation_rate:.1f}%', ha='center', va='center', 
               fontsize=24, fontweight='bold')
        
        ax.set_title('Student Participation Rate', fontsize=14, fontweight='bold', pad=20)
        
        filepath = os.path.join(self.get_date_dir(date_str), 'participation.png')
        return self.save_and_encode(fig, filepath)
    
    def generate_all_charts(self, data, date_str):
        """Generate all charts and return their paths and base64 data"""
        return {
            'avgRatings': self.generate_avg_ratings_chart(data, date_str),
            'distribution': self.generate_rating_distribution_chart(data, date_str),
            'sentiment': self.generate_sentiment_chart(data, date_str),
            'participation': self.generate_participation_chart(data, date_str)
        }
