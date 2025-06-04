import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState, JSX } from "react";
import { Annoyed, Smile, Laugh } from "lucide-react";

// WIDER slider, same height
const SLIDER_WIDTH = 460; // was 420
const HANDLE_SIZE = 64;

type Props = {
  onComplete: () => void;
  text?: string;
};

const SlideToLoginButton = ({
  onComplete,
  text = "Slide to Login with Google",
}: Props) => {
  const x = useMotionValue(0);
  const progress = useTransform(x, [0, SLIDER_WIDTH - HANDLE_SIZE], [0, 1]);
  const [emoji, setEmoji] = useState<JSX.Element>(
    <Annoyed size={32} color="#83A99B" />
  );

  useEffect(() => {
    x.set(0);
  }, [x]);

  useEffect(() => {
    return progress.on("change", (p) => {
      if (p > 0.85) setEmoji(<Laugh size={32} color="#83A99B" />);
      else if (p > 0.35) setEmoji(<Smile size={32} color="#83A99B" />);
      else setEmoji(<Annoyed size={32} color="#83A99B" />);
    });
  }, [progress]);

  // Change: threshold is right at end (no -20)
  function handleDragEnd(_: any, info: any) {
    const dragX = x.get();
    const threshold = SLIDER_WIDTH - HANDLE_SIZE; // Snap right to the end
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
    // Get progress only ONCE per render
    const p = progress.get();

    return t.split("").map((char, idx) => {
      const pct = idx / (t.length - 1 || 1);
      const bounceRange = 0.12;
      let lift = 0;

      // Only apply bounce when NOT completed
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
            fontSize: "1.7rem",
            letterSpacing: 0.5,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      );
    });
  };

  return (
    <div className="fancy-bg min-h-screen flex items-center justify-center">
      <div
        className="relative"
        style={{
          width: SLIDER_WIDTH + "px",
          height: "72px", // not taller!
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
          dragConstraints={{ left: 0, right: SLIDER_WIDTH - HANDLE_SIZE }}
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
            fontSize: "1.7rem",
            letterSpacing: 0.5,
            fontFamily: "inherit",
            paddingLeft: `${HANDLE_SIZE + 16}px`, // handle + small gap
            boxSizing: "border-box",
            textAlign: "left",
            lineHeight: "72px", // vertically center text
          }}
        >
          {renderBouncyText(text)}
        </span>
      </div>
    </div>
  );
};

export default SlideToLoginButton;
