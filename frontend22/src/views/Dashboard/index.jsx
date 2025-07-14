import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import CharSpinner from './CharSpinner';

const Dashboard = () => {
  const [text, setText] = useState('');
  const [video, setVideo] = useState(null);
  const [audio, setAudio] = useState(null);
  const [voiceChoice, setVoiceChoice] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [textError, setTextError] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [videoError, setVideoError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthentication = async () => {
    try {
      const res = await fetch("http://localhost:5000/check_auth", {
        credentials: 'include'
      });
      const data = await res.json();
      return data.authenticated;
    } catch (error) {
      console.error("Auth check failed:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTextError("");
    setVoiceError("");
    setVideoError("");
    setLoginError("");

    if (!text.trim()) {
      setTextError("*This field is required");
      return;
    }

    if (!audio && !voiceChoice) {
      setVoiceError("*Please upload a reference audio or choose a default voice");
      return;
    }

    if (!video) {
      setVideoError("*Please upload a video");
      return;
    }

    const isAuth = await checkAuthentication();
    if (!isAuth) {
      setLoginError("⚠ You must be logged in to use AvatarLab.");
      return;
    }
    setIsAuthenticated(true);

    const agreed = window.confirm(
      "⚠️ AvatarLab is only for ethical use.\nYou agree not to generate misleading or harmful content.\n\nDo you accept the terms and wish to proceed?"
    );
    if (!agreed) return;

    const formData = new FormData();
    formData.append("text", text);
    formData.append("video", video);
    if (audio) {
      formData.append("audio", audio);
    } else {
      formData.append("voice_choice", voiceChoice);
    }

    setIsLoading(true);
    setVideoUrl(null);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error("Failed to receive video");

      const blob = await response.blob();
      const videoURL = URL.createObjectURL(blob);
      setVideoUrl(videoURL);
    } catch (err) {
      console.error("Error:", err);
      setLoginError("Something went wrong while processing.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card elevation={6} sx={{ borderRadius: 4, background: '#f9fafb' }}>
        <CardHeader
          title="🎭 Avatar Lab"
          subheader="Generate talking avatars with reference video/image and voice"
          sx={{
            backgroundColor: 'linear-gradient(to right, #4a00e0, #8e2de2)',
            color: '#f9fafb',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16
          }}
        />
        <CardContent component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Enter your script text"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (e.target.value.trim()) setTextError("");
                }}
                error={!!textError}
                helperText={textError}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                component="label"
                fullWidth
                startIcon={<UploadFileIcon />}
                sx={{ height: '56px', backgroundColor: '#3366ff' }}
              >
                Upload Video
                <input
                  type="file"
                  hidden
                  accept="video/mp4"
                  onChange={(e) => setVideo(e.target.files[0])}
                />
              </Button>
              {video && (
                <Typography variant="body2" mt={1} color="text.secondary">
                  Selected: {video.name}
                </Typography>
              )}
              {videoError && (
                <Typography variant="body2" color="error" mt={1}>
                  {videoError}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                component="label"
                fullWidth
                startIcon={<MicIcon />}
                sx={{ height: '56px', backgroundColor: '#3366ff' }}
              >
                Upload Reference Audio
                <input
                  type="file"
                  hidden
                  accept="audio/*"
                  onChange={(e) => {
                    setAudio(e.target.files[0]);
                    if (e.target.files[0]) setVoiceChoice("");
                    setVoiceError("");
                  }}
                />
              </Button>
              {audio && (
                <Typography variant="body2" mt={1} color="text.secondary">
                  Selected: {audio.name}
                </Typography>
              )}
            </Grid>

            {!audio && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!!voiceError}>
                  <InputLabel>Select Default Voice</InputLabel>
                  <Select
                    value={voiceChoice}
                    onChange={(e) => {
                      setVoiceChoice(e.target.value);
                      setVoiceError("");
                    }}
                    label="Select Default Voice"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                  {voiceError && (
                    <Typography variant="body2" color="error" mt={1}>
                      {voiceError}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                endIcon={<SendIcon />}
                disabled={isLoading}
                sx={{
                  background: 'linear-gradient(to right, #4c6fff, #3366ff)',
                  color: '#fff',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? 'Generating...' : 'Generate Avatar'}
              </Button>
            </Grid>

            {loginError && (
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  color="error"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  {loginError}
                </Typography>
              </Grid>
            )}

            {isLoading && (
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ mt: 2, color: 'text.secondary', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  Generating lip-synced video... &nbsp;
                  <CharSpinner />
                </Typography>
              </Grid>
            )}
          </Grid>

          {videoUrl && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Generated Video:
              </Typography>
              <Box
                component="video"
                controls
                src={videoUrl}
                sx={{ width: '100%', maxWidth: 480, borderRadius: 2, boxShadow: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 2 }}>
                <a href={videoUrl} download="lipsynced_video.mp4" style={{ textDecoration: 'none' }}>
                  ⬇ Download MP4
                </a>
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;

