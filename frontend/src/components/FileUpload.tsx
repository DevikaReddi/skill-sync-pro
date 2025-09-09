import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpTrayIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { DocumentIcon } from '@heroicons/react/24/solid';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onTextExtracted: (text: string) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  label: string;
  type: 'resume' | 'job';
}

interface UploadState {
  isDragging: boolean;
  file: File | null;
  uploading: boolean;
  success: boolean;
  error: string | null;
  progress: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onTextExtracted,
  acceptedTypes = '.pdf,.txt',
  maxSize = 10,
  label,
  type
}) => {
  const [state, setState] = useState<UploadState>({
    isDragging: false,
    file: null,
    uploading: false,
    success: false,
    error: null,
    progress: 0
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.txt')) {
      return 'Only PDF and TXT files are supported';
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Additional validation for resume
    if (type === 'resume' && fileSizeMB < 0.01) {
      return 'File seems too small to be a valid resume';
    }

    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    // Reset previous state
    setState(prev => ({ ...prev, error: null, success: false }));

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setState(prev => ({ 
        ...prev, 
        error: validationError,
        file: null 
      }));
      return;
    }

    // Set file and start upload animation
    setState(prev => ({ 
      ...prev, 
      file, 
      uploading: true,
      progress: 0 
    }));

    // Simulate progress (will be replaced with actual upload)
    const progressInterval = setInterval(() => {
      setState(prev => {
        if (prev.progress >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return { ...prev, progress: prev.progress + 10 };
      });
    }, 100);

    try {
      // Call parent's file select handler
      await onFileSelect(file);
      
      // Complete progress
      setState(prev => ({ 
        ...prev, 
        progress: 100,
        uploading: false,
        success: true
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, success: false }));
      }, 3000);

    } catch (error) {
      clearInterval(progressInterval);
      setState(prev => ({ 
        ...prev, 
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        file: null,
        progress: 0
      }));
    }
  }, [onFileSelect, type, maxSize]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setState(prev => ({ ...prev, isDragging: true }));
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setState(prev => ({ ...prev, isDragging: false }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragging: false }));
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setState({
      isDragging: false,
      file: null,
      uploading: false,
      success: false,
      error: null,
      progress: 0
    });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const gradientClass = type === 'resume' 
    ? 'from-blue-500/10 via-purple-500/10 to-pink-500/10'
    : 'from-green-500/10 via-teal-500/10 to-cyan-500/10';

  const iconGradient = type === 'resume'
    ? 'from-blue-500 to-purple-500'
    : 'from-green-500 to-teal-500';

  return (
    <div className="w-full">
      {/* Label with premium gradient */}
      <div className="flex items-center mb-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${iconGradient} mr-2`}>
          <DocumentTextIcon className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </h3>
        {state.file && !state.error && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ml-auto"
          >
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </motion.div>
        )}
      </div>

      {/* Upload Area with Glassmorphism */}
      <motion.div
        className={`
          relative overflow-hidden rounded-2xl p-8
          backdrop-blur-xl bg-white/60 dark:bg-gray-900/60
          border border-white/20 dark:border-gray-700/30
          shadow-2xl shadow-black/5 dark:shadow-black/20
          ${state.isDragging ? 'scale-[1.02]' : 'scale-100'}
          transition-all duration-300
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Animated gradient background */}
        <div className={`
          absolute inset-0 bg-gradient-to-br ${gradientClass}
          ${state.isDragging ? 'opacity-100' : 'opacity-50'}
          transition-opacity duration-300
        `} />

        {/* Animated particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute h-32 w-32 rounded-full bg-gradient-to-br ${iconGradient} opacity-10`}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
              style={{
                left: `${i * 20}%`,
                top: `${i * 15}%`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            className="hidden"
            disabled={state.uploading}
          />

          <AnimatePresence mode="wait">
            {!state.file ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center cursor-pointer"
                onClick={() => inputRef.current?.click()}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block"
                >
                  <div className={`
                    p-4 rounded-2xl bg-gradient-to-br ${iconGradient}
                    shadow-lg shadow-black/10 dark:shadow-black/30
                    mb-4
                  `}>
                    <CloudArrowUpIcon className="h-8 w-8 text-white" />
                  </div>
                </motion.div>

                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Drop your {type === 'resume' ? 'resume' : 'job description'} here
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  or click to browse • PDF or TXT • Max {maxSize}MB
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    mt-4 px-4 py-2 rounded-lg
                    bg-gradient-to-r ${iconGradient}
                    text-white text-sm font-medium
                    shadow-lg shadow-black/10
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  <ArrowUpTrayIcon className="inline h-4 w-4 mr-2" />
                  Choose File
                </motion.button>
              </motion.div>
            ) : state.uploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <SparklesIcon className="h-8 w-8 text-blue-500" />
                  </motion.div>
                </div>

                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Processing {state.file.name}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${iconGradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${state.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {state.progress}% complete
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="uploaded"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center space-x-3">
                  <DocumentIcon className="h-10 w-10 text-blue-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {state.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(state.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={removeFile}
                    className="ml-auto p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <XMarkIcon className="h-5 w-5 text-red-500" />
                  </motion.button>
                </div>

                {state.success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-xs text-green-600 dark:text-green-400"
                  >
                    ✓ File uploaded successfully
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {state.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-xs text-red-700 dark:text-red-400">
                    {state.error}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};