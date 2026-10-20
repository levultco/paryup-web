"use client";

import useIsMobile from "@/hooks/useIsMobile";
import StickyProductStory from "./StickyProductStory";
import { useEffect, useState } from "react";

export const PresentationScreen = () => {
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);

  const renderMobile = hasMounted && isMobile;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (renderMobile) {
    return <div></div>;
  }

  return <StickyProductStory />;
};
