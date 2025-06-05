import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState, JSX, useRef } from "react";
import { Annoyed, Smile, Laugh } from "lucide-react";

type Props = {
  onComplete: () => void;
  text?: string;
};

const SLIDER_HEIGHT = 56; // px (use clamp for font if you like)
const HANDLE_SIZE = SLIDER_HEIGHT; // keep handle a circle, always as tall as slider

const SlideToLoginButton = ({
  onComplete,
  text = "Slide to Login with Google",
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = useState(0);

  // Measure actual slider width
  useEffect(() => {
    const measure = () => {
      if (containerRef.current)
        setSliderWidth(containerRef.current.offsetWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const x = useMotionValue(0);
  const progress = useTransform(x, [0, sliderWidth - HANDLE_SIZE], [0, 1]);
  const [emoji, setEmoji] = useState<JSX.Element>(
    <Annoyed size={SLIDER_HEIGHT / 2} color="#83A99B" />
  );

  useEffect(() => {
    x.set(0);
  }, [x, sliderWidth]); // re-zero if width changes

  useEffect(() => {
    return progress.on("change", (p) => {
      if (p > 0.85)
        setEmoji(<Laugh size={SLIDER_HEIGHT / 2} color="#83A99B" />);
      else if (p > 0.35)
        setEmoji(<Smile size={SLIDER_HEIGHT / 2} color="#83A99B" />);
      else setEmoji(<Annoyed size={SLIDER_HEIGHT / 2} color="#83A99B" />);
    });
  }, [progress]);

  function handleDragEnd(_: any, info: any) {
    const dragX = x.get();
    const threshold = sliderWidth - HANDLE_SIZE;
    if (dragX >= threshold) {
      animate(x, threshold, {
        type: "spring",
        stiffness: 800,
        damping: 16,
      });
      setTimeout(onComplete, 250);
    } else {
      animate(x, 0, { type: "spring", stiffness: 800, damping: 22 });
    }
  }

  const renderBouncyText = (t: string) => {
    const p = progress.get();
    return t.split("").map((char, idx) => {
      const pct = idx / (t.length - 1 || 1);
      const bounceRange = 0.12;
      let lift = 0;
      if (p > 0.01 && p < 0.999) {
        const diff = Math.abs(p - pct);
        lift = diff < bounceRange ? -18 * (1 - diff / bounceRange) : 0;
      }
      return (
        <motion.span
          key={idx}
          className="inline-block"
          animate={{ y: lift }}
          transition={{
            duration: 0.18,
            type: "spring",
            stiffness: 320,
            damping: 19,
          }}
          style={{
            color: "#83A99B",
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 4vw, 1.5rem)",
            letterSpacing: 0.5,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      );
    });
  };

  return (
    <div className="fancy-bg min-h-screen flex items-center justify-center px-2">
      <div
        ref={containerRef}
        className="relative"
        style={{
          width: "75vw",
          maxWidth: 460, // or any desktop max (e.g. 460~500)
          height: SLIDER_HEIGHT,
          borderRadius: "9999px",
          background: "#fff",
          boxShadow: "0 8px 32px rgba(0,0,0,0.11)",
          border: "2px solid #83A99B",
          userSelect: "none",
          touchAction: "pan-x",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Draggable handle */}
        <motion.div
          className="absolute top-1/2 left-0 z-10"
          drag="x"
          dragConstraints={{ left: 0, right: sliderWidth - HANDLE_SIZE }}
          style={{
            x,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            borderRadius: "9999px",
            background: "#fff",
            boxShadow: "0 4px 28px 0 rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            y: "-50%",
            zIndex: 10,
          }}
          whileTap={{ scale: 1.07 }}
          animate={{
            rotate: progress.get() * 360,
            scale: 1 + progress.get() * 0.04,
          }}
          transition={{
            type: "spring",
            stiffness: 600,
            damping: 24,
          }}
          onDragEnd={handleDragEnd}
        >
          {emoji}
        </motion.div>

        {/* Animated text (matches handle's left padding) */}
        <span
          className="absolute left-0 w-full z-0 pointer-events-none"
          style={{
            color: "#83A99B",
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 4vw, 1.5rem)",
            letterSpacing: 0.5,
            fontFamily: "inherit",
            paddingLeft: `calc(${HANDLE_SIZE}px + 2vw)`, // handle + responsive gap
            boxSizing: "border-box",
            textAlign: "left",
            lineHeight: `${SLIDER_HEIGHT}px`,
            transition: "padding-left .2s", // smooth on resize
          }}
        >
          {renderBouncyText(text)}
        </span>
      </div>
    </div>
  );
};

export default SlideToLoginButton;
