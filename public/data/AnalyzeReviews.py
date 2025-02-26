import json
from textblob import TextBlob

def analyze_reviews(input_file='reviews.json', output_file='sentiment_reviews.json'):
    """
    Reads reviews from input_file, performs sentiment analysis, 
    and saves results to output_file in JSON format.
    """
    # Load reviews from JSON
    with open(input_file, 'r', encoding='utf-8') as f:
        reviews = json.load(f)
    
    sentiments = []
    for review in reviews:
        # Extract the review text from the dictionary
        review_text = review.get('review_text', '')
        
        # Ensure that review_text is a string
        if not isinstance(review_text, str):
            print(f"Skipping non-string review: {review}")
            continue
        
        # Perform sentiment analysis
        blob = TextBlob(review_text)
        polarity = blob.sentiment.polarity  # -1.0 (negative) to +1.0 (positive)
        
        # Determine sentiment label based on polarity
        if polarity > 0:
            sentiment_label = 'positive'
        elif polarity < 0:
            sentiment_label = 'negative'
        else:
            sentiment_label = 'neutral'
        
        # Append the results to the sentiments list
        sentiments.append({
            'name': review.get('name', 'N/A'),
            'rating': review.get('rating', 'N/A'),
            'date': review.get('date', 'N/A'),
            'review_text': review_text,
            'sentiment': sentiment_label,
            'polarity': polarity
        })
    
    # Save sentiment results to JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(sentiments, f, ensure_ascii=False, indent=4)
    
    print(f"Sentiment analysis complete. Results saved in {output_file}.")

if __name__ == "__main__":
    analyze_reviews('reviews.json', 'sentiment_reviews.json')
