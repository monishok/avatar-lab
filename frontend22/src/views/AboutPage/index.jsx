import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { FaReact } from 'react-icons/fa';
import { SiFlask, SiPostgresql } from 'react-icons/si';
import { MdRecordVoiceOver, MdVideoLibrary } from 'react-icons/md';

const AboutPage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 4, background: '#f5f5f5' }}>
        <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
          About Avatar Lab
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Avatar Lab</strong> is a web-based application that allows users to generate AI-powered talking avatars by providing text input, voice or audio reference, and a reference image or video.
        </Typography>

        <Box mt={4}>
          <Typography variant="h5" color="secondary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MdRecordVoiceOver size={24} /> OpenVoice – Text-to-Speech (TTS)
          </Typography>
          <Typography variant="body1" paragraph>
            We use <strong>OpenVoice</strong>, an advanced voice cloning model, to convert written text into realistic human speech. It supports multiple speaker identities and emotions, making it ideal for personalized avatar generation.
          </Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h5" color="secondary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MdVideoLibrary size={24} /> Wav2Lip – Lip Synchronization
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Wav2Lip</strong> is a state-of-the-art model used to synchronize lip movements with the generated audio. Given an input video or image, Wav2Lip ensures the lips match the spoken words frame by frame, even if the original video is silent.
          </Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h5" color="secondary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SiFlask size={22} /> Flask – Backend API
          </Typography>
          <Typography variant="body1" paragraph>
            The backend of Avatar Lab is built using <strong>Flask</strong>, a lightweight Python web framework. It handles requests from the frontend, processes the avatar generation pipeline, and returns the output video.
          </Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h5" color="secondary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaReact size={22} color="#61DBFB" /> React.js – Frontend UI
          </Typography>
          <Typography variant="body1" paragraph>
            The user interface is built with <strong>React.js</strong> and styled using Material UI components. It provides an interactive, responsive experience where users can input their data and view the generated avatars seamlessly.
          </Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h5" color="secondary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SiPostgresql size={22} color="#336791" /> PostgreSQL – User Data Storage
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>PostgreSQL</strong> is used as the relational database system to store user information, including login credentials and avatar generation history. Its robust querying capabilities support admin-level filtering and efficient data access.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;