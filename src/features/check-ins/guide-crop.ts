export type GuideBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type VideoCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ObjectCoverMapping = {
  scale: number;
  offsetX: number;
  offsetY: number;
  horizontalCrop: number;
  verticalCrop: number;
};

export function computeObjectCoverMapping(
  videoWidth: number,
  videoHeight: number,
  elementWidth: number,
  elementHeight: number
): ObjectCoverMapping {
  const videoAspect = videoWidth / videoHeight;
  const elementAspect = elementWidth / elementHeight;

  if (videoAspect > elementAspect) {
    const scale = elementHeight / videoHeight;
    const renderedWidth = videoWidth * scale;
    const horizontalCrop = (renderedWidth - elementWidth) / 2;
    return { scale, offsetX: 0, offsetY: 0, horizontalCrop, verticalCrop: 0 };
  } else {
    const scale = elementWidth / videoWidth;
    const renderedHeight = videoHeight * scale;
    const verticalCrop = (renderedHeight - elementHeight) / 2;
    return { scale, offsetX: 0, offsetY: 0, horizontalCrop: 0, verticalCrop };
  }
}

export function mapGuideToVideo(
  videoWidth: number,
  videoHeight: number,
  elementWidth: number,
  elementHeight: number,
  guide: GuideBounds
): VideoCrop {
  const mapping = computeObjectCoverMapping(videoWidth, videoHeight, elementWidth, elementHeight);

  const guideElementX = guide.left * elementWidth;
  const guideElementY = guide.top * elementHeight;
  const guideElementWidth = guide.width * elementWidth;
  const guideElementHeight = guide.height * elementHeight;

  const videoX = (guideElementX + mapping.horizontalCrop) / mapping.scale;
  const videoY = (guideElementY + mapping.verticalCrop) / mapping.scale;
  const videoWidth_ = guideElementWidth / mapping.scale;
  const videoHeight_ = guideElementHeight / mapping.scale;

  return {
    x: Math.max(0, Math.min(videoWidth, Math.round(videoX))),
    y: Math.max(0, Math.min(videoHeight, Math.round(videoY))),
    width: Math.max(1, Math.min(videoWidth - Math.round(videoX), Math.round(videoWidth_))),
    height: Math.max(1, Math.min(videoHeight - Math.round(videoY), Math.round(videoHeight_))),
  };
}
