# Analytics Service

Daily feedback analysis and visualization service for Hostel Flavour.

## Features

- Daily feedback analysis based on selected date
- Average rating per meal (Breakfast, Lunch, Dinner, Night Snacks)
- Rating distribution (1-5 stars)
- Sentiment analysis (Positive/Negative/Neutral)
- Participation rate tracking
- Visual charts generation (matplotlib/seaborn)

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Ensure MongoDB is running and accessible**

3. **Backend .env file must contain:**
```
MONGODB_URI=your_mongodb_connection_string
```

## Usage

### Run daily analysis for a specific date:
```bash
python services/daily_analysis.py 2024-01-08
```

### Test chart generation:
```bash
python test_chart_generation.py
```

## Integration with Backend

The backend spawns this Python script and receives JSON output via stdout:

```javascript
// backend/services/analyticsService.js
const result = await executePythonScript('daily_analysis.py', [dateString]);
```

## Output Structure

```json
{
  "status": "success",
  "date": "2024-01-08",
  "data": {
    "overview": {
      "totalStudents": 150,
      "participatingStudents": 120,
      "participationRate": 80.0,
      "overallRating": 4.2
    },
    "averageRatingPerMeal": {...},
    "sentimentAnalysisPerMeal": {...},
    ...
  },
  "charts": {
    "avgRatings": {
      "path": "/output/daily/2024-01-08/avg_ratings.png",
      "base64": "data:image/png;base64,..."
    },
    ...
  }
}
```

## Charts Generated

1. **avg_ratings.png** - Bar chart of average ratings
2. **rating_distribution.png** - Stacked bar chart of star ratings
3. **sentiment_analysis.png** - Pie charts showing sentiment per meal
4. **participation.png** - Donut chart of participation rate

All charts are saved to `output/daily/{date}/` and also returned as base64.
