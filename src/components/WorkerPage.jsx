import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const WorkerPage = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const checkDomain = async () => {
    if (!domain) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/check-domain?domain=${encodeURIComponent(domain)}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to check domain');
      }
      
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Domain Checker
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Enter domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            onKeyPress={(e) => e.key === 'Enter' && checkDomain()}
          />
          <Button 
            variant="contained" 
            onClick={checkDomain}
            disabled={loading || !domain}
          >
            {loading ? <CircularProgress size={24} /> : 'Check'}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {results && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Results for {results.originalDomain.name}
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Original Domain Status:
            </Typography>
            <Typography>
              {results.originalDomain.available ? '✅ Available' : '❌ Not Available'}
              {results.originalDomain.price && ` - $${results.originalDomain.price} ${results.originalDomain.currency}`}
            </Typography>
          </Box>

          {results.alternatives.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Affordable Alternatives:
              </Typography>
              <List>
                {results.alternatives.map((alt, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={alt.name}
                      secondary={`$${alt.price} ${alt.currency}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default WorkerPage; 