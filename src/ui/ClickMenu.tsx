import React, { useEffect, useRef } from "react";

interface ClickMenuProps {
  top?: number | undefined;
  left?: number | undefined;
  bottom?: number | undefined;
  right?: number | undefined;
  children: React.ReactNode;
  closeContextMenuHandler: () => void;
}

const ClickMenu: React.FC<ClickMenuProps> = ({
  top,
  left,
  bottom,
  right,
  children,
  closeContextMenuHandler,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const styleObj = {
    top: top !== undefined ? `${top}px` : undefined,
    left: left !== undefined ? `${left}px` : undefined,
    bottom: bottom !== undefined ? `${bottom}px` : undefined,
    right: right !== undefined ? `${right}px` : undefined,
    boxShadow: "0px 0px 2px #b7b2b2",
  };

  useEffect(() => {
    document.addEventListener("mousedown", (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        closeContextMenuHandler();
      }
    });

    document.addEventListener("touchstart", (e: TouchEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        closeContextMenuHandler();
      }
    });

    return () => {
      document.removeEventListener("mousedown", (e: MouseEvent) => {
        const target = e.target as Node;
        if (containerRef.current && !containerRef.current.contains(target)) {
          closeContextMenuHandler();
        }
      });

      document.removeEventListener("touchstart", (e: TouchEvent) => {
        const target = e.target as Node;
        if (containerRef.current && !containerRef.current.contains(target)) {
          closeContextMenuHandler();
        }
      });
    };
  }, []);

  return (
    <div
      style={styleObj}
      ref={containerRef}
      className="absolute z-30 rounded-md"
    >
      {children}
    </div>
  );
};

export default ClickMenu;
