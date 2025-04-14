/**
 * Компонент для управления всплывающими уведомлениями
 */
import React from 'react';
import { Snackbar, Alert, IconButton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { removeNotification } from '../../store/slices/uiSlice';

const NotificationsManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);
  
  // Обработчик закрытия уведомления
  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };
  
  return (
    <Stack 
      spacing={2} 
      sx={{ 
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 2000
      }}
    >
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHide === false ? null : notification.duration || 5000}
          onClose={() => handleClose(notification.id)}
        >
          <Alert
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={() => handleClose(notification.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default NotificationsManager;
