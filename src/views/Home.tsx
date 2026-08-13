// @ts-nocheck
"use client"

import React from "react";
import Hero from "../components/home/Hero";
import USPStrip from "../components/common/USPStrip";
import FindYourSoulPromo from "../components/home/FindYourSoulPromo";
import BuildYourPackagePromo from "../components/home/BuildYourPackagePromo";
import CuratedCollections from "../components/home/CuratedCollections";

export default function Home() {
  return (
    <>
      <Hero />
      <USPStrip />
      <CuratedCollections />
      <FindYourSoulPromo />
      <BuildYourPackagePromo />
    </>
  );
}

