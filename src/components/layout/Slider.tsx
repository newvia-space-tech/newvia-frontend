'use client';

interface SliderProps {
  variant?: 'Default' | 'Variant2' | 'Variant3';
}

export default function Slider({ variant = 'Default' }: SliderProps) {
  return (
    <div className="relative w-full h-full">
      <video
        autoPlay
        className="absolute w-full h-full object-cover"
        controlsList="nodownload"
        loop
        playsInline
        muted
      >
        <source src="/_videos/v1/42b02a4ab44496ffec1099973cb3de615b80bfdf" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
