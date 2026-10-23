"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/use-reduced-motion";

function subscribeNoop() {
  return () => {};
}

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function checkLowPower(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const isMobile = window.innerWidth < 768;
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency : 8;
  if (isMobile && cores && cores <= 4) return true;
  return false;
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isWebGLSupported = useSyncExternalStore(
    subscribeNoop,
    checkWebGLSupport,
    () => true
  );
  const isLowPower = useSyncExternalStore(
    subscribeNoop,
    checkLowPower,
    () => false
  );
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined" || !isWebGLSupported || isLowPower) return;

    let isCancelled = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let ctx: gsap.Context | null = null;

    // Lazy load canvas via idle callback so it never blocks First Contentful Paint / LCP
    const idleId =
      "requestIdleCallback" in window
        ? (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
            () => runInit(),
            { timeout: 1500 }
          )
        : setTimeout(() => runInit(), 200);

    const runInit = () => {
      if (isCancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const isMobile = window.innerWidth < 768;

      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: !isMobile,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      } catch {
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
      camera.position.z = 7;

      // Particle count: 3500 on mobile, 8000 on desktop
      const count = isMobile ? 3500 : 8000;
      const positions = new Float32Array(count * 3);
      const randoms = new Float32Array(count);
      let k = 0;
      let tries = 0;

      while (k < count && tries < 2000000) {
        tries++;
        const x = Math.random() * 2.4 - 1.2;
        const y = Math.random() * 2.4 - 1.2;
        const z = Math.random() * 2.6 - 1.3;
        const a = x * x + 2.25 * y * y + z * z - 1;
        const f = a * a * a - x * x * z * z * z - 0.1125 * y * y * z * z * z;

        if (f < 0 && f > -0.035) {
          positions[k * 3] = x * 1.5;
          positions[k * 3 + 1] = z * 1.5;
          positions[k * 3 + 2] = y * 1.5;
          randoms[k] = Math.random();
          k++;
        }
      }

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aR", new THREE.BufferAttribute(randoms, 1));

      const uniforms = {
        uT: { value: 0 },
        uM: { value: new THREE.Vector2(99, 99) },
        uC: { value: new THREE.Color(0xff4d5e) },
        uO: { value: 0 },
        uS: { value: isMobile ? 12 : 16 },
        uP: { value: renderer.getPixelRatio() },
      };

      material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          uniform float uT, uS, uP;
          uniform vec2 uM;
          attribute float aR;
          varying float vA;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vec2 d = w.xy - uM;
            float l = length(d);
            float f = smoothstep(1.4, 0.0, l);
            w.xy += normalize(d + 1e-4) * f * f * 1.1;
            w.z += f * 0.8 * sin(aR * 6.28 + uT * 3.0);
            vec4 mv = viewMatrix * w;
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uS * uP * (0.6 + aR * 0.8) / -mv.z;
            vA = 0.5 + 0.5 * aR;
          }
        `,
        fragmentShader: `
          uniform vec3 uC;
          uniform float uO;
          varying float vA;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            gl_FragColor = vec4(uC * vA, (1.0 - d * 2.0) * uO);
          }
        `,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const palette = [
        new THREE.Color(0xff4d5e),
        new THREE.Color(0x5ee1d2),
        new THREE.Color(0xffb86b),
      ];

      const state = {
        x: 0,
        y: -0.9,
        s: 1,
        ry: 0,
        c: 0,
        o: 0,
      };

      const mouse = { x: 0, y: 0 };
      let isDesktop = window.innerWidth > 900;

      const handleResize = () => {
        if (!renderer || !canvas) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        isDesktop = width > 900;
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      const handlePointerMove = (e: PointerEvent) => {
        mouse.x = e.clientX / window.innerWidth - 0.5;
        mouse.y = e.clientY / window.innerHeight - 0.5;

        const vector = new THREE.Vector3(mouse.x * 2, -mouse.y * 2, 0.5)
          .unproject(camera)
          .sub(camera.position)
          .normalize();

        uniforms.uM.value.set(
          camera.position.x + vector.x * (-camera.position.z / vector.z),
          camera.position.y + vector.y * (-camera.position.z / vector.z)
        );
      };

      window.addEventListener("pointermove", handlePointerMove);

      const tempColor = new THREE.Color();

      renderer.setAnimationLoop(() => {
        const t = performance.now() / 1000;
        const beat = reducedMotion
          ? 0
          : Math.pow(Math.max(0, Math.sin(t * 4.6)), 8) * 0.05;

        uniforms.uT.value = t;
        points.rotation.y =
          state.ry + (reducedMotion ? 0 : t * 0.18) + mouse.x * 0.4;
        points.rotation.x = mouse.y * 0.2;
        points.position.set(state.x, state.y, 0);
        points.scale.setScalar(state.s * (1 + beat));

        const i = Math.min(Math.floor(state.c), 1);
        tempColor
          .copy(palette[i])
          .lerp(palette[i + 1], Math.min(state.c - i, 1));
        uniforms.uC.value.copy(tempColor);
        uniforms.uO.value = state.o;

        if (renderer) {
          renderer.render(scene, camera);
        }
      });

      // GSAP ScrollTrigger wiring
      ctx = gsap.context(() => {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(state, { o: 1, duration: 1.6 }, 0.2)
          .from(state, { s: 0.45, duration: 2 }, 0.2);

        gsap.to(state, {
          x: isDesktop ? 2.1 : 0,
          y: isDesktop ? 0 : 1.25,
          s: isDesktop ? 1 : 0.68,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to("#hero > *:not(.pointer-events-none)", {
          opacity: 0,
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "60% top",
            scrub: true,
          },
        });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: "#story",
              start: "top top",
              end: "+=300%",
              scrub: 0.6,
            },
            defaults: { ease: "none" },
          })
          .to(state, { ry: Math.PI * 2, c: 2, duration: 3 }, 0);

        gsap.fromTo(
          state,
          { o: 1 },
          {
            o: 0,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: "#demo",
              start: "top 90%",
              end: "top 55%",
              scrub: true,
            },
          }
        );

        ScrollTrigger.create({
          trigger: "#cta",
          start: "top 85%",
          end: "bottom bottom",
          onUpdate: (self) => {
            state.o = Math.min(1, self.progress * 3);
            state.x = 0;
            state.y = -0.3;
            state.s = 1.15;
            state.c = 2;
          },
        });
      });
    };

    return () => {
      isCancelled = true;
      if (typeof window !== "undefined") {
        if ("cancelIdleCallback" in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId as number);
        } else {
          clearTimeout(idleId as NodeJS.Timeout);
        }
      }
      if (ctx) ctx.revert();
      if (renderer) {
        renderer.setAnimationLoop(null);
        renderer.dispose();
      }
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  }, [reducedMotion, isWebGLSupported, isLowPower]);

  if (!isWebGLSupported || isLowPower) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,rgba(255,77,94,0.14),transparent_65%)]"
        aria-hidden="true"
      />
    );
  }

  return (
    <>
      {/* Ambient background fallback glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,rgba(255,77,94,0.08),transparent_60%)]"
        aria-hidden="true"
      />
      {/* Fixed WebGL Canvas */}
      <canvas
        ref={canvasRef}
        id="c"
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        aria-hidden="true"
      />
    </>
  );
}
