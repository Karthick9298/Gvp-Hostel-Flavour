#!/usr/bin/env python3
"""
Chart Generation Utility - Creates visualizations for daily analysis
Enhanced with modern dark theme matching the frontend UI
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

# Set modern dark theme to match frontend
sns.set_theme(style="darkgrid")
plt.rcParams['figure.facecolor'] = '#0f172a'  # Navy-950
plt.rcParams['axes.facecolor'] = '#1e293b'    # Navy-900
plt.rcParams['text.color'] = '#e2e8f0'        # Gray-200
plt.rcParams['axes.labelcolor'] = '#e2e8f0'   # Gray-200
plt.rcParams['axes.edgecolor'] = '#475569'    # Navy-600
plt.rcParams['xtick.color'] = '#cbd5e1'       # Gray-300
plt.rcParams['ytick.color'] = '#cbd5e1'       # Gray-300
plt.rcParams['grid.color'] = '#334155'        # Navy-700
plt.rcParams['grid.alpha'] = 0.3
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 11

class ChartGenerator:
    def __init__(self):
        """Initialize chart generator for in-memory base64 generation (no file storage)"""
        # Modern gradient color schemes matching frontend
        self.meal_colors = {
            'Breakfast': '#f59e0b',   # Amber-500
            'Lunch': '#3b82f6',       # Blue-500
            'Snacks': '#8b5cf6',      # Purple-500
            'Night': '#ec4899'        # Pink-500
        }
        
        self.rating_colors = {
            1: '#ef4444',  # Red-500
            2: '#f97316',  # Orange-500
            3: '#fbbf24',  # Yellow-400
            4: '#84cc16',  # Lime-500
            5: '#10b981'   # Emerald-500
        }
        
        self.sentiment_colors = {
            'positive': '#10b981',  # Emerald-500
            'neutral': '#64748b',   # Slate-500
            'negative': '#ef4444'   # Red-500
        }
        
        # Dark theme colors
        self.bg_dark = '#1e293b'      # Navy-900
        self.bg_darker = '#0f172a'    # Navy-950
        self.border_color = '#475569' # Navy-600
        self.text_primary = '#e2e8f0' # Gray-200
        self.text_secondary = '#cbd5e1' # Gray-300
    
    def encode_to_base64(self, fig):
        """Convert figure to base64 encoding without saving to disk"""
        buffer = BytesIO()
        fig.savefig(buffer, format='png', dpi=150, bbox_inches='tight', 
                   facecolor='#0f172a', transparent=False)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close(fig)
        # Return with data URI prefix for HTML img tags
        return f'data:image/png;base64,{image_base64}'
    
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
        
        return {
            'path': filepath,
            'base64': f'data:image/png;base64,{image_base64}'
        }
    
    def generate_avg_ratings_chart(self, data):
        """Generate modern average ratings bar chart with gradient effects (base64 only)"""
        meal_data = data.get('averageRatingPerMeal', {})
        
        if not meal_data or all(v == 0 for v in meal_data.values()):
            return None
        
        fig, ax = plt.subplots(figsize=(14, 8))
        fig.patch.set_facecolor(self.bg_darker)
        ax.set_facecolor(self.bg_dark)
        
        meals = list(meal_data.keys())
        ratings = list(meal_data.values())
        
        # Create gradient bars
        x_pos = np.arange(len(meals))
        colors = [self.meal_colors.get(meal, '#60a5fa') for meal in meals]
        
        bars = ax.bar(x_pos, ratings, color=colors, alpha=0.9, 
                      edgecolor='#334155', linewidth=2.5, width=0.65)
        
        # Add glow effect with multiple bars
        for bar, color in zip(bars, colors):
            x = bar.get_x()
            width = bar.get_width()
            height = bar.get_height()
            # Subtle glow
            ax.bar(x, height, width=width, color=color, alpha=0.2, 
                  edgecolor='none', linewidth=0)
        
        # Add rating badges on top
        for i, (bar, rating) in enumerate(zip(bars, ratings)):
            height = bar.get_height()
            # Modern badge with shadow effect
            bbox_props = dict(boxstyle='round,pad=0.6', 
                            facecolor=colors[i], 
                            edgecolor='#0f172a',
                            linewidth=2.5,
                            alpha=0.95)
            ax.text(bar.get_x() + bar.get_width()/2., height + 0.2,
                   f'{rating:.1f}★', ha='center', va='bottom', 
                   fontsize=15, fontweight='bold', color='white',
                   bbox=bbox_props)
            
            # Add emoji based on rating
            emoji = '🌟' if rating >= 4.5 else '😊' if rating >= 4 else '😐' if rating >= 3 else '😟'
            ax.text(bar.get_x() + bar.get_width()/2., height/2,
                   emoji, ha='center', va='center', fontsize=28)
        
        # Modern styling
        ax.set_ylabel('Average Rating', fontsize=14, fontweight='bold', 
                     color=self.text_primary, labelpad=10)
        ax.set_xlabel('Meal Type', fontsize=14, fontweight='bold', 
                     color=self.text_primary, labelpad=10)
        ax.set_title('📊 Average Rating per Meal', fontsize=18, fontweight='bold', 
                    pad=25, color=self.text_primary)
        ax.set_ylim(0, 6.0)
        ax.set_xticks(x_pos)
        ax.set_xticklabels(meals, fontsize=12, fontweight='600', color=self.text_secondary)
        
        # Reference lines with modern styling
        reference_lines = [
            (5, '#10b981', 'Excellent (5.0)'),
            (4, '#84cc16', 'Good (4.0)'),
            (3, '#fbbf24', 'Average (3.0)'),
            (2, '#f97316', 'Poor (2.0)')
        ]
        
        for y_val, color, label in reference_lines:
            ax.axhline(y=y_val, color=color, linestyle='--', 
                      linewidth=2, alpha=0.4, label=label)
        
        # Grid styling
        ax.grid(axis='y', alpha=0.15, linestyle='-', linewidth=1.2, color='#475569')
        ax.set_axisbelow(True)
        
        # Legend with dark theme
        legend = ax.legend(loc='upper right', framealpha=0.95, fontsize=10,
                          facecolor=self.bg_dark, edgecolor=self.border_color,
                          labelcolor=self.text_secondary)
        legend.get_frame().set_linewidth(1.5)
        
        # Spine styling
        for spine in ax.spines.values():
            spine.set_edgecolor(self.border_color)
            spine.set_linewidth(2)
        
        # Tick styling
        ax.tick_params(colors=self.text_secondary, which='both', 
                      length=6, width=1.5)
        
        plt.tight_layout()
        
        return self.encode_to_base64(fig)
    
    def generate_rating_distribution_chart(self, data):
        """Generate 4 modern bar charts for rating distribution - one per meal (base64 only)"""
        distribution_data = data.get('feedbackDistributionPerMeal', {})
        distribution_data = data.get('feedbackDistributionPerMeal', {})
        
        if not distribution_data:
            return None
        # Create 2x2 subplot layout
        fig, axes = plt.subplots(2, 2, figsize=(18, 14))
        fig.patch.set_facecolor(self.bg_darker)
        axes = axes.flatten()
        
        meal_names = list(distribution_data.keys())
        star_labels = ['1★', '2★', '3★', '4★', '5★']
        star_keys = ['1_star', '2_star', '3_star', '4_star', '5_star']
        
        for idx, (meal, ax) in enumerate(zip(meal_names, axes)):
            ax.set_facecolor(self.bg_dark)
            meal_dist = distribution_data[meal]
            
            # Get counts for each star rating
            counts = [meal_dist.get(key, 0) for key in star_keys]
            colors_list = [self.rating_colors[i+1] for i in range(5)]
            
            # Create bar chart with gradient effect
            x_pos = np.arange(5)
            bars = ax.bar(x_pos, counts, color=colors_list, alpha=0.9,
                         edgecolor='#334155', linewidth=2.5, width=0.7)
            
            # Add glow effect
            for bar, color in zip(bars, colors_list):
                x = bar.get_x()
                width = bar.get_width()
                height = bar.get_height()
                ax.bar(x, height, width=width, color=color, alpha=0.2, 
                      edgecolor='none', linewidth=0)
            
            # Add count labels on bars
            for bar, count in zip(bars, counts):
                if count > 0:
                    height = bar.get_height()
                    ax.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                           f'{int(count)}', ha='center', va='bottom',
                           fontsize=13, fontweight='bold', color=self.text_primary)
            
            # Styling
            meal_color = self.meal_colors.get(meal, '#60a5fa')
            title_bbox = dict(boxstyle='round,pad=0.8', facecolor=meal_color,
                            edgecolor='#0f172a', linewidth=2.5, alpha=0.95)
            ax.set_title(f'{meal}', fontsize=15, fontweight='bold', 
                        pad=18, color='white', bbox=title_bbox)
            ax.set_xlabel('Rating', fontsize=12, fontweight='bold', 
                         color=self.text_primary, labelpad=10)
            ax.set_ylabel('Number of Ratings', fontsize=12, fontweight='bold', 
                         color=self.text_primary, labelpad=10)
            ax.set_xticks(x_pos)
            ax.set_xticklabels(star_labels, fontsize=12, fontweight='600',
                              color=self.text_secondary)
            
            # Grid and styling
            ax.grid(axis='y', alpha=0.15, linestyle='-', linewidth=1.2, color='#475569')
            ax.set_axisbelow(True)
            
            # Add total count annotation
            total = sum(counts)
            total_bbox = dict(boxstyle='round,pad=0.6', facecolor=self.bg_dark,
                            edgecolor=meal_color, linewidth=2, alpha=0.95)
            ax.text(0.98, 0.98, f'Total: {int(total)}', 
                   transform=ax.transAxes, ha='right', va='top',
                   fontsize=11, fontweight='bold', color=self.text_primary,
                   bbox=total_bbox)
            
            # Border styling
            for spine in ax.spines.values():
                spine.set_edgecolor(self.border_color)
                spine.set_linewidth(2)
            
            # Tick styling
            ax.tick_params(colors=self.text_secondary, which='both', 
                          length=6, width=1.5)
        
        # Overall title
        fig.suptitle('📈 Rating Distribution Analysis', fontsize=20, fontweight='bold',
                    y=0.995, color=self.text_primary)
        
        plt.tight_layout()
        
        return self.encode_to_base64(fig)
    
    def generate_sentiment_chart(self, data):
        """Generate modern sentiment analysis with NLP-based donut chart (base64 only)"""
        sentiment_data = data.get('sentimentAnalysisPerMeal', {})
        all_comments = data.get('allComments', [])
        
        if not sentiment_data:
            return None
        
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
            positive_pct = negative_pct = neutral_pct = 0
            positive_comments = negative_comments = []
        
        # Create modern dark-themed chart
        fig = plt.figure(figsize=(16, 9))
        fig.patch.set_facecolor(self.bg_darker)
        
        # Main donut chart
        ax_pie = plt.subplot2grid((2, 3), (0, 0), colspan=2, rowspan=2)
        ax_pie.set_facecolor(self.bg_darker)
        
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
            # Create modern donut chart with shadow effect
            wedges, texts, autotexts = ax_pie.pie(
                percentages, labels=sentiments, colors=colors,
                autopct='%1.1f%%', startangle=90,
                textprops={'fontsize': 13, 'fontweight': 'bold', 'color': self.text_primary},
                pctdistance=0.82, explode=[0.05] * len(percentages),
                wedgeprops={'linewidth': 3, 'edgecolor': '#0f172a', 'alpha': 0.95}
            )
            
            # Make percentage text white and bold
            for autotext in autotexts:
                autotext.set_color('white')
                autotext.set_fontsize(14)
                autotext.set_fontweight('bold')
            
            # Draw center circle for donut effect
            centre_circle = plt.Circle((0, 0), 0.65, fc=self.bg_dark, 
                                      linewidth=4, edgecolor=self.border_color)
            ax_pie.add_artist(centre_circle)
            
            # Add center text with modern styling
            ax_pie.text(0, 0.15, 'Overall', ha='center', va='center',
                       fontsize=16, fontweight='bold', color=self.text_secondary)
            ax_pie.text(0, -0.15, 'Sentiment', ha='center', va='center',
                       fontsize=16, fontweight='bold', color=self.text_secondary)
        
        ax_pie.set_title('🎭 Sentiment Analysis (NLP-Based)', fontsize=18, fontweight='bold',
                        pad=25, color=self.text_primary)
        
        # Top comments section with modern dark theme
        ax_comments = plt.subplot2grid((2, 3), (0, 2), rowspan=2)
        ax_comments.axis('off')
        ax_comments.set_facecolor(self.bg_darker)
        
        comment_text = "📝 TOP COMMENTS\n" + "─" * 35 + "\n\n"
        
        if positive_comments:
            comment_text += "✅ POSITIVE:\n"
            for i, c in enumerate(positive_comments[:3], 1):
                truncated = (c['text'][:55] + '...') if len(c['text']) > 55 else c['text']
                comment_text += f"{i}. {truncated}\n"
                comment_text += f"   ({c['meal']}, {c['rating']}★)\n\n"
        
        if negative_comments:
            comment_text += "\n❌ NEGATIVE:\n"
            for i, c in enumerate(negative_comments[:3], 1):
                truncated = (c['text'][:55] + '...') if len(c['text']) > 55 else c['text']
                comment_text += f"{i}. {truncated}\n"
                comment_text += f"   ({c['meal']}, {c['rating']}★)\n\n"
        
        comment_bbox = dict(boxstyle='round,pad=1.2', facecolor=self.bg_dark,
                          edgecolor=self.border_color, linewidth=2.5, alpha=0.95)
        ax_comments.text(0.05, 0.95, comment_text, transform=ax_comments.transAxes,
                        fontsize=9.5, verticalalignment='top', fontfamily='monospace',
                        color=self.text_secondary, bbox=comment_bbox, linespacing=1.6)
        
        plt.tight_layout()
        
        # Return both the chart and the top comments data
        return {
            'base64': self.encode_to_base64(fig),
            'topComments': {
                'positive': [
                    {
                        'text': c['text'],
                        'meal': c['meal'],
                        'rating': c['rating'],
                        'polarity': c['polarity']
                    } for c in positive_comments
                ],
                'negative': [
                    {
                        'text': c['text'],
                        'meal': c['meal'],
                        'rating': c['rating'],
                        'polarity': c['polarity']
                    } for c in negative_comments
                ]
            }
        }
    
    def generate_participation_chart(self, data):
        """Generate modern participation rate visualization with dark theme (base64 only)"""
        overview = data.get('overview', {})
        total_students = overview.get('totalStudents', 0)
        participating = overview.get('participatingStudents', 0)
        
        if total_students == 0:
            return None
        
        fig = plt.figure(figsize=(14, 9))
        fig.patch.set_facecolor(self.bg_darker)
        
        # Create main donut chart
        ax_main = plt.subplot2grid((2, 2), (0, 0), colspan=2, rowspan=2)
        ax_main.set_facecolor(self.bg_darker)
        
        non_participating = total_students - participating
        sizes = [participating, non_participating]
        labels = [f'Participated\n({participating} students)', 
                 f'Did Not Participate\n({non_participating} students)']
        colors = ['#10b981', '#ef4444']
        explode = (0.08, 0.08)
        
        wedges, texts, autotexts = ax_main.pie(
            sizes, labels=labels, colors=colors,
            autopct='%1.1f%%', startangle=90,
            textprops={'fontsize': 12, 'fontweight': 'bold', 'color': self.text_primary},
            pctdistance=0.82, explode=explode,
            wedgeprops={'linewidth': 4, 'edgecolor': '#0f172a', 'alpha': 0.95},
            shadow=True
        )
        
        # Style the text
        for text in texts:
            text.set_fontsize(13)
            text.set_fontweight('bold')
            text.set_color(self.text_primary)
        
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontsize(15)
            autotext.set_fontweight('bold')
        
        # Draw center circle for donut effect
        centre_circle = plt.Circle((0, 0), 0.65, fc=self.bg_dark, 
                                  linewidth=5, edgecolor=self.border_color)
        ax_main.add_artist(centre_circle)
        
        # Add center text with participation rate
        participation_rate = overview.get('participationRate', 0)
        rate_color = '#10b981' if participation_rate >= 70 else '#fbbf24' if participation_rate >= 50 else '#ef4444'
        
        ax_main.text(0, 0.2, f'{participation_rate:.1f}%', ha='center', va='center',
                    fontsize=42, fontweight='bold', color=rate_color)
        ax_main.text(0, -0.15, 'Participation', ha='center', va='center',
                    fontsize=16, fontweight='bold', color=self.text_secondary)
        
        # Add emoji based on participation rate
        emoji = '🎉' if participation_rate >= 70 else '👍' if participation_rate >= 50 else '📢'
        ax_main.text(0, -0.40, emoji, ha='center', va='center', fontsize=36)
        
        ax_main.set_title('👥 Student Participation Rate', fontsize=18, fontweight='bold',
                         pad=25, color=self.text_primary)
        
        # Add stats box with modern styling
        stats_text = f"""📊 PARTICIPATION STATS
{"─" * 28}

