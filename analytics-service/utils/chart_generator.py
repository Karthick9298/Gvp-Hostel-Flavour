#!/usr/bin/env python3
"""
Chart Generation Utility - Creates visualizations for daily analysis
Enhanced with beautiful UI and sentiment analysis
"""

import os
import base64
from io import BytesIO
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from textblob import TextBlob

# Set style for beautiful charts
sns.set_theme(style="whitegrid")
plt.rcParams['figure.facecolor'] = 'white'
plt.rcParams['axes.facecolor'] = '#f8fafc'
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 10

class ChartGenerator:
    def __init__(self, output_dir='output'):
        self.output_dir = output_dir
        
        # Beautiful color schemes
        self.meal_colors = {
            'Breakfast': '#FF6B6B',
            'Lunch': '#4ECDC4',
            'Dinner': '#45B7D1',
            'Night Snacks': '#FFA07A'
        }
        
        self.rating_colors = {
            1: '#EF4444',  # Red
            2: '#F59E0B',  # Orange
            3: '#FCD34D',  # Yellow
            4: '#84CC16',  # Light Green
            5: '#10B981'   # Green
        }
        
        self.sentiment_colors = {
            'positive': '#10B981',
            'neutral': '#94A3B8',
            'negative': '#EF4444'
        }
    
    def analyze_comment_sentiment(self, comment):
        """Analyze sentiment of a single comment using TextBlob"""
        try:
            blob = TextBlob(comment)
            polarity = blob.sentiment.polarity
            
            # Classify based on polarity score (-1 to 1)
            if polarity > 0.1:
                return 'positive', polarity
            elif polarity < -0.1:
                return 'negative', polarity
            else:
                return 'neutral', polarity
        except:
            return 'neutral', 0.0
    
    def get_date_dir(self, date_str):
        """Get and create directory for specific date"""
        date_dir = os.path.join(self.output_dir, 'daily', date_str)
        os.makedirs(date_dir, exist_ok=True)
        return date_dir
    
    def save_and_encode(self, fig, filepath):
        """Save figure to file and return base64 encoding"""
        # Save to file
        fig.savefig(filepath, dpi=120, bbox_inches='tight', facecolor='white', edgecolor='none')
        
        # Convert to base64
        buffer = BytesIO()
        fig.savefig(buffer, format='png', dpi=120, bbox_inches='tight', facecolor='white')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close(fig)
        
        return {
            'path': filepath,
            'base64': f'data:image/png;base64,{image_base64}'
        }
    
    def generate_avg_ratings_chart(self, data, date_str):
        """Generate beautiful average ratings bar chart with gradients"""
        meal_data = data.get('averageRatingPerMeal', {})
        
        if not meal_data or all(v == 0 for v in meal_data.values()):
            return {'path': None, 'base64': None}
        
        fig, ax = plt.subplots(figsize=(12, 7))
        fig.patch.set_facecolor('white')
        ax.set_facecolor('#f8fafc')
        
        meals = list(meal_data.keys())
        ratings = list(meal_data.values())
        
        # Create beautiful gradient bars
        x_pos = np.arange(len(meals))
        colors = [self.meal_colors.get(meal, '#60A5FA') for meal in meals]
        
        bars = ax.bar(x_pos, ratings, color=colors, alpha=0.85, 
                      edgecolor='white', linewidth=2, width=0.6)
        
        # Add rating value labels on top of bars with style
        for i, (bar, rating) in enumerate(zip(bars, ratings)):
            height = bar.get_height()
            # Rating badge
            ax.text(bar.get_x() + bar.get_width()/2., height + 0.15,
                   f'{rating:.1f}★', ha='center', va='bottom', 
                   fontsize=14, fontweight='bold', color=colors[i],
                   bbox=dict(boxstyle='round,pad=0.5', facecolor='white', 
                            edgecolor=colors[i], linewidth=2))
            
            # Add emoji based on rating
            emoji = '😊' if rating >= 4 else '😐' if rating >= 3 else '😟'
            ax.text(bar.get_x() + bar.get_width()/2., height/2,
                   emoji, ha='center', va='center', fontsize=24)
        
        # Styling
        ax.set_ylabel('Average Rating', fontsize=13, fontweight='bold', color='#1e293b')
        ax.set_xlabel('Meal Type', fontsize=13, fontweight='bold', color='#1e293b')
        ax.set_title('📊 Average Rating per Meal', fontsize=16, fontweight='bold', 
                    pad=20, color='#0f172a')
        ax.set_ylim(0, 5.8)
        ax.set_xticks(x_pos)
        ax.set_xticklabels(meals, fontsize=11, fontweight='600')
        
        # Add reference lines
        ax.axhline(y=5, color='#10B981', linestyle='--', linewidth=1.5, alpha=0.3, label='Excellent (5.0)')
        ax.axhline(y=4, color='#84CC16', linestyle='--', linewidth=1.5, alpha=0.3, label='Good (4.0)')
        ax.axhline(y=3, color='#F59E0B', linestyle='--', linewidth=1.5, alpha=0.3, label='Average (3.0)')
        ax.axhline(y=2, color='#EF4444', linestyle='--', linewidth=1.5, alpha=0.3, label='Poor (2.0)')
        
        # Grid styling
        ax.grid(axis='y', alpha=0.2, linestyle='-', linewidth=0.8)
        ax.set_axisbelow(True)
        
        # Legend
        ax.legend(loc='upper right', framealpha=0.9, fontsize=9)
        
        # Add border
        for spine in ax.spines.values():
            spine.set_edgecolor('#cbd5e1')
            spine.set_linewidth(1.5)
        
        plt.tight_layout()
        
        filepath = os.path.join(self.get_date_dir(date_str), 'avg_ratings.png')
        return self.save_and_encode(fig, filepath)
    
    def generate_rating_distribution_chart(self, data, date_str):
        """Generate 4 separate bar charts for rating distribution - one per meal"""
        distribution_data = data.get('feedbackDistributionPerMeal', {})
        
        if not distribution_data:
            return {'path': None, 'base64': None}
        
        # Create 2x2 subplot layout
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        fig.patch.set_facecolor('white')
        axes = axes.flatten()
        
        meal_names = list(distribution_data.keys())
        star_labels = ['1★', '2★', '3★', '4★', '5★']
        star_keys = ['1_star', '2_star', '3_star', '4_star', '5_star']
        
        for idx, (meal, ax) in enumerate(zip(meal_names, axes)):
            ax.set_facecolor('#f8fafc')
            meal_dist = distribution_data[meal]
            
            # Get counts for each star rating
            counts = [meal_dist.get(key, 0) for key in star_keys]
            colors_list = [self.rating_colors[i+1] for i in range(5)]
            
            # Create bar chart
            x_pos = np.arange(5)
            bars = ax.bar(x_pos, counts, color=colors_list, alpha=0.85,
                         edgecolor='white', linewidth=2, width=0.6)
            
            # Add count labels on bars
            for bar, count in zip(bars, counts):
                if count > 0:
                    height = bar.get_height()
                    ax.text(bar.get_x() + bar.get_width()/2., height + 0.3,
                           f'{int(count)}', ha='center', va='bottom',
                           fontsize=12, fontweight='bold', color='#1e293b')
            
            # Styling
            meal_color = self.meal_colors.get(meal, '#60A5FA')
            ax.set_title(f'{meal}', fontsize=14, fontweight='bold', 
                        pad=15, color=meal_color,
                        bbox=dict(boxstyle='round,pad=0.8', facecolor='white',
                                edgecolor=meal_color, linewidth=2))
            ax.set_xlabel('Rating', fontsize=11, fontweight='bold', color='#1e293b')
            ax.set_ylabel('Number of Ratings', fontsize=11, fontweight='bold', color='#1e293b')
            ax.set_xticks(x_pos)
            ax.set_xticklabels(star_labels, fontsize=11, fontweight='600')
            
            # Grid and styling
            ax.grid(axis='y', alpha=0.2, linestyle='-', linewidth=0.8)
            ax.set_axisbelow(True)
            
            # Add total count annotation
            total = sum(counts)
            ax.text(0.98, 0.98, f'Total: {int(total)}', 
                   transform=ax.transAxes, ha='right', va='top',
                   fontsize=10, fontweight='bold',
                   bbox=dict(boxstyle='round,pad=0.5', facecolor='#f1f5f9',
                            edgecolor='#cbd5e1', linewidth=1))
            
            # Border styling
            for spine in ax.spines.values():
                spine.set_edgecolor('#cbd5e1')
                spine.set_linewidth(1.5)
        
        # Overall title
        fig.suptitle('📈 Rating Distribution Analysis', fontsize=18, fontweight='bold',
                    y=0.995, color='#0f172a')
        
        plt.tight_layout()
        
        filepath = os.path.join(self.get_date_dir(date_str), 'rating_distribution.png')
        return self.save_and_encode(fig, filepath)
    
    def generate_sentiment_chart(self, data, date_str):
        """Generate comprehensive sentiment analysis with NLP-based pie chart"""
        sentiment_data = data.get('sentimentAnalysisPerMeal', {})
        all_comments = data.get('allComments', [])  # We'll need to add this
        
        if not sentiment_data:
            return {'path': None, 'base64': None, 'topComments': {}}
        
        # Analyze all comments with NLP if available
        if all_comments:
            analyzed_comments = []
            for comment in all_comments:
                if comment.get('text', '').strip():
                    sentiment, polarity = self.analyze_comment_sentiment(comment['text'])
                    analyzed_comments.append({
                        'text': comment['text'],
                        'meal': comment.get('meal', 'Unknown'),
                        'rating': comment.get('rating', 0),
                        'sentiment': sentiment,
                        'polarity': polarity
                    })
            
            # Sort by polarity for top positive/negative
            positive_comments = sorted(
                [c for c in analyzed_comments if c['sentiment'] == 'positive'],
                key=lambda x: x['polarity'], reverse=True
            )[:3]
            
            negative_comments = sorted(
                [c for c in analyzed_comments if c['sentiment'] == 'negative'],
                key=lambda x: x['polarity']
            )[:3]
            
            # Calculate overall sentiment percentages
            total_analyzed = len(analyzed_comments)
            if total_analyzed > 0:
                positive_count = sum(1 for c in analyzed_comments if c['sentiment'] == 'positive')
                negative_count = sum(1 for c in analyzed_comments if c['sentiment'] == 'negative')
                neutral_count = total_analyzed - positive_count - negative_count
                
                positive_pct = (positive_count / total_analyzed) * 100
                negative_pct = (negative_count / total_analyzed) * 100
                neutral_pct = (neutral_count / total_analyzed) * 100
            else:
                positive_pct = negative_pct = neutral_pct = 0
        else:
            # Fallback to rating-based sentiment
            positive_pct = negative_pct = neutral_pct = 0
            positive_comments = negative_comments = []
        
        # Create single beautiful pie chart for overall sentiment
        fig = plt.figure(figsize=(14, 8))
        fig.patch.set_facecolor('white')
        
        # Main pie chart
        ax_pie = plt.subplot2grid((2, 3), (0, 0), colspan=2, rowspan=2)
        ax_pie.set_facecolor('white')
        
        sentiments = []
        percentages = []
        colors = []
        
        if positive_pct > 0:
            sentiments.append('Positive 😊')
            percentages.append(positive_pct)
            colors.append(self.sentiment_colors['positive'])
        if neutral_pct > 0:
            sentiments.append('Neutral 😐')
            percentages.append(neutral_pct)
            colors.append(self.sentiment_colors['neutral'])
        if negative_pct > 0:
            sentiments.append('Negative 😞')
            percentages.append(negative_pct)
            colors.append(self.sentiment_colors['negative'])
        
        if percentages:
            # Create beautiful donut chart
            wedges, texts, autotexts = ax_pie.pie(percentages, labels=sentiments, colors=colors,
                                                   autopct='%1.1f%%', startangle=90,
                                                   textprops={'fontsize': 12, 'fontweight': 'bold'},
                                                   pctdistance=0.85, explode=[0.05] * len(percentages))
            
            # Make percentage text white and bold
            for autotext in autotexts:
                autotext.set_color('white')
                autotext.set_fontsize(13)
                autotext.set_fontweight('bold')
            
            # Draw center circle for donut effect
            centre_circle = plt.Circle((0, 0), 0.65, fc='white', linewidth=2, edgecolor='#cbd5e1')
            ax_pie.add_artist(centre_circle)
            
            # Add center text
            ax_pie.text(0, 0.1, 'Overall', ha='center', va='center',
                       fontsize=14, fontweight='bold', color='#64748b')
            ax_pie.text(0, -0.15, 'Sentiment', ha='center', va='center',
                       fontsize=14, fontweight='bold', color='#64748b')
        
        ax_pie.set_title('🎭 Sentiment Analysis (NLP-Based)', fontsize=16, fontweight='bold',
                        pad=20, color='#0f172a')
        
        # Top comments section
        ax_comments = plt.subplot2grid((2, 3), (0, 2), rowspan=2)
        ax_comments.axis('off')
        
        comment_text = "📝 TOP COMMENTS\n\n"
        
        if positive_comments:
            comment_text += "✅ POSITIVE:\n"
            for i, c in enumerate(positive_comments[:3], 1):
                truncated = (c['text'][:60] + '...') if len(c['text']) > 60 else c['text']
                comment_text += f"{i}. {truncated}\n   ({c['meal']}, {c['rating']}★)\n\n"
        
        if negative_comments:
            comment_text += "\n❌ NEGATIVE:\n"
            for i, c in enumerate(negative_comments[:3], 1):
                truncated = (c['text'][:60] + '...') if len(c['text']) > 60 else c['text']
                comment_text += f"{i}. {truncated}\n   ({c['meal']}, {c['rating']}★)\n\n"
        
        ax_comments.text(0.05, 0.95, comment_text, transform=ax_comments.transAxes,
                        fontsize=9, verticalalignment='top', fontfamily='monospace',
                        bbox=dict(boxstyle='round,pad=1', facecolor='#f1f5f9',
                                edgecolor='#cbd5e1', linewidth=1.5))
        
        plt.tight_layout()
        
        filepath = os.path.join(self.get_date_dir(date_str), 'sentiment_analysis.png')
        result = self.save_and_encode(fig, filepath)
        
        # Add top comments to result
        result['topComments'] = {
            'positive': [{'text': c['text'], 'meal': c['meal'], 'rating': c['rating']} 
                        for c in positive_comments],
            'negative': [{'text': c['text'], 'meal': c['meal'], 'rating': c['rating']} 
                        for c in negative_comments]
        }
        
        return result
    
    def generate_participation_chart(self, data, date_str):
        """Generate beautiful participation rate visualization"""
        overview = data.get('overview', {})
        total_students = overview.get('totalStudents', 0)
        participating = overview.get('participatingStudents', 0)
        
        if total_students == 0:
            return {'path': None, 'base64': None}
        
        fig = plt.figure(figsize=(12, 8))
        fig.patch.set_facecolor('white')
        
        # Create main donut chart
        ax_main = plt.subplot2grid((2, 2), (0, 0), colspan=2, rowspan=2)
        ax_main.set_facecolor('white')
        
        non_participating = total_students - participating
        sizes = [participating, non_participating]
        labels = [f'Participated\n({participating} students)', 
                 f'Did Not Participate\n({non_participating} students)']
        colors = ['#10B981', '#EF4444']
        explode = (0.05, 0.05)
        
        wedges, texts, autotexts = ax_main.pie(sizes, labels=labels, colors=colors,
                                               autopct='%1.1f%%', startangle=90,
                                               textprops={'fontsize': 11, 'fontweight': 'bold'},
                                               pctdistance=0.85, explode=explode,
                                               shadow=True)
        
        # Style the text
        for text in texts:
            text.set_fontsize(12)
            text.set_fontweight('bold')
        
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontsize(14)
            autotext.set_fontweight('bold')
        
        # Draw center circle for donut effect with gradient appearance
        centre_circle = plt.Circle((0, 0), 0.68, fc='white', linewidth=3, edgecolor='#cbd5e1')
        ax_main.add_artist(centre_circle)
        
        # Add center text with participation rate
        participation_rate = overview.get('participationRate', 0)
        rate_color = '#10B981' if participation_rate >= 70 else '#F59E0B' if participation_rate >= 50 else '#EF4444'
        
        ax_main.text(0, 0.15, f'{participation_rate:.1f}%', ha='center', va='center',
                    fontsize=36, fontweight='bold', color=rate_color)
        ax_main.text(0, -0.15, 'Participation', ha='center', va='center',
                    fontsize=14, fontweight='bold', color='#64748b')
        
        # Add emoji based on participation rate
        emoji = '🎉' if participation_rate >= 70 else '👍' if participation_rate >= 50 else '📢'
        ax_main.text(0, -0.35, emoji, ha='center', va='center', fontsize=32)
        
        ax_main.set_title('👥 Student Participation Rate', fontsize=16, fontweight='bold',
                         pad=20, color='#0f172a')
        
        # Add stats box
        stats_text = f"""
        📊 PARTICIPATION STATS
        
        Total Students: {total_students}
        Participated: {participating}
        Not Participated: {non_participating}
        
        Overall Rating: {overview.get('overallRating', 0):.1f}★/5.0
        Quality Consistency: {overview.get('qualityConsistencyScore', 0):.0f}/100
        """
        
        ax_main.text(1.15, 0.5, stats_text, transform=ax_main.transAxes,
                    fontsize=10, verticalalignment='center', fontfamily='monospace',
                    bbox=dict(boxstyle='round,pad=1', facecolor='#f1f5f9',
                            edgecolor='#cbd5e1', linewidth=2))
        
        plt.tight_layout()
        
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
