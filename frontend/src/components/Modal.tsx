import React from 'react';
import { Button } from './Button.js';

interface ModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  confirmLoading?: boolean;
  isDestructive?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  description,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  confirmLoading = false,
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur overlay */}
      <div 
        className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal card surface */}
      <div className="relative bg-[#131722] border border-spaceBorder rounded-2xl w-full max-w-md p-6 shadow-glass z-10 animate-in fade-in zoom-in duration-200">
        
        {/* Header Title */}
        <h3 className="text-base font-bold text-pureWhite tracking-tight">
          {title}
        </h3>

        {/* Description body */}
        <p className="text-xs text-mutedGray leading-relaxed mt-2.5">
          {description}
        </p>

        {/* Action Panel Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={confirmLoading}
          >
            Cancel
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            loading={confirmLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
