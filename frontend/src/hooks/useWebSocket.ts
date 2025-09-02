import { useEffect, useCallback } from 'react';
import { wsService } from '../services/websocket';
import toast from 'react-hot-toast';

export const useWebSocket = () => {
  useEffect(() => {
    // Connect on mount
    wsService.connect();
    
    // Set up notification handler
    const handleNotification = (data: any) => {
      toast(data.message, {
        icon: data.notification_type === 'success' ? '✅' : '📢',
        duration: 5000
      });
    };
    
    wsService.on('notification', handleNotification);
    
    // Cleanup
    return () => {
      wsService.off('notification', handleNotification);
      wsService.disconnect();
    };
  }, []);
  
  const sendMessage = useCallback((type: string, data: any) => {
    wsService.send({ type, data });
  }, []);
  
  return { sendMessage };
};

export const useAnalysisProgress = (onProgress: (progress: number, stage: string) => void) => {
  useEffect(() => {
    const handleProgress = (data: any) => {
      if (data.type === 'analysis_progress') {
        onProgress(data.progress, data.stage);
      }
    };
    
    wsService.on('analysis_progress', handleProgress);
    
    return () => {
      wsService.off('analysis_progress', handleProgress);
    };
  }, [onProgress]);
};
