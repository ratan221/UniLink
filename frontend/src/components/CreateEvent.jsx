import { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { fireApi } from '../utils/useFire';
import { toast } from 'react-hot-toast';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  height: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  outline: 'none',
  border:'none',
  overflowY: 'scroll'
};

const CreateEvent = ({ open, handleClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    image: null
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.date) newErrors.date = 'Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      let imageBase64 = null;
      if (formData.image) {
        imageBase64 = await fileToBase64(formData.image);
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        date: formData.date,
        image: imageBase64
      };

      const response = await fireApi('/api/events/create', 'POST', payload);

      console.log('Event created successfully:', response);
      toast.success(response?.message || 'Event created successfully!');
      handleClose();
      resetForm();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      date: '',
      image: null
    });
    setErrors({});
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="event-modal-title"
      aria-describedby="event-modal-description"
    >
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography id="event-modal-title" variant="h6" component="h2" mb={2}>
          Create New Event
        </Typography>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            required
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description}
            required
          />

          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            error={!!errors.location}
            helperText={errors.location}
            required
          />

          <TextField
            fullWidth
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.date}
            helperText={errors.date}
            required
          />
          
          <Stack>
            <Typography variant="subtitle2" gutterBottom>
              Event Image
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Create Event
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default CreateEvent;