import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Link,
  TextField,
  Button,
  Stack
} from '@mui/material';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchHistory = async (admin = false, start = '', end = '') => {
    try {
      const endpoint = admin
        ? 'http://localhost:5000/admin_history'
        : 'http://localhost:5000/history';
      const params = {};

      if (admin) {
        if (start) params.start_date = start;
        if (end) params.end_date = end;
      }

      const res = await axios.get(endpoint, {
        params,
        withCredentials: true
      });

      if (admin) {
        setHistory(res.data);
        setUsername('Admin');
      } else {
        setHistory(res.data.history);
        setUsername(res.data.username);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get('http://localhost:5000/admin_auth', { withCredentials: true })
      .then((res) => {
        if (res.data.authenticated) {
          setIsAdmin(true);
          fetchHistory(true); // admin history
        } else {
          fetchHistory(false); // normal user history
        }
      })
      .catch(() => {
        fetchHistory(false); 
      });
  }, []);

  const handleFilter = () => {
    fetchHistory(true, startDate, endDate);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        {username ? `${username}'s Avatar History` : 'Avatar History'}
      </Typography>

      {isAdmin && (
        <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 2 }}>
          <TextField
            label="Start Date & Time"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date & Time"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={handleFilter}>
            Filter
          </Button>
        </Stack>
      )}

      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : history.length === 0 ? (
        <Typography color="text.secondary">No avatar history found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                {isAdmin && <TableCell><strong>Username</strong></TableCell>}
                <TableCell><strong>Text</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Video</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((item, index) => (
                <TableRow key={index}>
                  {isAdmin && <TableCell>{item.username}</TableCell>}
                  <TableCell>{item.text || item.text_history}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <Link
                      href={`http://localhost:5000${item.video_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      Watch Video
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default HistoryPage;