"use client";
import Container from "../components/Common/Container";
import ScrollUp from "../components/Common/ScrollUp";
import Features from "../components/Features";
import Hero from "../components/Hero/hero";
import Pricing from "../components/Pricing";
import Testimonials from "../components/Testimonials";

export default function Home() {
  return (
    <Container>
      <ScrollUp />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
    </Container>
  );
}
