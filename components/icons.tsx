/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
  ArrowDown,
  ArrowRight,
  Baseline,
  Bot,
  ChevronDown,
  Clipboard,
  Copy,
  Download,
  Film,
  FileImage,
  Image,
  KeyRound,
  Layers,
  Menu,
  MessageSquare,
  Mic,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  StopCircle,
  Tv,
  User,
  Wand2,
  X,
} from 'lucide-react';

const defaultProps = {
  strokeWidth: 1.5,
};

export const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <KeyRound {...defaultProps} {...props} />
);

export const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Bot {...defaultProps} {...props} />
);

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <User {...defaultProps} {...props} />
);

export const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Menu {...defaultProps} {...props} />
);

export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Copy {...defaultProps} {...props} />
);

export const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Clipboard {...defaultProps} {...props} />
);

export const MessageSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <MessageSquare {...defaultProps} {...props} />
);

export const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <RefreshCw {...defaultProps} {...props} />;

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Sparkles {...defaultProps} {...props} />
);

export const MagicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Wand2 {...defaultProps} {...props} />
);

export const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Mic {...defaultProps} {...props} />
);

export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <StopCircle {...defaultProps} {...props} />
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Plus {...defaultProps} {...props} />
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ChevronDown {...defaultProps} {...props} />;

export const SlidersHorizontalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <SlidersHorizontal {...defaultProps} {...props} />

export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ArrowRight {...defaultProps} {...props} />;

export const RectangleStackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Layers {...defaultProps} {...props} />;

export const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <X {...defaultProps} {...props} />
);

export const TextModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Baseline {...defaultProps} {...props} />
);

export const FramesModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Image {...defaultProps} {...props} />;

export const ReferencesModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Film {...defaultProps} {...props} />;

export const TvIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Tv {...defaultProps} {...props} />
);

export const FilmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Film {...defaultProps} {...props} />
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Download {...defaultProps} {...props} />
);

export const FileImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <FileImage {...defaultProps} {...props} />
);

export const CurvedArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ArrowDown {...props} strokeWidth={3} />;