import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Upload, X, File, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/common/Button';

const FileUpload = ({
  value,
  onChange,
  label,
  hint,
  error,
  accept,
  multiple = false,
  maxSize,
  disabled = false,
  className,
  dragDrop = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);

    // Validate file size
    if (maxSize) {
      const oversized = fileArray.find((f) => f.size > maxSize);
      if (oversized) {
        error = `File ${oversized.name} exceeds maximum size of ${formatFileSize(maxSize)}`;
        return;
      }
    }

    if (multiple) {
      onChange?.(fileArray);
    } else {
      onChange?.(fileArray[0]);
    }

    // Create preview for images
    if (fileArray[0]?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(fileArray[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemove = () => {
    onChange?.(multiple ? [] : null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type?.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-primary-600" />;
    }
    return <File className="w-8 h-8 text-gray-400" />;
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}

      {dragDrop ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8',
            'transition-colors duration-200 cursor-pointer',
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={disabled}
            className="hidden"
          />

          {value ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  getFileIcon(Array.isArray(value) ? value[0] : value)
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {Array.isArray(value)
                      ? `${value.length} file(s) selected`
                      : value.name}
                  </p>
                  {!Array.isArray(value) && (
                    <p className="text-sm text-gray-500">
                      {formatFileSize(value.size)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {accept
                  ? `Accepted: ${accept}`
                  : 'Any file type'}
                {maxSize && ` (Max: ${formatFileSize(maxSize)})`}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={disabled}
            className={cn(
              'block w-full text-sm text-gray-500',
              'file:mr-4 file:py-2 file:px-4',
              'file:rounded-md file:border-0',
              'file:text-sm file:font-medium',
              'file:bg-primary-50 file:text-primary-700',
              'hover:file:bg-primary-100',
              'dark:file:bg-primary-900/50 dark:file:text-primary-300'
            )}
          />
          {value && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Array.isArray(value)
                  ? `${value.length} file(s) selected`
                  : value.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      )}

      {error && (
        <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">{error}</p>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onChange: PropTypes.func,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  maxSize: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  dragDrop: PropTypes.bool,
};

export { FileUpload };
export default FileUpload;