Total Students: {total_students}
Participated: {participating}
Not Participated: {non_participating}

Overall Rating: {overview.get('overallRating', 0):.1f}★/5.0
Quality Score: {overview.get('qualityConsistencyScore', 0):.0f}/100
"""
        
        stats_bbox = dict(boxstyle='round,pad=1.2', facecolor=self.bg_dark,
                        edgecolor=self.border_color, linewidth=2.5, alpha=0.95)
        ax_main.text(1.22, 0.5, stats_text, transform=ax_main.transAxes,
                    fontsize=11, verticalalignment='center', fontfamily='monospace',
                    color=self.text_secondary, bbox=stats_bbox, linespacing=1.8)
        
        plt.tight_layout()
        
        return self.encode_to_base64(fig)
    
    def generate_all_charts(self, data):
        """Generate all charts and return base64 data only (no file storage)"""
        sentiment_chart_data = self.generate_sentiment_chart(data)
        
        return {
            'avgRatings': {'base64': self.generate_avg_ratings_chart(data)},
            'distribution': {'base64': self.generate_rating_distribution_chart(data)},
            'sentiment': sentiment_chart_data if sentiment_chart_data else {'base64': None, 'topComments': {'positive': [], 'negative': []}},
            'participation': {'base64': self.generate_participation_chart(data)}
        }
